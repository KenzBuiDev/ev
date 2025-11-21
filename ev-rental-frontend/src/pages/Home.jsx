import React, { useEffect, useState } from 'react'
import api from '../api/fetchClient'
import VehicleCard from '../components/VehicleCard'
import '../styles/Home.css'

export default function Home() {
    const [vehicles, setVehicles] = useState([])
    const [q, setQ] = useState('')
    const [sort, setSort] = useState('')
    const [type, setType] = useState('')
    const [loading, setLoading] = useState(false)

    async function load() {
        setLoading(true)
        try {
            // Lấy data từ backend
            const data = await api.request('/vehicles') || []

            // Filter chỉ xe khả dụng (status = "Available")
            let filtered = data.filter(v => v.status === "Available")

            // Filter theo search q (theo model hoặc plate_no)
            filtered = filtered.filter(v =>
                v.model.toLowerCase().includes(q.toLowerCase()) ||
                v.plate_no.toLowerCase().includes(q.toLowerCase())
            )

            // Filter theo type nếu có
            if (type) filtered = filtered.filter(v => v.type === type)

            // Sort theo price_per_hour
            if (sort === 'price_asc') filtered.sort((a, b) => a.price_per_hour - b.price_per_hour)
            if (sort === 'price_desc') filtered.sort((a, b) => b.price_per_hour - a.price_per_hour)

            setVehicles(filtered)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [q, sort, type])

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Khám phá xe điện của chúng tôi</h1>
                <p>Chọn chiếc xe phù hợp và bắt đầu hành trình của bạn</p>
            </div>

            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Tìm kiếm</label>
                        <input
                            placeholder="Model hoặc biển số..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Sắp xếp</label>
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="">Không sắp xếp</option>
                            <option value="price_asc">Giá: thấp → cao</option>
                            <option value="price_desc">Giá: cao → thấp</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Loại xe</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="">Tất cả loại</option>
                            <option value="Evo">Evo</option>
                            <option value="Klara">Klara</option>
                            <option value="Vento">Vento</option>
                        </select>
                    </div>

                    <button className="filter-button" onClick={load}>Đổi lại</button>
                </div>
            </div>

            <div className="vehicles-section">
                <h2>Xe khả dụng</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
                ) : vehicles.length === 0 ? (
                    <div className="no-vehicles">
                        <h3>Không tìm thấy xe</h3>
                        <p>Hãy thử thay đổi bộ lọc của bạn</p>
                    </div>
                ) : (
                    <div className="vehicles-grid">
                        {vehicles.map(v => (
                            <VehicleCard key={v.vehicle_id} v={v} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
