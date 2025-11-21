// src/pages/Checkout.jsx
/**
 * TRANG THANH TOÁN
 * 
 * FLOW:
 * 1. Nhận reservation từ VehicleDetail page (qua state hoặc sessionStorage)
 * 2. Hiển thị thông tin đặt chỗ (xe, thời gian, giá)
 * 3. User click "Thanh toán qua VNPay" → gửi POST /payments/vnpay/create
 * 4. Nhận payment_url từ server → redirect sang VNPay gateway
 * 5. VNPay xử lý giao dịch → redirect về /payment/return?vnp_ResponseCode=...
 */
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/fetchClient";
import '../styles/Checkout.css';

export default function Checkout() {
  // ===== HOOKS CƠ BẢN =====
  // Lấy dữ liệu từ state (khi navigate từ VehicleDetail)
  const { state } = useLocation();

  // Lấy URL params (rid=...)
  const [params] = useSearchParams();

  // Hook điều hướng (dùng để quay lại hoặc navigate)
  const nav = useNavigate();

  /**
   * KHÔI PHỤC RESERVATION
   * Thứ tự ưu tiên:
   * 1. Từ state (được gửi khi navigate từ VehicleDetail)
   * 2. Từ sessionStorage (fallback nếu user refresh trang / mở link trực tiếp)
   * 3. Null (nếu không có, sẽ fetch lại từ server)
   */
  const [reservation, setReservation] = useState(() => {
    // Ưu tiên 1: Lấy từ state (được truyền qua navigate)
    if (state?.reservation) {
      console.log("✓ Reservation từ state (tìm thấy):", state.reservation);
      return state.reservation;
    }

    // Ưu tiên 2: Lấy từ sessionStorage (dành cho trường hợp refresh trang)
    const raw = sessionStorage.getItem("last_reservation");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log("✓ Reservation từ sessionStorage (tìm thấy):", parsed);
        return parsed;
      } catch (e) {
        console.error("✗ Lỗi parse sessionStorage:", e);
      }
    }

    // Ưu tiên 3: Null, sẽ fetch từ server nếu có rid trong URL
    console.warn("⚠ Chưa tìm thấy reservation, sẽ fetch từ server...");
    return null;
  });

  // Lấy reservation_id từ URL params
  // Ví dụ: /checkout?rid=rsv001 → ridFromQuery = "rsv001"
  const ridFromQuery = params.get("rid") || undefined;

  /**
   * useMemo: Tính toán reservation_id để dùng khi thanh toán
   * Ưu tiên: 
   * - Nếu có reservation object → lấy từ reservation.reservation_id
   * - Nếu không → lấy từ URL params (ridFromQuery)
   */
  const reservationId = useMemo(
    () => reservation?.reservation_id || ridFromQuery,
    [reservation, ridFromQuery]
  );

  /**
   * useEffect: FETCH RESERVATION NẾU CHỈ CÓ ID MÀ CHƯA CÓ CHI TIẾT
   * 
   * Trường hợp sử dụng:
   * - User refresh trang → state mất
   * - User mở link trực tiếp (từ email, bookmark)
   * - Private window → sessionStorage không available
   * 
   * Giải pháp:
   * - Lấy rid từ URL params
   * - Gọi API GET /reservations/:id để lấy chi tiết
   * - Cấp nhật state và lưu vào sessionStorage
   * 
   * API Response:
   * {
   *   reservation_id, vehicle_id, start_time, end_time, 
   *   hours, price_per_hour, ...
   * }
   */
  useEffect(() => {
    // Nếu chưa có reservation object nhưng có rid trong URL → fetch
    if (!reservation && ridFromQuery) {
      console.log("Fetching reservation từ server:", ridFromQuery);
      api.request(`/reservations/${ridFromQuery}`)
        .then((r) => {
          console.log("✓ Fetched reservation từ server:", r);

          // Nếu server không trả về estimated_amount, tính toán từ hours × price_per_hour
          const enrichedReservation = r;
          if (!enrichedReservation.estimated_amount && enrichedReservation.hours && enrichedReservation.price_per_hour) {
            enrichedReservation.estimated_amount = enrichedReservation.hours * enrichedReservation.price_per_hour;
          }

          // Cập nhật state
          setReservation(enrichedReservation);

          // Lưu vào sessionStorage để dùng lại nếu user tiếp tục (quay lại, refresh)
          sessionStorage.setItem("last_reservation", JSON.stringify(enrichedReservation));
        })
        .catch((e) => {
          console.error("✗ Lỗi fetch reservation:", e);
        });
    }
  }, [reservation, ridFromQuery]);

  /**
   * KHỞI TẠO THANH TOÁN VIA VNPAY
   * 
   * API: POST /payments/vnpay/create
   * 
   * Input body:
   * {
   *   reservation_id: "rsv001"
   * }
   * 
   * Response: {
   *   payment_url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
   *   order_id: "20241121...",
   *   created_at: "2024-11-21T..."
   * }
   * 
   * Flow:
   * 1. Kiểm tra reservationId có tồn tại không
   * 2. Gọi API tạo link thanh toán VNPay
   * 3. Redirect user sang VNPay gateway (QR code hoặc form nhập thẻ)
   * 4. VNPay xử lý giao dịch → redirect về /payment/return?vnp_ResponseCode=...
   * 5. sessionStorage vẫn giữ reservation data để PaymentReturn component dùng
   */
  async function onPayVNPay() {
    try {
      // Validate: Phải có reservationId để thanh toán
      if (!reservationId) {
        alert("Thiếu mã đặt chỗ. Hãy quay lại chọn thời gian và đặt chỗ trước.");
        return nav(-1);
      }

      console.log("📤 Bắt đầu thanh toán VNPay với reservation:", reservation);
      console.log("📦 SessionStorage hiện tại:", sessionStorage.getItem("last_reservation"));

      // Gửi API request tạo link thanh toán
      const res = await api.request("/payments/vnpay/create", {
        method: "POST",
        body: JSON.stringify({ reservation_id: reservationId }),
      });
      const { payment_url } = res || {};

      // Validate: Phải nhận được payment_url từ server
      if (!payment_url) throw new Error("Không nhận được payment_url từ server");

      console.log("✓ Nhận payment_url, chuyển hướng sang VNPay...");

      // Redirect sang VNPay gateway (QR code hoặc form nhập thẻ)
      // Trang này sẽ đóng và VNPay sẽ mở
      window.location.href = payment_url;
    } catch (e) {
      alert("Tạo thanh toán lỗi: " + e.message);
      console.error("✗ Payment error:", e);
    }
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h2>Thanh toán đơn thuê xe</h2>
      </div>

      <div className="checkout-content">
        {/* ===== PHẦN TRÁI: FORM THÔNG TIN ĐẶT CHỖ ===== */}
        <div className="checkout-form">
          <h3>Thông tin đặt chỗ</h3>

          {/* Mã đặt chỗ */}
          <div className="form-section">
            <p className="summary-item">
              <span className="summary-label">Mã đặt chỗ:</span>
              <span className="summary-value">{reservationId || "(chưa có)"}</span>
            </p>
          </div>

          {/* Thời gian đặt chỗ (từ - đến) */}
          <div className="form-section">
            <h4>Thời gian</h4>
            <p className="summary-item">
              <span className="summary-label">Từ:</span>
              <span className="summary-value">{reservation?.start_time || "-"}</span>
            </p>
            <p className="summary-item">
              <span className="summary-label">Đến:</span>
              <span className="summary-value">{reservation?.end_time || "-"}</span>
            </p>
          </div>

          {/* Thông tin xe được chọn */}
          <div className="form-section">
            <h4>Xe được chọn</h4>
            <p className="summary-item">
              <span className="summary-label">Vehicle ID:</span>
              <span className="summary-value">{reservation?.vehicle_id || "-"}</span>
            </p>
          </div>
        </div>

        {/* ===== PHẦN PHẢI: TÓM TẮT THANH TOÁN ===== */}
        <div className="checkout-summary">
          <h3>Tóm tắt</h3>

          {/* Hiển thị chi tiết nếu có reservation */}
          {reservation && (
            <>
              {/* Số giờ thuê */}
              <div className="summary-item">
                <span className="summary-label">Số giờ:</span>
                <span className="summary-value">{reservation.hours || "-"}</span>
              </div>

              {/* Giá thuê mỗi giờ */}
              <div className="summary-item">
                <span className="summary-label">Giá/giờ:</span>
                <span className="summary-value">
                  {reservation.price_per_hour ? `${Number(reservation.price_per_hour).toLocaleString("vi-VN")}` : "-"}
                </span>
              </div>
            </>
          )}

          {/* Tổng tiền tạm tính */}
          {/* Ưu tiên: estimated_amount từ server → tính từ hours × price_per_hour → "Đang tính..." */}
          <div className="total-amount">
            <span>Tạm tính:</span>
            <span>
              {reservation?.estimated_amount ||
                (reservation?.hours && reservation?.price_per_hour
                  ? `${Number(reservation.hours * reservation.price_per_hour).toLocaleString("vi-VN")} ₫`
                  : "Đang tính...")}
            </span>
          </div>

          {/* Nút thanh toán VNPay */}
          <button className="checkout-button" onClick={onPayVNPay}>
            Thanh toán qua VNPay (QR)
          </button>

          {/* Nút quay lại */}
          <button className="checkout-button checkout-back-button" onClick={() => nav(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
