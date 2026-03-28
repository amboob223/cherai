import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null); // store logged-in user

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:5000/api/logout",
      {},
      { withCredentials: true }
    );
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const resData = await axios.get("http://localhost:5000/dashboard", { withCredentials: true });
        setData(resData.data);
  
        // Fetch logged-in user info (including role)
        const resUser = await axios.get("http://localhost:5000/api/me", { withCredentials: true });
        setUser(resUser.data);
      } catch (err) {
        // If any request fails, redirect to login
        window.location.href = "/login";
      }
    };
  
    fetchData();
  }, []);
  if (!data || !user) return <p>Loading...</p>;

  const isAdmin = user.role === "admin";

  return (
    <div style={{ padding: "20px" }}>
      {/* {isAdmin && <Link to="/admin">Admin Page</Link>} */}
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {isAdmin && (
        <button>Edit Policies</button>
      )}

<pre>{JSON.stringify(data, null, 2)}</pre>

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