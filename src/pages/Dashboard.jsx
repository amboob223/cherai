import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(false);

  // =========================
  // ✅ FETCH DATA
  // =========================
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [tasksRes, policiesRes, incidentsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/policies"),
        api.get("/incidents"),
      ]);

      // ✅ SAFE DATA HANDLING
      setTasks(tasksRes.data || []);
      setPolicies(policiesRes.data || []);
      setIncidents(incidentsRes.data?.data || []); // 🔥 FIX HERE
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================
  // 📊 STATS
  // =========================
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress"
  ).length;

  const totalPolicies = policies.length;
  const totalIncidents = incidents.length;

  const cardStyle = {
    flex: 1,
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {loading && <p>Loading...</p>}

      {/* =========================
          📊 STATS
      ========================= */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
        <div style={{ ...cardStyle, background: "#4CAF50" }}>
          <h2>{totalTasks}</h2>
          <p>Total Tasks</p>
        </div>

        <div style={{ ...cardStyle, background: "#2196F3" }}>
          <h2>{inProgressTasks}</h2>
          <p>In Progress</p>
        </div>

        <div style={{ ...cardStyle, background: "#FF9800" }}>
          <h2>{pendingTasks}</h2>
          <p>Pending</p>
        </div>

        <div style={{ ...cardStyle, background: "#9C27B0" }}>
          <h2>{completedTasks}</h2>
          <p>Completed</p>
        </div>

        <div style={{ ...cardStyle, background: "#607D8B" }}>
          <h2>{totalPolicies}</h2>
          <p>Policies</p>
        </div>

        <div style={{ ...cardStyle, background: "#f44336" }}>
          <h2>{totalIncidents}</h2>
          <p>Incidents</p>
        </div>
      </div>

      {/* =========================
          📋 RECENT TASKS
      ========================= */}
      <div>
        <h2>Recent Tasks</h2>

        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No tasks yet
                </td>
              </tr>
            ) : (
              tasks.slice(0, 5).map((task) => {
                const status = task.status || "pending";

                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>

                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "5px",
                          color: "white",
                          background:
                            status === "done"
                              ? "green"
                              : status === "in_progress"
                              ? "orange"
                              : "gray",
                        }}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </td>

                    <td>
                      {task.created_at
                        ? new Date(task.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;