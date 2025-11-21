import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/VehicleCard.css'

/**
 * VEHICLE CARD COMPONENT
 * 
 * Hiển thị một thẻ xe với hình ảnh, tên, loại xe, giá
 * Được dùng trong trang Home để liệt kê danh sách xe
 * 
 * Props:
 * - v (vehicle object): Dữ liệu của một chiếc xe
 *   {
 *     id hoặc vehicle_id: "v001",
 *     name hoặc model: "Toyota Vios",
 *     type hoặc category: "Sedan",
 *     price_per_hour hoặc pricePerHour: 50000,
 *     image_url hoặc images: [...]
 *   }
 */

export default function VehicleCard({ v }) {
  /**
   * Lấy ID của xe
   * - Ưu tiên v.id, nếu không có thì lấy v.vehicle_id
   * - Dùng để tạo link đến trang chi tiết xe
   */
  const vid = v.id || v.vehicle_id

  /**
   * Lấy tên hiển thị của xe
   * - Ưu tiên: v.name → v.model → fallback v.id (nếu không có tên)
   */
  const name = v.name || v.model || vid

  /**
   * XỬ LÝ HÌNH ẢNH CỦA XE
   * 
   * Thứ tự ưu tiên (fallback chain):
   * 1. v.image_url: URL ảnh trực tiếp từ backend
   *    Ví dụ: "https://example.com/images/v001.jpg"
   * 
   * 2. v.images[0]?.url: Nếu API trả mảng images
   *    Ví dụ: { images: [{ url: "...", id: "img1" }, ...] }
   * 
   * 3. `/vehicles/${vid}.jpg`: Suy luận theo thư mục public
   *    Ví dụ: /vehicles/v001.jpg (tìm trong public/vehicles/v001.jpg)
   * 
   * 4. `/placeholder.png`: Hình mặc định nếu tất cả cách trên không được
   *    Dùng khi xe không có ảnh hoặc file ảnh bị thiếu
   */
  const primaryImage =
    v.image_url ||
    (Array.isArray(v.images) && v.images[0]?.url) ||
    (vid ? `/vehicles/${vid}.jpg` : '/placeholder.png')

  return (
    <div className="vehicle-card-wrapper">
      {/* 
        HÌNH ẢNH XE
        - src: Hiển thị ảnh chính (dùng fallback nếu cần)
        - alt: Mô tả ảnh (dùng cho accessibility - screen readers)
        - onError: Nếu ảnh không tìm được → Dùng ảnh placeholder
      */}
      <img
        src={primaryImage}
        alt={name}
        className="vehicle-card-image"
        onError={(e) => { e.currentTarget.src = '/placeholder.png' }}
      />

      {/* TÊN XE */}
      <h3>{name}</h3>

      {/* THÔNG TIN XE: LOẠI + GIÁ */}
      <div className="vehicle-card-info">
        {/* 
          Loại xe (Sedan, SUV, Hatchback, v.v.)
          - Ưu tiên: v.type → v.category → 'N/A' nếu không có
        */}
        <div>Mẫu: {v.type || v.category || 'N/A'}</div>

        {/* 
          Giá thuê theo giờ
          - Ưu tiên: v.price_per_hour → v.pricePerHour → '—' (không có giá)
          - ??: Operator "nullish coalesce" - nếu giá = 0 thì vẫn hiển thị 0
          - Đơn vị: ₫ (đồng Việt Nam)
        */}
        <div>Giá/giờ: {v.price_per_hour ?? v.pricePerHour ?? '—'} ₫</div>
      </div>

      {/* 
        BUTTON THUÊ XE
        - Chỉ hiển thị nếu có ID xe (vid tồn tại)
        - Link đến trang chi tiết: /vehicles/{id}
        - Ví dụ: /vehicles/v001
      */}
      {vid && <Link to={`/vehicles/${vid}`} className="vehicle-card-link">Thuê</Link>}
    </div>
  )
}
