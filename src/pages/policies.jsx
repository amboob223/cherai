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
      console.error("Fetch policies error:", err);
      setError("Failed to load policies.");
    } finally {
      setLoading(false);
    }
  };

  // load on mount
  useEffect(() => {
    fetchPolicies();
  }, []);

  // =========================
  // CREATE POLICY
  // =========================
  const createPolicy = async () => {
    if (!title || !description) {
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
      console.error("Create policy error:", err);
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
        prev.filter((p) => p.id !== id)
      );
    } catch (err) {
      console.error("Delete policy error:", err);
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
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container py-4">

      {/* HEADER */}
      <h2 style={{ color: "#d1002c" }}>
        Security Policies
      </h2>

      <p className="text-muted">
        Create, search, and review internal security policies.
      </p>

      {/* =========================
          CREATE POLICY
      ========================= */}
      <div className="card p-3 mb-4 shadow-sm">
        <h5>Create Policy</h5>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Policy title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Policy description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="btn btn-success"
          onClick={createPolicy}
          disabled={creating}
        >
          {creating ? "Creating..." : "Add Policy"}
        </button>
      </div>

      {/* =========================
          SEARCH
      ========================= */}
      <div className="d-flex gap-2 mb-3" style={{ maxWidth: "500px" }}>

        <input
          type="text"
          placeholder="Search policies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-control"
        />

        <button
          className="btn"
          style={{
            backgroundColor: "#d1002c",
            color: "white",
            whiteSpace: "nowrap",
          }}
          onClick={handleSearch}
        >
          Search
        </button>

      </div>

      {/* =========================
          STATES
      ========================= */}
      {loading && <p>Loading policies...</p>}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && policies.length === 0 && search && (
        <p className="text-muted">No policies found.</p>
      )}

      {/* =========================
          POLICY LIST (FIXED - SINGLE MAP ONLY)
      ========================= */}
      <div className="row g-3">
        {policies.map((policy) => (
          <div key={policy.id} className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">

                <h5>{policy.title}</h5>

                <p className="text-muted">
                  {policy.description}
                </p>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => deletePolicy(policy.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Policies;