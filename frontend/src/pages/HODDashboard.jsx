// src/pages/HODDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

function HODDashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await API.get("/applications/hod", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApps(res.data);
      } catch (err) {
        console.error("Failed to load HOD apps", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleDecision(id, decision) {
    try {
      await API.put(`/applications/${id}/approve`, { decision }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApps(prev => prev.map(a => a.id === id ? { ...a, hod_status: decision } : a));
    } catch (err) {
      console.error("HOD approve/reject error", err);
    }
  }

  async function handleGenerateOD(id) {
    try {
      // prefer POST (side-effect)
      const res = await API.post(`/applications/${id}/od-letter`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = res.data.url;
      setApps(prev => prev.map(a => a.id === id ? { ...a, od_letter_url: url } : a));
      alert("OD generated ✅");
    } catch (err) {
      console.error("Generate OD failed", err);
      alert("Failed to generate OD. See console for details.");
    }
  }

  if (loading) return <p>⏳ Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🏫 HOD Dashboard</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Position</th>
            <th>Coordinator Status</th>
            <th>HOD Status</th>
            <th>Decision</th>
            <th>OD Letter</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{app.student_id}</td>
              <td>{app.company_name}</td>
              <td>{app.position}</td>
              <td>{app.coordinator_status || "Pending"}</td>
              <td>{app.hod_status || "Pending"}</td>
              <td>
                {app.hod_status ? (
                  app.hod_status
                ) : (
                  <>
                    <button onClick={() => handleDecision(app.id, "approved")} style={btnStyle.approve}>✅ Approve</button>
                    <button onClick={() => handleDecision(app.id, "rejected")} style={btnStyle.reject}>❌ Reject</button>
                  </>
                )}
              </td>
              <td>
                {app.od_letter_url ? (
                  <a href={app.od_letter_url} target="_blank" rel="noreferrer">📄 View OD</a>
                ) : (
                  (app.hod_status === "approved") ? (
                    <button onClick={() => handleGenerateOD(app.id)} style={btnStyle.generate}>📄 Generate OD</button>
                  ) : (
                    "—"
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btnStyle = {
  approve: { background: "green", color: "#fff", padding: "6px 8px", border: "none", marginRight: 6, borderRadius: 4, cursor: "pointer" },
  reject: { background: "red", color: "#fff", padding: "6px 8px", border: "none", borderRadius: 4, cursor: "pointer" },
  generate: { background: "#0d6efd", color: "#fff", padding: "6px 8px", border: "none", borderRadius: 4, cursor: "pointer" }
};

export default HODDashboard;
