import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/dashboard", {
      withCredentials: true // 🔥 REQUIRED
    })
    .then(res => setData(res.data))
    .catch(() => {
      window.location.href = "/login"; // 🔥 redirect if not logged in
    });
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;