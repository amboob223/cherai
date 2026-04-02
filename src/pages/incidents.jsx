// src/pages/Incidents.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [file, setFile] = useState(null); // ✅ INSIDE component

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low",
  });

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/incidents");
      setIncidents(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Submit with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("severity", form.severity);

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.post("http://localhost:5000/api/incidents", formData);

      // Reset form
      setForm({ title: "", description: "", severity: "low" });
      setFile(null);

      fetchIncidents();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Incidents</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {/* ✅ FILE INPUT (correct place) */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">Create</button>
      </form>

      {/* INCIDENT LIST */}
      <ul>
        {incidents.map((i) => (
          <li key={i.id}>
            {i.title} - {i.severity} - {i.status || "pending"}{" "}
            
            {/* ✅ FILE LINK */}
            {i.file ? (
              <a
                href={`http://localhost:5000/uploads/${i.file}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: "10px" }}
              >
                View File
              </a>
            ) : (
              " (No file)"
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Incidents;