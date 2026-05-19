import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

# Valid status transitions:
# received -> processing -> stored -> disposed
# received -> disposed
SAMPLE_STATUSES = {"received", "processing", "stored", "disposed"}

VALID_TRANSITIONS: dict[str, set[str]] = {
    "received":   {"processing", "disposed"},
    "processing": {"stored", "disposed"},
    "stored":     {"disposed"},
    "disposed":   set(),
}


class Sample(Base, TimestampMixin):
    __tablename__ = "samples"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barcode: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    sample_type: Mapped[str] = mapped_column(String(100), nullable=False)  # blood, tissue, swab, etc.
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="received")
    collected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    collected_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    donor_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    aliquots: Mapped[list["Aliquot"]] = relationship("Aliquot", back_populates="sample", cascade="all, delete-orphan")  # noqa: F821


class Aliquot(Base, TimestampMixin):
    __tablename__ = "aliquots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barcode: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    volume_ul: Mapped[float | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    sample_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("samples.id"), nullable=False)
    container_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("containers.id"), nullable=True)

    sample: Mapped["Sample"] = relationship("Sample", back_populates="aliquots")
    container: Mapped["Container"] = relationship("Container", back_populates="aliquots")  # noqa: F821
