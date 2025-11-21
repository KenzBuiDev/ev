import React, { useEffect, useState } from 'react'
import { getAllRentals, updateRental, deleteRental } from '../../api/admin'
import '../../styles/ManageRentals.css'


export default function ManageRentals() {
    const [rentals, setRentals] = useState([])
    useEffect(() => { load() }, [])
    async function load() { const data = await getAllRentals(); setRentals(data || []) }


    async function changeStatus(r, status) {
        await updateRental(r.rental_id || r.id, { status })
        load()
    }
    async function remove(r) { if (!confirm('Delete rental?')) return; await deleteRental(r.rental_id || r.id); load() }


    return (
        <div>
            <h3>Quản lí thuê xe</h3>
            <table style={{ width: '100%' }}>
                <thead><tr><th>ID</th><th>Người dùng</th><th>Xe</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                <tbody>
                    {rentals.map(r => (
                        <tr key={r.rental_id || r.id}>
                            <td>{r.rental_id || r.id}</td>
                            <td>{r.user_id}</td>
                            <td>{r.vehicle_id}</td>
                            <td>{r.start_time || r.rental_start} → {r.end_time || r.rental_end}</td>
                            <td>{r.status}</td>
                            <td>
                                <button onClick={() => changeStatus(r, 'Ongoing')}>Đang diễn ra</button>
                                <button onClick={() => changeStatus(r, 'Completed')}>Hoàn thành</button>
                                <button onClick={() => remove(r)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}