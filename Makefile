# Tên container backend trong docker-compose (check lại file docker-compose.yml của bạn)
BACKEND_CONTAINER = sdms-project-backend-1 
# Lưu ý: Tên container phụ thuộc vào tên thư mục, thường là {folder}_backend_1. 
# Bạn có thể dùng lệnh "docker ps" để xem tên chính xác.
# Hoặc an toàn hơn ta dùng "docker-compose exec backend"

.PHONY: help up down restart logs migrate seed shell test

help: ## Hiển thị danh sách các lệnh
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Khởi động hệ thống (Backend + DB)
	docker-compose up -d

down: ## Tắt hệ thống
	docker-compose down

restart: down up ## Khởi động lại toàn bộ

logs: ## Xem log của Backend
	docker-compose logs -f backend

migrate: ## Chạy Database Migration (Cập nhật bảng mới)
	docker-compose exec backend alembic upgrade head

migration: ## Tạo file migration mới (Ví dụ: make migration msg="them_bang_user")
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

seed: ## Bơm dữ liệu mẫu
	docker-compose exec backend python -m app.initial_data

shell: ## Truy cập vào dòng lệnh bên trong container Backend
	docker-compose exec backend /bin/bash

db-shell: ## Truy cập vào Database PostgreSQL
	docker-compose exec db psql -U sdms_admin -d sdms_db

test: ## Chạy Unit Test (Sẽ setup sau)
	docker-compose exec backend pytest