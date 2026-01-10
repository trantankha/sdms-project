SYSTEM_RULES = """
### 1. QUY ĐỊNH VỀ HỢP ĐỒNG & LƯU TRÚ
- **Quy trình vào ở**: Sinh viên phải có Hợp đồng (Contract) ở trạng thái đã duyệt (ACTIVE) mới được check-in nhận phòng.
- **Thời hạn**: Hợp đồng thường kéo dài theo Học kỳ hoặc Năm học. 
- **Gia hạn**: Sinh viên cần gia hạn trước khi hợp đồng hết hạn 15 ngày.
- **Chấm dứt**: Nếu muốn chuyển ra ngoài sớm, phải làm đơn "Thanh lý hợp đồng" (Liquidation) và có thể chịu phạt cọc.
- **Tiền cọc**: Khoản tiền đảm bảo (Deposit) sẽ được hoàn trả khi thanh lý hợp đồng, trừ đi các khoản phạt hư hại (nếu có).

### 2. QUY ĐỊNH VỀ PHÒNG Ở (ROOMS)
- **Phân loại**: Có phòng Nam, phòng Nữ. Tuyệt đối không được nam vào phòng nữ và ngược lại (trừ sảnh chờ).
- **Giờ giới nghiêm**: Ký túc xá đóng cửa lúc 23:00 và mở cửa lúc 05:00 sáng. Về muộn cần báo bảo vệ.
- **Vệ sinh**: Sinh viên tự dọn dẹp phòng ở. Sẽ có kiểm tra vệ sinh hàng tuần.
- **Tài sản**: Sinh viên chịu trách nhiệm bảo quản tài sản trong phòng (Giường, Tủ, Bàn ghế). Hư hỏng do chủ quan phải đền bù.

### 3. TÀI CHÍNH & HÓA ĐƠN (FINANCE)
- **Hóa đơn hàng tháng**: Phát hành vào ngày 1-5 hàng tháng. Bao gồm:
  - Tiền phòng (nếu đóng theo tháng).
  - Tiền điện & nước (tính theo chỉ số thực tế).
  - Phí dịch vụ khác (Gửi xe, Internet, Giặt là).
- **Thanh toán**:
  - Hạn chót: Ngày 10 hàng tháng.
  - Quá hạn: Sau ngày 10 sẽ bị tính là "Overdue" và có thể bị cắt điện/nước hoặc khóa tài khoản.
- **Cách tính điện nước**:
  - Điện: Tính theo kWh tiêu thụ * Đơn giá (VD: 3.000đ/kWh).
  - Nước: Tính theo m3 tiêu thụ * Đơn giá (VD: 15.000đ/m3).

### 4. DỊCH VỤ & TIỆN ÍCH (SERVICES)
- **Gửi xe**: Đăng ký biển số xe với ban quản lý. Phí tính theo tháng.
- **Internet**: Wifi miễn phí tại sảnh, nhưng internet tốc độ cao trong phòng có thể thu phí gói.
- **Giặt là**: Có khu giặt chung hoặc dịch vụ giặt ủi (tính phí theo kg).
- **Sửa chữa**: Khi có hỏng hóc (bóng đèn cháy, vòi nước rỉ), sinh viên tạo "Yêu cầu sửa chữa" (Request) trên hệ thống.

### 5. KỶ LUẬT & KHEN THƯỞNG (CONDUCT)
- **Điểm rèn luyện**: Mỗi sinh viên bắt đầu với 100 điểm. Vi phạm sẽ bị trừ điểm.
- **Các lỗi thường gặp**:
  - Gây ồn ào sau 23h.
  - Xả rác bừa bãi.
  - Nấu ăn trong phòng (nếu bị cấm).
  - Đưa người lạ vào phòng không xin phép.
- **Hệ quả**: Bị trừ điểm rèn luyện, nhắc nhở, hoặc chấm dứt hợp đồng nếu tái phạm nhiều lần.
"""
