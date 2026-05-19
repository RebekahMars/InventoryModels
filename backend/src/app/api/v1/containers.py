import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import require_role
from app.db.session import get_db
from app.models.container import Container
from app.models.user import User
from app.schemas.container import ContainerCreate, ContainerRead, ContainerUpdate

router = APIRouter(prefix="/containers", tags=["containers"])

_researcher = Depends(require_role("admin", "researcher"))
_admin = Depends(require_role("admin"))


@router.get("", response_model=list[ContainerRead])
async def list_containers(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> list[Container]:
    result = await db.execute(select(Container).order_by(Container.name))
    return list(result.scalars().all())


@router.post("", response_model=ContainerRead, status_code=status.HTTP_201_CREATED)
async def create_container(
    body: ContainerCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Container:
    container = Container(**body.model_dump())
    db.add(container)
    await db.commit()
    await db.refresh(container)
    return container


@router.get("/{container_id}", response_model=ContainerRead)
async def get_container(
    container_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Container:
    result = await db.execute(select(Container).where(Container.id == container_id))
    container = result.scalar_one_or_none()
    if container is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Container not found")
    return container


@router.patch("/{container_id}", response_model=ContainerRead)
async def update_container(
    container_id: uuid.UUID,
    body: ContainerUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Container:
    result = await db.execute(select(Container).where(Container.id == container_id))
    container = result.scalar_one_or_none()
    if container is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Container not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(container, field, value)
    await db.commit()
    await db.refresh(container)
    return container


@router.delete("/{container_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[_admin])
async def delete_container(
    container_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(select(Container).where(Container.id == container_id))
    container = result.scalar_one_or_none()
    if container is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Container not found")
    await db.delete(container)
    await db.commit()
