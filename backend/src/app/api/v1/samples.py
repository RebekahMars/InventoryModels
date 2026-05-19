import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.deps import require_role
from app.db.session import get_db
from app.models.sample import VALID_TRANSITIONS, Aliquot, Sample
from app.models.user import User
from app.schemas.sample import (
    AliquotCreate,
    AliquotRead,
    SampleCreate,
    SampleDetailRead,
    SampleRead,
    SampleStatusUpdate,
    SampleUpdate,
)

router = APIRouter(prefix="/samples", tags=["samples"])

_researcher = Depends(require_role("admin", "researcher"))
_admin = Depends(require_role("admin"))


@router.get("", response_model=list[SampleRead])
async def list_samples(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> list[Sample]:
    result = await db.execute(select(Sample).order_by(Sample.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=SampleRead, status_code=status.HTTP_201_CREATED)
async def create_sample(
    body: SampleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Sample:
    existing = await db.execute(select(Sample).where(Sample.barcode == body.barcode))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Barcode already exists")
    sample = Sample(**body.model_dump())
    db.add(sample)
    await db.commit()
    await db.refresh(sample)
    return sample


@router.get("/{sample_id}", response_model=SampleDetailRead)
async def get_sample(
    sample_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Sample:
    result = await db.execute(
        select(Sample).options(selectinload(Sample.aliquots)).where(Sample.id == sample_id)
    )
    sample = result.scalar_one_or_none()
    if sample is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    return sample


@router.patch("/{sample_id}", response_model=SampleRead)
async def update_sample(
    sample_id: uuid.UUID,
    body: SampleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Sample:
    result = await db.execute(select(Sample).where(Sample.id == sample_id))
    sample = result.scalar_one_or_none()
    if sample is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(sample, field, value)
    await db.commit()
    await db.refresh(sample)
    return sample


@router.patch("/{sample_id}/status", response_model=SampleRead)
async def transition_status(
    sample_id: uuid.UUID,
    body: SampleStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Sample:
    result = await db.execute(select(Sample).where(Sample.id == sample_id))
    sample = result.scalar_one_or_none()
    if sample is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    allowed = VALID_TRANSITIONS.get(sample.status, set())
    if body.status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from '{sample.status}' to '{body.status}'",
        )
    sample.status = body.status
    await db.commit()
    await db.refresh(sample)
    return sample


@router.post("/{sample_id}/aliquots", response_model=AliquotRead, status_code=status.HTTP_201_CREATED)
async def create_aliquot(
    sample_id: uuid.UUID,
    body: AliquotCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Aliquot:
    result = await db.execute(select(Sample).where(Sample.id == sample_id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    existing = await db.execute(select(Aliquot).where(Aliquot.barcode == body.barcode))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Barcode already exists")
    aliquot = Aliquot(sample_id=sample_id, **body.model_dump())
    db.add(aliquot)
    await db.commit()
    await db.refresh(aliquot)
    return aliquot


@router.delete("/{sample_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[_admin])
async def delete_sample(
    sample_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(select(Sample).where(Sample.id == sample_id))
    sample = result.scalar_one_or_none()
    if sample is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    await db.delete(sample)
    await db.commit()
