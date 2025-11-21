import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <h2>Admin</h2>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setOpen(!open)}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4
                    }}
                >
                    Admin Menu ▾
                </button>

                {open && (
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
                        <Link
                            to="/admin/vehicles"
                            style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                            onClick={() => setOpen(false)}
                        >
                            Quản lí xe
                        </Link>
                        <Link
                            to="/admin/rentals"
                            style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                            onClick={() => setOpen(false)}
                        >
                            Quản lí thuê xe
                        </Link>
                        <Link
                            to="/admin/reports"
                            style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: '#333' }}
                            onClick={() => setOpen(false)}
                        >
                            Báo cáo hư hỏng
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}