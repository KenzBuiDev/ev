import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import '../styles/Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const [adminOpen, setAdminOpen] = useState(false);

    async function onLogout() {
        await logout();
        nav('/login');
    }

    return (
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/">Trang chủ</Link>
            {user && <Link to="/profile">Lịch sử thuê</Link>}

            {/* Dropdown admin/staff */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
                <div style={{ position: 'relative' }}>
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
                            <Link to="/admin/vehicles" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }} onClick={() => setAdminOpen(false)}>Quản lí xe</Link>
                            <Link to="/admin/rentals" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }} onClick={() => setAdminOpen(false)}>Quản lí thuê xe</Link>
                            <Link to="/admin/reports" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }} onClick={() => setAdminOpen(false)}>Báo cáo hư hỏng</Link>
                            {user?.role === 'admin' && <Link to="/admin/users" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }} onClick={() => setAdminOpen(false)}>Quản lí người dùng</Link>}
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginLeft: 'auto' }}>
                {user ? (
                    <>
                        <span style={{ marginRight: 8 }}>{user.full_name || user.email || user.user_id}</span>
                        <button onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}