from typing import Any, List, Optional, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.users import User
from app.models.enums import RoomStatus
from app.services.room_service import room_service, room_type_service
# Import Schema mới tạo
from app.schemas.infrastructure import (
    RoomResponse, RoomCreate, RoomUpdate,
    RoomTypeResponse, RoomTypeCreate, RoomTypeUpdate
)

router = APIRouter()

# --- ROOM TYPES ENDPOINTS ---

@router.post("/types", response_model=RoomTypeResponse)
def create_room_type(
    *,
    db: Session = Depends(deps.get_db),
    room_type_in: RoomTypeCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new Room Type (Admin only).
    """
    room_type = room_type_service.get_by_name(db, name=room_type_in.name)
    if room_type:
        raise HTTPException(status_code=400, detail="Room Type with this name already exists")
    room_type = room_type_service.create(db, obj_in=room_type_in)
    return room_type

@router.get("/types", response_model=List[RoomTypeResponse])
def read_room_types(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    List all Room Types.
    """
    types = room_type_service.get_multi(db, skip=skip, limit=limit)
    return types

@router.put("/types/{type_id}", response_model=RoomTypeResponse)
def update_room_type(
    *,
    db: Session = Depends(deps.get_db),
    type_id: UUID,
    room_type_in: RoomTypeUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a Room Type (Admin only).
    """
    room_type = room_type_service.get(db, id=type_id)
    if not room_type:
        raise HTTPException(status_code=404, detail="Room Type not found")
    room_type = room_type_service.update(db, db_obj=room_type, obj_in=room_type_in)
    return room_type

@router.delete("/types/{type_id}", response_model=RoomTypeResponse)
def delete_room_type(
    *,
    db: Session = Depends(deps.get_db),
    type_id: UUID,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a Room Type (Admin only).
    """
    room_type = room_type_service.get(db, id=type_id)
    if not room_type:
        raise HTTPException(status_code=404, detail="Room Type not found")
    room_type = room_type_service.remove(db, id=type_id)
    return room_type


# --- ROOM ENDPOINTS ---

# --- BUILDING ENDPOINTS (Convenience for filters) ---
# Better place might be a separate router, but for now here is fine as it relates to room filtering

from app.models.infrastructure import Building, Campus
from app.schemas.infrastructure import BuildingResponse, BuildingUpdate

@router.get("/campuses", response_model=List[Any])
def get_all_campuses(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all campuses.
    """
    campuses = db.query(Campus).all()
    return [{"id": c.id, "name": c.name, "address": c.address} for c in campuses]

@router.get("/buildings", response_model=List[Any])
def get_all_buildings(
    db: Session = Depends(deps.get_db),
    campus_id: Optional[UUID] = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all buildings for filtering, optionally filtered by campus.
    """
    query = db.query(Building)
    if campus_id:
        query = query.filter(Building.campus_id == campus_id)
    
    buildings = query.all()
    # Return simple structure with utility config
    return [{
        "id": b.id, 
        "name": b.name, 
        "code": b.code, 
        "campus_id": b.campus_id,
        "utility_config": b.utility_config
    } for b in buildings]

@router.put("/buildings/{building_id}", response_model=BuildingResponse)
def update_building(
    *,
    db: Session = Depends(deps.get_db),
    building_id: UUID,
    building_in: BuildingUpdate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Update a building (e.g. utility config).
    """
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    # Update fields
    if building_in.name:
        building.name = building_in.name
    if building_in.utility_config:
        # If existing is none, set it. If dict, update it or replace it?
        # Here we assume replacement or merge. Let's do replacement for simplicity as per Pydantic model
        # But wait, SQLAlchemy JSON type.
        building.utility_config = building_in.utility_config
        
    db.commit()
    db.refresh(building)
    return building


@router.get("/stats", response_model=Dict[str, Any])
def get_room_statistics(
    db: Session = Depends(deps.get_db),
    building_id: Optional[UUID] = None,
    current_user: User = Depends(deps.get_current_active_manager), # Manager or Admin
) -> Any:
    """
    Get occupancy statistics.
    """
    stats = room_service.get_occupancy_stats(db, building_id=building_id)
    return stats

@router.get("/", response_model=List[RoomResponse]) 
def read_rooms(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    room_type_id: Optional[UUID] = None,
    status: Optional[RoomStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    building_id: Optional[UUID] = None,
    keyword: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user), 
) -> Any:
    """
    Search and List Rooms with filters.
    """
    # Use search_rooms if filters are applied, else get_multi for basic pagination
    if any([room_type_id, status, min_price, max_price, building_id, keyword]):
        rooms = room_service.search_rooms(
            db, 
            room_type_id=room_type_id, 
            status=status, 
            min_price=min_price, 
            max_price=max_price,
            building_id=building_id,
            keyword=keyword
        )
        # Apply manual pagination for search results (naive approach)
        return rooms[skip : skip + limit]
    else:
        rooms = room_service.get_multi(db, skip=skip, limit=limit)
        return rooms

@router.post("/", response_model=RoomResponse)
def create_room(
    *,
    db: Session = Depends(deps.get_db),
    room_in: RoomCreate,
    current_user: User = Depends(deps.get_current_active_manager),
) -> Any:
    """
    Create a new Room.
    """
    room = room_service.create(db, obj_in=room_in)
    return room

@router.get("/{room_id}", response_model=RoomResponse)
def read_room_by_id(
    room_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get room details.
    """
    room = room_service.get(db, id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    *,
    db: Session = Depends(deps.get_db),
    room_id: UUID,
    room_in: RoomUpdate,
    current_user: User = Depends(deps.get_current_active_manager), # Manager permissions
) -> Any:
    """
    Update a room.
    """
    room = room_service.get(db, id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room = room_service.update(db, db_obj=room, obj_in=room_in)
    return room

@router.delete("/{room_id}", response_model=RoomResponse)
def delete_room(
    *,
    db: Session = Depends(deps.get_db),
    room_id: UUID,
    current_user: User = Depends(deps.get_current_active_superuser), # Delete often restricted to Admin
) -> Any:
    """
    Delete a room.
    """
    room = room_service.get(db, id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room = room_service.remove(db, id=room_id)
    return room