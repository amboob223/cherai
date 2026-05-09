import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH INCIDENTS
  // =========================
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);

      // FIX: avoid double "/api" if baseURL already includes it
      const res = await api.get("/incidents");

      setIncidents(res.data || []);
      setError("");
    } catch (err) {
      console.error("Fetch incidents error:", err);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // =========================
  // FILE VALIDATION
  // =========================
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

    if (!allowedTypes.includes(selected.type)) {
      alert("Invalid file type");
      return;
    }

    setFile(selected);
  };

  // =========================
  // CREATE INCIDENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title and description required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      if (file) {
        formData.append("attachment", file);
      }

      await api.post("/incidents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setDescription("");
      setFile(null);

      fetchIncidents();
    } catch (err) {
      console.error("Create incident error:", err);
      alert("Failed to create incident");
    }
  };

  // =========================
  // DELETE INCIDENT
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this incident?")) return;

    try {
      await api.delete(`/incidents/${id}`);

      setIncidents((prev) =>
        prev.filter(
          (incident) =>
            (incident.id || incident._id) !== id
        )
      );
    } catch (err) {
      console.error("Delete incident error:", err);
      alert("Delete failed");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">
      <div className="form-card">
        <h1 className="form-title">Incident Reports</h1>

        {error && <p style={{ color: "#ff8fab" }}>{error}</p>}
        {loading && <p style={{ color: "white" }}>Loading...</p>}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Incident Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          <div className="form-group">
            <label>Attachment</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-input"
            />
          </div>

          <button type="submit" className="form-btn">
            Create Incident
          </button>
        </form>

        <hr style={{ margin: "30px 0", borderColor: "rgba(255,255,255,0.1)" }} />

        {/* LIST */}
        <div>
          {incidents.length === 0 ? (
            <p>No incidents found.</p>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id || incident._id} className="page-card">
                <h3>{incident.title}</h3>
                <p>{incident.description}</p>

                {incident.attachment && (
                  <a
                    href={`http://localhost:5000/uploads/${incident.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#ff8fab" }}
                  >
                    View Attachment
                  </a>
                )}

                <br />
                <br />

                <button
                  onClick={() =>
                    handleDelete(incident.id || incident._id)
                  }
                  className="logout-btn"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;