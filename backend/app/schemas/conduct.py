from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import ViolationSeverity
from app.schemas.user import UserResponse

class ViolationBase(BaseModel):
    title: str
    description: str
    severity: ViolationSeverity = ViolationSeverity.WARNING
    points_deducted: int = 0
    violation_date: datetime = datetime.utcnow()

class ViolationCreate(ViolationBase):
    student_id: Optional[UUID] = None
    student_code: Optional[str] = None
    email: Optional[str] = None

    def check_student_identifier(self) -> 'ViolationCreate':
        if not self.student_id and not self.student_code and not self.email:
            raise ValueError('Must provide student_id, student_code, or email')
        return self

class ViolationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[ViolationSeverity] = None
    points_deducted: Optional[int] = None
    violation_date: Optional[datetime] = None

class ViolationResponse(ViolationBase):
    id: UUID
    user_id: UUID
    student: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True
