import uuid
from datetime import datetime, timezone, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.deps import require_role
from app.db.session import get_db
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.user import User
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemDetailRead,
    InventoryItemRead,
    InventoryItemUpdate,
    StockAdjust,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])

_researcher = Depends(require_role("admin", "researcher"))
_admin = Depends(require_role("admin"))


@router.get("", response_model=list[InventoryItemRead])
async def list_items(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
    low_stock: bool = Query(False),
    expiring_days: int | None = Query(None, ge=1),
) -> list[InventoryItem]:
    stmt = select(InventoryItem).order_by(InventoryItem.name)
    result = await db.execute(stmt)
    items = list(result.scalars().all())

    if low_stock:
        items = [i for i in items if i.quantity <= i.min_quantity]
    if expiring_days is not None:
        cutoff = datetime.now(timezone.utc) + timedelta(days=expiring_days)
        items = [i for i in items if i.expiration_date is not None and i.expiration_date <= cutoff]

    return items


@router.post("", response_model=InventoryItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(
    body: InventoryItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, _researcher],
) -> InventoryItem:
    if body.lot_number:
        existing = await db.execute(select(InventoryItem).where(InventoryItem.lot_number == body.lot_number))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Lot number already exists")

    item = InventoryItem(**body.model_dump())
    db.add(item)
    await db.flush()

    if body.quantity > 0:
        txn = InventoryTransaction(
            item_id=item.id,
            action="initial",
            delta=body.quantity,
            quantity_after=body.quantity,
            actor=current_user.email,
        )
        db.add(txn)

    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{item_id}", response_model=InventoryItemDetailRead)
async def get_item(
    item_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> InventoryItem:
    result = await db.execute(
        select(InventoryItem).options(selectinload(InventoryItem.transactions)).where(InventoryItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=InventoryItemRead)
async def update_item(
    item_id: uuid.UUID,
    body: InventoryItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> InventoryItem:
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updates = body.model_dump(exclude_unset=True)
    if "lot_number" in updates and updates["lot_number"] and updates["lot_number"] != item.lot_number:
        existing = await db.execute(select(InventoryItem).where(InventoryItem.lot_number == updates["lot_number"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Lot number already exists")

    for field, value in updates.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/{item_id}/adjust", response_model=InventoryItemRead)
async def adjust_stock(
    item_id: uuid.UUID,
    body: StockAdjust,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, _researcher],
) -> InventoryItem:
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    new_qty = item.quantity + body.delta
    if new_qty < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Adjustment would result in negative quantity ({new_qty:.2f})",
        )

    item.quantity = new_qty
    txn = InventoryTransaction(
        item_id=item.id,
        action=body.action,
        delta=body.delta,
        quantity_after=new_qty,
        actor=current_user.email,
        notes=body.notes,
    )
    db.add(txn)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[_admin])
async def delete_item(
    item_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    await db.delete(item)
    await db.commit()
