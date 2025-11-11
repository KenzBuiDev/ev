import React, { useEffect, useState } from "react";
import apiClient from "../../api/fetchClient";

export default function ManageVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        station_id: "",
        plate_no: "",
        model: "",
        type: "Scooter",
        status: "Available",
        battery_percent: 100,
        odometer: 0
    });

    async function loadVehicles() {
        try {
            const data = await apiClient.request("/vehicles");
            setVehicles(data || []);
        } catch (e) {
            console.error("Load failed:", e);
        }
    }

    useEffect(() => {
        loadVehicles();
    }, []);

    function startCreate() {
        setEditing(null);
        setForm({
            station_id: "",
            plate_no: "",
            model: "",
            type: "Evo",
            status: "Available",
            battery_percent: 100,
            odometer: 0
        });
    }

    function startEdit(vehicle) {
        setEditing(vehicle);
        setForm({ ...vehicle });
    }

    async function saveVehicle() {
        try {
            if (editing) {
                await apiClient.request(`/vehicles/${editing.vehicle_id}`, {
                    method: "PUT",
                    body: JSON.stringify(form)
                });
            } else {
                await apiClient.request("/vehicles", {
                    method: "POST",
                    body: JSON.stringify(form)
                });
            }
            await loadVehicles();
            setEditing(null);
        } catch (e) {
            alert("Save failed: " + e.message);
        }
    }

    async function removeVehicle(id) {
        // Kiểm tra trước khi xóa
        const vehicleExists = vehicles.some(v => v.vehicle_id === id);
        if (!vehicleExists) {
            alert("Vehicle này không tồn tại hoặc đã bị xóa!");
            return;
        }

        if (!confirm("Delete this vehicle?")) return;

        try {
            await apiClient.request(`/vehicles/${id}`, { method: "DELETE" });
            await loadVehicles();
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }

    return (
        <div>
            <h3>Manage Vehicles</h3>
            <div style={{ marginBottom: 16 }}>
                <button onClick={startCreate}>Add New Vehicle</button>
            </div>

            <div style={{ marginBottom: 24 }}>
                <input
                    placeholder="Station ID"
                    value={form.station_id}
                    onChange={e => setForm({ ...form, station_id: e.target.value })}
                />
                <input
                    placeholder="Plate No"
                    value={form.plate_no}
                    onChange={e => setForm({ ...form, plate_no: e.target.value })}
                />
                <input placeholder="Model"
                    value={form.model}
                    onChange={e => setForm({ ...form, model: e.target.value })}
                />
                <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                >
                    <option value="Evo">Evo</option>
                    <option value="Klara">Klara</option>
                    <option value="Vento">Vento</option>
                </select>
                <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                </select>
                <input
                    type="number"
                    placeholder="Battery %"
                    value={form.battery_percent}
                    onChange={e => setForm({ ...form, battery_percent: Number(e.target.value) })}
                />
                <input
                    type="number"
                    placeholder="Odometer"
                    value={form.odometer}
                    onChange={e => setForm({ ...form, odometer: Number(e.target.value) })}
                />
                <button onClick={saveVehicle}>{editing ? "Update" : "Create"}</button>
            </div>

            <div>
                {vehicles.map(v => (
                    <div key={v.vehicle_id} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
                        <h4>{v.model} ({v.plate_no})</h4>
                        <p>Vehicle ID: {v.vehicle_id}</p>
                        <p>Station: {v.station_id}</p>
                        <p>Type: {v.type}</p>
                        <p>Status: {v.status}</p>
                        <p>Battery: {v.battery_percent}%</p>
                        <p>Odometer: {v.odometer} km</p>
                        <div style={{ marginTop: 8 }}>
                            <button onClick={() => startEdit(v)}>Edit</button>
                            <button onClick={() => removeVehicle(v.vehicle_id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}