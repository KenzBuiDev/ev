## Debugging Payment -> Rental Flow

### Step-by-step flow:

1. **VehicleDetail** - Người dùng chọn xe, đặt giờ, báo giá, sau đó bấm "Xác nhận thuê xe"
   - Gọi POST `/reservations` với: vehicle_id, start_time, end_time
   - Server trả về: reservation với reservation_id
   - Enriched with quote data (hours, price_per_hour, estimated_amount)
   - Lưu vào sessionStorage key "last_reservation"
   - Điều hướng đến `/checkout?rid=<reservation_id>`

2. **Checkout** - Hiển thị tóm tắt
   - Lấy reservation từ state hoặc sessionStorage
   - Nếu chỉ có rid từ URL, fetch lại từ `/reservations/:id`
   - Cập nhật sessionStorage với dữ liệu đầy đủ
   - Người dùng bấm "Thanh toán qua VNPay"
   - sessionStorage vẫn chứa "last_reservation" với dữ liệu đầy đủ
   - Redirect tới VNPay

3. **VNPay** - User quét QR, thanh toán
   - VNPay xử lý giao dịch
   - Redirect trở lại `/payment/return?vnp_ResponseCode=00&vnp_TxnRef=...`

4. **PaymentReturn** - Xử lý kết quả thanh toán
   - Kiểm tra vnp_ResponseCode === "00"
   - Nếu success:
     - Lấy reservation từ sessionStorage "last_reservation"
     - Tạo POST `/rentals` với vehicle_id, start_time, end_time, estimated_amount, status: 'active'
     - Clear sessionStorage "last_reservation"
   - Hiển thị kết quả
   - User bấm "Xem lịch sử thuê" -> Navigate tới `/profile`

5. **Profile** - Hiển thị rental history
   - Fetch `/rentals/me` để lấy danh sách rentals
   - Render danh sách

### Debugging checklist:

- [ ] F12 Console - xem logs khi đi từ VehicleDetail → Checkout → VNPay
- [ ] `/debug` page - check sessionStorage contents sau mỗi bước
- [ ] Network tab - xem requests tới `/reservations`, `/payments/vnpay/create`, `/rentals`
- [ ] Response từ `/rentals` POST - kiểm tra có lỗi không
- [ ] `/profile` page - check nếu `/rentals/me` trả về dữ liệu

### Common issues:

1. **sessionStorage mất dữ liệu**
   - Kiểm tra browser settings, có thể sessionStorage disabled
   - Thử mở Private window để test

2. **estimated_amount là undefined**
   - VehicleDetail cần lưu estimated_amount từ quote
   - Checkout cần tính lại nếu undefined
   - PaymentReturn cần có fallback

3. **/rentals POST trả về lỗi**
   - Check backend logs xem field nào bị lỗi
   - Có thể backend cần field khác như `user_id`, `customer_id`
   - Có thể trạng thái 'active' không hợp lệ

4. **/rentals/me không trả về dữ liệu mới**
   - Check authentication - user_id có match không
   - Check database xem rental có được lưu không

### Test flow:
1. Login
2. Click vào 1 xe
3. Chọn thời gian, báo giá
4. Click "Xác nhận thuê xe"
5. Kiểm tra Console - có log về reservation không
6. Click "/debug" để xem sessionStorage
7. Quay lại Checkout, click "Thanh toán"
8. Scan QR (hoặc test payment)
9. Khi redirect về /payment/return, check Console logs
10. Click "Xem lịch sử thuê"
11. Check xem rental có xuất hiện trong list không
