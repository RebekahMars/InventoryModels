from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, timedelta
from app.core.deps import require_role
from app.core.forecasting import generate_synthetic_history, run_all_forecasts
from app.db.session import get_db
from app.models.experiment import Experiment
from app.models.inventory import InventoryItem
from app.models.sample import Sample
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"])

_researcher = Depends(require_role("admin", "researcher"))


@router.get("/summary")
async def get_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> dict:
    # Sample counts by status
    sample_rows = await db.execute(
        select(Sample.status, func.count()).group_by(Sample.status)
    )
    sample_by_status = {row[0]: row[1] for row in sample_rows}

    # Inventory alerts
    inv_result = await db.execute(select(InventoryItem))
    items = list(inv_result.scalars().all())
    now = datetime.now(timezone.utc)
    cutoff_expiring = now + timedelta(days=30)

    low_stock = sum(1 for i in items if i.min_quantity > 0 and i.quantity <= i.min_quantity)
    expiring  = sum(1 for i in items if i.expiration_date and now < i.expiration_date <= cutoff_expiring)
    expired   = sum(1 for i in items if i.expiration_date and i.expiration_date <= now)

    # Experiment counts by status
    exp_rows = await db.execute(
        select(Experiment.status, func.count()).group_by(Experiment.status)
    )
    exp_by_status = {row[0]: row[1] for row in exp_rows}

    # Recent samples (last 5)
    recent_result = await db.execute(
        select(Sample).order_by(Sample.created_at.desc()).limit(5)
    )
    recent = [
        {"id": str(s.id), "barcode": s.barcode, "sample_type": s.sample_type, "status": s.status}
        for s in recent_result.scalars().all()
    ]

    return {
        "samples": {
            "total": sum(sample_by_status.values()),
            "by_status": sample_by_status,
        },
        "inventory": {
            "total": len(items),
            "low_stock": low_stock,
            "expiring": expiring,
            "expired": expired,
        },
        "experiments": {
            "total": sum(exp_by_status.values()),
            "by_status": exp_by_status,
        },
        "recent_samples": recent,
    }


@router.get("/forecast")
async def get_forecast(
    _: Annotated[User, _researcher],
    horizon: int = Query(90, ge=7, le=365),
) -> dict:
    history = generate_synthetic_history(n_days=730)
    return run_all_forecasts(history, horizon=horizon)
