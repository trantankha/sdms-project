from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
from app.models.operations import Contract
from app.models.finance import Invoice, UtilityReading
from app.models.enums import InvoiceStatus
from app.models.infrastructure import Bed, Room

class DashboardService:
    def get_recent_activities(self, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        # 1. New Contracts (Registrations)
        contracts = db.query(Contract).options(
            joinedload(Contract.student),
            joinedload(Contract.bed)
        ).order_by(Contract.created_at.desc()).limit(limit).all()

        # 2. Paid Invoices (Income)
        invoices = db.query(Invoice).options(
            joinedload(Invoice.contract).joinedload(Contract.student)
        ).filter(Invoice.status == InvoiceStatus.PAID).order_by(Invoice.updated_at.desc()).limit(limit).all()

        activities = []

        for c in contracts:
            name = c.student.full_name if c.student else "Unknown"
            code = c.bed.label if c.bed else ""
            activities.append({
                "type": "CONTRACT",
                "subtype": c.status.value,
                "title": f"{name}",
                "description": f"Đăng ký phòng {code}",
                "timestamp": c.created_at,
                "amount": None,
                "status": c.status.value,
                "user": {"name": name, "avatar": None}
            })

        for inv in invoices:
            student = inv.contract.student if (inv.contract and inv.contract.student) else None
            name = student.full_name if student else "Unknown"
            activities.append({
                "type": "INVOICE",
                "subtype": "PAID",
                "title": f"{name}",
                "description": f"Đã thanh toán {inv.title}",
                "timestamp": inv.updated_at or inv.created_at,
                "amount": inv.total_amount,
                "status": "PAID",
                "user": {"name": name, "avatar": None}
            })

        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        return activities[:limit]

    
    def get_student_stats(self, db: Session, student_id: Any) -> Dict[str, Any]:
        # 1. Unpaid Invoices
        unpaid_invoices = db.query(Invoice).join(Contract).filter(
            Contract.student_id == student_id,
            Invoice.status.in_([InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIAL])
        ).all()
        
        unpaid_count = len(unpaid_invoices)
        unpaid_total = sum(i.remaining_amount or i.total_amount for i in unpaid_invoices)

        # 2. Active Request (Support/Maintenance)
        from app.models.support import MaintenanceRequest
        from app.models.enums import RequestStatus
        request_count = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.user_id == student_id,
            MaintenanceRequest.status.in_([RequestStatus.OPEN, RequestStatus.IN_PROGRESS])
        ).count()

        # 3. Active Contract / Room Info
        active_contract = db.query(Contract).options(
            joinedload(Contract.bed).joinedload(Bed.room).joinedload(Room.building)
        ).filter(
            Contract.student_id == student_id,
        ).order_by(Contract.created_at.desc()).first()
        
        room_info = None
        if active_contract and active_contract.bed:
             room_info = {
                "id": str(active_contract.bed.room.id),
                "code": active_contract.bed.room.code,
                "building": active_contract.bed.room.building.name if active_contract.bed.room.building else "N/A",
                "contract_status": active_contract.status,
                "end_date": active_contract.end_date
             }

        # 4. Utility Usage (Logic: Get latest reading for the room)
        last_elec_usage = 0
        last_water_usage = 0
        
        if active_contract and active_contract.bed and active_contract.bed.room:
            room_id = active_contract.bed.room.id
            latest_reading = db.query(UtilityReading).filter(
                UtilityReading.room_id == room_id
            ).order_by(
                UtilityReading.year.desc(), 
                UtilityReading.month.desc()
            ).first()
            
            if latest_reading:
                elec = latest_reading.electric_index or 0.0
                prev_elec = latest_reading.previous_electric_index or 0.0
                water = latest_reading.water_index or 0.0
                prev_water = latest_reading.previous_water_index or 0.0
                
                last_elec_usage = max(0.0, elec - prev_elec)
                last_water_usage = max(0.0, water - prev_water)

        return {
            "unpaid_invoices_count": unpaid_count,
            "unpaid_invoices_total": unpaid_total,
            "active_requests_count": request_count,
            "room_info": room_info,
            "utility_usage": {
                "electricity": last_elec_usage,
                "water": last_water_usage
            }
        }

dashboard_service = DashboardService()
