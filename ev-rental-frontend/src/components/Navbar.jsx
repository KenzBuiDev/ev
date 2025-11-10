import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'


export default function Navbar() {
    const { user, logout } = useAuth()
    const nav = useNavigate()


    async function onLogout() {
        await logout();
        nav('/login')
    }


    return (
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12 }}>
            <Link to="/">Home</Link>
            {user && <Link to="/profile">My Rentals</Link>}
            {user?.role === 'admin' && <Link to="/admin">Admin</Link>}


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
    )
}