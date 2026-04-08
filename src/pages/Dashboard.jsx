import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ check if user exists
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!data || !user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <p>Welcome {user.name}</p>

      <button onClick={handleLogout}>Logout</button>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Card title="Total Tasks" value={data.stats?.totalTasks || 0} />
        <Card title="Completed" value={data.stats?.completedTasks || 0} />
        <Card title="Pending" value={data.stats?.pendingTasks || 0} />
      </div>

      {/* TASK LIST */}
      <h2 style={{ marginTop: "30px" }}>Tasks</h2>
      <ul>
        {data.tasks?.map((task) => (
          <li key={task.id}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ title, value }) => {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        background: "#f5f5f5",
        minWidth: "150px",
        textAlign: "center",
        fontWeight: "bold"
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: "24px" }}>{value}</p>
    </div>
  );
};

export default Dashboard;