import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/VehicleCard.css'

export default function VehicleCard({ v }) {
  // Lấy id theo key nào cũng được (id | vehicle_id)
  const vid = v.id || v.vehicle_id
  const name = v.name || v.model || vid

  // Ưu tiên:
  // 1) v.image_url từ backend
  // 2) v.images[0].url nếu API trả mảng ảnh
  // 3) Suy luận theo quy ước thư mục public/vehicles/{vehicle_id}.jpg
  const primaryImage =
    v.image_url ||
    (Array.isArray(v.images) && v.images[0]?.url) ||
    (vid ? `/vehicles/${vid}.jpg` : '/placeholder.png')

  return (
    <div className="vehicle-card-wrapper">
      <img
        src={primaryImage}
        alt={name}
        className="vehicle-card-image"
        onError={(e) => { e.currentTarget.src = '/placeholder.png' }} // fallback khi thiếu file ảnh
      />
      <h3>{name}</h3>
      <div className="vehicle-card-info">
        <div>Mẫu: {v.type || v.category || 'N/A'}</div>
        <div>Giá/giờ: {v.price_per_hour ?? v.pricePerHour ?? '—'} ₫</div>
      </div>
      {vid && <Link to={`/vehicles/${vid}`} className="vehicle-card-link">Thuê</Link>}
    </div>
  )
}
