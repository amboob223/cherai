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
      setTasks(res.data || []);
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err);
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
        title: title.trim(),
        description: description.trim(),
      });

      setTasks((prev) => [res.data, ...prev]);

      setTitle("");
      setDescription("");
      setSuccess("Task created successfully");

    } catch (err) {
      console.error("CREATE TASK ERROR:", err);
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((task) => task.id !== id));

      setSuccess("Task deleted successfully");
    } catch (err) {
      console.error("DELETE TASK ERROR:", err);
      setError("Failed to delete task");
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/tasks/${id}`, {
        status,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? res.data : task
        )
      );

    } catch (err) {
      console.error("UPDATE TASK ERROR:", err);
      setError("Failed to update task");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tasks</h2>

      {/* CREATE FORM */}
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

      {/* STATUS MESSAGES */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* TASK LIST */}
      {tasks.map((task) => (
        <div key={task.id} style={{ marginTop: "10px" }}>
          <h4>{task.title}</h4>
          <p>{task.description}</p>

          <select
            value={task.status || "open"}
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