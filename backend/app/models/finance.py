import uuid
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Float, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base_class import Base
from app.models.enums import InvoiceStatus, UtilityType, PaymentMethod

if TYPE_CHECKING:
    from app.models.infrastructure import Room
    from app.models.users import User
    from app.models.operations import Contract
    
class UtilityConfig(Base):
    __tablename__ = "utility_configs"
    
    type: Mapped[UtilityType] = mapped_column(Enum(UtilityType), unique=True)
    price_per_unit: Mapped[float] = mapped_column(Float)
    is_progressive: Mapped[bool] = mapped_column(Boolean, default=False)

class UtilityReading(Base):
    __tablename__ = "utility_readings"
    
    room_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rooms.id"))
    recorded_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    
    month: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    
    electric_index: Mapped[float] = mapped_column(Float)
    water_index: Mapped[float] = mapped_column(Float)
    
    previous_electric_index: Mapped[float] = mapped_column(Float, default=0.0)
    previous_water_index: Mapped[float] = mapped_column(Float, default=0.0)
    
    is_finalized: Mapped[bool] = mapped_column(Boolean, default=False)
    
    room: Mapped["Room"] = relationship("Room", back_populates="utility_readings")
    recorder: Mapped["User"] = relationship("User", back_populates="recorded_utilities")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    contract_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("contracts.id"), nullable=True)
    
    room_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("rooms.id"), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    total_amount: Mapped[float] = mapped_column(Float)
    paid_amount: Mapped[float] = mapped_column(Float, default=0.0)

    remaining_amount: Mapped[float] = mapped_column(Float, default=0.0)
    details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus), default=InvoiceStatus.UNPAID)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    contract: Mapped[Optional["Contract"]] = relationship("Contract", back_populates="invoices")
    room: Mapped[Optional["Room"]] = relationship("Room", back_populates="invoices")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="invoice")

class Payment(Base):
    __tablename__ = "payments"
    
    invoice_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("invoices.id"))
    amount: Mapped[float] = mapped_column(Float)
    
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod))
    transaction_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")