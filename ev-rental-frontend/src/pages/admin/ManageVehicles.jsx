import React, { useEffect, useState } from 'react'
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../api/admin'

export default function ManageVehicles() {
    const [vehicles, setVehicles] = useState([])
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({
        name: '',
        type: '',
        price_per_hour: 0,
        status: 'Available',
        image_url: ''
    })

    async function load() {
        const data = await getAllVehicles()
        setVehicles(data || [])
    }

    useEffect(() => { load() }, [])

    function startCreate() {
        setEditing(null)
        setForm({ name: '', type: 'scooter', price_per_hour: 0, status: 'Available', image_url: '' })
    }

    function startEdit(v) {
        setEditing(v)
        setForm({ name: v.name, type: v.type, price_per_hour: v.price_per_hour, status: v.status, image_url: v.image_url })
    }

    async function save() {
        try {
            if (editing) await updateVehicle(editing.id || editing.vehicle_id, form)
            else await createVehicle(form)
            await load()
            setEditing(null)
        } catch (e) {
            alert('Save failed: ' + JSON.stringify(e))
        }
    }

    async function remove(id) {
        if (!confirm('Delete?')) return
        await deleteVehicle(id)
        load()
    }

    return (
        <div>
            <h3>Manage Vehicles</h3>
            {/* rest of your JSX */}
        </div>
    )
}
