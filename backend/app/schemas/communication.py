from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.models.enums import AnnouncementPriority, AnnouncementScope, AnnouncementStatus

class AnnouncementBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[AnnouncementPriority] = AnnouncementPriority.NORMAL
    scope: Optional[AnnouncementScope] = AnnouncementScope.GLOBAL
    target_criteria: Optional[List[str]] = None
    status: Optional[AnnouncementStatus] = AnnouncementStatus.DRAFT
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class AnnouncementCreate(AnnouncementBase):
    title: str
    content: str

class AnnouncementUpdate(AnnouncementBase):
    pass

class AnnouncementInDBBase(AnnouncementBase):
    id: UUID
    title: str
    content: str
    created_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class Announcement(AnnouncementInDBBase):
    author_name: Optional[str] = None
