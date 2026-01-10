import uuid
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Float, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import ContractStatus, TransferStatus

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.finance import Invoice
    from app.models.users import User
    from app.models.infrastructure import Bed, Room


class TransferRequest(Base):
    __tablename__ = "transfer_requests"
    
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    contract_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contracts.id"))
    
    target_bed_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("beds.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text)

    admin_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[TransferStatus] = mapped_column(Enum(TransferStatus), default=TransferStatus.PENDING)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    student: Mapped["User"] = relationship("User")

    contract: Mapped["Contract"] = relationship("Contract")
    target_bed: Mapped["Bed"] = relationship("Bed")

class Contract(Base):
    __tablename__ = "contracts"
    
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    bed_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("beds.id"))
    
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    
    price_per_month: Mapped[float] = mapped_column(Float)
    deposit_amount: Mapped[float] = mapped_column(Float, default=0.0)
    
    status: Mapped[ContractStatus] = mapped_column(Enum(ContractStatus), default=ContractStatus.PENDING)
    
    student: Mapped["User"] = relationship("User", back_populates="contracts")
    bed: Mapped["Bed"] = relationship("Bed", back_populates="contracts")

    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="contract")
    liquidation_record: Mapped[Optional["LiquidationRecord"]] = relationship("LiquidationRecord", back_populates="contract", uselist=False)

class LiquidationRecord(Base):
    __tablename__ = "liquidation_records"
    
    contract_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contracts.id"), unique=True)
    liquidation_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    refund_deposit_amount: Mapped[float] = mapped_column(Float, default=0.0)
    penalty_amount: Mapped[float] = mapped_column(Float, default=0.0)

    damage_fee: Mapped[float] = mapped_column(Float, default=0.0)
    total_refund_to_student: Mapped[float] = mapped_column(Float)
    
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confirmed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    contract: Mapped["Contract"] = relationship("Contract", back_populates="liquidation_record")

class Asset(Base):
    __tablename__ = "assets"
    
    room_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rooms.id"))
    name: Mapped[str] = mapped_column(String)

    code: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    condition: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    room: Mapped["Room"] = relationship("Room", back_populates="assets")