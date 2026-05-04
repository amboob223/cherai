import React, { useEffect, useState, useCallback } from "react";
import {
  getIncidents,
  createIncident,
  deleteIncident,
} from "../services/IncidentsService";

import IncidentList from "../components/Incident/IncidentList";

const Incidents = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low",
  });

  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 5;

  // =========================
  // NORMALIZE RESPONSE (CRITICAL FIX)
  // =========================
  const normalizeIncidents = (res) => {
    return (
      res?.data?.incidents ||
      res?.data ||
      res?.incidents ||
      []
    );
  };

  const normalizeTotal = (res) => {
    return (
      res?.data?.total ||
      res?.total ||
      res?.count ||
      0
    );
  };

  // =========================
  // FETCH
  // =========================
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getIncidents(page, limit);

      const data = normalizeIncidents(res);
      const count = normalizeTotal(res);

      setIncidents(Array.isArray(data) ? data : []);
      setTotal(count);

    } catch (err) {
      console.error("FETCH INCIDENTS ERROR:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Failed to fetch incidents");
      }

    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================
  // CREATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    try {
      const res = await createIncident(form);

      const created =
        res?.data ||
        res;

      setIncidents((prev) => [created, ...prev].slice(0, limit));
      setTotal((prev) => prev + 1);

      setForm({
        title: "",
        description: "",
        severity: "low",
      });

    } catch (err) {
      console.error("CREATE INCIDENT ERROR:", err);
      alert("Failed to create incident");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      await deleteIncident(id);

      setIncidents((prev) =>
        prev.filter((i) => i.id !== id)
      );

      setTotal((prev) => Math.max(prev - 1, 0));

    } catch (err) {
      console.error("DELETE INCIDENT ERROR:", err);
      alert("Failed to delete incident");
    }
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div>
      <h1>Incidents</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          value={form.severity}
          onChange={(e) =>
            setForm({ ...form, severity: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit">Create Incident</button>
      </form>

      {/* STATES */}
      {loading && <p>Loading...</p>}

      {!loading && incidents.length === 0 && (
        <p>No incidents found.</p>
      )}

      {/* LIST */}
      <IncidentList
        incidents={incidents}
        onDelete={handleDelete}
      />

      {/* PAGINATION */}
      <div>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
        >
          Prev
        </button>

        <button
          onClick={() =>
            setPage((p) => Math.min(p + 1, totalPages))
          }
          disabled={page === totalPages || loading}
        >
          Next
        </button>
      </div>

      <p>
        Page {page} of {totalPages}
      </p>
    </div>
  );
};

export default Incidents;