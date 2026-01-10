from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.models.conduct import Violation
from app.models.users import User
from app.schemas.conduct import ViolationCreate, ViolationUpdate
from fastapi import HTTPException, status

class ConductService:
    def create_violation(self, db: Session, obj_in: ViolationCreate) -> Violation:
        user_id = obj_in.student_id
        if not user_id:
            user = None
            if obj_in.student_code:
                user = db.query(User).filter(User.student_code == obj_in.student_code).first()
            elif obj_in.email:
                user = db.query(User).filter(User.email == obj_in.email).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Student not found with provided code or email"
                )
            user_id = user.id

        db_obj = Violation(
            user_id=user_id,
            title=obj_in.title,
            description=obj_in.description,
            severity=obj_in.severity,
            points_deducted=obj_in.points_deducted,
            violation_date=obj_in.violation_date
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, id: UUID) -> Optional[Violation]:
        return db.query(Violation).filter(Violation.id == id).first()

    def update_violation(self, db: Session, *, db_obj: Violation, obj_in: ViolationUpdate) -> Violation:
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete_violation(self, db: Session, *, id: UUID) -> Violation:
        obj = db.query(Violation).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def get_by_user(self, db: Session, user_id: UUID) -> List[Violation]:
        return db.query(Violation).filter(Violation.user_id == user_id).all()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Violation]:
        return db.query(Violation).offset(skip).limit(limit).all()

conduct_service = ConductService()
