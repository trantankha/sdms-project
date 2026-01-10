# Hệ thống Quản lý Ký túc xá Sinh viên (SDMS)

Chào mừng bạn đến với **Hệ thống Quản lý Ký túc xá Sinh viên (SDMS)**! Đây là giải pháp toàn diện được thiết kế để tối ưu hóa quy trình quản lý ký túc xá đại học, xử lý mọi thứ từ đăng ký sinh viên, phân bổ phòng, quản lý hợp đồng, hóa đơn cho đến các yêu cầu cơ sở vật chất.

## 🚀 Tổng quan Dự án

SDMS cung cấp một nền tảng hiện đại, nhanh chóng và mạnh mẽ cho cả **Quản trị viên (Admin)** và **Sinh viên**.
- **Admin**: Quản lý tòa nhà, phòng, hồ sơ sinh viên, hợp đồng, chỉ số điện/nước và báo cáo tài chính.
- **Sinh viên**: Đăng ký phòng, xem hợp đồng, theo dõi hóa đơn, thanh toán trực tuyến và gửi yêu cầu hỗ trợ.

## 🛠️ Công nghệ Sử dụng

Dự án này sử dụng các công nghệ hiện đại để đảm bảo hiệu suất cao và trải nghiệm phát triển tốt nhất.

### Backend (Server)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Hiệu suất cao, dễ học, nhanh chóng dev, sẵn sàng cho production.
- **Cơ sở dữ liệu**: [PostgreSQL](https://www.postgresql.org/) - Hệ quản trị CSDL quan hệ mã nguồn mở tiên tiến nhất.
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - Công cụ thao tác SQL và Mapping đối tượng mạnh mẽ của Python.
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) - Quản lý thay đổi cấu trúc database.
- **Môi trường**: Python 3.9+

### Frontend (Giao diện)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) - Framework React tối ưu cho Web.
- **Thư viện**: [React 19](https://react.dev/) - Thư viện UI phổ biến nhất.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Viết style nhanh chóng ngay trong class HTML.
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) - Bộ component đẹp mắt, dễ tùy biến.
- **Quản lý State**: [Zustand](https://github.com/pmndrs/zustand) - Nhẹ, nhanh và dễ dùng.
- **Xử lý dữ liệu**: [React Query](https://tanstack.com/query/latest) - Quản lý data fetched từ server cực mạnh.
- **Ngôn ngữ**: TypeScript

## ✨ Tính năng Chính

- **Người dùng & Xác thực**: Đăng nhập/Đăng ký bảo mật cho Admin và Sinh viên (JWT).
- **Quản lý Phòng ở**: Quản lý Tòa nhà, Tầng, Phòng với đầy đủ thông tin tiện ích và trạng thái.
- **Quy trình Sinh viên**: Quản lý vòng đời sinh viên từ lúc đăng ký đến khi trả phòng.
- **Quản lý Hợp đồng**: Tạo, gia hạn và hủy hợp đồng số hóa.
- **Tài chính & Hóa đơn**:
    - Tự động tạo hóa đơn tiền thuê phòng.
    - Ghi chỉ số Điện/Nước và tính tiền tự động.
    - Theo dõi lịch sử thanh toán.
- **Dịch vụ & Tiện ích**: Đăng ký dịch vụ (Internet, Gửi xe,...).
- **Hạnh kiểm & Kỷ luật**: Theo dõi điểm rèn luyện và vi phạm nội quy.
- **Yêu cầu & Hỗ trợ**: Hệ thống gửi yêu cầu sửa chữa, báo cáo sự cố từ sinh viên.

## 📦 Yêu cầu Cài đặt

Hãy đảm bảo máy tính của bạn đã cài đặt:
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (Khuyên dùng để cài đặt nhanh nhất)
- **HOẶC** nếu cài thủ công:
    - [Node.js](https://nodejs.org/) (v18 trở lên)
    - [Python](https://www.python.org/) (v3.9 trở lên)
    - [PostgreSQL](https://www.postgresql.org/)

## 🏃 Cài đặt & Chạy Dự án

### Cách 1: Sử dụng Docker (Khuyên dùng)

Cách nhanh nhất để chạy toàn bộ hệ thống mà không cần cài môi trường phức tạp.

1.  **Clone dự án**
    ```bash
    git clone https://github.com/trantankha/sdms-project.git
    cd sdms-project
    ```

2.  **Khởi động hệ thống**
    Lệnh này sẽ build backend, setup database và khởi chạy các service.
    ```bash
    docker-compose up -d
    ```

3.  **Khởi tạo Database & Dữ liệu mẫu**
    Chạy lệnh này **một lần duy nhất** khi mới cài đặt để tạo bảng và thêm dữ liệu mẫu (Tài khoản Admin, Tòa nhà, Phòng).
    ```bash
    docker-compose exec backend python -m app.initial_data
    ```

4.  **Truy cập hệ thống**
    - **Trang chủ (Frontend)**: [http://localhost:3000](http://localhost:3000)
    - **Tài liệu API (Backend)**: [http://localhost:8000/docs](http://localhost:8000/docs)

    *Tài khoản Admin mặc định (nếu dùng data mẫu):*
    - Email: `admin@utehy.edu.vn`
    - Password: `admin123`

### Cách 2: Cài đặt Thủ công (Development)

Dành cho việc phát triển code (Dev).

#### 1. Setup Database
Đảm bảo bạn đã có PostgreSQL đang chạy. Bạn có thể dùng Docker chỉ cho DB:
```bash
docker-compose up -d db
```

#### 2. Setup Backend
```bash
cd backend

# Tạo môi trường ảo (Virtual Environment)
python -m venv venv
# Kích hoạt môi trường
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Cấu hình biến môi trường
# Copy file .env.example sang .env và sửa DATABASE_URL nếu cần
cp .env.example .env

# Chạy Migrations (Tạo bảng)
alembic upgrade head

# Chạy Server
python run.py
```

#### 3. Setup Frontend
```bash
cd frontend

# Cài đặt thư viện node modules
npm install

# Cấu hình biến môi trường
# Copy file .env.example sang .env.local
cp .env.example .env.local

# Chạy Web Dev Server
npm run dev
```

## 📂 Cấu trúc Dự án

```
sdms-project/
├── backend/                # Mã nguồn Backend (FastAPI)
│   ├── app/
│   │   ├── api/            # API Endpoints (v1)
│   │   ├── core/           # Cấu hình, Bảo mật, Kết nối DB
│   │   ├── models/         # Định nghĩa bảng Database (SQLAlchemy)
│   │   ├── schemas/        # Định nghĩa kiểu dữ liệu (Pydantic)
│   │   ├── services/       # Xử lý nghiệp vụ logic
│   │   └── main.py         # File chạy chính
│   ├── alembic/            # Quản lý version database
│   ├── requirements.txt    # Danh sách thư viện Python
│   └── Dockerfile
│
├── frontend/               # Mã nguồn Frontend (Next.js)
│   ├── src/
│   │   ├── app/            # App Router (Các trang & Layout)
│   │   ├── components/     # Các component giao diện tái sử dụng
│   │   ├── lib/            # Các hàm tiện ích (axios, utils)
│   │   ├── services/       # Gọi API từ backend
│   │   ├── store/          # Quản lý state toàn cục (Zustand)
│   │   └── styles/         # Global Styles
│   ├── package.json
│   └── tailwind.config.ts
│
├── docker-compose.yml      # File cấu hình chạy Docker
└── README.md               # Tài liệu dự án
```

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy thoải mái gửi Pull Request để cải thiện dự án.