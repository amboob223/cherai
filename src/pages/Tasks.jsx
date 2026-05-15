import React, { useEffect, useState } from "react";
import api from "../api/api";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD DATA
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
      const res = await api.post("/tasks", {
        title,
        description,
      });

      setTasks((prev) => [res.data, ...prev]);
      setTitle("");
      setDescription("");
      setSuccess("Task created");
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };

  // =========================
  // SINGLE UPDATE FUNCTION (IMPORTANT FIX)
  // =========================
  const updateTask = async (id, data) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
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

        <button>Create Task</button>
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
            value={task.status || "open"}
            onChange={(e) =>
              updateTask(task.id, { status: e.target.value })
            }
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* EMPLOYEE ASSIGN */}
          <select
            value={task.assigned_to || ""}
            onChange={(e) =>
              updateTask(task.id, {
                assigned_to: e.target.value || null,
              })
            }
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