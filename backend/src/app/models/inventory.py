import uuid
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

INVENTORY_CATEGORIES = {
    "reagent", "consumable", "equipment", "media", "chemical", "kit", "other"
}

TRANSACTION_ACTIONS = {"restock", "use", "adjust", "dispose", "initial"}


class InventoryItem(Base, TimestampMixin):
    __tablename__ = "inventory_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    lot_number: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True, index=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    min_quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    expiration_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    supplier: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    transactions: Mapped[list["InventoryTransaction"]] = relationship(
        "InventoryTransaction", back_populates="item", cascade="all, delete-orphan",
        order_by="InventoryTransaction.created_at.desc()",
    )


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    delta: Mapped[float] = mapped_column(Float, nullable=False)
    quantity_after: Mapped[float] = mapped_column(Float, nullable=False)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    )

    item: Mapped["InventoryItem"] = relationship("InventoryItem", back_populates="transactions")
