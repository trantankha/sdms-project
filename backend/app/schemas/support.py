from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import RequestStatus

class MaintenanceRequestBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    room_code: Optional[str] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[RequestStatus] = None
    ai_analysis_result: Optional[str] = None
    room_code: Optional[str] = None

class MaintenanceRequestInDBBase(MaintenanceRequestBase):
    id: UUID
    user_id: UUID
    status: RequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    ai_analysis_result: Optional[str] = None

    class Config:
        from_attributes = True

class MaintenanceRequestResponse(MaintenanceRequestInDBBase):
    pass
