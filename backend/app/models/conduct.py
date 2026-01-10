import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, Enum, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import ViolationSeverity
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.users import User

class Violation(Base):
    __tablename__ = "violations"
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    
    severity: Mapped[ViolationSeverity] = mapped_column(Enum(ViolationSeverity), default=ViolationSeverity.WARNING)
    points_deducted: Mapped[int] = mapped_column(Integer, default=0)
    
    violation_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    student: Mapped["User"] = relationship("User") 
