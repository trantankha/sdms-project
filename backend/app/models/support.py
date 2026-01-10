import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import RequestStatus

if TYPE_CHECKING:
    from app.models.users import User

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    room_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ai_analysis_result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.OPEN)
    user: Mapped["User"] = relationship("User", back_populates="maintenance_requests")