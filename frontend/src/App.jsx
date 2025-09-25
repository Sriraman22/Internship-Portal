import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import HODDashboard from "./pages/HODDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ApplyForm from "./pages/ApplyForm";

function App() {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase(); // ✅ normalize case

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {token && role === "student" && (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply" element={<ApplyForm />} />
        </>
      )}
      {token && role === "coordinator" && (
        <Route path="/dashboard" element={<CoordinatorDashboard />} />
      )}
      {token && role === "hod" && (
        <Route path="/dashboard" element={<HODDashboard />} />
      )}
      {token && role === "admin" && (
        <Route path="/dashboard" element={<AdminDashboard />} />
      )}
      {/* Default redirect */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
