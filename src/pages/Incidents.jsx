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

  // =========================
  // FETCH
  // =========================
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/incidents");
      setIncidents(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // =========================
  // FILE
  // =========================
  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  // =========================
  // CREATE INCIDENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (file) {
        formData.append("attachment", file);
      }

      const res = await api.post("/incidents", formData);

      setIncidents([res.data, ...incidents]);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Create incident error:", err);
      alert("Failed to create incident");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    await api.delete(`/incidents/${id}`);
    setIncidents(incidents.filter((i) => i.id !== id));
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">
      <div className="form-card">

        <div style={{ display: "flex", gap: 10 }}>
          <img src={logo} style={{ width: 40 }} />
          <h1>Incidents</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input type="file" onChange={handleFileChange} />

          <button>Create</button>
        </form>

        {incidents.map((i) => (
          <div key={i.id}>
            <h3>{i.title}</h3>
            <p>{i.description}</p>

            {i.file_url && (
              <a href={`https://cherai-kosc.onrender.com${i.file_url}`}>
                View File
              </a>
            )}

            <button onClick={() => handleDelete(i.id)}>
              Delete
            </button>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Incidents;