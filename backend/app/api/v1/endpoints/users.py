from typing import Any, List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.core.config import settings
from app.models.users import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPasswordUpdate
from app.services.user_service import user_service
from app.core import security

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    role: Optional[UserRole] = None,
    keyword: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve users.
    Only Admin/Manager can list users.
    (Assuming 'get_current_active_admin' checks for ADMIN role. 
     If Manager also needs access, logic should be adjusted to allow Manager)
    """
    users = user_service.get_multi_with_filter(
        db, skip=skip, limit=limit, role=role, keyword=keyword, is_active=is_active
    )
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user.
    Only Admin can create users.
    """
    user = user_service.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = user_service.create(db, obj_in=user_in)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def read_user_by_id(
    user_id: UUID,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = user_service.get(db, id=user_id)
    if not user:
         raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    
    # Check permissions: Admin/Manager or the user themselves
    if user.id == current_user.id:
        return user
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user), # Allow any user to reach here
) -> Any:
    """
    Update a user.
    Users can update themselves. Admin can update anyone.
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    
    # Permission check
    if user.id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
        
    user = user_service.update(db, db_obj=user, obj_in=user_in)
    return user

@router.put("/{user_id}/password", response_model=UserResponse)
def update_user_password(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    password_in: UserPasswordUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update password.
    User can update their own password.
    Admin can update any password (logic below focuses on self-update primarily or Admin override without old password check might be needed in different endpoint, but here we stick to flow).
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
        
    # Permission check
    if user.id != current_user.id and current_user.role != UserRole.ADMIN:
         raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )

    # Verify old password
    if not security.verify_password(password_in.current_password, user.hashed_password):
         raise HTTPException(
            status_code=400, detail="Incorrect password"
        )
    
    # Update new password
    new_password_hash = security.get_password_hash(password_in.new_password)
    user.hashed_password = new_password_hash
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Delete a user (Soft delete).
    """
    user = user_service.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Users cannot delete themselves",
        )
        
    # Soft delete
    user.is_active = False
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
