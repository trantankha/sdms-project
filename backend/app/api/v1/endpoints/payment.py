from typing import Any, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api import deps
from app.services.payment_gateway_service import payment_gateway_service
from app.models.users import User

router = APIRouter()

class PaymentUrlRequest(BaseModel):
    invoice_id: UUID
    amount: float

@router.post("/create_url")
def create_payment_url(
    req: PaymentUrlRequest,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Tạo URL thanh toán (redirect tới Gateway).
    """
    client_ip = request.client.host
    
    # 1. Fetch Student Info (Room - Building)
    from app.models.operations import Contract, ContractStatus
    contract = db.query(Contract).filter(
        Contract.student_id == current_user.id,
        Contract.status == ContractStatus.ACTIVE
    ).first()
    
    student_info = "Unknown"
    if contract and contract.bed and contract.bed.room and contract.bed.room.building:
        building_name = contract.bed.room.building.name
        room_code = contract.bed.room.code
        student_info = f"{building_name} - {room_code}"
    
    url = payment_gateway_service.create_payment_url(req.invoice_id, req.amount, client_ip, current_user.full_name, student_info)
    return {"url": url}

@router.post("/ipn")
async def payment_ipn(
    request: Request,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Webhook (IPN) nhận thông báo kết quả thanh toán từ Gateway.
    """
    # IPN thường gửi params qua Query String hoặc Body FORM
    # Ở đây ta giả lập gửi JSON hoặc Form
    params = await request.json()
    result = payment_gateway_service.process_ipn(db, params)
    return result

@router.get("/payment_return")
def payment_return(
    request: Request,
    db: Session = Depends(deps.get_db)
) -> Any:
    params = dict(request.query_params)
    
    is_valid = payment_gateway_service.verify_ipn(params.copy())
    
    if is_valid and params.get("responseCode") == "00":
         import time
         from app.models.finance import Invoice, InvoiceStatus
         
         invoice_id = params.get("orderId")
         if invoice_id:
             for _ in range(5): # Wait up to 2.5 seconds
                 db.commit() # Ensure we see latest data
                 inv = db.query(Invoice).filter(Invoice.id == UUID(invoice_id)).first()
                 if inv and inv.status == InvoiceStatus.PAID:
                     return {"status": "success", "message": "Giao dịch thành công", "data": params}
                 time.sleep(0.5)
         
         # Even if status isn't PAID yet (slow IPN), we verify the Signature is valid.
         return {"status": "success", "message": "Giao dịch hợp lệ (đang xử lý)", "data": params}
    else:
         return {"status": "error", "message": "Giao dịch thất bại hoặc chữ ký không hợp lệ", "data": params}
