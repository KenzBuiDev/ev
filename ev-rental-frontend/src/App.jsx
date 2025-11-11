import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VehicleDetail from "./pages/VehicleDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageVehicles from "./pages/admin/ManageVehicles";
import ManageRentals from "./pages/admin/ManageRentals";
import ManageReports from "./pages/admin/ManageReports";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import PaymentReturn from "./pages/PaymentReturn";


// Layout chung cho tất cả trang
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: "16px" }}>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Trang login không cần layout */}
      <Route path="/login" element={<Login />} />

      {/* Các trang bình thường có layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout><Checkout /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/return"
        element={<Layout><PaymentReturn /></Layout>}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <ManageVehicles />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rentals"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <ManageRentals />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <ManageReports />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
