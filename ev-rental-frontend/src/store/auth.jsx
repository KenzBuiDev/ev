import React, { createContext, useContext, useState } from "react";
import api from "../api/fetchClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const login = async (email, password) => {
        const res = await api.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // backend trả: { ok: true, data: { user, token } } hoặc { success: false, message: "..." }
        const data = res.data || res;

        // Check if login failed
        if (!data?.success || !data?.user || !data?.token) {
            const errorMsg = data?.message || "Sai email hoặc mật khẩu";
            throw new Error(errorMsg);
        }

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        return data;
    };
    const logout = async () => {
        await api.request("/auth/logout", { method: "POST" }).catch(() => { });
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}