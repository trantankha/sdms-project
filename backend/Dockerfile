# Sử dụng Python 3.10 slim để nhẹ (khoảng 150MB thay vì 800MB)
FROM python:3.10-slim

# Thiết lập biến môi trường:
# PYTHONDONTWRITEBYTECODE: Ngăn Python tạo file .pyc
# PYTHONUNBUFFERED: Log in ra console ngay lập tức (quan trọng khi debug Docker)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Cài đặt các dependencies hệ thống cần thiết cho psycopg2 (Postgres driver)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements trước để tận dụng Docker Cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY . .

# Mở port 8000
EXPOSE 8000

# Lệnh chạy mặc định (có thể bị override bởi docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]