"""experiment logging

Revision ID: 0004
Revises: 0003
Create Date: 2026-05-18 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "experiments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("protocol", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="draft"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_experiments_title", "experiments", ["title"])

    op.create_table(
        "experiment_samples",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("experiment_id", UUID(as_uuid=True), sa.ForeignKey("experiments.id"), nullable=False),
        sa.Column("sample_id", UUID(as_uuid=True), sa.ForeignKey("samples.id"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("experiment_id", "sample_id", name="uq_experiment_sample"),
    )
    op.create_index("ix_experiment_samples_experiment_id", "experiment_samples", ["experiment_id"])

    op.create_table(
        "experiment_results",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("experiment_id", UUID(as_uuid=True), sa.ForeignKey("experiments.id"), nullable=False),
        sa.Column("sample_id", UUID(as_uuid=True), sa.ForeignKey("samples.id"), nullable=True),
        sa.Column("analyte", sa.String(255), nullable=False),
        sa.Column("value", sa.String(255), nullable=False),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("reference_range", sa.String(100), nullable=True),
        sa.Column("interpretation", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_by", sa.String(255), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_experiment_results_experiment_id", "experiment_results", ["experiment_id"])


def downgrade() -> None:
    op.drop_index("ix_experiment_results_experiment_id", table_name="experiment_results")
    op.drop_table("experiment_results")
    op.drop_index("ix_experiment_samples_experiment_id", table_name="experiment_samples")
    op.drop_table("experiment_samples")
    op.drop_index("ix_experiments_title", table_name="experiments")
    op.drop_table("experiments")
