import React, { useEffect, useState } from "react";
import api from "../api/api";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD TASKS + EMPLOYEES
  // =========================
  const fetchData = async () => {
    try {
      const [tasksRes, empRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/employees"),
      ]);

      setTasks(tasksRes.data);
      setEmployees(empRes.data);

    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // CREATE TASK
  // =========================
  const createTask = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post("/tasks", {
        title,
        description,
      });

      setTasks([res.data, ...tasks]);
      setTitle("");
      setDescription("");
      setSuccess("Task created");

    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/tasks/${id}`, {
        status,
      });

      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));

    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    }
  };

  // =========================
  // ASSIGN EMPLOYEE
  // =========================
  const assignEmployee = async (id, employeeId) => {
    try {
      const res = await api.put(`/tasks/${id}`, {
        assigned_to: employeeId || null,
      });

      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));

    } catch (err) {
      console.error(err);
      setError("Failed to assign employee");
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      setSuccess("Task deleted");

    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };

  return (
    <div>
      <h2>Tasks</h2>

      {/* CREATE */}
      <form onSubmit={createTask}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* LIST */}
      {tasks.map((task) => (
        <div key={task.id} style={{ marginTop: 10 }}>
          <h4>{task.title}</h4>
          <p>{task.description}</p>

          {/* STATUS */}
          <select
            value={task.status}
            onChange={(e) => updateStatus(task.id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* ASSIGN EMPLOYEE */}
          <select
            value={task.assigned_to || ""}
            onChange={(e) => assignEmployee(task.id, e.target.value)}
          >
            <option value="">Unassigned</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Tasks;