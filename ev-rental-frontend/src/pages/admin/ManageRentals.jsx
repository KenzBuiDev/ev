import React, { useEffect, useState } from 'react'
import { getAllRentals, updateRental, deleteRental } from '../../api/admin'
import '../../styles/ManageRentals.css'

/**
 * MANAGE RENTALS PAGE
 * 
 * Trang quản lí đơn thuê xe dành cho admin/staff
 * 
 * Chức năng:
 * 1. Xem danh sách tất cả đơn thuê xe
 * 2. Thay đổi trạng thái rental:
 *    - Đang diễn ra (Ongoing) - Xe đang được thuê
 *    - Hoàn thành (Completed) - Xe đã được trả
 * 3. Xóa đơn thuê (xóa lịch sử)
 * 
 * API calls:
 * - getAllRentals(): Lấy danh sách tất cả rental
 * - updateRental(id, data): Cập nhật trạng thái rental
 * - deleteRental(id): Xóa rental record
 */

export default function ManageRentals() {
    /**
     * State rentals - Danh sách tất cả đơn thuê xe
     * Mỗi rental object chứa:
     * {
     *   rental_id: "rt001",
     *   user_id: "u001",
     *   vehicle_id: "v001",
     *   start_time: "2024-11-21T10:30:00Z",
     *   end_time: "2024-11-21T14:30:00Z",
     *   status: "Ongoing" | "Completed" | "pending",
     * }
     */
    const [rentals, setRentals] = useState([])

    // State: Trạng thái loading khi đang fetch dữ liệu
    const [loading, setLoading] = useState(false)

    // State: Thông báo lỗi nếu có
    const [error, setError] = useState("")

    /**
     * useEffect hook - Chạy khi component mount
     * - Dependencies array rỗng [] → chỉ chạy 1 lần khi component load
     * - Gọi load() để lấy dữ liệu rental từ API
     */
    useEffect(() => { load() }, [])

    /**
     * Hàm formatTime - Format thời gian ISO sang định dạng dễ đọc
     * 
     * @param {string} isoString - Thời gian ISO (ví dụ: 2024-11-21T10:30:00Z)
     * @returns {string} Thời gian định dạng: "21/11/2024 10:30" hoặc "-" nếu không có
     */
    function formatTime(isoString) {
        if (!isoString) return "-"
        try {
            const date = new Date(isoString)
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${day}/${month}/${year} ${hours}:${minutes}`
        } catch (e) {
            return isoString
        }
    }

    /**
     * Hàm load() - Lấy danh sách rental từ API
     * - Gọi getAllRentals() từ api/admin.js
     * - Cập nhật state rentals với data từ API
     * - Nếu data = null → set rentals = [] (mảng rỗng)
     * - In log để debug nếu có vấn đề
     */
    async function load() {
        setLoading(true)
        setError("")
        try {
            const data = await getAllRentals()
            console.log("✓ Rental data từ API:", data)
            setRentals(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error("✗ Lỗi load rental:", e)
            setError("Lỗi tải dữ liệu: " + e.message)
            setRentals([])
        } finally {
            setLoading(false)
        }
    }

    /**
     * Hàm changeStatus(r, status) - Thay đổi trạng thái rental
     * 
     * Parameters:
     * - r: rental object chứa rental_id
     * - status: trạng thái mới ("Ongoing" hoặc "Completed")
     * 
     * Process:
     * 1. Gọi updateRental(id, { status })
     * 2. Sau khi update → gọi load() để refresh danh sách
     */
    async function changeStatus(r, status) {
        await updateRental(r.rental_id || r.id, { status })
        load()
    }

    /**
     * Hàm remove(r) - Xóa rental record
     * 
     * Parameters:
     * - r: rental object chứa rental_id
     * 
     * Process:
     * 1. Hiển thị confirmation dialog: "Delete rental?"
     * 2. Nếu user click Cancel → return (không làm gì)
     * 3. Nếu user click OK → gọi deleteRental(id)
     * 4. Sau khi xóa → gọi load() để refresh danh sách
     */
    async function remove(r) {
        if (!confirm('Delete rental?')) return
        await deleteRental(r.rental_id || r.id)
        load()
    }

    return (
        <div>
            <h3>Quản lí thuê xe</h3>

            {/* Nút làm mới dữ liệu */}
            <button onClick={load} style={{ marginBottom: '16px' }}>
                Làm mới
            </button>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            {/* Hiển thị trạng thái loading */}
            {loading && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#eef',
                    color: '#33c',
                    borderRadius: '4px'
                }}>
                    Đang tải dữ liệu...
                </div>
            )}

            {/* Kiểm tra nếu danh sách rental rỗng */}
            {!loading && rentals.length === 0 && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#ffe',
                    color: '#c93',
                    borderRadius: '4px'
                }}>
                    Không có lịch sử thuê xe nào.
                </div>
            )}

            {/* 
              Table hiển thị danh sách rental
              - className="rentals-table" để áp dụng CSS styling
              - Responsive design & hover effects
            */}
            <table className="rentals-table">
                {/* 
                  Table header - Tiêu đề các cột
                  - ID: Mã đơn thuê
                  - Người dùng: user_id hoặc user name
                  - Xe: vehicle_id
                  - Thời gian: start_time → end_time
                  - Trạng thái: Ongoing/Completed/pending
                  - Hành động: Change status / Delete buttons
                */}
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Xe</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                {/* Table body - Dữ liệu rental */}
                <tbody>
                    {/* 
                      Loop qua rentals array → tạo <tr> cho mỗi rental
                      - key={r.rental_id || r.id} → React cần key để track items
                      - Hiển thị id, user_id, vehicle_id, thời gian, trạng thái
                    */}
                    {rentals.map(r => (
                        <tr key={r.rental_id || r.id}>
                            {/* Rental ID */}
                            <td>{r.rental_id || r.id}</td>

                            {/* Người dùng - Hiển thị tên nếu có, fallback về user_id */}
                            <td>
                                {r.renter_name || r.user_id || r.renter_id}
                            </td>

                            {/* Vehicle ID - mã chiếc xe */}
                            <td>{r.vehicle_id}</td>

                            {/* 
                              Thời gian thuê - Format: DD/MM/YYYY HH:MM
                              - Ưu tiên: start_actual/end_actual (thời gian thực tế)
                              - Fallback: start_time/end_time (thời gian dự kiến)
                              - Sử dụng formatTime() để format
                            */}
                            <td>
                                {formatTime(r.start_actual || r.start_time)}
                                {' → '}
                                {formatTime(r.end_actual || r.end_time)}
                            </td>

                            {/* 
                              Status badge - Trạng thái rental
                              - className động: `rental-status ${(r.status || 'pending').toLowerCase()}`
                              - CSS class thay đổi theo status: pending/ongoing/completed
                              - Hiển thị màu khác nhau cho mỗi status (xanh/vàng/đỏ)
                            */}
                            <td>
                                <span className={`rental-status ${(r.status || 'pending').toLowerCase()}`}>
                                    {r.status}
                                </span>
                            </td>

                            {/* 
                              Hành động - 3 buttons
                              - className="rental-actions" → layout flex các button
                            */}
                            <td className="rental-actions">
                                {/* Button "Đang diễn ra" - Set status = "Ongoing" */}
                                <button
                                    className="status-btn"
                                    onClick={() => changeStatus(r, 'Ongoing')}
                                >
                                    Đang diễn ra
                                </button>

                                {/* Button "Hoàn thành" - Set status = "Completed" */}
                                <button
                                    className="status-btn"
                                    onClick={() => changeStatus(r, 'Completed')}
                                >
                                    Hoàn thành
                                </button>

                                {/* Button "Xóa" - Xóa rental record */}
                                <button
                                    className="delete-btn"
                                    onClick={() => remove(r)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}