import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

EXPERIMENT_STATUSES = {"draft", "active", "completed", "archived"}

VALID_TRANSITIONS: dict[str, set[str]] = {
    "draft":     {"active", "archived"},
    "active":    {"completed", "archived"},
    "completed": {"archived"},
    "archived":  set(),
}

INTERPRETATIONS = {"normal", "abnormal", "inconclusive", "pending"}


class Experiment(Base, TimestampMixin):
    __tablename__ = "experiments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    protocol: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(255), nullable=False)

    experiment_samples: Mapped[list["ExperimentSample"]] = relationship(
        "ExperimentSample", back_populates="experiment", cascade="all, delete-orphan"
    )
    results: Mapped[list["ExperimentResult"]] = relationship(
        "ExperimentResult", back_populates="experiment", cascade="all, delete-orphan",
        order_by="ExperimentResult.recorded_at.desc()",
    )


class ExperimentSample(Base):
    __tablename__ = "experiment_samples"
    __table_args__ = (UniqueConstraint("experiment_id", "sample_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experiments.id"), nullable=False)
    sample_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("samples.id"), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    )

    experiment: Mapped["Experiment"] = relationship("Experiment", back_populates="experiment_samples")
    sample: Mapped["Sample"] = relationship("Sample")  # noqa: F821


class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("experiments.id"), nullable=False)
    sample_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("samples.id"), nullable=True)
    analyte: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    interpretation: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[str] = mapped_column(String(255), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: __import__("datetime").datetime.now(__import__("datetime").timezone.utc),
    )

    experiment: Mapped["Experiment"] = relationship("Experiment", back_populates="results")
    sample: Mapped["Sample | None"] = relationship("Sample")  # noqa: F821
