import React from 'react';

export default function Debug() {
    const reservation = sessionStorage.getItem("last_reservation");

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <h2>Debug Info</h2>
            <h3>SessionStorage - last_reservation:</h3>
            {reservation ? (
                <pre style={{
                    background: '#f5f5f5',
                    padding: '20px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    maxHeight: '400px'
                }}>
                    {JSON.stringify(JSON.parse(reservation), null, 2)}
                </pre>
            ) : (
                <p style={{ color: 'red' }}>No reservation data in sessionStorage</p>
            )}

            <h3>Browser Console Logs:</h3>
            <p>Mở DevTools (F12) → Console tab để xem chi tiết các bước tạo rental</p>

            <div style={{ marginTop: '30px' }}>
                <button onClick={() => {
                    sessionStorage.removeItem("last_reservation");
                    alert("Cleared sessionStorage");
                    window.location.reload();
                }} style={{
                    padding: '10px 20px',
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Clear SessionStorage
                </button>
            </div>
        </div>
    );
}
