import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/incidents";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // FETCH INCIDENTS
  // =========================
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchIncidents();
  }, [fetchIncidents, token]);

  // =========================
  // FILE VALIDATION (SECURITY)
  // =========================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    // 🔐 Restrict file size (5MB)
    if (selected.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)");
      return;
    }

    // 🔐 Restrict file types
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selected.type)) {
      alert("Invalid file type");
      return;
    }

    setFile(selected);
  };

  // =========================
  // DELETE INCIDENT
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this incident?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIncidents((prev) => prev.filter((i) => i.id !== id)); // 🔥 instant UI update
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // =========================
  // CREATE INCIDENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (file) formData.append("attachment", file);

    try {
      await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset
      setTitle("");
      setDescription("");
      setFile(null);

      fetchIncidents();
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Incidents</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {/* =========================
          CREATE FORM
      ========================= */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255} // 🔐 prevent abuse
          required
        />
        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000} // 🔐 prevent abuse
          required
        />
        <br /><br />

        <input type="file" onChange={handleFileChange} />
        <br /><br />

        <button type="submit">Create Incident</button>
      </form>

      <hr />

      {/* =========================
          INCIDENT LIST
      ========================= */}
      <ul>
        {incidents.map((incident) => (
          <li key={incident.id} style={{ marginBottom: "15px" }}>
            <strong>{incident.title}</strong>
            <p>{incident.description}</p>

            {incident.attachment && (
              <a
                href={`http://localhost:5000/uploads/${incident.attachment}`}
                target="_blank"
                rel="noopener noreferrer" // 🔐 security fix
              >
                View Attachment
              </a>
            )}

            <br />

            <button onClick={() => handleDelete(incident.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Incidents;