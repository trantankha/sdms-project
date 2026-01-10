from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api import deps
from app.services.ai_service import ai_service
from app.models.users import User
from app.models.operations import Contract
from app.models.enums import ContractStatus, InvoiceStatus
from typing import List

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    
class SuggestedQuestion(BaseModel):
    id: int
    text: str

def get_user_context(db: Session, user: User) -> str:
    """
    Builds a context string about the current user's status.
    """
    context_parts = [f"User Name: {user.full_name}"]
    
    # 1. Check Active Contract & Room
    active_contract = db.query(Contract).filter(
        Contract.student_id == user.id,
        Contract.status == ContractStatus.ACTIVE
    ).first()
    
    if active_contract:
        room = active_contract.bed.room
        building = room.building
        context_parts.append(f"Living Status: Active Contract.")
        context_parts.append(f"Address: Room {room.code}, Floor {room.floor}, Building {building.name}.")
        context_parts.append(f"Contract Ends: {active_contract.end_date.strftime('%d/%m/%Y')}.")
    else:
        context_parts.append("Living Status: No active contract (Not currently living in dorm).")

    # 2. Check Unpaid Invoices
    # We can access invoices via relationship if loaded, or query. 
    # For now, let's query via relationship or direct filter if relationship is not eager loaded.
    # Assuming user.invoices or contract.invoices exists, but direct query is safer here.
    # Note: Invoice model links to contract or room. Let's find invoices for this user's contracts.
    
    # Simple logic: Find unpaid invoices attached to user's contracts
    unpaid_count = 0
    unpaid_amount = 0.0
    
    # Reload user with contracts if needed, or just iterate if lazy loading works (it should in this scope)
    # But safer to query Invoices joined with Contract
    from app.models.finance import Invoice
    
    unpaid_invoices = db.query(Invoice).join(Contract).filter(
        Contract.student_id == user.id,
        Invoice.status.in_([InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE])
    ).all()
    
    if unpaid_invoices:
        unpaid_count = len(unpaid_invoices)
        unpaid_amount = sum(inv.remaining_amount for inv in unpaid_invoices)
        context_parts.append(f"Finance: You have {unpaid_count} unpaid/overdue invoices. Total debt: {unpaid_amount:,.0f} VND.")
    else:
        context_parts.append("Finance: No unpaid invoices. Good job!")

    return "\n".join(context_parts)

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Build dynamic context
    user_context = get_user_context(db, current_user)
    
    # Generate response with context
    response_text = await ai_service.generate_response(request.message, user_context)
    return ChatResponse(response=response_text)

@router.get("/suggested", response_model=List[SuggestedQuestion])
async def get_suggested_questions():
    # Predefined list
    # Expanded list of suggested questions
    questions = [
        # Procedures
        {"id": 1, "text": "Làm thế nào để đăng ký phòng?"},
        {"id": 5, "text": "Thủ tục chấm dứt hợp đồng?"},
        {"id": 6, "text": "Tôi muốn chuyển phòng được không?"},
        
        # Rules & Conduct
        {"id": 2, "text": "Quy định về giờ giấc ra vào?"},
        {"id": 7, "text": "Có được nấu ăn trong phòng không?"},
        {"id": 8, "text": "Quy định về tiếp khách người lạ?"},
        
        # Finance & Services
        {"id": 3, "text": "Cách thanh toán tiền điện nước?"},
        {"id": 9, "text": "Tôi có thể xem hóa đơn ở đâu?"},
        {"id": 10, "text": "Phí gửi xe hàng tháng là bao nhiêu?"},
        {"id": 11, "text": "Dịch vụ giặt là hoạt động thế nào?"},
        
        # Issues & Support
        {"id": 4, "text": "Tôi muốn báo cáo sự cố phòng ốc"},
        {"id": 12, "text": "Internet trong phòng bị hỏng"},
        {"id": 13, "text": "Báo cáo mất tài sản"},
        
        # General
        {"id": 14, "text": "Giới thiệu về Ban quản lý KTX"},
        {"id": 15, "text": "Lịch trực ban của các tòa nhà"}
    ]
    import random
    # Select 4 random questions from the pool to keep it fresh
    selected = random.sample(questions, k=min(len(questions), 4))
    return selected
