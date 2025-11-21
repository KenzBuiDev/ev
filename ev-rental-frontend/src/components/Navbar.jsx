import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import '../styles/Navbar.css';

/**
 * NAVBAR COMPONENT
 * 
 * Header navigation bar hiển thị ở trên cùng của trang
 * 
 * Chứa:
 * 1. Link "Trang chủ" - Luôn hiển thị
 * 2. Link "Lịch sử thuê" - Chỉ hiển thị khi user đã đăng nhập
 * 3. Admin/Staff Menu - Dropdown menu dành cho admin/staff
 *    - Quản lí xe (admin & staff)
 *    - Quản lí thuê xe (admin & staff)
 *    - Báo cáo hư hỏng (admin & staff)
 *    - Quản lí người dùng (admin only)
 * 4. User Info & Logout - Hiển thị tên user + logout button
 *    - Hoặc Link đến Login nếu chưa đăng nhập
 */

export default function Navbar() {
    // Lấy thông tin user từ AuthContext (auth.jsx)
    // user = { user_id, email, role, full_name } hoặc null
    // logout = function để logout (clear token & user data)
    const { user, logout } = useAuth();

    // useNavigate hook từ React Router
    // Dùng để navigate đến trang khác (ví dụ: nav('/login'))
    const nav = useNavigate();

    // State để điều khiển mở/đóng dropdown menu admin/staff
    const [adminOpen, setAdminOpen] = useState(false);

    /**
     * Hàm xử lý logout
     * - Gọi logout() để xóa token & user từ localStorage
     * - Redirect đến trang login
     */
    async function onLogout() {
        await logout();
        nav('/login');
    }

    return (
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Link trang chủ - Luôn hiển thị */}
            <Link to="/">Trang chủ</Link>

            {/* Link lịch sử thuê - Chỉ hiển thị khi user đã đăng nhập */}
            {user && <Link to="/profile">Lịch sử thuê</Link>}

            {/* 
              Dropdown Admin/Staff Menu
              - Chỉ hiển thị nếu user role = 'admin' hoặc 'staff'
              - Cho phép admin/staff quản lí xe, rental, reports
              - Chỉ admin được quản lí user
            */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
                <div style={{ position: 'relative' }}>
                    {/* 
                      Button mở/đóng menu dropdown
                      - Hiển thị "Admin" nếu role = admin
                      - Hiển thị "Staff" nếu role = staff
                      - onClick toggle state adminOpen (true/false)
                    */}
                    <button
                        onClick={() => setAdminOpen(!adminOpen)}
                        style={{
                            padding: '6px 10px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                        }}
                    >
                        {user?.role === 'admin' ? 'Admin' : 'Staff'} ▾
                    </button>

                    {/* 
                      Dropdown menu - Hiển thị khi adminOpen === true
                      - Conditional rendering: {adminOpen && ...}
                      - Position absolute để dropdown hiển thị dưới button
                    */}
                    {adminOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            marginTop: 4,
                            zIndex: 100,
                            minWidth: 160
                        }}>
                            {/* Link quản lí xe - Cho admin & staff */}
                            <Link
                                to="/admin/vehicles"
                                style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                                onClick={() => setAdminOpen(false)}
                            >
                                Quản lí xe
                            </Link>

                            {/* Link quản lí thuê xe - Cho admin & staff */}
                            <Link
                                to="/admin/rentals"
                                style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                                onClick={() => setAdminOpen(false)}
                            >
                                Quản lí thuê xe
                            </Link>

                            {/* Link báo cáo hư hỏng - Cho admin & staff */}
                            <Link
                                to="/admin/reports"
                                style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                                onClick={() => setAdminOpen(false)}
                            >
                                Báo cáo hư hỏng
                            </Link>

                            {/* 
                              Link quản lí người dùng - Chỉ cho admin
                              - Conditional: user?.role === 'admin'
                              - Staff không thể truy cập
                            */}
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin/users"
                                    style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                                    onClick={() => setAdminOpen(false)}
                                >
                                    Quản lí người dùng
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 
              User info & Authentication section
              - Hiển thị ở bên phải navbar (marginLeft: 'auto')
            */}
            <div style={{ marginLeft: 'auto' }}>
                {user ? (
                    <>
                        {/* 
                          Hiển thị tên user nếu đã đăng nhập
                          - Ưu tiên: full_name → email → user_id
                        */}
                        <span style={{ marginRight: 8 }}>{user.full_name || user.email || user.user_id}</span>

                        {/* Button logout - Gọi onLogout() khi click */}
                        <button onClick={onLogout}>Đăng xuất</button>
                    </>
                ) : null}
            </div>
        </nav>
    );
}