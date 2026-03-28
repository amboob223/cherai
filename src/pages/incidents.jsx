import React, { useEffect, useState } from "react";
import axios from "axios";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low",
  });

  const fetchIncidents = async () => {
    const res = await axios.get("http://localhost:5000/api/incidents");
    setIncidents(res.data);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/incidents", form);

    fetchIncidents();

    setForm({
      title: "",
      description: "",
      severity: "low",
    });
  };

  return (
    <div>
      <h2>Incidents</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <button type="submit">Create</button>
      </form>

      <ul>
        {incidents.map((i) => (
          <li key={i.id}>
            {i.title} - {i.severity} - {i.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Incidents;