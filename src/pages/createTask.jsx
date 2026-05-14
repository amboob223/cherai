const fetchEmployees = async () => {

    const res = await api.get("/employees");
 
    setEmployees(res.data);
 
 };
 <select
  value={assignedTo}
  onChange={(e) => setAssignedTo(e.target.value)}
>

  <option value="">Assign Employee</option>

  {employees.map((employee) => (

    <option
      key={employee.id}
      value={employee.id}
    >
      {employee.name}
    </option>

  ))}

</select>