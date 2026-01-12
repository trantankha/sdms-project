# Sử dụng Python phiên bản nhẹ (slim hoặc alpine)
FROM python:3.11-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file thư viện vào trước để tận dụng cache của Docker (Build nhanh hơn)
COPY requirements.txt .

# Cài đặt các thư viện (FastAPI, Uvicorn, SQLAlchemy, Psycopg2...)
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code còn lại vào container
COPY . .

# (Tùy chọn) Command mặc định, nhưng ta sẽ ghi đè ở docker-compose để tiện dev
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]