from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import UserRole, GenderType

if TYPE_CHECKING:
    from app.models.operations import Contract
    from app.models.support import MaintenanceRequest
    from app.models.finance import UtilityReading

class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    
    full_name: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT)
    
    student_code: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    gender: Mapped[Optional[GenderType]] = mapped_column(Enum(GenderType), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    contracts: Mapped[List["Contract"]] = relationship("Contract", back_populates="student")

    maintenance_requests: Mapped[List["MaintenanceRequest"]] = relationship("MaintenanceRequest", back_populates="user")
    recorded_utilities: Mapped[List["UtilityReading"]] = relationship("UtilityReading", back_populates="recorder")