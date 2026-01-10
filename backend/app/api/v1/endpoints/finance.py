from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.models.enums import UtilityType
from app.services.finance_service import finance_service, utility_config_service
from app.schemas.finance import (
    UtilityConfigResponse, UtilityConfigUpdate, UtilityConfigCreate,
    UtilityRecordingBatch, UtilityRecordingCreate, UtilityReadingResponse,
    InvoiceResponse, InvoiceCreate,
    PaymentResponse, PaymentCreate,
    InvoiceStatus
)

router = APIRouter()

# --- UTILITY CONFIGURATION ---

@router.get("/config", response_model=List[UtilityConfigResponse])
def get_utility_configs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get all utility rate configurations.
    """
    return utility_config_service.get_multi(db)

@router.put("/config/{config_id}", response_model=UtilityConfigResponse)
def update_utility_config(
    config_id: UUID,
    config_in: UtilityConfigUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Admin only to change price
) -> Any:
    """
    Update utility rate (e.g. price per unit).
    """
    config = utility_config_service.get(db, id=config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    config = utility_config_service.update(db, db_obj=config, obj_in=config_in)
    return config

# --- UTILITY READINGS ---

@router.post("/readings/batch", response_model=List[UtilityReadingResponse]) # Return specific schema if needed
def record_utility_readings(
    batch: UtilityRecordingBatch,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Record a batch of electric/water readings.
    """
    results = finance_service.record_utility_batch(db, recordings=batch.items, recorder_id=current_user.id)
    results = finance_service.record_utility_batch(db, recordings=batch.items, recorder_id=current_user.id)
    return results

@router.get("/readings/latest", response_model=List[UtilityReadingResponse])
def get_latest_readings(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get the latest finalized readings for all rooms.
    """
    return finance_service.get_latest_readings(db)

# --- INVOICES ---

@router.post("/invoices/generate", response_model=List[InvoiceResponse])
def generate_monthly_invoices(
    month: int,
    year: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Generate invoices for all active contracts for a specific month/year.
    """
    # Check if already generated? Service doesn't check, triggers duplication if run twice.
    # In real app, UI should warn or Service should be idempotent.
    invoices = finance_service.generate_monthly_invoices(db, month=month, year=year)
    return invoices

@router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(
    skip: int = 0,
    limit: int = 20,
    student_id: Optional[UUID] = None,
    status: Optional[InvoiceStatus] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    List invoices. Students only see their own. Managers see all or filter.
    """
    if current_user.role == "SINH_VIEN":
        # ... existing logic ...
        return finance_service.get_invoices(
            db, 
            skip=skip, 
            limit=limit, 
            student_id=current_user.id,
            exclude_status=[InvoiceStatus.CANCELLED],
            keyword=keyword
        )
    
    # Manager/Admin
    invoices = finance_service.get_invoices(db, skip=skip, limit=limit, status=status, keyword=keyword) 
    return invoices

@router.put("/invoices/{invoice_id}/cancel", response_model=InvoiceResponse)
def cancel_invoice(
    invoice_id: UUID,
    reason: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Cancel an invoice.
    """
    invoice = finance_service.cancel_invoice(db, invoice_id=invoice_id, reason=reason)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

# --- PAYMENTS ---

@router.post("/payments", response_model=PaymentResponse)
def create_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Record a payment for an invoice.
    """
    # Check if invoice exists
    # Service handles logic
    payment = finance_service.process_payment(db, payment_in)
    return payment

@router.get("/stats")
def get_finance_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get finance statistics (Revenue, Overdue, Pending).
    """
    return finance_service.get_revenue_stats(db)
