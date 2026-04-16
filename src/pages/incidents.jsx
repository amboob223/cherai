import React, { useEffect, useState, useCallback } from "react";
import { getIncidents, createIncident, deleteIncident } from "../services/IncidentsService";
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

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await deleteIncident(id);

      // remove from UI instantly
      setIncidents((prev) => prev.filter((i) => i.id !== id));

      // optional: refetch to stay in sync
      fetchData();

    } catch (err) {
      console.error(err);
      alert("Failed to delete incident");
    }
  };

  // ✅ CREATE (FIXED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      const newIncident = await createIncident(form);

      // 🔥 THIS IS THE KEY FIX
      setIncidents((prev) => [newIncident, ...prev].slice(0, limit));

      setForm({ title: "", description: "", severity: "low" });

      // keep pagination accurate
      setTotal((prev) => prev + 1);

    } catch (err) {
      console.error(err);
      alert("Failed to create incident");
    }
  };

  // ✅ FETCH
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getIncidents(page, limit);

      setIncidents(res.data ?? res.incidents ?? []);
      setTotal(res.total ?? res.count ?? 0);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        alert("Session expired, please login again");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Failed to fetch incidents.");
      }

    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div>
      <h1>Incidents</h1>

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

      {loading && <p>Loading...</p>}

      {!loading && incidents.length === 0 && (
        <p>No incidents found.</p>
      )}

      <IncidentList
        incidents={incidents}
        onDelete={handleDelete}
      />

      <div>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1 || loading}
        >
          Prev
        </button>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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