from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.enums import RoomStatus, GenderType, BedStatus

class RoomTypeBase(BaseModel):
    name: str
    capacity: int
    base_price: float
    description: Optional[str] = None
    amenities: List[str] = []

class RoomTypeCreate(RoomTypeBase):
    pass

class RoomTypeUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    base_price: Optional[float] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None

class RoomTypeResponse(RoomTypeBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- CAMPUS SCHEMAS ---
class CampusBase(BaseModel):
    name: str
    address: Optional[str] = None
    description: Optional[str] = None

class CampusResponse(CampusBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- BUILDING SCHEMAS ---
class BuildingBase(BaseModel):
    code: str
    name: Optional[str] = None
    utility_config: Optional[Dict[str, float]] = None

class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    utility_config: Optional[Dict[str, float]] = None

class BuildingResponse(BuildingBase):
    id: UUID
    total_floors: int
    campus_id: UUID
    campus: Optional[CampusResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- BED SCHEMAS ---
class BedBase(BaseModel):
    label: str # G1, G2
    status: BedStatus = BedStatus.AVAILABLE
    is_occupied: bool = False # Legacy

class RoomSimpleResponse(BaseModel):
    id: UUID
    code: str
    model_config = ConfigDict(from_attributes=True)

class BedResponse(BedBase):
    id: UUID
    room: Optional[RoomSimpleResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- ROOM SCHEMAS ---
class RoomBase(BaseModel):
    code: str      # MH101
    floor: int
    gender_type: GenderType
    status: RoomStatus
    base_price: float
    area_m2: Optional[float] = None
    room_type_id: Optional[UUID] = None
    attributes: Optional[Dict[str, Any]] = None

class RoomCreate(RoomBase):
    building_id: UUID

class RoomUpdate(BaseModel):
    code: Optional[str] = None
    floor: Optional[int] = None
    gender_type: Optional[GenderType] = None
    status: Optional[RoomStatus] = None
    base_price: Optional[float] = None
    area_m2: Optional[float] = None
    room_type_id: Optional[UUID] = None
    attributes: Optional[Dict[str, Any]] = None

class RoomResponse(RoomBase):
    id: UUID
    current_occupancy: int
    beds: List[BedResponse] = [] 
    room_type: Optional[RoomTypeResponse] = None
    building: Optional[BuildingResponse] = None
    model_config = ConfigDict(from_attributes=True)

