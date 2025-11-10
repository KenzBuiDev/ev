import React, { useEffect, useState } from 'react'
import { getAllRentals, updateRental, deleteRental } from '../../api/admin'


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
            <h3>Manage Rentals</h3>
            <table style={{ width: '100%' }}>
                <thead><tr><th>ID</th><th>User</th><th>Vehicle</th><th>Period</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {rentals.map(r => (
                        <tr key={r.rental_id || r.id}>
                            <td>{r.rental_id || r.id}</td>
                            <td>{r.user_id}</td>
                            <td>{r.vehicle_id}</td>
                            <td>{r.start_time || r.rental_start} → {r.end_time || r.rental_end}</td>
                            <td>{r.status}</td>
                            <td>
                                <button onClick={() => changeStatus(r, 'Ongoing')}>Set Ongoing</button>
                                <button onClick={() => changeStatus(r, 'Completed')}>Set Completed</button>
                                <button onClick={() => remove(r)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}