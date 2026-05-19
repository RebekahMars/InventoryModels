"""sample tracking

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-18 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "containers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("container_type", sa.String(50), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "samples",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("barcode", sa.String(100), nullable=False),
        sa.Column("sample_type", sa.String(100), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="received"),
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("collected_by", sa.String(255), nullable=True),
        sa.Column("donor_id", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_samples_barcode", "samples", ["barcode"], unique=True)

    op.create_table(
        "aliquots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("barcode", sa.String(100), nullable=False),
        sa.Column("volume_ul", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("sample_id", UUID(as_uuid=True), sa.ForeignKey("samples.id"), nullable=False),
        sa.Column("container_id", UUID(as_uuid=True), sa.ForeignKey("containers.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_aliquots_barcode", "aliquots", ["barcode"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_aliquots_barcode", table_name="aliquots")
    op.drop_table("aliquots")
    op.drop_index("ix_samples_barcode", table_name="samples")
    op.drop_table("samples")
    op.drop_table("containers")
