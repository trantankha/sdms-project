from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.enums import InvoiceStatus, PaymentMethod, UtilityType
from app.schemas.operations import ContractResponse
from app.schemas.infrastructure import BuildingResponse

class UtilityConfigBase(BaseModel):
    type: UtilityType
    price_per_unit: float
    is_progressive: bool = False

class UtilityConfigCreate(UtilityConfigBase):
    pass

class UtilityConfigUpdate(BaseModel):
    price_per_unit: Optional[float] = None
    is_progressive: Optional[bool] = None

class UtilityConfigResponse(UtilityConfigBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class UtilityRecordingCreate(BaseModel):
    room_id: UUID
    month: int
    year: int
    electric_index: float
    water_index: float

class UtilityRecordingBatch(BaseModel):
    items: List[UtilityRecordingCreate]

class UtilityReadingResponse(BaseModel):
    id: UUID
    room_id: UUID
    month: int
    year: int
    electric_index: float
    water_index: float
    recorded_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentBase(BaseModel):
    amount: float
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    invoice_id: UUID

class PaymentResponse(PaymentBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InvoiceBase(BaseModel):
    title: Optional[str]
    total_amount: float
    due_date: Optional[datetime] = None

class InvoiceCreate(InvoiceBase):
    contract_id: Optional[UUID] = None
    room_id: Optional[UUID] = None
    details: Optional[Dict[str, Any]] = None


class RoomInvoiceInfo(BaseModel):
    id: UUID
    code: str
    name: Optional[str] = None
    building: Optional[BuildingResponse] = None
    model_config = ConfigDict(from_attributes=True)

class InvoiceResponse(InvoiceBase):
    id: UUID
    contract_id: Optional[UUID]
    room_id: Optional[UUID] = None
    status: InvoiceStatus
    paid_amount: float = 0.0
    remaining_amount: float = 0.0
    details: Optional[Dict[str, Any]] = None
    payments: List[PaymentResponse] = []
    contract: Optional[ContractResponse] = None
    room: Optional[RoomInvoiceInfo] = None 
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
