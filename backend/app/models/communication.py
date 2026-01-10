import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, Enum, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import AnnouncementPriority, AnnouncementScope, AnnouncementStatus
from datetime import datetime

if TYPE_CHECKING:
    from app.models.users import User

class Announcement(Base):
    __tablename__ = "announcements"
    
    title: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    
    priority: Mapped[AnnouncementPriority] = mapped_column(Enum(AnnouncementPriority), default=AnnouncementPriority.NORMAL)
    
    # Targeting
    scope: Mapped[AnnouncementScope] = mapped_column(Enum(AnnouncementScope), default=AnnouncementScope.GLOBAL)
    target_criteria: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    
    # Scheduling & Lifecycle
    status: Mapped[AnnouncementStatus] = mapped_column(Enum(AnnouncementStatus), default=AnnouncementStatus.DRAFT)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    author: Mapped["User"] = relationship("User")
