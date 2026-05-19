from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class SampleRef(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    barcode: str
    sample_type: str
    status: str


class ExperimentSampleRead(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    sample_id: UUID
    notes: str | None
    added_at: datetime
    sample: SampleRef


class ExperimentResultBase(BaseModel):
    analyte: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1, max_length=255)
    unit: str | None = Field(None, max_length=50)
    reference_range: str | None = Field(None, max_length=100)
    interpretation: str = Field("pending", pattern="^(normal|abnormal|inconclusive|pending)$")
    notes: str | None = None
    sample_id: UUID | None = None


class ExperimentResultCreate(ExperimentResultBase):
    pass


class ExperimentResultRead(ExperimentResultBase):
    model_config = {"from_attributes": True}
    id: UUID
    experiment_id: UUID
    recorded_by: str
    recorded_at: datetime


class ExperimentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    protocol: str | None = None
    notes: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ExperimentCreate(ExperimentBase):
    pass


class ExperimentUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    protocol: str | None = None
    notes: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ExperimentStatusUpdate(BaseModel):
    status: str


class AddSampleBody(BaseModel):
    sample_id: UUID
    notes: str | None = None


class ExperimentRead(ExperimentBase):
    model_config = {"from_attributes": True}
    id: UUID
    status: str
    created_by: str
    created_at: datetime
    updated_at: datetime


class ExperimentDetailRead(ExperimentRead):
    experiment_samples: list[ExperimentSampleRead] = []
    results: list[ExperimentResultRead] = []
