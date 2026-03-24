// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/logout";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard", { withCredentials: true });
        setMessage(res.data.message);
      } catch {
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div>
      <h1>{message}</h1>
      <Logout />
    </div>
  );
}