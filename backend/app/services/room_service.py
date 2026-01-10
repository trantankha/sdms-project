from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Any, Dict
from uuid import UUID
from app.models.infrastructure import Room, RoomType, RoomStatus, Bed, BedStatus
from app.services.base import BaseService
from app.schemas.infrastructure import RoomCreate, RoomUpdate, RoomTypeCreate, RoomTypeUpdate

class RoomTypeService(BaseService[RoomType, RoomTypeCreate, RoomTypeUpdate]):
    def get_by_name(self, db: Session, name: str) -> Optional[RoomType]:
        return db.query(RoomType).filter(RoomType.name == name).first()

class RoomService(BaseService[Room, RoomCreate, RoomUpdate]):
    def create(self, db: Session, *, obj_in: RoomCreate) -> Room:
        # 1. Create the room itself
        room = super().create(db, obj_in=obj_in)
        
        # 2. Determine capacity (beds count)
        capacity = 0
        if room.room_type_id:
            room_type = db.query(RoomType).get(room.room_type_id)
            if room_type:
                capacity = room_type.capacity
        
        if capacity > 0:
            beds = []
            for i in range(1, capacity + 1):
                bed_name = f"G-{i}"
                bed = Bed(
                    label=bed_name,
                    room_id=room.id,
                    status=BedStatus.AVAILABLE
                )
                beds.append(bed)
            
            db.add_all(beds)
            db.commit()
            db.refresh(room)
            
        return room

    def _compute_occupancy(self, room: Room):
        if room and room.beds:
            room.current_occupancy = sum(1 for b in room.beds if b.status in [BedStatus.OCCUPIED, BedStatus.RESERVED])

    def get(self, db: Session, id: UUID) -> Optional[Room]:
        from sqlalchemy.orm import joinedload
        room = db.query(Room).options(
            joinedload(Room.beds),
            joinedload(Room.room_type),
            joinedload(Room.building)
        ).filter(Room.id == id).first()
        if room:
            self._compute_occupancy(room)
        return room

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Room]:
        from sqlalchemy.orm import joinedload
        rooms = db.query(Room).options(
            joinedload(Room.beds),
            joinedload(Room.room_type),
            joinedload(Room.building)
        ).offset(skip).limit(limit).all()
        for room in rooms:
            self._compute_occupancy(room)
        return rooms

    def get_by_building(self, db: Session, building_code: str) -> List[Room]:
        from sqlalchemy.orm import joinedload
        rooms = db.query(Room).options(
            joinedload(Room.beds),
            joinedload(Room.room_type),
            joinedload(Room.building)
        ).filter(Room.code.startswith(building_code)).all()
        for room in rooms:
            self._compute_occupancy(room)
        return rooms

    def get_available_rooms(self, db: Session) -> List[Room]:
        from sqlalchemy.orm import joinedload
        rooms = db.query(Room).options(
            joinedload(Room.beds),
            joinedload(Room.room_type),
            joinedload(Room.building)
        ).filter(Room.status == RoomStatus.AVAILABLE).all()
        for room in rooms:
            self._compute_occupancy(room)
        return rooms

    def check_room_availability(self, db: Session, room_id: UUID) -> bool:
        room = self.get(db, room_id)
        if not room:
            return False
            
        capacity = 0
        if room.room_type:
            capacity = room.room_type.capacity
        else:
            capacity = len(room.beds)
        
        return room.current_occupancy < capacity

    def search_rooms(self, db: Session, 
                     room_type_id: Optional[UUID] = None, 
                     min_price: Optional[float] = None, 
                     max_price: Optional[float] = None,
                     status: Optional[RoomStatus] = None,
                     attributes: Optional[Dict[str, Any]] = None,
                     building_id: Optional[UUID] = None,
                     keyword: Optional[str] = None
                     ) -> List[Room]:
        from sqlalchemy.orm import joinedload
        query = db.query(Room).options(
            joinedload(Room.beds),
            joinedload(Room.room_type),
            joinedload(Room.building)
        )
        
        if room_type_id:
            query = query.filter(Room.room_type_id == room_type_id)
            
        if min_price is not None:
             query = query.join(RoomType, isouter=True)
             query = query.filter(func.coalesce(Room.base_price, RoomType.base_price) >= min_price)

        if max_price is not None:
             if not room_type_id: 
                query = query.join(RoomType, isouter=True)
             query = query.filter(func.coalesce(Room.base_price, RoomType.base_price) <= max_price)

        if status:
            query = query.filter(Room.status == status)

        if attributes:
            for key, value in attributes.items():
                query = query.filter(Room.attributes[key].astext == str(value))
        
        if building_id:
            query = query.filter(Room.building_id == building_id)

        if keyword:
            search = f"%{keyword}%"
            query = query.join(Room.building)
            query = query.filter(
                (Room.code.ilike(search)) 
            )

        rooms = query.all()
        for room in rooms:
            self._compute_occupancy(room)
        return rooms

    def get_occupancy_stats(self, db: Session, building_id: Optional[UUID] = None) -> Dict[str, Any]:
        from sqlalchemy.orm import joinedload
        query = db.query(Room).options(
            joinedload(Room.room_type), 
            joinedload(Room.beds),
            joinedload(Room.building)
        )
        if building_id:
            query = query.filter(Room.building_id == building_id)
        
        rooms = query.all()
        total_rooms = len(rooms)
        
        status_counts = {}
        total_capacity = 0
        total_occupied = 0
        
        building_stats_map = {}
        
        for room in rooms:
            s = room.status.value
            status_counts[s] = status_counts.get(s, 0) + 1
            
            cap = room.room_type.capacity if room.room_type else len(room.beds)
            total_capacity += cap
            
            occ = sum(1 for bed in room.beds if bed.status in [BedStatus.OCCUPIED, BedStatus.RESERVED])
            total_occupied += occ
            
            b_name = room.building.name if room.building else "Unknown"
            if b_name not in building_stats_map:
                building_stats_map[b_name] = {"name": b_name, "total": 0, "occupied": 0}
            
            building_stats_map[b_name]["total"] += cap
            building_stats_map[b_name]["occupied"] += occ

        return {
            "total_rooms": total_rooms,
            "status_breakdown": status_counts,
            "total_capacity": total_capacity,
            "total_occupied": total_occupied,
            "occupancy_rate": (total_occupied / total_capacity * 100) if total_capacity > 0 else 0,
            "building_stats": list(building_stats_map.values())
        }

room_type_service = RoomTypeService(RoomType)
room_service = RoomService(Room)