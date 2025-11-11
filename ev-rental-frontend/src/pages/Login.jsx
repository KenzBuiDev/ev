import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        navigate("/"); // redirect luôn, không hiển thị lỗi
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}
        >
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ display: "block", width: "100%", marginBottom: 12, padding: 8 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ display: "block", width: "100%", marginBottom: 12, padding: 8 }}
            />

            <button type="submit" style={{ padding: "8px 16px" }}>Login</button>
        </form>
    );
}
