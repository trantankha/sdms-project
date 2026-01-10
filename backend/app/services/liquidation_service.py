from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException
from app.models.operations import LiquidationRecord, Contract, ContractStatus
from app.schemas.operations import LiquidationCreate

class LiquidationService:
    def liquidate_contract(self, db: Session, confirmed_by: UUID, obj_in: LiquidationCreate) -> LiquidationRecord:
        contract = db.query(Contract).filter(Contract.id == obj_in.contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        if contract.status != ContractStatus.ACTIVE:
             raise HTTPException(status_code=400, detail="Only active contracts can be liquidated")

        base_deposit = contract.deposit_amount
        total_refund = base_deposit - obj_in.penalty_amount - obj_in.damage_fee
        
        db_obj = LiquidationRecord(
            contract_id=obj_in.contract_id,
            refund_deposit_amount=base_deposit,
            penalty_amount=obj_in.penalty_amount,
            damage_fee=obj_in.damage_fee,
            total_refund_to_student=total_refund,
            notes=obj_in.notes,
            confirmed_by=confirmed_by,
            liquidation_date=datetime.utcnow()
        )
        
        contract.status = ContractStatus.TERMINATED
        contract.end_date = datetime.utcnow()
        
        from app.models.infrastructure import Bed
        bed = db.query(Bed).filter(Bed.id == contract.bed_id).first()
        if bed:
            bed.is_occupied = False
            db.add(bed)

        db.add(db_obj)
        db.add(contract)
        db.commit()
        db.refresh(db_obj)
        return db_obj

liquidation_service = LiquidationService()
