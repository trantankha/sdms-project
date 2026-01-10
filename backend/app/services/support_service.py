from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.base import BaseService
from app.models.support import MaintenanceRequest
from app.models.operations import Contract, ContractStatus
from app.models.enums import RequestStatus
from app.schemas.support import MaintenanceRequestCreate, MaintenanceRequestUpdate

class SupportService(BaseService[MaintenanceRequest, MaintenanceRequestCreate, MaintenanceRequestUpdate]):
    def create_request(self, db: Session, obj_in: MaintenanceRequestCreate, user_id: UUID) -> MaintenanceRequest:
        if not obj_in.room_code:
            active_contract = db.query(Contract).filter(
                Contract.student_id == user_id,
                Contract.status == ContractStatus.ACTIVE
            ).order_by(Contract.created_at.desc()).first()
            
            if active_contract and active_contract.bed and active_contract.bed.room:
                obj_in.room_code = active_contract.bed.room.code
        
        db_obj = MaintenanceRequest(
            **obj_in.dict(),
            user_id=user_id,
            status=RequestStatus.OPEN
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_my_requests(self, db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(
            MaintenanceRequest.user_id == user_id
        ).order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit).all()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, status: Optional[RequestStatus] = None) -> List[MaintenanceRequest]:
        query = db.query(MaintenanceRequest)
        if status:
            query = query.filter(MaintenanceRequest.status == status)
        return query.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit).all()

    def cancel_request(self, db: Session, request_id: UUID, user_id: UUID) -> MaintenanceRequest:
        request = self.get(db, id=request_id)
        if not request:
            raise HTTPException(status_code=404, detail="Yêu cầu không tìm thấy")
        
        if request.user_id != user_id:
             raise HTTPException(status_code=403, detail="Không có quyền truy cập")
             
        if request.status != RequestStatus.OPEN:
             raise HTTPException(status_code=400, detail="Chỉ có thể hủy yêu cầu khi đang ở trạng thái 'Mới'")
             
        request.status = RequestStatus.REJECTED
        db.add(request)
        db.commit()
        db.refresh(request)
        return request

support_service = SupportService(MaintenanceRequest)
