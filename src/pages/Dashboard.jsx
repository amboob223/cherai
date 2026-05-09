import React, { useEffect, useState } from "react";
import api from "../api/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    tasks: 0,
    policies: 0,
    incidents: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH STATS (SAFE VERSION)
  // =========================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksRes, policiesRes, incidentsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/policies"),
        api.get("/incidents"),
      ]);

      setStats({
        tasks: tasksRes.data?.length || 0,
        policies: policiesRes.data?.length || 0,
        incidents: incidentsRes.data?.length || 0,
      });

    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchDashboard();
  }, []);

  // auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">

      <div className="form-card">

        <h1 className="form-title">
          Security Dashboard
        </h1>

        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Live system overview
        </p>

        {error && (
          <p style={{ color: "#ff8fab" }}>
            {error}
          </p>
        )}

        {loading && <p>Loading dashboard...</p>}

        {/* =========================
            STATS
        ========================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
            marginTop: "20px",
          }}
        >

          <div className="page-card">
            <h2 style={{ color: "#ff4d6d" }}>
              {stats.tasks}
            </h2>
            <p>Tasks</p>
          </div>

          <div className="page-card">
            <h2 style={{ color: "#ff4d6d" }}>
              {stats.policies}
            </h2>
            <p>Policies</p>
          </div>

          <div className="page-card">
            <h2 style={{ color: "#ff4d6d" }}>
              {stats.incidents}
            </h2>
            <p>Incidents</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;