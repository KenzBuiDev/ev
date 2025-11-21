import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function ProtectedRoute({ children, adminOnly = false, staffOnly = false }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
    if (staffOnly && user.role !== "staff" && user.role !== "admin") return <Navigate to="/" replace />;

    return children;
}
