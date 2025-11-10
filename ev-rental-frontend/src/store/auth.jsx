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

        // backend trả: { ok: true, data: { user, token } }
        const data = res.data;
        if (!data || !data.user || !data.token) throw new Error("Login failed");

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
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
