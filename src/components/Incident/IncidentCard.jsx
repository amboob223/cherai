  const IncidentCard = ({ incident }) => {
      return (
        <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{incident.title}</h3>
          <p>{incident.description}</p>
    
          {incident.file && (
         <a 
         href={`http://localhost:5000/uploads/${incident.file}`} 
         target="_blank" 
         rel="noreferrer"
       >
         View File
       </a>
            
          )}
        </div>
      );
    };
    
    export default IncidentCard;