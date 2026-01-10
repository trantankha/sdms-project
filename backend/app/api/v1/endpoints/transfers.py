from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.schemas.transfers import TransferRequestCreate, TransferRequestResponse, TransferRequestUpdate
from app.services.transfer_service import transfer_service

router = APIRouter()

@router.post("/", response_model=TransferRequestResponse)
def create_transfer_request(
    request_in: TransferRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Sinh viên gửi yêu cầu chuyển phòng.
    """
    return transfer_service.create_request(db, user_id=current_user.id, obj_in=request_in)

@router.get("/me", response_model=List[TransferRequestResponse])
def read_my_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Xem lịch sử yêu cầu chuyển phòng của chính mình.
    """
    return transfer_service.get_my_requests(db, user_id=current_user.id)

@router.get("/", response_model=List[TransferRequestResponse])
def read_all_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Only Admin
) -> Any:
    """
    Admin xem danh sách yêu cầu chuyển phòng.
    """
    return transfer_service.get_all(db, skip=skip, limit=limit)

@router.put("/{request_id}", response_model=TransferRequestResponse)
def update_transfer_status(
    request_id: UUID,
    status_in: TransferRequestUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Only Admin
) -> Any:
    """
    Admin duyệt (APPROVED) hoặc từ chối (REJECTED) yêu cầu chuyển phòng.
    Nếu APPROVED, hệ thống sẽ thực hiện chuyển đổi giường (đổi Contract) ngay lập tức.
    """
    return transfer_service.update_status(db, request_id=request_id, obj_in=status_in)
