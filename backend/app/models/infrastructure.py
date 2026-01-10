import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base_class import Base
from app.models.enums import RoomStatus, GenderType, BedStatus

if TYPE_CHECKING:
    from app.models.operations import Contract, Asset
    from app.models.finance import UtilityReading, Invoice

class Campus(Base):
    __tablename__ = "campuses"
    name: Mapped[str] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    buildings: Mapped[List["Building"]] = relationship("Building", back_populates="campus")

class Building(Base):
    __tablename__ = "buildings"
    campus_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campuses.id"))
    
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    total_floors: Mapped[int] = mapped_column(Integer)
    
    utility_config: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    campus: Mapped["Campus"] = relationship("Campus", back_populates="buildings")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="building")

class RoomType(Base):
    __tablename__ = "room_types"
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    capacity: Mapped[int] = mapped_column(Integer) # Tiêu chuẩn số người
    base_price: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    amenities: Mapped[Optional[dict]] = mapped_column(JSONB, default=list)
    
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="room_type")

class Room(Base):
    __tablename__ = "rooms"
    building_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("buildings.id"))
    room_type_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("room_types.id"), nullable=True)

    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    floor: Mapped[int] = mapped_column(Integer)
    
    gender_type: Mapped[GenderType] = mapped_column(Enum(GenderType), default=GenderType.MALE)
    status: Mapped[RoomStatus] = mapped_column(Enum(RoomStatus), default=RoomStatus.AVAILABLE)
    
    base_price: Mapped[float] = mapped_column(Float, default=0.0)
    area_m2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0)
    attributes: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    building: Mapped["Building"] = relationship("Building", back_populates="rooms")
    room_type: Mapped["RoomType"] = relationship("RoomType", back_populates="rooms")
    beds: Mapped[List["Bed"]] = relationship("Bed", back_populates="room")
    
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="room")
    utility_readings: Mapped[List["UtilityReading"]] = relationship("UtilityReading", back_populates="room")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="room")

class Bed(Base):
    __tablename__ = "beds"
    room_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rooms.id"))
    label: Mapped[str] = mapped_column(String)

    status: Mapped[BedStatus] = mapped_column(Enum(BedStatus), default=BedStatus.AVAILABLE)
    is_occupied: Mapped[bool] = mapped_column(Boolean, default=False)
    
    room: Mapped["Room"] = relationship("Room", back_populates="beds")
    contracts: Mapped[List["Contract"]] = relationship("Contract", back_populates="bed")