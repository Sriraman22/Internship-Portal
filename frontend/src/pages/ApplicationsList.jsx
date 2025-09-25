// src/pages/ApplicationsList.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

const ApplicationsList = ({ onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  if (loading) return <p>⏳ Loading applications...</p>;

  return (
    <div className="list-container">
      <h2>📑 My Internship Applications</h2>
      <button className="back-button" onClick={onBack}>⬅ Back</button>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table className="apps-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Applied On</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.company_name}</td>
                <td>{app.position}</td>
                <td>{app.status || "Pending"}</td>
                <td>{new Date(app.applied_on).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApplicationsList;
