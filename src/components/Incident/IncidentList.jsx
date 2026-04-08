// src/components/Incident/IncidentList.jsx
import React from "react";
import IncidentCard from "./IncidentCard";

const IncidentList = ({ incidents }) => {
  if (!incidents || incidents.length === 0) {
    return <p>No incidents found.</p>;
  }

  return (
    <div className="incident-list">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
};

export default IncidentList;