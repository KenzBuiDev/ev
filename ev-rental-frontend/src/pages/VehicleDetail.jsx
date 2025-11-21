// src/pages/VehicleDetail.jsx
/**
 * TRANG CHI TIẾT XE
 * 
 * FLOW:
 * 1. User chọn xe từ trang Home
 * 2. Trang này load thông tin xe từ API
 * 3. User chọn giờ bắt đầu & kết thúc
 * 4. User click "Báo giá" → gửi POST /billing/quote
 * 5. User click "Xác nhận thuê xe" → gửi POST /reservations
 * 6. Lưu reservation vào sessionStorage để dùng lại khi thanh toán
 * 7. Redirect sang /checkout page
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/fetchClient";
import '../styles/VehicleDetail.css'

/**
 * Chuẩn hóa khoảng thời gian:
 * - input là datetime-local (vd: "2024-11-21T10:30")
 * - convert sang ISO string (vd: "2024-11-21T10:30:00.000Z")
 * - nếu end <= start, tự động thêm 24 giờ (hiểu là qua ngày hôm sau)
 */
function normalizeRange(startLocal, endLocal) {
  const s = new Date(startLocal);
  let e = new Date(endLocal);
  if (isNaN(+s) || isNaN(+e)) throw new Error("Thời gian không hợp lệ");
  if (e <= s) e = new Date(e.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: s.toISOString(), endISO: e.toISOString() };
}

