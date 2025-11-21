import React, { useEffect, useState } from 'react'
import api from '../api/fetchClient'
import '../styles/Profile.css'

/**
 * TRANG PROFILE - LỊCH SỬ THUÊ XE
 * 
 * FLOW:
 * 1. Load thông tin user hiện tại (GET /auth/me)
 * 2. Load danh sách rental của user (GET /rentals/me)
 * 3. Hiển thị thông tin user + rental history
 * 
 * Lưu ý:
 * - /rentals/me sẽ tự động filter theo user_id từ JWT token
 * - Rental được tạo từ PaymentReturn sẽ xuất hiện ở đây
 */

export default function Profile() {
    const [rentals, setRentals] = useState([])     // Danh sách rental của user
    const [vehicles, setVehicles] = useState({})   // Map vehicle_id -> vehicle data
    const [user, setUser] = useState(null)         // Thông tin user hiện tại
    const [loading, setLoading] = useState(true)   // Loading state

    /**
     * LOAD THÔNG TIN USER VÀ RENTAL HISTORY
     * 
     * API 1: GET /auth/me
     * Response: { user_id, full_name, email, phone, role, ... }
     * 
     * API 2: GET /rentals/me
     * Response: [
     *   {
     *     rental_id: "rt001",
     *     vehicle_id: "v001",
     *     renter_id: "user123",
     *     start_time: "2024-11-21T10:30:00Z",
     *     end_time: "2024-11-21T14:30:00Z",
     *     estimated_amount: 400000,
     *     status: "active",
     *     ...
     *   },
     *   ...
     * ]
     * 
     * Gửi cả 2 API cùng lúc (Promise.all) để tăng tốc độ
     */
    useEffect(() => {
        setLoading(true);
        Promise.all([
            // Lấy thông tin user hiện tại
            api.request('/auth/me')
                .then(setUser)
                .catch(e => console.error(" Lỗi fetch user:", e)),

            // Lấy danh sách rental của user
            // Backend sẽ filter theo user_id từ JWT token, nên không cần truyền params
            api.request('/rentals/me')
                .then(data => {
                    console.log(" Rentals fetched:", data);
                    // Ensure data là array (fallback nếu server trả về undefined)
                    const rentalList = Array.isArray(data) ? data : [];
                    setRentals(rentalList);

                    // Fetch vehicle details cho mỗi rental
                    fetchVehicleDetails(rentalList);
                })
                .catch(e => {
                    console.error(" Lỗi fetch rentals:", e);
                    setRentals([]);
                })
        ]).finally(() => setLoading(false));
    }, [])

    /**
     * Fetch chi tiết xe cho mỗi rental
     * Tạo map vehicle_id -> vehicle data để hiển thị type, model, price
     */
    async function fetchVehicleDetails(rentalList) {
        try {
            const vehicleMap = {};

            // Lấy unique vehicle_ids
            const vehicleIds = [...new Set(rentalList.map(r => r.vehicle_id))];

            // Fetch details cho mỗi vehicle
            for (const vehicleId of vehicleIds) {
                try {
                    const vehicleData = await api.request(`/vehicles/${vehicleId}`);
                    vehicleMap[vehicleId] = vehicleData;
                } catch (e) {
                    console.warn(`Không thể fetch vehicle ${vehicleId}:`, e);
                    vehicleMap[vehicleId] = null;
                }
            }

            setVehicles(vehicleMap);
        } catch (e) {
            console.error("Lỗi fetch vehicle details:", e);
        }
    }

    /**
     * Format thời gian từ ISO string sang dạng đọc được
     * Example: "2024-11-21T10:30:00Z" → "21/11/2024 10:30"
     */
    function formatTime(isoString) {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return isoString;
        }
    }

    /**
     * Tính thời lượng thuê (giờ) từ start_time đến end_time
     */
    function calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return 'N/A';
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const durationMs = end - start;
            const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
            return `${durationHours} giờ`;
        } catch (e) {
            return 'N/A';
        }
    }

    /**
     * Xóa rental record
     * DELETE /rentals/:id
     */
    async function deleteRental(rentalId) {
        if (!window.confirm('Bạn chắc chắn muốn xóa lịch sử thuê này?')) {
            return;
        }

        try {
            await api.request(`/rentals/${rentalId}`, {
                method: 'DELETE'
            });

            // Reload rental list after delete
            const data = await api.request('/rentals/me');
            const rentalList = Array.isArray(data) ? data : [];
            setRentals(rentalList);

            // Refetch vehicle details
            fetchVehicleDetails(rentalList);

            console.log(' Xóa lịch sử thuê thành công');
        } catch (e) {
            console.error(' Lỗi xóa lịch sử thuê:', e);
            alert('Không thể xóa lịch sử thuê. Vui lòng thử lại.');
        }
    }

    /**
     * Convert status string thành lowercase CSS class
     * Dùng để apply styling khác nhau cho các trạng thái
     */
    const getStatusClass = (status) => {
        if (!status) return 'pending'
        return status.toLowerCase()
    }

    return (
        <div className="profile-container">


            <div className="rentals-section">
                <h3> Lịch sử thuê xe của tôi</h3>
                {loading ? (
                    <div className="loading-state">
                        Đang tải lịch sử thuê xe...
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="no-rentals">
                        <p>Bạn chưa có đơn thuê xe nào. <a href="/">Xem xe ngay</a></p>
                    </div>
                ) : (
                    <div className="rentals-list">
                        {rentals.map(r => {
                            const vehicle = vehicles[r.vehicle_id];
                            return (
                                <div key={r.rental_id || r.id} className="rental-card">
                                    <div className="rental-header">
                                        <div className="rental-title">
                                            <h4>{vehicle?.model || vehicle?.type || 'Xe'} - {vehicle?.plate_no || r.vehicle_id}</h4>
                                            <p className="rental-id">Đơn #{r.rental_id || r.id}</p>
                                        </div>
                                        <div className="rental-actions">
                                            <span className={`rental-status ${getStatusClass(r.status)}`}>
                                                {r.status === 'active' || r.status === 'Ongoing' ? ' Đang sử dụng' :
                                                    r.status === 'Completed' || r.status === 'completed' ? ' Hoàn thành' :
                                                        r.status === 'Cancelled' || r.status === 'cancelled' ? ' Đã hủy' :
                                                            r.status === 'pending' ? ' Chờ xác nhận' :
                                                                r.status || 'Chờ xác nhận'}
                                            </span>
                                            <button
                                                className="btn-delete-rental"
                                                onClick={() => deleteRental(r.rental_id || r.id)}
                                                title="Xóa lịch sử này"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rental-details-grid">
                                        <div className="rental-detail-item">
                                            <strong>Loại xe:</strong>
                                            <p>{vehicle?.type || 'N/A'}</p>
                                        </div>
                                        <div className="rental-detail-item">
                                            <strong>Mẫu xe:</strong>
                                            <p>{vehicle?.model || 'N/A'}</p>
                                        </div>
                                        <div className="rental-detail-item">
                                            <strong>Thời gian thuê:</strong>
                                            <p>{formatTime(r.start_time)}</p>
                                        </div>
                                        <div className="rental-detail-item">
                                            <strong>Thời gian trả:</strong>
                                            <p>{formatTime(r.end_time)}</p>
                                        </div>
                                        <div className="rental-detail-item">
                                            <strong>Thời lượng:</strong>
                                            <p>{calculateDuration(r.start_time, r.end_time)}</p>
                                        </div>
                                        <div className="rental-detail-item">
                                            <strong>Đơn giá:</strong>
                                            <p>{vehicle ? `${Number(vehicle.price_per_hour || 0).toLocaleString('vi-VN')} VNĐ/giờ` : 'N/A'}</p>
                                        </div>
                                        <div className="rental-detail-item total">
                                            <strong>Tổng tiền:</strong>
                                            <p className="amount-highlight">{Number(r.estimated_amount || r.amount || 0).toLocaleString('vi-VN')} VNĐ</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}