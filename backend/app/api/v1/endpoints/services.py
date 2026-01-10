from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User, UserRole
from app.schemas.service import ServicePackage, ServicePackageCreate, Subscription, SubscriptionCreate
from app.services.service_mgmt_service import service_mgmt_service

router = APIRouter()

@router.get("/packages", response_model=List[ServicePackage])
def list_service_packages(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
) -> Any:
    """
    List all available service packages (Laundry, Parking, etc).
    """
    return service_mgmt_service.get_all_packages(db, skip=skip, limit=limit)

@router.post("/packages", response_model=ServicePackage)
def create_service_package(
    package_in: ServicePackageCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Admin create new service package.
    """
    return service_mgmt_service.create_package(db, obj_in=package_in)

@router.put("/packages/{package_id}", response_model=ServicePackage)
def update_service_package(
    *,
    db: Session = Depends(deps.get_db),
    package_id: str,
    package_in: ServicePackageCreate,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a service package.
    """
    return service_mgmt_service.update_package(db, package_id=package_id, obj_in=package_in)

@router.post("/subscribe", response_model=Subscription)
def subscribe_service(
    subscription_in: SubscriptionCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Student subscribe to a service.
    """
    return service_mgmt_service.subscribe_student(db, user_id=current_user.id, obj_in=subscription_in)

@router.get("/subscriptions", response_model=List[Subscription])
def get_all_subscriptions_admin(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all service subscriptions (Admin only).
    """
    return service_mgmt_service.get_all_subscriptions(db, skip=skip, limit=limit)

@router.get("/my-subscriptions", response_model=List[Subscription])
def get_my_subscriptions(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get active subscriptions of current user.
    """
    return service_mgmt_service.get_student_subscriptions(db, user_id=current_user.id)
