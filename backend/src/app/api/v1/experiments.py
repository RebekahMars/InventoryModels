import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.deps import require_role
from app.db.session import get_db
from app.models.experiment import VALID_TRANSITIONS, Experiment, ExperimentResult, ExperimentSample
from app.models.sample import Sample
from app.models.user import User
from app.schemas.experiment import (
    AddSampleBody,
    ExperimentCreate,
    ExperimentDetailRead,
    ExperimentRead,
    ExperimentResultCreate,
    ExperimentResultRead,
    ExperimentSampleRead,
    ExperimentStatusUpdate,
    ExperimentUpdate,
)

router = APIRouter(prefix="/experiments", tags=["experiments"])

_researcher = Depends(require_role("admin", "researcher"))
_admin = Depends(require_role("admin"))


def _load_detail(experiment_id: uuid.UUID):
    return (
        select(Experiment)
        .options(
            selectinload(Experiment.experiment_samples).selectinload(ExperimentSample.sample),
            selectinload(Experiment.results),
        )
        .where(Experiment.id == experiment_id)
    )


@router.get("", response_model=list[ExperimentRead])
async def list_experiments(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> list[Experiment]:
    result = await db.execute(select(Experiment).order_by(Experiment.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=ExperimentRead, status_code=status.HTTP_201_CREATED)
async def create_experiment(
    body: ExperimentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, _researcher],
) -> Experiment:
    experiment = Experiment(**body.model_dump(), created_by=current_user.email)
    db.add(experiment)
    await db.commit()
    await db.refresh(experiment)
    return experiment


@router.get("/{experiment_id}", response_model=ExperimentDetailRead)
async def get_experiment(
    experiment_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Experiment:
    result = await db.execute(_load_detail(experiment_id))
    experiment = result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    return experiment


@router.patch("/{experiment_id}", response_model=ExperimentRead)
async def update_experiment(
    experiment_id: uuid.UUID,
    body: ExperimentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Experiment:
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(experiment, field, value)
    await db.commit()
    await db.refresh(experiment)
    return experiment


@router.patch("/{experiment_id}/status", response_model=ExperimentRead)
async def transition_status(
    experiment_id: uuid.UUID,
    body: ExperimentStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> Experiment:
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    allowed = VALID_TRANSITIONS.get(experiment.status, set())
    if body.status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from '{experiment.status}' to '{body.status}'",
        )
    experiment.status = body.status
    await db.commit()
    await db.refresh(experiment)
    return experiment


@router.post("/{experiment_id}/samples", response_model=ExperimentSampleRead, status_code=status.HTTP_201_CREATED)
async def add_sample(
    experiment_id: uuid.UUID,
    body: AddSampleBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> ExperimentSample:
    exp_result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = exp_result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    if experiment.status in ("completed", "archived"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Experiment is locked")

    sample_result = await db.execute(select(Sample).where(Sample.id == body.sample_id))
    if sample_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")

    existing = await db.execute(
        select(ExperimentSample).where(
            ExperimentSample.experiment_id == experiment_id,
            ExperimentSample.sample_id == body.sample_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sample already in experiment")

    es = ExperimentSample(experiment_id=experiment_id, sample_id=body.sample_id, notes=body.notes)
    db.add(es)
    await db.commit()

    result = await db.execute(
        select(ExperimentSample)
        .options(selectinload(ExperimentSample.sample))
        .where(ExperimentSample.id == es.id)
    )
    return result.scalar_one()


@router.delete("/{experiment_id}/samples/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_sample(
    experiment_id: uuid.UUID,
    sample_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, _researcher],
) -> None:
    exp_result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = exp_result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    if experiment.status in ("completed", "archived"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Experiment is locked")

    es_result = await db.execute(
        select(ExperimentSample).where(
            ExperimentSample.experiment_id == experiment_id,
            ExperimentSample.sample_id == sample_id,
        )
    )
    es = es_result.scalar_one_or_none()
    if es is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not in experiment")
    await db.delete(es)
    await db.commit()


@router.post("/{experiment_id}/results", response_model=ExperimentResultRead, status_code=status.HTTP_201_CREATED)
async def record_result(
    experiment_id: uuid.UUID,
    body: ExperimentResultCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, _researcher],
) -> ExperimentResult:
    exp_result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = exp_result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    if experiment.status in ("archived",):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Experiment is archived")

    if body.sample_id:
        linked = await db.execute(
            select(ExperimentSample).where(
                ExperimentSample.experiment_id == experiment_id,
                ExperimentSample.sample_id == body.sample_id,
            )
        )
        if linked.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Sample is not linked to this experiment",
            )

    result_obj = ExperimentResult(
        experiment_id=experiment_id,
        recorded_by=current_user.email,
        **body.model_dump(),
    )
    db.add(result_obj)
    await db.commit()
    await db.refresh(result_obj)
    return result_obj


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[_admin])
async def delete_experiment(
    experiment_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    experiment = result.scalar_one_or_none()
    if experiment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    await db.delete(experiment)
    await db.commit()
