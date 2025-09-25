// src/pages/ApplyForm.jsx
import React, { useState } from "react";
import API from "../api";

function ApplyForm() {
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("company_name", companyName);
    formData.append("position", position);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    if (file) {
      formData.append("file", file); // ✅ must match upload.single("file")
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post("/applications", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(`✅ Application submitted! ID: ${res.data.id}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit application");
    }
  }

  return (
    <div style={styles.container}>
      <h2>📝 Internship Application Form</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          style={styles.input}
        />
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          style={styles.input}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          style={styles.input}
        />
        <label>Upload Offer Letter (PDF/Image):</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])} // ✅ only 1 file
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Submit Application
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: "500px", margin: "auto", padding: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", fontSize: "14px" },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ApplyForm;
