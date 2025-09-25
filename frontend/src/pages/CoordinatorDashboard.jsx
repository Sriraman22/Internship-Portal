import React, { useEffect, useState } from "react";
import API from "../api";

function CoordinatorDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all applications on mount
  useEffect(() => {
    async function fetchApps() {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch apps", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  // Approve / Reject handler
  async function handleDecision(id, decision) {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/applications/${id}/approve`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, coordinator_status: decision } : app
        )
      );
    } catch (err) {
      console.error("❌ Approval error", err);
    }
  }

  if (loading) return <p>⏳ Loading applications...</p>;

  return (
    <div style={styles.container}>
      <h2>📑 Coordinator Dashboard</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Position</th>
            <th>Offer Letter</th>
            <th>Coordinator Status</th>
            <th>HOD Status</th>
            <th>Admin Status</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.student_id}</td>
              <td>{app.company_name}</td>
              <td>{app.position}</td>
              <td>
                {app.blob_url ? (
                  <a
                    href={app.blob_url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    {app.file_name || "📄 View Document"}
                  </a>
                ) : (
                  "No Document"
                )}
              </td>
              <td>{app.coordinator_status || "Pending"}</td>
              <td>{app.hod_status || "Pending"}</td>
              <td>{app.admin_status || "Pending"}</td>
              <td>
                {app.coordinator_status ? (
                  <span>{app.coordinator_status}</span>
                ) : (
                  <>
                    <button
                      style={styles.approveBtn}
                      onClick={() => handleDecision(app.id, "approved")}
                    >
                      ✅ Approve
                    </button>
                    <button
                      style={styles.rejectBtn}
                      onClick={() => handleDecision(app.id, "rejected")}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ Styles
const styles = {
  container: { padding: "20px" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    border: "1px solid #ddd",
  },
  link: {
    color: "#007bff",
    textDecoration: "underline",
  },
  approveBtn: {
    background: "green",
    color: "white",
    border: "none",
    padding: "6px 10px",
    marginRight: "5px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  rejectBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default CoordinatorDashboard;
