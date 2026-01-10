from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import TransferStatus

class TransferRequestBase(BaseModel):
    reason: str
    target_bed_id: Optional[UUID] = None

class TransferRequestCreate(TransferRequestBase):
    contract_id: UUID

class TransferRequestResponse(TransferRequestBase):
    id: UUID
    student_id: UUID
    contract_id: UUID
    status: TransferStatus
    admin_response: Optional[str] = None
    created_at: datetime
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    current_room_name: Optional[str] = None
    current_bed_label: Optional[str] = None
    target_room_name: Optional[str] = None
    target_bed_label: Optional[str] = None
    
    class Config:
        from_attributes = True

class TransferRequestUpdate(BaseModel):
    status: TransferStatus
    admin_response: Optional[str] = None
    assigned_bed_id: Optional[UUID] = None
