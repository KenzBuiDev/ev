import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/fetchClient";
import '../styles/PaymentReturn.css';

/**
 * TRANG KẾT QUẢ THANH TOÁN
 * 
 * FLOW:
 * 1. VNPay redirect về URL này kèm các query params (vnp_ResponseCode, vnp_TxnRef, vnp_Amount, ...)
 * 2. Parse params để kiểm tra kết quả thanh toán
 * 3. Nếu vnp_ResponseCode === "00" → thanh toán thành công
 * 4. Gửi POST /rentals để tạo rental record từ sessionStorage reservation data
 * 5. Hiển thị kết quả + cho user click vào profile để xem lịch sử thuê
 */

export default function PaymentReturn() {
  const [params] = useSearchParams(); // Lấy URL query params từ VNPay
  const nav = useNavigate();
  const [info, setInfo] = useState(null); // Thông tin kết quả thanh toán
  const [loading, setLoading] = useState(true);

  /**
   * PARSE VNPAY RESPONSE PARAMS
   * 
   * URL Example:
   * /payment/return?vnp_ResponseCode=00&vnp_TxnRef=20241121123456&vnp_Amount=40000000&vnp_BankCode=NCB&vnp_PayDate=20241121123500
   * 
   * Params từ VNPay:
   * - vnp_ResponseCode: "00" = thành công, khác = thất bại
   * - vnp_TxnRef: mã giao dịch từ VNPay
   * - vnp_Amount: số tiền (x100, phải chia 100 để lấy VND)
   * - vnp_BankCode: mã ngân hàng
   * - vnp_PayDate: thời gian thanh toán (format YYYYMMDDHHMMSS)
   */
  useEffect(() => {
    // Convert URLSearchParams thành object thường
    const q = Object.fromEntries(params.entries());
    console.log(" Nhận response từ VNPay:", q);

    // Kiểm tra mã response: "00" = success, khác = fail
    const isSuccess = q.vnp_ResponseCode === "00";
    console.log(isSuccess ? "✓ Thanh toán THÀNH CÔNG" : "✗ Thanh toán THẤT BẠI");

    // Lưu thông tin thanh toán để hiển thị
    setInfo({
      status: isSuccess ? "success" : "failed",
      txnRef: q.vnp_TxnRef,
      amount: (Number(q.vnp_Amount || 0) / 100) + " VND", // Chia 100 vì VNPay gửi x100
      bank: q.vnp_BankCode,
      payDate: q.vnp_PayDate,
    });

    // Nếu thanh toán thành công, tạo rental record từ reservation data
    if (isSuccess) {
      createRentalFromReservation();
    }
    setLoading(false);
  }, [params]);

  /**
   * TẠO RENTAL RECORD TRONG DATABASE
   * 
   * Quy trình:
   * 1. Lấy reservation data từ sessionStorage (được lưu từ VehicleDetail khi user xác nhận thuê)
   * 2. Tính toán estimated_amount nếu chưa có (hours x price_per_hour)
   * 3. Gửi POST /rentals với dữ liệu:
   *    - vehicle_id: ID xe được thuê
   *    - start_time: thời gian bắt đầu
   *    - end_time: thời gian kết thúc
   *    - estimated_amount: tổng tiền
   *    - reservation_id: ID reservation
   *    - status: 'active' (đơn thuê đang hoạt động)
   * 
   * API: POST /rentals
   * Response: { rental_id, vehicle_id, renter_id, start_time, end_time, status, ... }
   * 
   * Lưu ý:
   * - Backend sẽ tự động set renter_id từ authenticated user
   * - Sau tạo thành công, sẽ có trong danh sách /rentals/me
   * - Clear sessionStorage để không tạo lại nếu user reload trang
   */
  async function createRentalFromReservation() {
    try {
      // Bước 1: Lấy reservation từ sessionStorage
      const reservationData = sessionStorage.getItem("last_reservation");
      console.log(" Lấy reservation từ sessionStorage:", reservationData);

      if (reservationData) {
        const reservation = JSON.parse(reservationData);
        console.log("✓ Parse thành công:", reservation);

        // Bước 2: Tính estimated_amount nếu chưa có
        let estimatedAmount = reservation.estimated_amount || reservation.amount;
        if (!estimatedAmount && reservation.hours && reservation.price_per_hour) {
          estimatedAmount = reservation.hours * reservation.price_per_hour;
        }
        console.log(" Estimated amount:", estimatedAmount);

        // Bước 3: Chuẩn bị dữ liệu để gửi tới API
        const rentalData = {
          vehicle_id: reservation.vehicle_id,
          start_time: reservation.start_time,
          end_time: reservation.end_time,
          estimated_amount: estimatedAmount || 0,
          reservation_id: reservation.reservation_id,
          status: 'active' // Trạng thái mới tạo
        };

        console.log(" Gửi dữ liệu tạo rental:", rentalData);

        // Bước 4: Gửi API tạo rental
        // Backend sẽ tự động set renter_id từ JWT token của user đang đăng nhập
        const result = await api.request("/rentals", {
          method: "POST",
          body: JSON.stringify(rentalData),
        });

        console.log(" Rental tạo thành công:", result);

        // Bước 5: Xóa sessionStorage để avoid tạo lại nếu refresh
        sessionStorage.removeItem("last_reservation");
      } else {
        console.warn(" Không tìm thấy reservation trong sessionStorage - có thể user vào direct URL");
      }
    } catch (e) {
      console.error(" Lỗi tạo rental:", e);
    }
  }

  if (loading) return <div className="payment-loading">Đang xử lý...</div>;
  if (!info) return <p>Không có thông tin thanh toán</p>;

  return (
    <div className="payment-return-container">
      <h2>Kết quả thanh toán</h2>
      {info.status === "success" ? (
        <div className="payment-status-card success">
          <p className="payment-status-title">✓ Thanh toán thành công</p>
          <p><strong>Tham chiếu:</strong> {info.txnRef}</p>
          <p><strong>Số tiền:</strong> {info.amount}</p>
          <p><strong>Ngân hàng:</strong> {info.bank}</p>
          <p><strong>Thời gian:</strong> {info.payDate}</p>
          <p className="payment-info-text">Đơn thuê xe của bạn đã được tạo. Kiểm tra lịch sử thuê để xem chi tiết.</p>
        </div>
      ) : (
        <div className="payment-status-card failed">
          <p className="payment-status-title">✗ Thanh toán thất bại</p>
          <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>
      )}
      <div className="payment-actions">
        <Link to="/profile" className="profile-link">Xem lịch sử thuê</Link>
        <Link to="/" className="home-link">Về trang chủ</Link>
      </div>
    </div>
  );
}
