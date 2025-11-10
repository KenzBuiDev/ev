import React from 'react'
import { Link } from 'react-router-dom'


export default function AdminDashboard() {
    return (
        <div>
            <h2>Admin Dashboard</h2>
            <nav style={{ display: 'flex', gap: 12 }}>
                <Link to="/admin/vehicles">Manage Vehicles</Link>
                <Link to="/admin/rentals">Manage Rentals</Link>
                <Link to="/admin/reports">Damage Reports</Link>
            </nav>
        </div>
    )
}