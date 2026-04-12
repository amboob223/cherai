// src/components/Incident/IncidentList.jsx
import React from "react";
// import IncidentCard from "./IncidentCard";

const IncidentList = ({ incidents, onDelete }) => {
  return (
    <div>
      {incidents.map((incident) => (
        <div key={incident.id} style={{ border: "1px solid gray", margin: 10 }}>
          
          <h3>{incident.title}</h3>
          <p>{incident.description}</p>
          <p>Severity: {incident.severity}</p>

          <button onClick={() => onDelete(incident.id)}>
            Delete
          </button>

        </div>
      ))}
    </div>
  );
};

export default IncidentList;

