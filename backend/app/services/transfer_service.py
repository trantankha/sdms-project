from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from typing import List
from app.models.operations import TransferRequest, Contract, ContractStatus
from app.models.finance import Invoice, InvoiceStatus
from app.models.infrastructure import Bed
from app.models.enums import TransferStatus, ContractStatus
from app.schemas.transfers import TransferRequestCreate, TransferRequestUpdate

class TransferService:
    def create_request(self, db: Session, user_id: UUID, obj_in: TransferRequestCreate) -> TransferRequest:
        # 1. Validate Contract
        contract = db.query(Contract).filter(Contract.id == obj_in.contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Hợp đồng không tồn tại")
        
        if contract.student_id != user_id:
            raise HTTPException(status_code=403, detail="Bạn không sở hữu hợp đồng này")
            
        if contract.status != ContractStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Chỉ hợp đồng đang hoạt động mới được yêu cầu chuyển phòng")

        # 2. Check duplicate pending request
        existing = db.query(TransferRequest).filter(
            TransferRequest.contract_id == obj_in.contract_id,
            TransferRequest.status == TransferStatus.PENDING
        ).first()
        if existing:
             raise HTTPException(status_code=400, detail="Bạn đang có yêu cầu chuyển phòng chờ duyệt")
             
        # 3. Create Request
        db_obj = TransferRequest(
            student_id=user_id,
            contract_id=obj_in.contract_id,
            target_bed_id=obj_in.target_bed_id,
            reason=obj_in.reason,
            status=TransferStatus.PENDING
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_my_requests(self, db: Session, user_id: UUID) -> List[TransferRequest]:
        return db.query(TransferRequest).filter(TransferRequest.student_id == user_id).all()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[TransferRequest]:
        from sqlalchemy.orm import joinedload
        from app.models.infrastructure import Bed, Room, Building
        
        results = db.query(TransferRequest)\
            .options(
                joinedload(TransferRequest.student),
                joinedload(TransferRequest.contract).joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building)
            )\
            .offset(skip).limit(limit).all()
            
        for req in results:
            if req.student:
                req.student_name = req.student.full_name
                req.student_code = getattr(req.student, "student_code", req.student.email)
            
            if req.contract and req.contract.bed:
                bed = req.contract.bed
                req.current_bed_label = bed.label or bed.name
                
                if bed.room:
                    room = bed.room
                    building_name = room.building.name if room.building else ""
                    req.current_room_name = f"{room.code} - {building_name}"

            if req.target_bed_id:
                target_bed = db.query(Bed).filter(Bed.id == req.target_bed_id).first()
                if target_bed:
                    req.target_bed_label = target_bed.label or target_bed.name
                    if target_bed.room:
                         t_room = target_bed.room
                         t_bld_name = t_room.building.name if t_room.building else ""
                         req.target_room_name = f"{t_room.code} - {t_bld_name}"
                    
        return results

    def update_status(self, db: Session, request_id: UUID, obj_in: TransferRequestUpdate) -> TransferRequest:
        req = db.query(TransferRequest).filter(TransferRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Yêu cầu không tồn tại")
            
        if req.status != TransferStatus.PENDING:
             raise HTTPException(status_code=400, detail="Yêu cầu đã được xử lý trước đó")
             
        req.admin_response = obj_in.admin_response
        req.status = obj_in.status
        
        if obj_in.status == TransferStatus.REJECTED:
            db.add(req)
            db.commit()
            db.refresh(req)
            return req
            
        if obj_in.status == TransferStatus.APPROVED:
            # 1. Determine Target Bed
            target_bed_id = obj_in.assigned_bed_id or req.target_bed_id
            if not target_bed_id:
                raise HTTPException(status_code=400, detail="Cần chỉ định giường đích để duyệt")
                
            # 2. Validate Target Bed
            from app.models.infrastructure import Room, BedStatus
            new_bed = db.query(Bed).filter(Bed.id == target_bed_id).first()
            if not new_bed:
                 raise HTTPException(status_code=404, detail="Giường đích không tồn tại")
            
            if new_bed.status != BedStatus.AVAILABLE:
                 raise HTTPException(status_code=400, detail="Giường đích không khả dụng (Đã có người hoặc bảo trì)")

            # 3. Get Old Contract & Data
            contract = db.query(Contract).filter(Contract.id == req.contract_id).first()
            if not contract or contract.status != ContractStatus.ACTIVE:
                 raise HTTPException(status_code=400, detail="Hợp đồng gốc không còn hiệu lực để chuyển")
            
            # 4. Terminate Old Contract (Thanh lý nhanh)
            from datetime import datetime, timezone, timedelta
            now = datetime.now(timezone.utc)
            
            old_bed_id = contract.bed_id
            old_bed = db.query(Bed).filter(Bed.id == old_bed_id).first()
            
            contract.status = ContractStatus.TERMINATED
            contract.end_date = now
            db.add(contract)
            
            if old_bed:
                old_bed.status = BedStatus.AVAILABLE
                old_bed.is_occupied = False
                db.add(old_bed)
                
            # 5. Create New Pending Contract
            new_room = db.query(Room).filter(Room.id == new_bed.room_id).first()
            
            new_price = new_room.base_price
            new_deposit = new_room.base_price
            
            original_end = contract.original_end_date if hasattr(contract, 'original_end_date') else contract.end_date
            if original_end <= now:
                original_end = now + timedelta(days=180)

            new_contract = Contract(
                student_id=req.student_id,
                bed_id=new_bed.id,
                start_date=now,
                end_date=original_end,
                price_per_month=new_price,
                deposit_amount=new_deposit,
                status=ContractStatus.PENDING
            )
            db.add(new_contract)
            db.flush()
            
            # 6. Financial Reconciliation & New Invoice
            # A. Cancel Old Unpaid Invoices
            old_unpaid = db.query(Invoice).filter(
                Invoice.contract_id == contract.id,
                Invoice.status == InvoiceStatus.UNPAID
            ).all()
            for inv in old_unpaid:
                inv.status = InvoiceStatus.CANCELLED
                details = inv.details if inv.details else {}
                if isinstance(details, dict):
                     details["cancellation_reason"] = "Transferred to new room"
                inv.details = details
                db.add(inv)

            # B. Calculate Refund for Unused Days (If Current Month is Paid)
            from calendar import monthrange
            
            # Check if there is a PAID invoice for the current month
            # Logic: Invoice due in current month + status PAID
            current_month_paid_invoice = db.query(Invoice).filter(
                Invoice.contract_id == contract.id,
                Invoice.status == InvoiceStatus.PAID,
                Invoice.due_date >= now.replace(day=1).date(), # Simple heuristic: Invoice created/due this month
                Invoice.due_date <= (now.replace(day=1) + timedelta(days=32)).replace(day=1).date()
            ).first()

            refund_amount = 0
            refund_note = ""
            
            if current_month_paid_invoice:
                days_in_month = monthrange(now.year, now.month)[1]
                unused_days = days_in_month - now.day
                if unused_days > 0:
                    daily_rate = contract.price_per_month / days_in_month
                    refund_amount = daily_rate * unused_days
                    refund_note = f"Hoàn tiền {unused_days} ngày thuê chưa sử dụng ({refund_amount:,.0f}đ). "

            # C. Calculate Final Amount
            old_deposit = contract.deposit_amount or 0
            
            # Total Credit = Old Deposit + Refund Amount
            total_credit = old_deposit + refund_amount
            
            required_amount = new_price + new_deposit # 1st Month Rent + New Deposit
            
            final_amount = max(0, required_amount - total_credit)
            
            credit_note = f"Khấu trừ cọc cũ: -{old_deposit:,.0f}đ. "
            if refund_amount > 0:
                credit_note += f"Hoàn tiền thuê cũ: -{refund_amount:,.0f}đ. "
            
            # D. Create New Invoice
            invoice = Invoice(
                contract_id=new_contract.id,
                title="Thanh toán Chuyển phòng (Cọc mới + Tháng đầu)",
                total_amount=final_amount,
                remaining_amount=final_amount,
                status=InvoiceStatus.UNPAID,
                due_date=now + timedelta(days=3),
                details={
                    "type": "TRANSFER_FEE",
                    "old_contract_id": str(contract.id),
                    "old_deposit_credit": old_deposit,
                    "refund_rent_amount": refund_amount,
                    "original_total": required_amount,
                    "note": f"Phí chuyển phòng: {required_amount:,.0f}đ. {credit_note}Còn lại: {final_amount:,.0f}đ."
                }
            )
            db.add(invoice)

            req.admin_response = obj_in.admin_response or "Đã duyệt chuyển phòng. Vui lòng kiểm tra hóa đơn mới."
            req.status = obj_in.status
            req.target_bed_id = target_bed_id
            
            db.add(req)
            db.commit()
            db.refresh(req)
            return req

transfer_service = TransferService()
