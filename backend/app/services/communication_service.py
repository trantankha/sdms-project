from datetime import datetime
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional, Union
from app.models.communication import Announcement
from app.models.enums import AnnouncementStatus, AnnouncementScope, UserRole
from app.schemas.communication import AnnouncementCreate, AnnouncementUpdate
from app.models.users import User

class CommunicationService:
    def create_announcement(self, db: Session, user_id: UUID, obj_in: AnnouncementCreate) -> Announcement:
        db_obj = Announcement(
            **obj_in.model_dump(),
            created_by=user_id
        )
        if not db_obj.published_at and db_obj.status == AnnouncementStatus.PUBLISHED:
            db_obj.published_at = datetime.utcnow()
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_announcements(self, db: Session, current_user: User, skip: int = 0, limit: int = 100) -> List[Announcement]:
        if current_user.role in [UserRole.ADMIN, UserRole.MANAGER]:
            # Simple query for admins
            return db.query(Announcement)\
                .order_by(Announcement.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()

        now = datetime.utcnow()
        
        # 1. Base Filter: Published & Time Window
        query = db.query(Announcement).filter(
            Announcement.status == AnnouncementStatus.PUBLISHED,
        )
        
        # 2. Fetch candidates
        candidates = query.order_by(Announcement.priority.desc(), Announcement.created_at.desc()).all()
        
        # 3. Targeting Logic (Python Side)
        user_building_id = None
        user_campus_id = None
        
        from app.models.operations import Contract, ContractStatus
        from app.models.infrastructure import Bed, Room, Building as DbBuilding
        
        active_contract = db.query(Contract).join(Bed).join(Room).join(DbBuilding)\
            .filter(Contract.student_id == current_user.id, Contract.status.in_([ContractStatus.ACTIVE, ContractStatus.PENDING]))\
            .order_by(Contract.created_at.desc())\
            .first()
            
        if active_contract:
            location_info = db.query(Room.building_id, DbBuilding.campus_id)\
                .select_from(Contract)\
                .join(Bed).join(Room).join(DbBuilding)\
                .filter(Contract.id == active_contract.id)\
                .first()
                
            if location_info:
                user_building_id = str(location_info.building_id)
                user_campus_id = str(location_info.campus_id)

        visible_announcements = []
        for ann in candidates:
            if ann.scope == AnnouncementScope.GLOBAL:
                visible_announcements.append(ann)
                continue
                
            if not ann.target_criteria:
                continue
                
            criteria = ann.target_criteria
            
            if ann.scope == AnnouncementScope.BUILDING:
                if user_building_id and user_building_id in criteria:
                    visible_announcements.append(ann)
            
            elif ann.scope == AnnouncementScope.ROLE:
                 if current_user.role and current_user.role.value in criteria:
                     visible_announcements.append(ann)

            elif ann.scope == AnnouncementScope.CAMPUS:
                 if user_campus_id and user_campus_id in criteria:
                     visible_announcements.append(ann)
                     
        # 4. Pagination
        return visible_announcements[skip : skip + limit]

    def get_announcement(self, db: Session, announcement_id: UUID) -> Optional[Announcement]:
        return db.query(Announcement).filter(Announcement.id == announcement_id).first()

    def update_announcement(
        self, db: Session, *, db_obj: Announcement, obj_in: Union[AnnouncementUpdate, AnnouncementCreate]
    ) -> Announcement:
        obj_data = db_obj.to_dict() if hasattr(db_obj, "to_dict") else db_obj.__dict__
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        # Auto-set published_at if publishing
        if db_obj.status == AnnouncementStatus.PUBLISHED and not db_obj.published_at:
             db_obj.published_at = datetime.utcnow()

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete_announcement(self, db: Session, *, id: UUID) -> Announcement:
        obj = db.query(Announcement).get(id)
        db.delete(obj)
        db.commit()
        return obj

communication_service = CommunicationService()