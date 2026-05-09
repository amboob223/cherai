import React, { useState, useEffect } from "react";
import api from "../api/api";

const Policies = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [policies, setPolicies] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH POLICIES
  // =========================
  const fetchPolicies = async (query = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/policies", {
        params: { search: query.trim() },
      });

      setPolicies(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // =========================
  // CREATE POLICY
  // =========================
  const createPolicy = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/policies", {
        title,
        description,
      });

      setTitle("");
      setDescription("");

      fetchPolicies(search);
    } catch (err) {
      console.error(err);
      setError("Failed to create policy.");
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // DELETE POLICY
  // =========================
  const deletePolicy = async (id) => {
    try {
      await api.delete(`/policies/${id}`);

      setPolicies((prev) =>
        prev.filter((p) => (p.id || p._id) !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete policy");
    }
  };

  // =========================
  // SEARCH
  // =========================
  const handleSearch = () => {
    setSearch(searchInput);
    fetchPolicies(searchInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">

      <div className="form-card">

        {/* HEADER */}
        <h1 className="form-title">Security Policies</h1>

        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Create, search, and manage internal security policies.
        </p>

        {/* ERROR */}
        {error && (
          <p style={{ color: "#ff8fab", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        {/* =========================
            CREATE POLICY
        ========================= */}
        <div style={{ marginBottom: "25px" }}>

          <div style={{ display: "grid", gap: "12px" }}>

            <input
              className="form-input"
              placeholder="Policy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="form-textarea"
              placeholder="Policy description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="form-btn"
              onClick={createPolicy}
              disabled={creating}
            >
              {creating ? "Creating..." : "Add Policy"}
            </button>

          </div>

        </div>

        {/* =========================
            SEARCH
        ========================= */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px"
        }}>

          <input
            className="form-input"
            placeholder="Search policies..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />

          <button className="form-btn" onClick={handleSearch}>
            Search
          </button>

        </div>

        {/* =========================
            STATES
        ========================= */}
        {loading && <p>Loading policies...</p>}

        {!loading && policies.length === 0 && (
          <p>No policies found.</p>
        )}

        {/* =========================
            POLICY LIST
        ========================= */}
        <div>

          {policies.map((policy) => (
            <div
              key={policy.id || policy._id}
              className="page-card"
              style={{ marginBottom: "15px" }}
            >

              <h3 style={{ marginBottom: "8px" }}>
                {policy.title}
              </h3>

              <p style={{ color: "#ccc", marginBottom: "12px" }}>
                {policy.description}
              </p>

              <button
                className="logout-btn"
                onClick={() =>
                  deletePolicy(policy.id || policy._id)
                }
              >
                Delete
              </button>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default Policies;