from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from uuid import UUID
from app.models.operations import Contract, ContractStatus
from app.models.infrastructure import Bed, Room, BedStatus
from app.models.users import User, UserRole
from app.models.enums import GenderType
from app.models.finance import Invoice, InvoiceStatus
from app.schemas.operations import ContractCreate, ContractUpdateStatus
from datetime import datetime, timezone, timedelta
import math

class ContractService:
    def calculate_months(self, start_date: datetime, end_date: datetime) -> int:
        if start_date.tzinfo is None:
            start_date = start_date.replace(tzinfo=timezone.utc)
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
            
        delta = end_date - start_date
        days = delta.days
        if days < 0:
            return 0
        return math.ceil(days / 30)

    def book_bed(self, db: Session, user_id: UUID, contract_in: ContractCreate) -> Contract:
        # --- 1. Logic thời gian ---
        start_date = datetime.now(timezone.utc)
        end_date = contract_in.end_date

        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
        else:
            end_date = end_date.astimezone(timezone.utc)
        
        if end_date <= start_date:
            raise HTTPException(
                status_code=400, 
                detail="Ngày kết thúc hợp đồng phải sau ngày hiện tại!"
            )

        # --- 2. Kiểm tra giường ---
        bed = db.query(Bed).filter(Bed.id == contract_in.bed_id).first()
        if not bed:
            raise HTTPException(status_code=404, detail="Giường không tồn tại")
        if bed.status != BedStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Giường này không khả dụng (Đã có người hoặc đang bảo trì)")

        existing_contract = db.query(Contract).filter(
            Contract.bed_id == contract_in.bed_id,
            Contract.status.in_([ContractStatus.PENDING, ContractStatus.ACTIVE])
        ).first()

        if existing_contract:
            raise HTTPException(status_code=400, detail="Giường này đang được giữ chỗ (Chờ duyệt)")

        # --- 2.1 Kiểm tra User và Giới tính ---
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

        room = db.query(Room).filter(Room.id == bed.room_id).first()
        
        if room.gender_type != GenderType.MIXED:
            if not user.gender:
                raise HTTPException(status_code=400, detail="Vui lòng cập nhật giới tính trong hồ sơ trước khi đăng ký!")
            
            if user.gender != room.gender_type:
                 gender_map = {
                     GenderType.MALE: "Nam",
                     GenderType.FEMALE: "Nữ",
                     GenderType.MIXED: "Hỗn hợp"
                 }
                 required_gender = gender_map.get(room.gender_type, room.gender_type.value)
                 raise HTTPException(status_code=400, detail=f"Phòng này chỉ dành cho sinh viên {required_gender}!")

        # --- 3. Lấy giá và Tính tiền ---
        months_count = self.calculate_months(start_date, contract_in.end_date)
        
        if months_count < 1:
            months_count = 1 
            
        total_rent = months_count * room.base_price
        deposit = room.base_price 
        grand_total = total_rent + deposit

        # --- 4. Tạo hợp đồng ---
        contract = Contract(
            student_id=user_id,
            bed_id=contract_in.bed_id,
            start_date=start_date,
            end_date=contract_in.end_date,
            price_per_month=room.base_price, 
            deposit_amount=deposit,
            status=ContractStatus.PENDING
        )
        db.add(contract)
        db.flush()
        db.commit()
        db.refresh(contract)
        return contract

    def get_my_contracts(self, db: Session, user_id: UUID):
        contracts = db.query(Contract).options(
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.room_type),
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building),
            joinedload(Contract.student)
        ).filter(Contract.student_id == user_id).order_by(Contract.created_at.desc()).all()
        for c in contracts:
            if c.bed:
                c.room = c.bed.room
        return contracts

    def get_all(self, db: Session, skip: int = 0, limit: int = 100, campus_id: UUID = None, keyword: str = None, status: str = None):
        query = db.query(Contract).options(
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.room_type),
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building),
            joinedload(Contract.student)
        )
        
        if status and status != 'ALL':
             query = query.filter(Contract.status == status)
        
        if campus_id:
             from app.models.infrastructure import Building
             query = query.join(Contract.bed).join(Bed.room).join(Room.building).filter(Building.campus_id == campus_id)

        if keyword:
            search = f"%{keyword}%"
            query = query.join(Contract.student).filter(
                (User.full_name.ilike(search)) |
                (User.student_code.ilike(search)) |
                (User.email.ilike(search))
            )

        contracts = query.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()
        for c in contracts:
            if c.bed:
                c.room = c.bed.room
        return contracts

    def update_status(self, db: Session, contract_id: UUID, status_in: ContractUpdateStatus) -> Contract:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Hợp đồng không tìm thấy")

        if status_in.status == ContractStatus.ACTIVE and contract.status != ContractStatus.ACTIVE:
            # Nếu duyệt -> Đánh dấu giường đã có người
            bed = db.query(Bed).filter(Bed.id == contract.bed_id).first()
            bed.status = BedStatus.OCCUPIED
            bed.is_occupied = True # Legacy sync
            db.add(bed)

            start_date = contract.start_date
            
            room = bed.room
            if not room:
                 room = db.query(Room).filter(Room.id == bed.room_id).first()
            
            billable_months = 1
            total_rent = billable_months * room.base_price
            deposit = room.base_price
            grand_total = total_rent + deposit

            invoice_title = f"Thanh toán Đợt 1: Cọc + Tiền thuê tháng đầu"
            
            invoice = Invoice(
                contract_id=contract.id,
                title=invoice_title,
                total_amount=grand_total,
                status=InvoiceStatus.UNPAID,
                # Add default due_date: 5 days from now
                due_date=datetime.now(timezone.utc) + timedelta(days=5),
                details={
                    "rent_months": billable_months,
                    "price_per_month": room.base_price,
                    "deposit": deposit,
                    "start_date": str(start_date),
                    "note": "Hóa đơn thanh toán lần đầu (Cọc + Tháng 1). Các tháng tiếp theo sẽ thanh toán hàng tháng."
                }
            )
            db.add(invoice)
        
        if status_in.status in [ContractStatus.EXPIRED, ContractStatus.TERMINATED] and contract.status == ContractStatus.ACTIVE:
            bed = db.query(Bed).filter(Bed.id == contract.bed_id).first()
            bed.status = BedStatus.AVAILABLE
            bed.is_occupied = False
            db.add(bed)

            if status_in.status == ContractStatus.TERMINATED:
                unpaid_invoices = db.query(Invoice).filter(
                    Invoice.contract_id == contract.id,
                    Invoice.status == InvoiceStatus.UNPAID
                ).all()
                for inv in unpaid_invoices:
                    inv.status = InvoiceStatus.CANCELLED
                    if not inv.details:
                        inv.details = {}
                    new_details = dict(inv.details or {})
                    new_details["cancel_reason"] = "Contract Terminated by Admin"
                    inv.details = new_details
                    db.add(inv)

        contract.status = status_in.status
        db.add(contract)
        db.commit()
        db.refresh(contract)
        return contract

    def cancel_contract(self, db: Session, contract_id: UUID, user_id: UUID):
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Hợp đồng không tồn tại")
        
        # 1. Check quyền chính chủ
        if contract.student_id != user_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền hủy hợp đồng này")

        # 2. Check trạng thái hợp đồng
        if contract.status == ContractStatus.ACTIVE:
            raise HTTPException(
                status_code=400, 
                detail="Hợp đồng đang có hiệu lực. Vui lòng làm thủ tục thanh lý hợp đồng (Trả phòng)."
            )
        
        if contract.status != ContractStatus.PENDING:
            raise HTTPException(status_code=400, detail="Không thể hủy hợp đồng này.")

        # 3. Check trạng thái thanh toán
        paid_invoices = db.query(Invoice).filter(
            Invoice.contract_id == contract.id, 
            Invoice.status == InvoiceStatus.PAID
        ).first()

        if paid_invoices:
             raise HTTPException(
                status_code=400, 
                detail="Bạn đã thanh toán tiền cọc. Vui lòng liên hệ quản lý để hủy và nhận lại tiền."
            )

        # 4. Hợp lệ -> Xóa
        db.query(Invoice).filter(Invoice.contract_id == contract.id).delete()
        db.delete(contract)
        db.commit()
        return {"message": "Hủy hợp đồng thành công"}

    def get(self, db: Session, id: UUID, user_id: UUID, role: UserRole) -> Contract:
        contract = db.query(Contract).options(
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.room_type),
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building),
            joinedload(Contract.student)
        ).filter(Contract.id == id).first()
        
        if not contract:
            raise HTTPException(status_code=404, detail="Hợp đồng không tồn tại")
        
        if contract.bed:
             contract.room = contract.bed.room

        if role != UserRole.ADMIN and role != UserRole.MANAGER and contract.student_id != user_id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền xem hợp đồng này")
            
        return contract

    def get_contract_stats(self, db: Session) -> dict:
        pending_count = db.query(Contract).filter(Contract.status == ContractStatus.PENDING).count()
        active_count = db.query(Contract).filter(Contract.status == ContractStatus.ACTIVE).count()
        
        return {
            "pending_contracts": pending_count,
            "active_contracts": active_count
        }

contract_service = ContractService()