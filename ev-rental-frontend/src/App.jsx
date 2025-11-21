import ManageUsers from "./pages/admin/ManageUsers";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageVehicles from "./pages/admin/ManageVehicles";
import ManageRentals from "./pages/admin/ManageRentals";
import ManageReports from "./pages/admin/ManageReports";
import Profile from "./pages/Profile";
import Debug from "./pages/Debug";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VehicleDetail from "./pages/VehicleDetail";
import Checkout from "./pages/Checkout";
import PaymentReturn from "./pages/PaymentReturn";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";


// Layout chung cho tất cả trang
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ width: '100%', height: '100%', margin: 0, padding: 0, minHeight: 'calc(100vh - 56px)' }}>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <Routes>

      {/* Trang đăng ký không cần layout */}
      <Route path="/register" element={<Register />} />
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
        path="/debug"
        element={<Layout><Debug /></Layout>}
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
          <ProtectedRoute staffOnly>
            <Layout>
              <ManageVehicles />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rentals"
        element={
          <ProtectedRoute staffOnly>
            <Layout>
              <ManageRentals />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute staffOnly>
            <Layout>
              <ManageReports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <ManageUsers />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
