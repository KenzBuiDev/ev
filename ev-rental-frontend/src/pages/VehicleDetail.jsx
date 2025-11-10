import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/fetchClient";
import { useAuth } from "../store/auth";

export default function VehicleDetail() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const nav = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        api.request(`/vehicles/${id}`)
            .then(setVehicle)
            .catch(console.error);
    }, [id]);

    async function onRent() {
        if (!user) return nav("/login");

        if (user.role !== "renter") {
            alert("Chỉ người dùng renter mới được thuê xe");
            return;
        }

        try {
            const rental = await api.request("/rentals/renter", {
                method: "POST",
                body: JSON.stringify({ vehicle_id: id })
            });

            // điều hướng sang trang checkout với rental data
            nav("/checkout", { state: { rental } });
        } catch (e) {
            alert("Rent failed: " + (e.message || e));
        }
    }

    if (!vehicle) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: 800 }}>
            <h2>{vehicle.name}</h2>
            <img
                src={vehicle.image_url}
                alt={vehicle.name}
                style={{ width: "100%", maxHeight: 420, objectFit: "cover" }}
            />
            <p>Type: {vehicle.type}</p>
            <p>Price per hour: {vehicle.price_per_hour}</p>
            <p>Status: {vehicle.status}</p>
            <button
                onClick={onRent}
                disabled={vehicle.status !== "Available"}
            >
                Rent this vehicle
            </button>
        </div>
    );
}
