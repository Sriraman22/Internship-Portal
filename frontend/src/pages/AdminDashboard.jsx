import React, { useEffect, useState } from "react";
import API from "../api";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/applications/admin", {
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

  if (loading) return <p>⏳ Loading applications...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>👨‍💼 Admin Dashboard</h2>
      <table border="1" cellPadding="6" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Offer Letter</th>
            <th>OD Letter</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.student_id}</td>
              <td>{app.company_name}</td>
              <td>{app.position}</td>
              <td>{new Date(app.start_date).toLocaleDateString()}</td>
              <td>{new Date(app.end_date).toLocaleDateString()}</td>
              <td>
                {app.blob_url ? (
                  <a href={app.blob_url} target="_blank" rel="noreferrer">
                    {app.file_name}
                  </a>
                ) : (
                  "No Document"
                )}
              </td>
              <td>
                {app.od_letter_url ? (
                  <a href={app.od_letter_url} target="_blank" rel="noreferrer">
                    📄 View OD Letter
                  </a>
                ) : (
                  "Not Generated"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
