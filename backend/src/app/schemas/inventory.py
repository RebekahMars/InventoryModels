from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class TransactionRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    action: str
    delta: float
    quantity_after: float
    actor: str
    notes: str | None
    created_at: datetime


class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=50)
    lot_number: str | None = Field(None, max_length=100)
    quantity: float = Field(0.0, ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    min_quantity: float = Field(0.0, ge=0)
    expiration_date: datetime | None = None
    supplier: str | None = Field(None, max_length=255)
    description: str | None = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    category: str | None = Field(None, min_length=1, max_length=50)
    lot_number: str | None = Field(None, max_length=100)
    unit: str | None = Field(None, min_length=1, max_length=50)
    min_quantity: float | None = Field(None, ge=0)
    expiration_date: datetime | None = None
    supplier: str | None = Field(None, max_length=255)
    description: str | None = None


class StockAdjust(BaseModel):
    action: str = Field(..., pattern="^(restock|use|adjust|dispose)$")
    delta: float = Field(..., description="Positive for restock, negative for use/dispose")
    notes: str | None = None


class InventoryItemRead(InventoryItemBase):
    model_config = {"from_attributes": True}

    id: UUID
    created_at: datetime
    updated_at: datetime


class InventoryItemDetailRead(InventoryItemRead):
    transactions: list[TransactionRead] = []
