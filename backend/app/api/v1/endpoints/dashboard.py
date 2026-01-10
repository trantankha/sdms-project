from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("/activities")
def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get recent system activities (New Contracts, Paid Invoices).
    """
    return dashboard_service.get_recent_activities(db, limit=limit)

@router.get("/student/stats")
def get_student_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get statistics for the current student dashboard.
    """
    if current_user.role != "SINH_VIEN": # Or UserRole.STUDENT check
         pass # Allow others for testing or restrict? Usually dashboard is role-specific.
    
    return dashboard_service.get_student_stats(db, student_id=current_user.id)
