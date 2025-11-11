import React, { useEffect, useState } from 'react'
import api from '../api/fetchClient'
import VehicleCard from '../components/VehicleCard'


export default function Home() {
    const [vehicles, setVehicles] = useState([])
    const [q, setQ] = useState('')
    const [sort, setSort] = useState('')
    const [type, setType] = useState('')
    const [loading, setLoading] = useState(false)


    async function load() {
        setLoading(true)
        try {
            const qs = []
            if (q) qs.push(`q=${encodeURIComponent(q)}`)
            if (sort) qs.push(`sort=${encodeURIComponent(sort)}`)
            if (type) qs.push(`type=${encodeURIComponent(type)}`)
            const path = `/vehicles${qs.length ? '?' + qs.join('&') : ''}`
            const data = await api.request(path)
            setVehicles(data || [])
        } catch (e) {
            console.error(e)
        } finally { setLoading(false) }
    }


    useEffect(() => { load() }, [q, sort, type])


    return (
        <div>
            <h2>Vehicles</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="">Sort</option>
                    <option value="price_asc">Price: low → high</option>
                    <option value="price_desc">Price: high → low</option>
                </select>
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="">All types</option>
                    <option value="Evo">Evo</option>
                    <option value="Klara">Klara</option>
                    <option value="Vento">Vento</option>
                </select>
                <button onClick={load}>Refresh</button>
            </div>


            {loading ? <div>Loading...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                    {vehicles.map(v => <VehicleCard key={v.id || v.vehicle_id} v={v} />)}
                </div>
            )}
        </div>
    )
}