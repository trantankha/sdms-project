from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.users import UserRole, GenderType

# 1. Base Schema (Chứa các trường chung)
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

# 2. Input Schema (Dùng khi tạo User - Cần Password)
class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.STUDENT
    student_code: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[GenderType] = None

# 3. Output Schema (Dùng để trả về Client - BỎ Password)
class UserResponse(UserBase):
    id: UUID
    role: UserRole
    student_code: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[GenderType] = None
    model_config = ConfigDict(from_attributes=True)

# 4. Update Schema (Dùng khi cập nhật)
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    student_code: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[GenderType] = None
    is_active: Optional[bool] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str