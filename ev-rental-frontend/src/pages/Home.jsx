import React, { useEffect, useState } from 'react'
import api from '../api/fetchClient'
import VehicleCard from '../components/VehicleCard'
import '../styles/Home.css'

/**
 * Home Component - Trang danh sách xe điện
 * 
 * CHỨC NĂNG:
 * - Hiển thị danh sách xe khả dụng từ API
 * - Tìm kiếm xe theo model hoặc biển số
 * - Lọc theo loại xe (Evo, Klara, Vento)
 * - Sắp xếp theo giá (thấp → cao, cao → thấp)
 * - User có thể click vào xe để xem chi tiết hoặc đặt chỗ
 */
export default function Home() {
    // State: Danh sách xe được filter và sort
    const [vehicles, setVehicles] = useState([])

    // State: Từ khóa tìm kiếm (q = query)
    const [q, setQ] = useState('')

    // State: Loại sắp xếp (price_asc, price_desc, hoặc '')
    const [sort, setSort] = useState('')

    // State: Loại xe được filter (Evo, Klara, Vento)
    const [type, setType] = useState('')

    // State: Trạng thái loading khi gọi API
    const [loading, setLoading] = useState(false)

    /**
     * Hàm load - Lấy xe từ API và áp dụng filter + sort
     * 
     * Các bước:
     * 1. Gọi API GET /vehicles lấy tất cả xe
     * 2. Filter chỉ xe status = "Available" (xe khả dụng)
     * 3. Filter theo search query (model hoặc plate_no)
     * 4. Filter theo type nếu user chọn
     * 5. Sort theo giá nếu user chọn
     * 6. Cập nhật state vehicles
     */
    async function load() {
        setLoading(true)
        try {
            // Gọi API lấy danh sách tất cả xe
            const data = await api.request('/vehicles') || []

            // Bước 1: Filter - chỉ lấy xe khả dụng (status = "Available")
            let filtered = data.filter(v => v.status === "Available")

            // Bước 2: Filter theo từ khóa tìm kiếm q
            // Tìm kiếm theo model (tên xe) hoặc plate_no (biển số)
            // Không phân biệt hoa/thường (toLowerCase)
            filtered = filtered.filter(v =>
                v.model.toLowerCase().includes(q.toLowerCase()) ||
                v.plate_no.toLowerCase().includes(q.toLowerCase())
            )

            // Bước 3: Filter theo loại xe nếu user chọn
            // type có giá trị: 'Evo', 'Klara', 'Vento', hoặc '' (tất cả)
            if (type) filtered = filtered.filter(v => v.type === type)

            // Bước 4: Sort theo giá thuê mỗi giờ
            // price_asc: sắp xếp từ thấp đến cao
            // price_desc: sắp xếp từ cao đến thấp
            if (sort === 'price_asc') filtered.sort((a, b) => a.price_per_hour - b.price_per_hour)
            if (sort === 'price_desc') filtered.sort((a, b) => b.price_per_hour - a.price_per_hour)

            // Bước 5: Cập nhật state với danh sách xe đã filter
            setVehicles(filtered)
        } catch (e) {
            // Nếu có lỗi khi gọi API, log ra console
            console.error(e)
        } finally {
            // Kết thúc loading dù thành công hay thất bại
            setLoading(false)
        }
    }

    /**
     * useEffect: Tự động load xe khi user thay đổi filter
     * 
     * Dependencies: [q, sort, type]
     * - Khi q (search) thay đổi → gọi load()
     * - Khi sort (sắp xếp) thay đổi → gọi load()
     * - Khi type (loại xe) thay đổi → gọi load()
     * 
     * Lưu ý: Không đưa load() vào dependencies để tránh infinite loop
     */
    useEffect(() => { load() }, [q, sort, type])

    return (
        <div className="home-container">
            {/* HEADER SECTION */}
            <div className="home-header">
                <h1>Khám phá xe điện của chúng tôi</h1>
                <p>Chọn chiếc xe phù hợp và bắt đầu hành trình của bạn</p>
            </div>

            {/* FILTER SECTION - Tìm kiếm, sắp xếp, lọc */}
            <div className="filters-section">
                <div className="filters-grid">
                    {/* Input tìm kiếm theo model hoặc biển số */}
                    <div className="filter-group">
                        <label>Tìm kiếm</label>
                        <input
                            placeholder="Model hoặc biển số..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>

                    {/* Select sắp xếp theo giá */}
                    <div className="filter-group">
                        <label>Sắp xếp</label>
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="">Không sắp xếp</option>
                            <option value="price_asc">Giá: thấp → cao</option>
                            <option value="price_desc">Giá: cao → thấp</option>
                        </select>
                    </div>

                    {/* Select lọc theo loại xe */}
                    <div className="filter-group">
                        <label>Loại xe</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="">Tất cả loại</option>
                            <option value="Evo">Evo</option>
                            <option value="Klara">Klara</option>
                            <option value="Vento">Vento</option>
                        </select>
                    </div>

                    {/* Nút reset filter */}
                    <button className="filter-button" onClick={load}>Đổi lại</button>
                </div>
            </div>

            {/* VEHICLES SECTION - Danh sách xe */}
            <div className="vehicles-section">
                <h2>Xe khả dụng</h2>

                {/* Conditional rendering: Loading → No results → Vehicle list */}
                {loading ? (
                    // Trạng thái: Đang tải dữ liệu
                    <div className="loading-state">Loading...</div>
                ) : vehicles.length === 0 ? (
                    // Trạng thái: Không tìm thấy xe (filter quá chặt)
                    <div className="no-vehicles">
                        <h3>Không tìm thấy xe</h3>
                        <p>Hãy thử thay đổi bộ lọc của bạn</p>
                    </div>
                ) : (
                    // Trạng thái: Có xe → hiển thị danh sách
                    <div className="vehicles-grid">
                        {/* Map qua từng xe và render VehicleCard component */}
                        {vehicles.map(v => (
                            <VehicleCard key={v.vehicle_id} v={v} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
