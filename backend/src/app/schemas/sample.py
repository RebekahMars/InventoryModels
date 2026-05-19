import uuid
from datetime import datetime
from pydantic import BaseModel


class AliquotBase(BaseModel):
    barcode: str
    volume_ul: float | None = None
    notes: str | None = None
    container_id: uuid.UUID | None = None


class AliquotCreate(AliquotBase):
    pass


class AliquotRead(AliquotBase):
    id: uuid.UUID
    sample_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class SampleBase(BaseModel):
    barcode: str
    sample_type: str
    collected_at: datetime | None = None
    collected_by: str | None = None
    donor_id: str | None = None
    notes: str | None = None


class SampleCreate(SampleBase):
    pass


class SampleUpdate(BaseModel):
    sample_type: str | None = None
    collected_at: datetime | None = None
    collected_by: str | None = None
    donor_id: str | None = None
    notes: str | None = None


class SampleStatusUpdate(BaseModel):
    status: str


class SampleRead(SampleBase):
    id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class SampleDetailRead(SampleRead):
    aliquots: list[AliquotRead] = []
