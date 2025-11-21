import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

/**
 * ADMIN DASHBOARD COMPONENT
 * 
 * Trang dashboard chính cho admin
 * Hiển thị menu dropdown với các tùy chọn quản lí
 * 
 * Chứa các link tới:
 * 1. Quản lí xe (ManageVehicles)
 *    - Xem danh sách xe
 *    - Thêm/Sửa/Xóa xe
 *    - Quản lí trạng thái xe
 * 
 * 2. Quản lí thuê xe (ManageRentals)
 *    - Xem danh sách các đơn thuê
 *    - Thay đổi trạng thái rental (Ongoing, Completed)
 *    - Xóa lịch sử thuê
 * 
 * 3. Báo cáo hư hỏng (ManageReports)
 *    - Xem danh sách báo cáo hư hỏng
 *    - Đánh dấu hư hỏng đã sửa (Resolved)
 *    - Xóa báo cáo
 * 
 * 4. Quản lí người dùng (ManageUsers)
 *    - Xem danh sách tất cả user
 *    - Thêm/Sửa/Xóa user
 *    - Gán role (admin, staff, renter)
 *    - Kích hoạt/Vô hiệu hóa user
 */

export default function AdminDashboard() {
    /**
     * State để điều khiển trạng thái menu
     * - open = true: Hiển thị dropdown menu
     * - open = false: Ẩn dropdown menu
     */
    const [open, setOpen] = useState(false);

    return (
        <div className="admin-dashboard-wrapper">
            <h2>Admin</h2>

            {/* Container chứa menu dropdown */}
            <div className="admin-menu-container">
                {/* 
                  Button mở/đóng menu
                  - Khi click → toggle state open (true/false)
                  - ▾ là biểu tượng mũi tên xuống
                */}
                <button
                    className="admin-menu-button"
                    onClick={() => setOpen(!open)}
                >
                    Admin Menu ▾
                </button>

                {/* 
                  Dropdown menu - Chỉ hiển thị khi open === true
                  Sử dụng conditional rendering {open && ...}
                  - Nếu open = true → render dropdown
                  - Nếu open = false → không render gì cả
                */}
                {open && (
                    <div className="admin-menu-dropdown">
                        {/* 
                          Link 1: Quản lí xe
                          - Dẫn đến trang: /admin/vehicles
                          - onClick={() => setOpen(false)} để đóng menu sau khi click
                        */}
                        <Link
                            to="/admin/vehicles"
                            className="admin-menu-item"
                            onClick={() => setOpen(false)}
                        >
                            Quản lí xe
                        </Link>

                        {/* 
                          Link 2: Quản lí thuê xe
                          - Dẫn đến trang: /admin/rentals
                        */}
                        <Link
                            to="/admin/rentals"
                            className="admin-menu-item"
                            onClick={() => setOpen(false)}
                        >
                            Quản lí thuê xe
                        </Link>

                        {/* 
                          Link 3: Báo cáo hư hỏng
                          - Dẫn đến trang: /admin/reports
                        */}
                        <Link
                            to="/admin/reports"
                            className="admin-menu-item"
                            onClick={() => setOpen(false)}
                        >
                            Báo cáo hư hỏng
                        </Link>

                        {/* 
                          Link 4: Quản lí người dùng
                          - Dẫn đến trang: /admin/users
                        */}
                        <Link
                            to="/admin/users"
                            className="admin-menu-item"
                            onClick={() => setOpen(false)}
                        >
                            Quản lí người dùng
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}