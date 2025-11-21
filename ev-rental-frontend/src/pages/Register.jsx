// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/fetchClient";
import '../styles/Register.css';

export default function Register() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        role: "renter",
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: "" });
        }
    }

    /**
     * Validate form before submission
     * - Email: Must be @gmail.com format
     * - Phone: Must be exactly 10 digits
     * - Password: At least 6 characters
     * - Full name: Not empty
     */
    function validateForm() {
        const errors = {};

        // Email validation
        if (!form.email) {
            errors.email = "Email là bắt buộc";
        } else if (!form.email.endsWith("@gmail.com")) {
            errors.email = "Email phải có dạng @gmail.com (ví dụ: username@gmail.com)";
        }

        // Password validation
        if (!form.password) {
            errors.password = "Mật khẩu là bắt buộc";
        } else if (form.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        // Full name validation
        if (!form.full_name) {
            errors.full_name = "Họ tên là bắt buộc";
        }

        // Phone validation
        if (form.phone) {
            const phoneDigits = form.phone.replace(/\D/g, ""); // Remove non-digits
            if (phoneDigits.length !== 10) {
                errors.phone = "Số điện thoại phải có đúng 10 chữ số";
            }
        } else {
            errors.phone = "Số điện thoại là bắt buộc";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const res = await api.request("/auth/register", {
                method: "POST",
                body: JSON.stringify(form),
            });
            if (res.success) {
                alert("Đăng ký thành công!");
                nav("/login");
            } else {
                // Handle specific error messages from backend
                setError(res.message || "Đăng ký thất bại");

                // If email already exists, highlight the email field
                if (res.message && res.message.includes("Email")) {
                    setFieldErrors({ ...fieldErrors, email: res.message });
                }
            }
        } catch (err) {
            setError(err.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Đăng ký tài khoản</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Nhập email @gmail.com (ví dụ: username@gmail.com)"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className={fieldErrors.email ? "input-error" : ""}
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className={fieldErrors.password ? "input-error" : ""}
                        />
                        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label>Họ tên:</label>
                        <input
                            name="full_name"
                            type="text"
                            placeholder="Nhập họ tên đầy đủ"
                            value={form.full_name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className={fieldErrors.full_name ? "input-error" : ""}
                        />
                        {fieldErrors.full_name && <span className="field-error">{fieldErrors.full_name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại:</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Nhập 10 chữ số"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={loading}
                            className={fieldErrors.phone ? "input-error" : ""}
                        />
                        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                    </div>

                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                </form>
                <div className="register-footer">
                    <span>Bạn đã có tài khoản? </span>
                    <a href="/login">Đăng nhập ngay</a>
                </div>
            </div>
        </div>
    );
}
