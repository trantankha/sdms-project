from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Tạo Engine kết nối
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # Tự động kiểm tra kết nối sống hay chết trước khi query
    pool_size=20,       # Tối đa 20 kết nối đồng thời
    max_overflow=10     # Cho phép tràn thêm 10 kết nối khi cao điểm
)

# Tạo Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)