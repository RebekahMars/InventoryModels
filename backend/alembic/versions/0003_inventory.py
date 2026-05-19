"""inventory management

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-18 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inventory_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("lot_number", sa.String(100), nullable=True),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(50), nullable=False),
        sa.Column("min_quantity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("expiration_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("supplier", sa.String(255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_inventory_items_name", "inventory_items", ["name"])
    op.create_index("ix_inventory_items_lot_number", "inventory_items", ["lot_number"], unique=True)

    op.create_table(
        "inventory_transactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("item_id", UUID(as_uuid=True), sa.ForeignKey("inventory_items.id"), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("delta", sa.Float(), nullable=False),
        sa.Column("quantity_after", sa.Float(), nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_inventory_transactions_item_id", "inventory_transactions", ["item_id"])


def downgrade() -> None:
    op.drop_index("ix_inventory_transactions_item_id", table_name="inventory_transactions")
    op.drop_table("inventory_transactions")
    op.drop_index("ix_inventory_items_lot_number", table_name="inventory_items")
    op.drop_index("ix_inventory_items_name", table_name="inventory_items")
    op.drop_table("inventory_items")
