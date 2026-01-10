from typing import Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.schemas.user import UserCreate
from app.services.base import BaseService
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate, UserUpdate
from typing import Any, Dict, Union
from sqlalchemy import or_

class UserService(BaseService[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            role=obj_in.role,
            student_code=obj_in.student_code,
            phone_number=obj_in.phone_number,
            gender=obj_in.gender,
            is_active=True
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
            
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def get_multi_with_filter(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        role: Optional[str] = None,
        keyword: Optional[str] = None,
        is_active: Optional[bool] = None
    ):
        query = db.query(self.model)
        
        if role:
            query = query.filter(self.model.role == role)
            
        if keyword:
            search = f"%{keyword}%"
            query = query.filter(
                or_(
                    self.model.email.ilike(search),
                    self.model.full_name.ilike(search),
                    self.model.student_code.ilike(search)
                )
            )

        if is_active is not None:
             query = query.filter(self.model.is_active == is_active)
            
        return query.offset(skip).limit(limit).all()

user_service = UserService(User)