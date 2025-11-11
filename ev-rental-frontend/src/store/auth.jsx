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

        // backend trả { user, token }
        if (res && res.user && res.token) {
            setUser(res.user);
            setToken(res.token);
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.setItem("token", res.token);
            return true;
        }

        return false;
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
