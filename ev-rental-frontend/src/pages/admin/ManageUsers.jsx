import React, { useEffect, useState } from "react";
import api from "../../api/fetchClient";
import '../../styles/ManageUsers.css';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        email: "",
        full_name: "",
        phone: "",
        role: "renter",
        password: "",
        is_active: true
    });

    async function loadUsers() {
        try {
            const data = await api.request("/users");
            setUsers(data || []);
        } catch (e) {
            alert("Load users failed: " + e.message);
        }
    }

    useEffect(() => { loadUsers(); }, []);

    function startCreate() {
        setEditing(null);
        setForm({ email: "", full_name: "", phone: "", role: "renter", password: "", is_active: true });
    }

    function startEdit(user) {
        setEditing(user);
        setForm({ ...user, password: "" });
    }

    async function saveUser() {
        try {
            if (editing) {
                await api.request(`/users/${editing.user_id}`, {
                    method: "PUT",
                    body: JSON.stringify(form)
                });
            } else {
                await api.request("/users", {
                    method: "POST",
                    body: JSON.stringify(form)
                });
            }
            await loadUsers();
            setEditing(null);
        } catch (e) {
            alert("Save failed: " + e.message);
        }
    }

    async function removeUser(id) {
        if (!window.confirm("Xóa user này?")) return;
        try {
            await api.request(`/users/${id}`, { method: "DELETE" });
            await loadUsers();
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }

    return (
        <div className="manage-users">
            <h3>Quản lý người dùng</h3>
            <div className="add-user-form">
                <h4>{editing ? "Sửa người dùng" : "Thêm người dùng mới"}</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label>Email:</label>
                        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Họ tên:</label>
                        <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại:</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Vai trò:</label>
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="renter">Người thuê</option>
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Quản trị</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group checkbox">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                        id="is_active"
                    />
                    <label htmlFor="is_active">Kích hoạt</label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="submit-btn" onClick={saveUser}>{editing ? "Cập nhật" : "Tạo mới"}</button>
                    {editing && <button className="cancel-btn" onClick={startCreate}>Hủy</button>}
                </div>
            </div>
            <hr />
            <h4>Danh sách người dùng</h4>
            <div className="users-list">
                {users.map(u => (
                    <div key={u.user_id} className="user-card">
                        <h4>{u.full_name}</h4>
                        <p><strong>Email:</strong> {u.email}</p>
                        <p><strong>Điện thoại:</strong> {u.phone}</p>
                        <span className={`user-role ${u.role}`}>{u.role}</span>
                        <span className={`user-status ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? 'Kích hoạt' : 'Vô hiệu'}
                        </span>
                        <div className="user-card-actions">
                            <button className="edit-btn" onClick={() => startEdit(u)}>Sửa</button>
                            <button className="delete-btn" onClick={() => removeUser(u.user_id)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
