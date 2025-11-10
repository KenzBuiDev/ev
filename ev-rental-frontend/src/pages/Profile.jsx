import React, { useEffect, useState } from 'react'
import api from '../api/fetchClient'


export default function Profile() {
    const [rentals, setRentals] = useState([])
    useEffect(() => { api.request('/rentals').then(setRentals).catch(console.error) }, [])
    return (
        <div>
            <h2>My Rentals</h2>
            <ul>
                {rentals.map(r => <li key={r.rental_id || r.id}>{r.rental_id || r.id} - {r.status}</li>)}
            </ul>
        </div>
    )
}