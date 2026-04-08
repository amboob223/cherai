import React, { useState, useEffect } from "react";
import axios from "axios";

const Policies = () => {
  const [search, setSearch] = useState("");
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/policies", {
          params: {
            search: search || "",
          },
        });

        setPolicies(res.data);
      } catch (err) {
        console.error("Policies fetch error:", err);
      }
    };

    const delay = setTimeout(fetchPolicies, 300);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Policies</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search policies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "15px",
          padding: "8px",
          width: "300px",
        }}
      />

      {/* Policies List */}
      {policies.length === 0 ? (
        <p>No policies found.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {policies.map((policy) => (
            <div
              key={policy.id}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                borderRadius: "8px",
                background: "#f9f9f9",
              }}
            >
              <h3 style={{ margin: 0 }}>{policy.title}</h3>
              <p style={{ marginTop: "5px", color: "#555" }}>
                {policy.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Policies;