from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.operations import ContractStatus
from app.schemas.user import UserResponse
from app.models.enums import GenderType
from app.schemas.infrastructure import BedResponse, RoomResponse

class ContractBase(BaseModel):
    bed_id: UUID
    end_date: datetime

class ContractCreate(BaseModel):
    bed_id: UUID
    end_date: datetime

class AdminContractCreate(ContractCreate):
    student_id: UUID
    student_gender: Optional[GenderType] = None
    student_phone: Optional[str] = None

class ContractUpdateStatus(BaseModel):
    status: ContractStatus

class ContractResponse(ContractBase):
    id: UUID
    student_id: UUID
    price_per_month: float
    deposit_amount: float
    status: ContractStatus
    start_date: datetime
    created_at: datetime
    student: Optional["UserResponse"] = None
    bed: Optional["BedResponse"] = None
    room: Optional["RoomResponse"] = None
    model_config = ConfigDict(from_attributes=True)

class LiquidationCreate(BaseModel):
    contract_id: UUID
    penalty_amount: float = 0.0
    damage_fee: float = 0.0
    notes: Optional[str] = None

class LiquidationResponse(BaseModel):
    id: UUID
    contract_id: UUID
    liquidation_date: datetime
    total_refund_to_student: float
    refund_deposit_amount: float
    penalty_amount: float
    damage_fee: float
    notes: Optional[str] = None
    confirmed_by: UUID
    model_config = ConfigDict(from_attributes=True)