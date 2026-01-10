from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from app.models.finance import UtilityReading, Invoice, InvoiceStatus, UtilityConfig, Payment
from app.models.operations import ContractStatus
from app.models.enums import UtilityType
from app.schemas.finance import UtilityRecordingCreate, PaymentCreate, UtilityConfigCreate, UtilityConfigUpdate
from app.services.base import BaseService

class UtilityConfigService(BaseService[UtilityConfig, UtilityConfigCreate, UtilityConfigUpdate]):
    def get_by_type(self, db: Session, type: UtilityType) -> Optional[UtilityConfig]:
        return db.query(UtilityConfig).filter(UtilityConfig.type == type).first()

class FinanceService:
    def get_rate(self, db: Session, type: UtilityType) -> float:
        config = db.query(UtilityConfig).filter(UtilityConfig.type == type).first()
        return config.price_per_unit if config else 0.0

    def record_utility_batch(self, db: Session, recordings: List[UtilityRecordingCreate], recorder_id: UUID) -> List[UtilityReading]:
        results = []
        for record in recordings:
            last_reading = db.query(UtilityReading).filter(
                UtilityReading.room_id == record.room_id,
                UtilityReading.is_finalized == True
            ).order_by(UtilityReading.year.desc(), UtilityReading.month.desc()).first()
            
            prev_elec = last_reading.electric_index if last_reading else 0.0
            prev_water = last_reading.water_index if last_reading else 0.0
            
            db_obj = UtilityReading(
                room_id=record.room_id,
                recorded_by=recorder_id,
                month=record.month,
                year=record.year,
                electric_index=record.electric_index,
                water_index=record.water_index,
                previous_electric_index=prev_elec,
                previous_water_index=prev_water,
                is_finalized=True
            )
            db.add(db_obj)
            results.append(db_obj)
        
        db.commit()
        return results

    def get_latest_readings(self, db: Session) -> List[UtilityReading]:
        query = db.query(UtilityReading).distinct(UtilityReading.room_id).filter(
            UtilityReading.is_finalized == True
        ).order_by(UtilityReading.room_id, UtilityReading.year.desc(), UtilityReading.month.desc())
        
        return query.all()

    def generate_monthly_invoices(self, db: Session, month: int, year: int) -> List[Invoice]:
        from app.models.infrastructure import Room
        from app.models.services import ServiceSubscription
        from app.models.operations import Contract
        
        invoices = []
      
        readings = db.query(UtilityReading).filter(
            UtilityReading.month == month,
            UtilityReading.year == year,
            UtilityReading.is_finalized == True
        ).all()
        
        elec_rate = self.get_rate(db, UtilityType.ELECTRICITY)
        water_rate = self.get_rate(db, UtilityType.WATER)
        
        processed_rooms = set()
        
        for reading in readings:
            if reading.room_id in processed_rooms:
                continue
                
            elec_usage = max(0, reading.electric_index - reading.previous_electric_index)
            water_usage = max(0, reading.water_index - reading.previous_water_index)
            elec_cost = elec_usage * elec_rate
            water_cost = water_usage * water_rate
            
            total_utility = elec_cost + water_cost
            
            if total_utility > 0:
                items = [
                    {"name": "Điện", "usage": elec_usage, "rate": elec_rate, "amount": elec_cost},
                    {"name": "Nước", "usage": water_usage, "rate": water_rate, "amount": water_cost}
                ]
                
                # Create Room Invoice
                room = db.query(Room).filter(Room.id == reading.room_id).first()
                room_code = room.code if room else "Unknown"
                
                inv = Invoice(
                    room_id=reading.room_id,
                    contract_id=None, # Shared invoice
                    title=f"Hóa đơn Điện/Nước phòng {room_code} - T{month}/{year}",
                    total_amount=total_utility,
                    remaining_amount=total_utility,
                    status=InvoiceStatus.UNPAID,
                    details={"items": items, "month": month, "year": year, "type": "UTILITY"}
                )
                db.add(inv)
                invoices.append(inv)
            
            processed_rooms.add(reading.room_id)
            
        contracts = db.query(Contract).filter(Contract.status == ContractStatus.ACTIVE).all()
        
        for contract in contracts:
            student_id = contract.student_id
            
            rent_cost = contract.price_per_month
            
            subscriptions = db.query(ServiceSubscription).filter(
                ServiceSubscription.user_id == student_id,
                ServiceSubscription.is_active == True,
                (ServiceSubscription.end_date == None) | (ServiceSubscription.end_date >= datetime(year, month, 1))
            ).all()
            
            service_items = []
            service_cost = 0
            for sub in subscriptions:
                cost = sub.service_package.price * sub.quantity
                service_cost += cost
                service_items.append({
                    "name": f"Dịch vụ: {sub.service_package.name}", 
                    "quantity": sub.quantity, 
                    "price": sub.service_package.price, 
                    "amount": cost
                })
            
            total_personal = rent_cost + service_cost
            
            if total_personal > 0:
                items = [
                    {"name": "Tiền phòng", "amount": rent_cost},
                    *service_items
                ]
                
                inv = Invoice(
                    contract_id=contract.id,
                    room_id=contract.bed.room_id,
                    title=f"Hóa đơn Tiền phòng - T{month}/{year}",
                    total_amount=total_personal,
                    remaining_amount=total_personal,
                    status=InvoiceStatus.UNPAID,
                    details={"items": items, "month": month, "year": year, "type": "PERSONAL"}
                )
                db.add(inv)
                invoices.append(inv)
            
        db.commit()
        return invoices

    def process_payment(self, db: Session, payment_in: PaymentCreate) -> Payment:
        # Idempotency Check: Prevent duplicate payments globally
        if payment_in.transaction_id:
            existing_payment = db.query(Payment).filter(Payment.transaction_id == payment_in.transaction_id).first()
            if existing_payment:
                # Already processed, return existing record
                return existing_payment

        payment = Payment(
            invoice_id=payment_in.invoice_id,
            amount=payment_in.amount,
            payment_method=payment_in.payment_method,
            transaction_id=payment_in.transaction_id
        )
        db.add(payment)
        
        inv = db.query(Invoice).filter(Invoice.id == payment_in.invoice_id).first()
        if inv:
            inv.paid_amount += payment_in.amount
            inv.remaining_amount = inv.total_amount - inv.paid_amount
            
            if inv.remaining_amount <= 0:
                inv.status = InvoiceStatus.PAID
                inv.remaining_amount = 0
            else:
                inv.status = InvoiceStatus.PARTIAL
                
            db.add(inv)
            
        db.commit()
        db.refresh(payment)
        return payment

    
    def cancel_invoice(self, db: Session, invoice_id: UUID, reason: Optional[str] = None) -> Invoice:
        inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not inv:
            return None
            
        inv.status = InvoiceStatus.CANCELLED
        if reason:
            if not inv.details:
                inv.details = {}
            new_details = dict(inv.details or {})
            new_details["cancel_reason"] = reason
            inv.details = new_details
            
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv

    def get_revenue_stats(self, db: Session) -> dict:
        paid_invoices = db.query(Invoice).filter(
            Invoice.status.in_([InvoiceStatus.PAID, InvoiceStatus.PARTIAL])
        ).all()
        
        total_revenue = sum(inv.paid_amount for inv in paid_invoices)
        
        overdue_count = db.query(Invoice).filter(Invoice.status == InvoiceStatus.OVERDUE).count()
        
        pending_count = db.query(Invoice).filter(Invoice.status == InvoiceStatus.UNPAID).count()
        
        return {
            "total_revenue": total_revenue,
            "overdue_invoices": overdue_count,
            "pending_invoices": pending_count
        }

    def get_invoices(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        student_id: Optional[UUID] = None, 
        room_id: Optional[UUID] = None,
        status: Optional[InvoiceStatus] = None,
        exclude_status: Optional[List[InvoiceStatus]] = None,
        keyword: Optional[str] = None
    ) -> List[Invoice]:
        from sqlalchemy.orm import joinedload
        from app.models.operations import Contract
        from app.models.users import User
        from app.models.infrastructure import Bed, Room
        
        query = db.query(Invoice).options(
            joinedload(Invoice.contract).joinedload(Contract.student),
            joinedload(Invoice.contract).joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building),
            joinedload(Invoice.room).joinedload(Room.building)
        )
        
        if student_id:
            query = query.filter(Invoice.contract_id != None).join(Contract).filter(Contract.student_id == student_id)
            
        if room_id:
             query = query.filter(Invoice.room_id == room_id)

        if status:
            query = query.filter(Invoice.status == status)
            
        if exclude_status:
            query = query.filter(Invoice.status.notin_(exclude_status))

        if keyword:
            search = f"%{keyword}%"

            query = query.outerjoin(Contract).outerjoin(User, Contract.student_id == User.id).outerjoin(Room, Invoice.room_id == Room.id)
            
            query = query.filter(
                (Invoice.title.ilike(search)) |
                (User.full_name.ilike(search)) |
                (User.student_code.ilike(search)) |
                (Room.code.ilike(search))
            )
            
        return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

utility_config_service = UtilityConfigService(UtilityConfig)
finance_service = FinanceService()
