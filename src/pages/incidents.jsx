import React, { useEffect, useState, useCallback } from "react";
import { getIncidents,createIncident,deleteIncident } from "../services/IncidentsService";
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

  // ✅ keep limit as a constant outside hook dependencies
  const limit = 5;


  const handleDelete = async (id) => {
    try {
      await deleteIncident(id);
      fetchData(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to delete incident");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    await createIncident(form);
  
    setForm({ title: "", description: "", severity: "low" });
    fetchData(); // refresh list
  };

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
  }, [page]);

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