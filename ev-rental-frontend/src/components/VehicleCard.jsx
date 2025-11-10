import React from 'react'
import { Link } from 'react-router-dom'

export default function VehicleCard({ v }) {
    const vid = v.id || v.vehicle_id // ✅ lấy id đúng dù backend trả key nào
    return (
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <img
                src={v.image_url || '/placeholder.png'}
                alt={v.name}
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }}
            />
            <h3>{v.name}</h3>
            <p>Type: {v.type} • Price/hr: {v.price_per_hour}</p>
            <Link to={`/vehicles/${vid}`}>Details</Link> {/* ✅ */}
        </div>
    )
}