export default function VehicleDetail() {
  const { id } = useParams(); // vehicle_id từ URL params /vehicles/:id
  const nav = useNavigate(); // Để navigate sang trang khác

  const [vehicle, setVehicle] = useState(null);
  const [startTime, setStartTime] = useState(""); // Giờ bắt đầu (format datetime-local)
  const [endTime, setEndTime] = useState("");     // Giờ kết thúc (format datetime-local)
  const [quote, setQuote] = useState(null);       // Kết quả báo giá từ server
  const [loading, setLoading] = useState(false);  // Loading state khi gửi API

  /**
   * LOAD THÔNG TIN XE
   * API: GET /vehicles/:id
   * Response: { vehicle_id, name, type, price_per_hour, image_url, status, ... }
   */
  useEffect(() => {
    api.request(`/vehicles/${id}`).then(setVehicle).catch(() => { });
  }, [id]);

  /**
   * GỬI API TÍNH GIÁ THUÊ
   * API: POST /billing/quote
   * 
   * Input body:
   * {
   *   vehicle_id: "v001",
   *   start_time: "2024-11-21T10:30:00.000Z",
   *   end_time: "2024-11-21T14:30:00.000Z"
   * }
   * 
   * Response: {
   *   hours: 4,
   *   price_per_hour: 100000,
   *   billing_unit: "giờ",
   *   currency: "VND",
   *   amount: 400000
   * }
   */
  async function handleQuote() {
    setLoading(true);
    try {
      const { startISO, endISO } = normalizeRange(startTime, endTime);
      const q = await api.request("/billing/quote", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: id,
          start_time: startISO,
          end_time: endISO,
        }),
      });
      setQuote(q); // Lưu kết quả báo giá
    } catch (e) {
      alert("Báo giá thất bại: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * TẠO ĐẶT CHỖ (RESERVATION)
   * API: POST /reservations
   * 
   * Input body:
   * {
   *   vehicle_id: "v001",
   *   start_time: "2024-11-21T10:30:00.000Z",
   *   end_time: "2024-11-21T14:30:00.000Z"
   * }
   * 
   * Response: {
   *   reservation_id: "rsv001",
   *   vehicle_id: "v001",
   *   start_time: "2024-11-21T10:30:00.000Z",
   *   end_time: "2024-11-21T14:30:00.000Z",
   *   status: "pending",
   *   created_at: "2024-11-21T..."
   * }
   * 
   * Lưu ý:
   * - Merge dữ liệu từ quote (hours, price_per_hour, estimated_amount, currency)
   * - Lưu vào sessionStorage với key "last_reservation" (để dùng lại nếu refresh trang)
   * - Navigate sang Checkout page kèm reservation_id trong URL params
   */
  async function handleReserve() {
    if (!quote) return alert("Bạn cần báo giá trước");
    try {
      const { startISO, endISO } = normalizeRange(startTime, endTime);
      const reservation = await api.request("/reservations", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: id,
          start_time: startISO,
          end_time: endISO,
        }),
      });

      // Merge thêm dữ liệu từ quote để có đủ info khi thanh toán
      const enrichedReservation = {
        ...reservation,
        hours: quote.hours,
        price_per_hour: quote.price_per_hour,
        estimated_amount: quote.amount || (quote.hours * quote.price_per_hour),
        currency: quote.currency,
        billing_unit: quote.billing_unit,
      };

      // Lưu vào sessionStorage với key "last_reservation"
      // sessionStorage sẽ giữ dữ liệu này nếu user refresh trang / mở tab mới
      sessionStorage.setItem("last_reservation", JSON.stringify(enrichedReservation));

      // Navigate sang trang Checkout kèm reservation_id trong URL param
      // Vừa gửi reservation qua state (nhanh) vừa lưu URL (durable)
      nav(`/checkout?rid=${encodeURIComponent(reservation.reservation_id)}`, {
        state: { reservation: enrichedReservation },
      });
    } catch (e) {
      alert("Tạo đặt chỗ lỗi: " + e.message);
    }
  }

  if (!vehicle) return <div className="vehicle-detail-loading">Đang tải...</div>;

  // Check if vehicle is available for booking
  const isAvailable = vehicle.status === "Available" || !vehicle.status;

  return (
    <div className="vehicle-detail-container">
      <div className="vehicle-detail-wrapper">
        <h2>{vehicle.name || `Xe ${id}`}</h2>

        {vehicle.image_url && (
          <img
            src={vehicle.image_url}
            alt={vehicle.name || id}
            className="vehicle-detail-image"
          />
        )}

        <div className="vehicle-detail-info">
          <p><strong>Loại xe:</strong> {vehicle.type}</p>
          <p><strong>Giá thuê:</strong> <span className="price-highlight">{Number(vehicle.price_per_hour || 0).toLocaleString("vi-VN")} VNĐ/giờ</span></p>
          <p><strong>Trạng thái:</strong> <span className={`status-badge ${vehicle.status?.toLowerCase() || 'available'}`}>{vehicle.status || 'Sẵn sàng'}</span></p>

          {!isAvailable && (
            <div className="unavailable-warning">
              ⚠️ Xe này hiện không khả dụng. Vui lòng chọn xe khác.
            </div>
          )}
        </div>

        {isAvailable ? (
          <div className="vehicle-detail-grid">
            <div className="vehicle-booking">
              <h3>Đặt xe</h3>
              <div className="booking-form">
                <label>
                  Giờ bắt đầu:
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label>
                  Giờ kết thúc:
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
                <div className="booking-buttons">
                  <button className="btn-quote" disabled={loading} onClick={handleQuote}>
                    {loading ? 'Đang báo giá...' : 'Báo giá'}
                  </button>
                  {quote && (
                    <button className="btn-reserve" disabled={loading} onClick={handleReserve}>
                      {loading ? 'Đang xử lý...' : 'Xác nhận thuê xe'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {quote && (
              <div className="vehicle-quote">
                <h4>Báo giá chi tiết</h4>
                <div className="quote-content">
                  <div className="quote-row">
                    <span>Thời gian:</span>
                    <span className="quote-value">{quote.hours} giờ</span>
                  </div>
                  <div className="quote-row">
                    <span>Đơn giá:</span>
                    <span className="quote-value">{Number(quote.price_per_hour).toLocaleString("vi-VN")} {quote.currency || "VNĐ"}/{quote.billing_unit || "giờ"}</span>
                  </div>
                  <div className="quote-row total">
                    <span>Tổng cộng:</span>
                    <span className="quote-total">{Number(quote.amount).toLocaleString("vi-VN")} {quote.currency || "VNĐ"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="unavailable-message">
            <p>Xe này không khả dụng để đặt. Vui lòng quay lại trang chủ để chọn xe khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
