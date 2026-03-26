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
      <button onClick={handleLogout}>Logout</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;