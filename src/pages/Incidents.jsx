import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import logo from "../assests/logo.png";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // FETCH INCIDENTS
  // =========================
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/incidents");

      setIncidents(res.data || []);
    } catch (err) {
      console.error("FETCH INCIDENTS ERROR:", err);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // =========================
  // FILE CHANGE
  // =========================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
  };

  // =========================
  // CREATE INCIDENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (!title.trim()) {
        alert("Title required");
        return;
      }

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (file) {
        formData.append("attachment", file);
      }

      const res = await api.post(
        "/incidents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIncidents((prev) => [res.data, ...prev]);

      setTitle("");
      setDescription("");
      setFile(null);

      setSuccess("Incident created");

    } catch (err) {
      console.error("CREATE INCIDENT ERROR:", err);

      setError(
        err.response?.data?.message ||
        "Failed to create incident"
      );
    }
  };

  // =========================
  // DELETE INCIDENT
  // =========================
  const handleDelete = async (id) => {
    try {

      await api.delete(`/incidents/${id}`);

      setIncidents((prev) =>
        prev.filter((i) => i.id !== id)
      );

    } catch (err) {
      console.error("DELETE INCIDENT ERROR:", err);

      setError("Failed to delete incident");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">

      <div className="form-card">

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <img
            src={logo}
            alt="CherAI Logo"
            style={{
              width: "175px",
              height: "175px",
              objectFit: "contain",
            }}
          />

          <h1 className="form-title" style={{ margin: 0 }}>
            Incidents
          </h1>
        </div>

        <p
          style={{
            color: "#aaa",
            marginBottom: "25px",
          }}
        >
          Report and track compliance incidents
        </p>

        {loading && (
          <p style={{ color: "white" }}>
            Loading...
          </p>
        )}

        {error && (
          <p style={{ color: "#ff8fab" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "#4ade80" }}>
            {success}
          </p>
        )}

        {/* =========================
            CREATE INCIDENT
        ========================= */}
        <form onSubmit={handleSubmit}>

          <div
            className="page-card"
            style={{ marginBottom: "20px" }}
          >

            <h3>Create Incident</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "15px",
              }}
            >

              <input
                className="form-input"
                placeholder="Incident Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <textarea
                className="form-textarea"
                placeholder="Description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <input
                className="form-input"
                type="file"
                onChange={handleFileChange}
              />

              <button
                className="form-btn"
                type="submit"
              >
                Create Incident
              </button>

            </div>

          </div>

        </form>

        {/* =========================
            INCIDENT LIST
        ========================= */}
        {incidents.length === 0 ? (

          <p style={{ color: "#ccc" }}>
            No incidents found
          </p>

        ) : (

          incidents.map((i) => (

            <div
              key={i.id}
              className="page-card"
              style={{ marginBottom: "15px" }}
            >

              <h3>{i.title}</h3>

              <p style={{ color: "#ccc" }}>
                {i.description}
              </p>

              {i.file_url && (
                <a
                  href={`https://cherai-kosc.onrender.com${i.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#ff8fab",
                  }}
                >
                  View Attachment
                </a>
              )}

              <div style={{ marginTop: "15px" }}>
                <button
                  className="logout-btn"
                  onClick={() => handleDelete(i.id)}
                >
                  Delete
                </button>
              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
};

export default Incidents;