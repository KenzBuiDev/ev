import React from 'react'
import { Link } from 'react-router-dom'

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
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <img
        src={primaryImage}
        alt={name}
        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }}
        onError={(e) => { e.currentTarget.src = '/placeholder.png' }} // fallback khi thiếu file ảnh
      />
      <h3 style={{ marginTop: 8 }}>{name}</h3>
      <p>
        Type: {v.type || v.category || 'N/A'}
        {' • '}
        Price/hr: {v.price_per_hour ?? v.pricePerHour ?? '—'}
      </p>
      {vid && <Link to={`/vehicles/${vid}`}>Details</Link>}
    </div>
  )
}
