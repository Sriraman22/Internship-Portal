// src/pages/Dashboard.jsx
import React, { useState } from "react";
import ApplyForm from "./ApplyForm";
import ApplicationsList from "./ApplicationsList";

const Dashboard = () => {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const [view, setView] = useState("menu");

  if (role === "student") {
    if (view === "apply") return <ApplyForm onBack={() => setView("menu")} />;
    if (view === "review") return <ApplicationsList onBack={() => setView("menu")} />;

    return (
      <div className="dashboard-container">
        <h1>🎓 Student Dashboard</h1>
        <p>Welcome! What would you like to do today?</p>
        <div className="dashboard-buttons">
          <button onClick={() => setView("review")}>📑 Review Applications</button>
          <button onClick={() => setView("apply")}>📝 Apply for Internship</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome {role.toUpperCase()} 🚀</h1>
      <p>Your role dashboard will be here soon.</p>
    </div>
  );
};

export default Dashboard;
