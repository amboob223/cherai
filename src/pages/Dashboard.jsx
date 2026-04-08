import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await axios.get("http://localhost:5000/api/tasks");
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Tasks error:", err);
      }
    
      try {
        const policiesRes = await axios.get("http://localhost:5000/api/policies");
        setPolicies(policiesRes.data);
      } catch (err) {
        console.error("Policies error:", err);
      }
    };

    fetchData();
  }, []);

  // 📊 Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;

  const totalPolicies = policies.length;

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

      {/* 📊 Stats Row */}
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
      </div>

      {/* 📋 Recent Tasks */}
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
            {tasks.slice(0, 5).map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "5px",
                      color: "white",
                      background:
                        task.status === "done"
                          ? "green"
                          : task.status === "in_progress"
                          ? "orange"
                          : "gray",
                    }}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {task.created_at
                    ? new Date(task.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;