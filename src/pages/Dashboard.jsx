import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:5000/api/logout",
      {},
      { withCredentials: true }
    );
    window.location.href = "/login";
  };

  useEffect(() => {
    axios.get("http://localhost:5000/dashboard", {
      withCredentials: true
    })
    .then(res => setData(res.data))
    .catch(() => {
      window.location.href = "/login";
    });
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {/* COUNTS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Card title="Total Policies" value={data.totalPolicies} />
        <Card title="Open Tasks" value={data.openTasks} />
        <Card title="Overdue Policies" value={data.overduePolicies} danger />
        <Card title="Overdue Tasks" value={data.overdueTasks} danger />
      </div>

      {/* UPCOMING REVIEW */}
      <h2 style={{ marginTop: "30px" }}>Upcoming Reviews</h2>
      <ul>
        {data.upcomingPolicies?.map(policy => (
          <li key={policy.id}>
            {policy.name} - {new Date(policy.review_date).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {/* RECENT ACTIVITY */}
      <h2 style={{ marginTop: "30px" }}>Recent Activity</h2>
      <ul>
        {data.recentLogs.map(log => (
          <li key={log.id}>
            {log.action} - {new Date(log.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ title, value, danger }) => {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        background: danger ? "#ffe5e5" : "#f5f5f5",
        color: danger ? "red" : "black",
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