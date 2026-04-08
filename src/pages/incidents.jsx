import React, { useEffect, useState, useCallback } from "react";
import { getIncidents } from "../services/IncidentsService";
import IncidentList from "../components/Incident/IncidentList";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIncidents(page, limit);
      setIncidents(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired, please login again");
        window.location.href = "/login";
      } else {
        alert("Failed to fetch incidents. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages, page]);

  return (
    <div>
      <h1>Incidents</h1>
      {loading && <p>Loading...</p>}
      <IncidentList incidents={incidents} />
      <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1 || loading}>
        Prev
      </button>
      <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || loading}>
        Next
      </button>
      <p>Page {page} of {totalPages}</p>
    </div>
  );
};

export default Incidents;