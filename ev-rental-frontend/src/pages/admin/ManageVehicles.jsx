import React, { useState, useEffect } from "react";
import apiClient from "../../api/fetchClient";
import '../../styles/ManageVehicles.css'

export default function ManageVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        station_id: "",
        plate_no: "",
        model: "",
        type: "Evo",
        status: "Available",
        battery_percent: 0,
        odometer: 0,
        price_per_hour: 0
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    async function loadVehicles() {
        try {
            const data = await apiClient.request("/vehicles"); // giả sử API trả về mảng xe
            setVehicles(data);
        } catch (e) {
            alert("Failed to load vehicles: " + e.message);
        }
    }

    function startCreate() {
        setEditing(null);
        setForm({
            station_id: "",
            plate_no: "",
            model: "",
            type: "Evo",
            status: "Available",
            battery_percent: 0,
            odometer: 0,
            price_per_hour: 0
        });
    }

    function startEdit(vehicle) {
        setEditing(vehicle);
        setForm(vehicle);
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
        if (!confirm("Delete this vehicle?")) return;
        try {
            await apiClient.request(`/vehicles/${id}`, { method: "DELETE" });
            await loadVehicles();
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h3>Quản lí xe</h3>

            <button onClick={startCreate} style={{ marginBottom: 16 }}>
                Thêm xe mới
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400, marginBottom: 24 }}>
                <label>
                    Trạm xe:
                    <select
                        value={form.station_id}
                        onChange={e => setForm({ ...form, station_id: e.target.value })}
                    >
                        <option value="">--Chọn trạm--</option>
                        <option value="st_1">Station 1</option>
                        <option value="st_2">Station 2</option>
                        <option value="st_3">Station 3</option>
                    </select>
                </label>

                <label>
                    Biển số:
                    <input
                        placeholder="Plate No"
                        value={form.plate_no}
                        onChange={e => setForm({ ...form, plate_no: e.target.value })}
                    />
                </label>

                <label>
                    Model:
                    <input
                        placeholder="Model"
                        value={form.model}
                        onChange={e => setForm({ ...form, model: e.target.value })}
                    />
                </label>

                <label>
                    Loại xe:
                    <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="Evo">Evo</option>
                        <option value="Klara">Klara</option>
                        <option value="Vento">Vento</option>
                    </select>
                </label>

                <label>
                    Trạng thái:
                    <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                        <option value="Available">Khả dụng</option>
                        <option value="Rented">Đang thuê</option>
                        <option value="Maintenance">Bảo trì</option>
                    </select>
                </label>

                <label>
                    Pin (%):
                    <input
                        type="number"
                        value={form.battery_percent}
                        onChange={e => setForm({ ...form, battery_percent: Number(e.target.value) })}
                    />
                </label>

                <label>
                    Số km đã đi:
                    <input
                        type="number"
                        value={form.odometer}
                        onChange={e => setForm({ ...form, odometer: Number(e.target.value) })}
                    />
                </label>

                <label>
                    Giá thuê/giờ (VNĐ):
                    <input
                        type="number"
                        value={form.price_per_hour}
                        onChange={e => setForm({ ...form, price_per_hour: Number(e.target.value) })}
                    />
                </label>

                <button onClick={saveVehicle}>
                    {editing ? "Cập nhật xe" : "Thêm xe mới"}
                </button>
            </div>

            <div>
                {vehicles.map(v => (
                    <div key={v.vehicle_id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
                        <h4>{v.model} ({v.plate_no})</h4>
                        <p>Vehicle ID: {v.vehicle_id}</p>
                        <p>Station: {v.station_id}</p>
                        <p>Loại xe: {v.type}</p>
                        <p>Trạng thái: {v.status}</p>
                        <p>Pin: {v.battery_percent}%</p>
                        <p>Số km đã đi: {v.odometer} km</p>
                        <p>Giá thuê/giờ: {v.price_per_hour} VNĐ</p>
                        <div style={{ marginTop: 8 }}>
                            <button onClick={() => startEdit(v)} style={{ marginRight: 8 }}>Chỉnh sửa</button>
                            <button onClick={() => removeVehicle(v.vehicle_id)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
