from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.schemas.conduct import ViolationCreate, ViolationResponse, ViolationUpdate
from app.services.conduct_service import conduct_service

router = APIRouter()

@router.post("/violations", response_model=ViolationResponse)
def create_violation(
    violation_in: ViolationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Only Admin can create
) -> Any:
    """
    Ghi nhận lỗi vi phạm (Chỉ dành cho Admin/Quản lý).
    """
    return conduct_service.create_violation(db, obj_in=violation_in)

@router.get("/me", response_model=List[ViolationResponse])
def read_my_violations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Xem danh sách lỗi vi phạm của chính mình.
    """
    return conduct_service.get_by_user(db, user_id=current_user.id)

@router.get("/violations", response_model=List[ViolationResponse])
def read_all_violations(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Only Admin
) -> Any:
    """
    Admin xem danh sách tất cả vi phạm.
    """
    return conduct_service.get_all(db, skip=skip, limit=limit)

@router.put("/violations/{id}", response_model=ViolationResponse)
def update_violation(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    violation_in: ViolationUpdate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Cập nhật thông tin vi phạm.
    """
    violation = conduct_service.get(db, id=id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return conduct_service.update_violation(db, db_obj=violation, obj_in=violation_in)

@router.delete("/violations/{id}", response_model=ViolationResponse)
def delete_violation(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Xóa hồ sơ vi phạm.
    """
    violation = conduct_service.get(db, id=id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return conduct_service.delete_violation(db, id=id)
