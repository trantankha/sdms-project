from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.models.enums import UserRole, RequestStatus
from app.services.support_service import support_service
from app.schemas.support import MaintenanceRequestCreate, MaintenanceRequestResponse, MaintenanceRequestUpdate

router = APIRouter()

@router.get("/requests", response_model=List[MaintenanceRequestResponse])
def get_my_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[RequestStatus] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user's requests.
    """
    if current_user.role == UserRole.STUDENT:
        # Students see their own requests (filter by status optional)
        # Note: Service generic get_my_requests doesn't filter by status, I might need to filter in memory or enhance service.
        # Enhancing service is better but for speed:
        requests = support_service.get_my_requests(db, user_id=current_user.id, skip=skip, limit=limit)
        if status:
            requests = [r for r in requests if r.status == status]
        return requests
    
    # Admin/Manager sees all
    return support_service.get_all(db, skip=skip, limit=limit, status=status)

@router.post("/requests", response_model=MaintenanceRequestResponse)
def create_request(
    request_in: MaintenanceRequestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new maintenance request.
    """
    return support_service.create_request(db, obj_in=request_in, user_id=current_user.id)

@router.put("/requests/{request_id}/cancel", response_model=MaintenanceRequestResponse)
def cancel_request(
    request_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Student cancels their own request.
    """
    return support_service.cancel_request(db, request_id=request_id, user_id=current_user.id)

@router.put("/requests/{request_id}", response_model=MaintenanceRequestResponse)
def update_request(
    request_id: UUID,
    request_in: MaintenanceRequestUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager), # Only Manager/Admin
) -> Any:
    """
    Update request status/details (Admin only).
    """
    request = support_service.get(db, id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return support_service.update(db, db_obj=request, obj_in=request_in)
