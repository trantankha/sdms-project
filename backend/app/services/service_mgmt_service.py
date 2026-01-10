from uuid import UUID
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models.services import ServicePackage, ServiceSubscription
from app.schemas.service import ServicePackageCreate, SubscriptionCreate
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from app.models.operations import Contract, ContractStatus
from app.models.finance import Invoice, InvoiceStatus

class ServiceMgmtService:
    def create_package(self, db: Session, obj_in: ServicePackageCreate) -> ServicePackage:
        db_obj = ServicePackage(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_all_packages(self, db: Session, skip: int = 0, limit: int = 100) -> List[ServicePackage]:
        return db.query(ServicePackage).offset(skip).limit(limit).all()

    def update_package(self, db: Session, package_id: UUID, obj_in: ServicePackageCreate) -> ServicePackage:
        db_obj = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail="Service package not found")
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def subscribe_student(self, db: Session, user_id: UUID, obj_in: SubscriptionCreate) -> ServiceSubscription:
        # 1. Get Service Package Price
        service_pkg = db.query(ServicePackage).filter(ServicePackage.id == obj_in.service_id).first()
        if not service_pkg:
             raise HTTPException(status_code=404, detail="Gói dịch vụ không tồn tại")
        
        # 2. Find Active Contract
        contract = db.query(Contract).filter(
            Contract.student_id == user_id,
            Contract.status == ContractStatus.ACTIVE
        ).first()

        if not contract:
             raise HTTPException(status_code=400, detail="Bạn cần có hợp đồng thuê phòng đang hiệu lực để đăng ký dịch vụ.")

        # 3. Create Subscription
        db_obj = ServiceSubscription(
            user_id=user_id,
            service_id=obj_in.service_id,
            quantity=obj_in.quantity,
            note=obj_in.note,
            is_active=True
        )
        db.add(db_obj)
        
        # 4. Create Invoice
        total_amount = service_pkg.price * obj_in.quantity
        
        due_date = datetime.now(timezone.utc) + timedelta(days=2)
        
        invoice = Invoice(
            contract_id=contract.id,
            title=f"Hóa đơn Dịch vụ: {service_pkg.name}",
            total_amount=total_amount,
            remaining_amount=total_amount,
            status=InvoiceStatus.UNPAID,
            due_date=due_date,
            details={
                "service_id": str(service_pkg.id),
                "service_name": service_pkg.name,
                "quantity": obj_in.quantity,
                "month": datetime.now().month,
                "year": datetime.now().year,
                "note": "Phí đăng ký dịch vụ"
            }
        )
        db.add(invoice)

        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_student_subscriptions(self, db: Session, user_id: UUID) -> List[ServiceSubscription]:
        # Using joinedload to get service name efficiently if needed
        subs = db.query(ServiceSubscription).options(
            joinedload(ServiceSubscription.service_package)
        ).filter(
            ServiceSubscription.user_id == user_id, 
            ServiceSubscription.is_active == True
        ).all()
        
        for sub in subs:
            if sub.service_package:
                sub.service_name = sub.service_package.name
                
        return subs

    def get_all_subscriptions(self, db: Session, skip: int = 0, limit: int = 100) -> List[ServiceSubscription]:
        subs = db.query(ServiceSubscription).options(
            joinedload(ServiceSubscription.service_package),
            joinedload(ServiceSubscription.user)
        ).order_by(ServiceSubscription.start_date.desc()).offset(skip).limit(limit).all()
        
        from app.models.infrastructure import Room, Bed, Building
        
        for sub in subs:
            # 1. Service Name
            if sub.service_package:
                sub.service_name = sub.service_package.name
                
            # 2. Student Info
            if sub.user:
                sub.student_name = sub.user.full_name
                sub.student_code = sub.user.student_code or sub.user.id
                
            # 3. Room Info (via Active Contract)
            active_contract = db.query(Contract).options(
                 joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building)
            ).filter(
                Contract.student_id == sub.user_id,
                Contract.status == ContractStatus.ACTIVE
            ).first()
            
            if active_contract and active_contract.bed and active_contract.bed.room:
                sub.room_code = active_contract.bed.room.code
                sub.building_name = active_contract.bed.room.building.name if active_contract.bed.room.building else ""
                sub.bed_label = active_contract.bed.label
            else:
                sub.room_code = "N/A"
                sub.building_name = "N/A"
                
        return subs

service_mgmt_service = ServiceMgmtService()
