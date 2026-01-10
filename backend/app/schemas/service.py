from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.models.services import ServiceType, BillingCycle

class ServicePackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: ServiceType = ServiceType.OTHER
    price: float
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    is_active: bool = True

class ServicePackageCreate(ServicePackageBase):
    pass

class ServicePackageUpdate(ServicePackageBase):
    pass

class ServicePackageInDBBase(ServicePackageBase):
    id: UUID
    class Config:
        from_attributes = True

class ServicePackage(ServicePackageInDBBase):
    pass

# --- Subscription ---
class SubscriptionBase(BaseModel):
    service_id: UUID
    quantity: int = 1
    note: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    quantity: Optional[int] = None
    note: Optional[str] = None
    is_active: Optional[bool] = None

class SubscriptionInDBBase(SubscriptionBase):
    id: UUID
    user_id: UUID
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool
    
    class Config:
        from_attributes = True

class Subscription(SubscriptionInDBBase):
    service_name: Optional[str] = None
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    room_code: Optional[str] = None
    building_name: Optional[str] = None
