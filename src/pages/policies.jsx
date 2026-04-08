import React, { useState, useEffect } from "react";
import axios from "axios";

const Policies = () => {
  const [search, setSearch] = useState("");
  const [policies, setPolicies] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/policies", {
          params: {
            search: search || "",
            type: type || "",
            status: status || "",
          },
        });

        setPolicies(res.data);
      } catch (err) {
        console.error("Policies fetch error:", err);
      }
    };

    const delay = setTimeout(fetchPolicies, 300);
    return () => clearTimeout(delay);
  }, [search, type, status]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Policies Page</h1>

      <input
        type="text"
        placeholder="Search policies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
      />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="">All Types</option>
        <option value="HR">HR</option>
        <option value="IT">IT</option>
      </select>

      <select onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <ul>
        {policies.map((policy) => (
          <li key={policy.id}>
            <strong>{policy.title}</strong> ({policy.type} - {policy.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Policies;