import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Float, Boolean, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_class import Base
from app.models.enums import ServiceType, BillingCycle
from datetime import datetime

if TYPE_CHECKING:
    from app.models.users import User

class ServicePackage(Base):
    __tablename__ = "service_packages"
    
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    type: Mapped[ServiceType] = mapped_column(Enum(ServiceType), default=ServiceType.OTHER)
    price: Mapped[float] = mapped_column(Float)

    billing_cycle: Mapped[BillingCycle] = mapped_column(Enum(BillingCycle), default=BillingCycle.MONTHLY)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    subscriptions: Mapped[List["ServiceSubscription"]] = relationship("ServiceSubscription", back_populates="service_package")

class ServiceSubscription(Base):
    __tablename__ = "service_subscriptions"
    
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    service_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("service_packages.id"))
    
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True) 
    
    service_package: Mapped["ServicePackage"] = relationship("ServicePackage", back_populates="subscriptions")
    user: Mapped["User"] = relationship("User")
