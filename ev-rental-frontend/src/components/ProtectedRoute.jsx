import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Bảo vệ các route (trang) để chỉ cho phép user đã đăng nhập truy cập
 * Có thể giới hạn quyền truy cập dựa trên role của user
 * 
 * CÁCH DÙNG:
 * 1. Route bình thường (chỉ cần đăng nhập):
 *    <ProtectedRoute><Profile /></ProtectedRoute>
 * 
 * 2. Route chỉ admin:
 *    <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
 * 
 * 3. Route chỉ staff hoặc admin:
 *    <ProtectedRoute staffOnly><ManageRentals /></ProtectedRoute>
 */

export default function ProtectedRoute({ children, adminOnly = false, staffOnly = false }) {
    // Lấy thông tin user từ AuthContext (auth.jsx)
    // user sẽ null nếu chưa đăng nhập, hoặc có: { user_id, email, role, full_name }
    const { user } = useAuth();

    // BƯỚC 1: Kiểm tra user có đăng nhập không
    // - Nếu chưa đăng nhập (user === null) → Redirect đến /login
    // replace: true = không tạo history entry (user không thể quay lại)
    if (!user) return <Navigate to="/login" replace />;

    // BƯỚC 2: Kiểm tra quyền admin
    // - Nếu route yêu cầu adminOnly=true nhưng user không phải admin
    // - Redirect về trang chủ "/" (hoặc trang không được phép truy cập)
    // Ví dụ: /admin/dashboard chỉ cho admin
    if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

    // BƯỚC 3: Kiểm tra quyền staff hoặc admin
    // - Nếu route yêu cầu staffOnly=true
    // - Nhưng user không phải staff cũng không phải admin → Redirect về "/"
    // Ví dụ: /staff/manage-rentals cho phép staff hoặc admin
    if (staffOnly && user.role !== "staff" && user.role !== "admin") return <Navigate to="/" replace />;

    // BƯỚC 4: Nếu vượt qua tất cả kiểm tra → Cho phép xem trang (render children)
    // children = component được truyền vào, ví dụ <Profile />
    return children;
}
