import React, { createContext, useContext, useState } from "react";
import api from "../api/fetchClient";

/**
 * AUTH STORE - Quản lý trạng thái đăng nhập (authentication)
 * 
 * Sử dụng React Context API để lưu trữ:
 * - user: Thông tin user đăng nhập (email, role, user_id, ...)
 * - token: JWT token dùng để authenticate API requests
 * 
 * Chức năng:
 * - login(email, password): Đăng nhập user
 * - logout(): Đăng xuất user
 * - useAuth(): Hook để dùng auth context ở các component
 */

// Tạo Auth context - dùng để share auth state toàn ứng dụng
const AuthContext = createContext(null);

/**
 * AuthProvider Component - Provider cho Auth Context
 * 
 * Chứa logic đăng nhập/đăng xuất và lưu trữ state authentication
 * Wrap component App để tất cả components con có thể access auth state
 * 
 * @param {React.ReactNode} children - Components được wrap bởi provider
 */
export function AuthProvider({ children }) {
    /**
     * State user - Thông tin user đăng nhập
     * 
     * Cấu trúc:
     * {
     *   user_id: "u001",
     *   email: "user@example.com",
     *   full_name: "John Doe",
     *   role: "renter" | "staff" | "admin",
     *   phone: "0123456789",
     *   is_active: true
     * }
     * 
     * Khởi tạo từ localStorage để user không mất session khi refresh
     */
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    /**
     * State token - JWT token từ server
     * 
     * Token này được gửi trong header "Authorization: Bearer <token>"
     * để authenticate các API requests
     * 
     * Khởi tạo từ localStorage để duy trì session
     */
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    /**
     * Hàm login - Xác thực user với email và password
     * 
     * Quy trình:
     * 1. Gửi POST /auth/login với email và password
     * 2. Server xác thực và trả về { user, token }
     * 3. Lưu user và token vào state
     * 4. Lưu vào localStorage để duy trì session
     * 5. Trả về data hoặc throw error nếu thất bại
     * 
     * @param {string} email - Email của user
     * @param {string} password - Password của user
     * @returns {object} Data từ server { user, token }
     * @throws {Error} Nếu login thất bại (sai email/password)
     */
    const login = async (email, password) => {
        // Gửi POST request đến /auth/login
        const res = await api.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // Backend trả về: { data: { user, token } } hoặc { success, message }
        // Lấy data từ response (ưu tiên res.data nếu có, fallback res)
        const data = res.data || res;

        // Validate response - kiểm tra xem login thành công không
        // Phải có cả success=true, user object, và token
        if (!data?.success || !data?.user || !data?.token) {
            // Nếu validate thất bại → lấy error message từ server hoặc dùng default
            const errorMsg = data?.message || "Sai email hoặc mật khẩu";
            throw new Error(errorMsg);
        }

        // Login thành công → cập nhật state user
        setUser(data.user);

        // Cập nhật state token
        setToken(data.token);

        // Lưu user vào localStorage (JSON format)
        // Để khi user refresh trang, state vẫn được restore
        localStorage.setItem("user", JSON.stringify(data.user));

        // Lưu token vào localStorage
        // Token sẽ được dùng trong fetchClient để attach vào header Authorization
        localStorage.setItem("token", data.token);

        // Trả về data để caller có thể xử lý (navigate, show success message, ...)
        return data;
    };
    /**
     * Hàm logout - Đăng xuất user
     * 
     * Quy trình:
     * 1. Gửi POST /auth/logout đến server (để invalidate token)
     * 2. Xóa user khỏi state
     * 3. Xóa token khỏi state
     * 4. Xóa user và token khỏi localStorage
     * 
     * Note: .catch(() => {}) dùng để ignore lỗi từ logout API
     * (nếu server error, logout vẫn hoàn thành ở client)
     */
    const logout = async () => {
        // Gửi POST /auth/logout đến server invalidate token
        // Nếu có lỗi, cứ tiếp tục (ignore error)
        await api.request("/auth/logout", { method: "POST" }).catch(() => { });

        // Reset user state
        setUser(null);

        // Reset token state
        setToken(null);

        // Xóa user khỏi localStorage
        localStorage.removeItem("user");

        // Xóa token khỏi localStorage
        localStorage.removeItem("token");
    };

    // Trả về Auth Provider
    // Tất cả components con sẽ có thể access { user, token, login, logout }
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook useAuth - Dùng để access auth state ở các components
 * 
 * Cách dùng:
 * const { user, token, login, logout } = useAuth();
 * 
 * Trả về:
 * {
 *   user: User object | null,
 *   token: JWT token | null,
 *   login: async (email, password) => data,
 *   logout: async () => void
 * }
 * 
 * Lưu ý: Phải được dùng trong component được wrap bởi <AuthProvider>
 */
export function useAuth() {
    // Lấy context value từ AuthContext
    // Phải được dùng trong component được wrap bởi <AuthProvider>
    return useContext(AuthContext);
}