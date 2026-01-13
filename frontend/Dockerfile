# Sử dụng Node.js bản nhẹ
FROM node:20-slim

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json để cài thư viện
COPY package.json package-lock.json* ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code nguồn
COPY . .

# Chạy server development (để bạn sửa code là web tự cập nhật - Hot Reload)
CMD ["npm", "run", "dev"]