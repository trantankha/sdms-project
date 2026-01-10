from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User, UserRole
from app.schemas.operations import ContractCreate, ContractResponse, ContractUpdateStatus, LiquidationCreate, LiquidationResponse, AdminContractCreate
from app.services.contract_service import contract_service

router = APIRouter()

@router.get("/stats")
def get_contract_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Get contract statistics (Pending, Active).
    """
    return contract_service.get_contract_stats(db)

@router.post("/admin-create", response_model=ContractResponse)
def admin_create_contract(
    contract_in: AdminContractCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Admin tạo hợp đồng cho sinh viên.
    """
    # 1. Update Student Info if provided (Hotfix for missing profile data)
    if contract_in.student_gender or contract_in.student_phone:
        student = db.query(User).filter(User.id == contract_in.student_id).first()
        if not student:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Student not found")
        
        if contract_in.student_gender:
            student.gender = contract_in.student_gender
        if contract_in.student_phone:
            student.phone_number = contract_in.student_phone
            
        db.add(student)
        db.commit()
        db.refresh(student)

    # Reuse book_bed logic but pass the student_id from the input
    return contract_service.book_bed(db, user_id=contract_in.student_id, contract_in=contract_in)

@router.post("/book", response_model=ContractResponse)
def student_book_bed(
    contract_in: ContractCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Sinh viên đăng ký thuê giường.
    """
    return contract_service.book_bed(db, user_id=current_user.id, contract_in=contract_in)

@router.get("/me", response_model=List[ContractResponse])
def read_my_contracts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Xem lịch sử hợp đồng của chính mình.
    """
    return contract_service.get_my_contracts(db, user_id=current_user.id)

@router.get("/", response_model=List[ContractResponse])
def read_all_contracts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    campus_id: UUID = None, # Add campus_id filter
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_admin), # Chỉ Admin mới xem được hết
) -> Any:
    """
    Admin xem danh sách toàn bộ hợp đồng.
    """
    return contract_service.get_all(db, skip=skip, limit=limit, campus_id=campus_id, keyword=keyword, status=status)

@router.put("/{contract_id}/status", response_model=ContractResponse)
def admin_update_contract_status(
    contract_id: UUID,
    status_in: ContractUpdateStatus,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin), # Chỉ Admin mới được duyệt
) -> Any:
    """
    Admin duyệt (ACTIVE) hoặc từ chối/hủy (TERMINATED) hợp đồng.
    """
    return contract_service.update_status(db, contract_id=contract_id, status_in=status_in)

@router.post("/liquidate", response_model=LiquidationResponse)
def liquidate_contract(
    liquidation_in: LiquidationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Liquidate a contract (Checkout).
    """
    from app.services.liquidation_service import liquidation_service
    return liquidation_service.liquidate_contract(db, confirmed_by=current_user.id, obj_in=liquidation_in)

@router.delete("/{contract_id}/cancel")
def student_cancel_contract(
    contract_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Sinh viên tự hủy hợp đồng (Chỉ khi CHƯA THANH TOÁN).
    """
    return contract_service.cancel_contract(db, contract_id=contract_id, user_id=current_user.id)


@router.get("/{contract_id}", response_model=ContractResponse)
def read_contract(
    contract_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get contract by ID.
    Admin can get any contract. Student can only get their own.
    """
    return contract_service.get(db, id=contract_id, user_id=current_user.id, role=current_user.role)
