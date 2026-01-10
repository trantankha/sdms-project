import logging
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.users import User, UserRole
from app.models.infrastructure import Campus, Building
from app.models.enums import ServiceType, BillingCycle
from app.models.services import ServicePackage
from app.models.operations import Contract
from app.models.finance import UtilityReading, Invoice
from app.models.support import MaintenanceRequest

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # 1. Tạo Super Admin nếu chưa có
    user = db.query(User).filter(User.email == "admin@utehy.edu.vn").first()
    if not user:
        user = User(
            email="admin@utehy.edu.vn",
            hashed_password=get_password_hash("admin123"),
            full_name="Super Admin",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        logger.info("--- Admin Created ---")

    # 2. Tạo Campus
    # Cơ sở 1
    campus1 = db.query(Campus).filter(Campus.name == "Cơ sở Khoái Châu").first()
    if not campus1:
        campus1 = Campus(
            name="Cơ sở Khoái Châu",
            address="Việt Tiến, Hưng Yên",
            description="Cơ sở chính, nơi đặt hệ thống Server"
        )
        db.add(campus1)
        db.commit()
        db.refresh(campus1)
        logger.info("--- Campus 1 Created ---")

    # Cơ sở 2
    campus2 = db.query(Campus).filter(Campus.name == "Cơ sở Mỹ Hào").first()
    if not campus2:
        campus2 = Campus(
            name="Cơ sở Mỹ Hào",
            address="Phường Mỹ Hào, Hưng Yên",
            description="Cơ sở 2, nơi đặt phòng cho sinh viên"
        )
        db.add(campus2)
        db.commit()
        db.refresh(campus2)
        logger.info("--- Campus 2 Created ---")

    # Cơ sở 3
    campus3 = db.query(Campus).filter(Campus.name == "Cơ sở Hải Phòng").first()
    if not campus3:
        campus3 = Campus(
            name="Cơ sở Hải Phòng",
            address="Phường Lê Thanh Nghị, Hải Phòng",
            description="Cơ sở 3, nơi đặt phòng cho sinh viên"
        )
        db.add(campus3)
        db.commit()
        db.refresh(campus3)
        logger.info("--- Campus 3 Created ---")

    # 3. Tạo Tòa nhà
    def create_building_if_not_exists(db, campus_id, code, name, floors, elec_price, water_price):
        building = db.query(Building).filter(Building.code == code, Building.campus_id == campus_id).first()
        if not building:
            building = Building(
                campus_id=campus_id,
                code=code,
                name=name,
                total_floors=floors,
                utility_config={"electric_price": elec_price, "water_price": water_price}
            )
            db.add(building)
            db.commit()
            db.refresh(building)
            logger.info(f"--- Building {code} Created with Elec: {elec_price}, Water: {water_price} ---")
        return building

    # Cơ sở 1: 3 tòa nhà KC, 4 tầng
    for i in range(1, 4):
        create_building_if_not_exists(db, campus1.id, f"KC{i}", f"Tòa nhà Khoái Châu {i}", 4, 3000, 4500)

    # Cơ sở 2: 1 tòa nhà MH, 5 tầng
    create_building_if_not_exists(db, campus2.id, "MH", "Tòa nhà Mỹ Hào", 5, 4000, 5000)

    # Cơ sở 3: 2 tòa nhà, 3 tầng
    for i in range(1, 3):
        create_building_if_not_exists(db, campus3.id, f"HP{i}", f"Tòa nhà Hải Phòng {i}", 3, 3500, 5000)

    # 4. Tạo Gói Dịch Vụ Chuyên Nghiệp
    service_packages = [
        {
            "name": "Gửi xe máy tháng",
            "description": "Dịch vụ giữ xe máy 24/7 tại hầm xe của tòa nhà. An ninh đảm bảo.",
            "type": ServiceType.PARKING,
            "price": 80000,
            "billing_cycle": BillingCycle.MONTHLY
        },
        {
            "name": "Gửi xe đạp điện",
            "description": "Dịch vụ giữ xe đạp điện kèm sạc tại khu vực quy định.",
            "type": ServiceType.PARKING,
            "price": 50000,
            "billing_cycle": BillingCycle.MONTHLY
        },
        {
            "name": "Internet Tốc độ cao (Gói SV1)",
            "description": "Cáp quang băng thông 150Mbps, không giới hạn dung lượng.",
            "type": ServiceType.INTERNET,
            "price": 120000,
            "billing_cycle": BillingCycle.MONTHLY
        },
        {
            "name": "Giặt là (Theo kg)",
            "description": "Giặt sấy khô, gấp gọn. Giá tính theo kg quần áo.",
            "type": ServiceType.LAUNDRY,
            "price": 15000,
            "billing_cycle": BillingCycle.ONE_TIME
        },
        {
            "name": "Nước uống đóng bình (20L)",
            "description": "Nước khoáng tinh khiết, giao tận phòng.",
            "type": ServiceType.WATER_DELIVERY,
            "price": 45000,
            "billing_cycle": BillingCycle.ONE_TIME
        },
        {
            "name": "Dọn phòng theo yêu cầu",
            "description": "Dọn dẹp vệ sinh phòng, lau sàn, cọ toilet.",
            "type": ServiceType.CLEANING,
            "price": 100000,
            "billing_cycle": BillingCycle.ONE_TIME
        }
    ]

    for pkg in service_packages:
        existing = db.query(ServicePackage).filter(ServicePackage.name == pkg["name"]).first()
        if not existing:
            new_pkg = ServicePackage(
                name=pkg["name"],
                description=pkg["description"],
                type=pkg["type"],
                price=pkg["price"],
                billing_cycle=pkg["billing_cycle"],
                is_active=True
            )
            db.add(new_pkg)
            db.commit()
            logger.info(f"--- Service Package '{pkg['name']}' Created ---")

    logger.info("--- Database seeding completed successfully! ---")