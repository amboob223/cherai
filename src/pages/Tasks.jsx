import React, { useEffect, useState } from "react";
import api from "../api/api";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // GET TASKS
  // =========================
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
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
      setSuccess("Task created successfully");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE TASK (FIXED)
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks(tasks.filter((task) => task.id !== id));

      setSuccess("Task deleted successfully");

    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError("Failed to delete task");
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================
  const updateStatus = async (id, status) => {
    try {
      const task = tasks.find((t) => t.id === id);

      const res = await api.put(`/tasks/${id}`, {
        ...task,
        status,
      });

      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      setError("Failed to update task");
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
        <div key={task.id} style={{ marginTop: "10px" }}>
          <h4>{task.title}</h4>
          <p>{task.description}</p>

          <select
            value={task.status}
            onChange={(e) => updateStatus(task.id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
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