import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import '../styles/Login.css';

/**
 * Login Component - Trang đăng nhập
 * 
 * CHỨC NĂNG:
 * - User nhập email và password
 * - Click nút Login → gửi API đăng nhập
 * - Nếu thành công → navigate đến Home page
 * - Nếu thất bại → hiển thị lỗi
 * - Có link để chuyển sang trang Đăng ký
 */
export default function Login() {
    // State: Email user nhập
    const [email, setEmail] = useState("");

    // State: Password user nhập
    const [password, setPassword] = useState("");

    // State: Lỗi đăng nhập (nếu email/password sai)
    const [error, setError] = useState("");

    // State: Trạng thái loading khi đang gửi API
    const [loading, setLoading] = useState(false);

    // Lấy function login từ Auth context
    const { login } = useAuth();

    // Hook điều hướng (dùng để chuyển trang)
    const navigate = useNavigate();

    /**
     * Hàm handleSubmit - Xử lý sự kiện submit form
     * 
     * Quy trình:
     * 1. Ngăn chặn hành động mặc định của form (reload trang)
     * 2. Xóa lỗi cũ (nếu có)
     * 3. Bắt đầu loading
     * 4. Gửi API login với email và password
     * 5. Nếu thành công → lưu token và redirect đến /
     * 6. Nếu thất bại → hiển thị lỗi và dừng loading
     */
    const handleSubmit = async (e) => {
        // Ngăn chặn reload trang khi submit form
        e.preventDefault();

        // Xóa thông báo lỗi cũ
        setError("");

        // Bắt đầu trạng thái loading
        setLoading(true);

        try {
            // Gửi hàm login từ Auth context với email và password
            // Hàm này sẽ gửi API /auth/login để xác thực
            await login(email, password);

            // Nếu login thành công → redirect đến Home page
            navigate("/");
        } catch (err) {
            // Nếu login thất bại → hiển thị thông báo lỗi
            // err.message từ server hoặc mặc định "Sai email hoặc mật khẩu"
            setError(err.message || "Sai email hoặc mật khẩu");

            // Dừng loading state
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>

                {/* Hiển thị lỗi nếu có (email/password sai hoặc lỗi server) */}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {/* INPUT EMAIL */}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* INPUT PASSWORD */}
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* NÚT SUBMIT */}
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Login"}
                    </button>
                </form>
                {/* LINK CHUYỂN SANG TRANG ĐĂNG KÝ */}
                <div className="login-footer">
                    <span>Bạn chưa có tài khoản? </span>
                    <a href="/register">Đăng ký ngay</a>
                </div>
            </div>
        </div>
    );
}
