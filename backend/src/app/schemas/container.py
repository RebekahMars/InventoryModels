import uuid
from datetime import datetime
from pydantic import BaseModel


class ContainerBase(BaseModel):
    name: str
    container_type: str
    location: str | None = None
    description: str | None = None


class ContainerCreate(ContainerBase):
    pass


class ContainerUpdate(BaseModel):
    name: str | None = None
    container_type: str | None = None
    location: str | None = None
    description: str | None = None


class ContainerRead(ContainerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
