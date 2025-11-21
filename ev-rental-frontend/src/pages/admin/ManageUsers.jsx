import React, { useEffect, useState } from "react";
import api from "../../api/fetchClient";
import '../../styles/ManageUsers.css';

/**
 * ManageUsers Component - Quản lý người dùng trong hệ thống
 * Cho phép admin tạo, sửa, xóa và xem danh sách người dùng
 */
export default function ManageUsers() {
    // State: Danh sách tất cả người dùng từ API
    const [users, setUsers] = useState([]);

    // State: Người dùng đang được chỉnh sửa (null nếu tạo mới)
    const [editing, setEditing] = useState(null);

    // State: Dữ liệu form cho việc tạo/sửa người dùng
    const [form, setForm] = useState({
        email: "",
        full_name: "",
        phone: "",
        role: "renter",
        password: "",
        is_active: true
    });

    /**
     * Hàm loadUsers - Tải danh sách người dùng từ API
     * Gọi endpoint GET /users để lấy danh sách tất cả người dùng
     */
    async function loadUsers() {
        try {
            const data = await api.request("/users");
            setUsers(data || []);
        } catch (e) {
            alert("Load users failed: " + e.message);
        }
    }

    // useEffect Hook: Tải danh sách người dùng khi component mount lần đầu
    useEffect(() => { loadUsers(); }, []);

    /**
     * Hàm startCreate - Khởi tạo form để tạo người dùng mới
     * Reset trạng thái editing và xóa dữ liệu form
     */
    function startCreate() {
        setEditing(null);
        setForm({ email: "", full_name: "", phone: "", role: "renter", password: "", is_active: true });
    }

    /**
     * Hàm startEdit - Khởi tạo form để sửa người dùng hiện có
     * @param {Object} user - Dữ liệu người dùng cần sửa
     * Lưu người dùng đang sửa và điền dữ liệu vào form (không điền password)
     */
    function startEdit(user) {
        setEditing(user);
        setForm({ ...user, password: "" });
    }

    /**
     * Hàm saveUser - Lưu người dùng (tạo mới hoặc cập nhật)
     * Nếu editing có giá trị: gọi PUT để cập nhật
     * Nếu editing là null: gọi POST để tạo người dùng mới
     * Sau khi lưu thành công, reload danh sách và đóng form
     */
    async function saveUser() {
        try {
            if (editing) {
                // Cập nhật người dùng hiện có (PUT request)
                await api.request(`/users/${editing.user_id}`, {
                    method: "PUT",
                    body: JSON.stringify(form)
                });
            } else {
                // Tạo người dùng mới (POST request)
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

    /**
     * Hàm removeUser - Xóa người dùng
     * @param {string} id - ID của người dùng cần xóa
     * Yêu cầu xác nhận trước khi xóa, gọi DELETE endpoint
     */
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

            {/* FORM SECTION: Tạo hoặc sửa người dùng */}
            <div className="add-user-form">
                <h4>{editing ? "Sửa người dùng" : "Thêm người dùng mới"}</h4>

                {/* Hàng 1: Email và Họ tên */}
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

                {/* Hàng 2: Số điện thoại và Vai trò */}
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

                {/* Input Mật khẩu */}
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>

                {/* Checkbox Kích hoạt */}
                <div className="form-group checkbox">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                        id="is_active"
                    />
                    <label htmlFor="is_active">Kích hoạt</label>
                </div>

                {/* Nút action: Lưu/Cập nhật và Hủy */}
                <div className="form-actions">
                    <button className="submit-btn" onClick={saveUser}>{editing ? "Cập nhật" : "Tạo mới"}</button>
                    {editing && <button className="cancel-btn" onClick={startCreate}>Hủy</button>}
                </div>
            </div>

            <hr />

            {/* LIST SECTION: Hiển thị danh sách người dùng */}
            <h4>Danh sách người dùng</h4>
            <div className="users-list">
                {/* Lặp qua từng người dùng và hiển thị card */}
                {users.map(u => (
                    <div key={u.user_id} className="user-card">
                        <h4>{u.full_name}</h4>
                        <p><strong>Email:</strong> {u.email}</p>
                        <p><strong>Điện thoại:</strong> {u.phone}</p>
                        {/* Badge hiển thị vai trò */}
                        <span className={`user-role ${u.role}`}>{u.role}</span>
                        {/* Badge hiển thị trạng thái kích hoạt */}
                        <span className={`user-status ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? 'Kích hoạt' : 'Vô hiệu'}
                        </span>
                        {/* Nút sửa và xóa */}
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
