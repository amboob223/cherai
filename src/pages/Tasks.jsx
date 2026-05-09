import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
  });

  // =========================
  // USERS
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // =========================
  // TASKS
  // =========================
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/tasks", {
        params: { search, assigned_to: filterUser },
      });

      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [search, filterUser]);

  useEffect(() => {
    const delay = setTimeout(() => fetchTasks(), 300);
    return () => clearTimeout(delay);
  }, [fetchTasks]);

  // =========================
  // CREATE
  // =========================
  const createTask = async () => {
    if (!newTask.title.trim()) return alert("Task title required");

    try {
      await api.post("/tasks", {
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to || null,
        status: "pending",
      });

      setNewTask({ title: "", description: "", assigned_to: "" });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // UPDATE
  // =========================
  const updateTask = async (id, data) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);

      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === id ? res.data : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // STATUS BADGE
  // =========================
  const statusBadge = (status) => {
    const base = {
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      color: "white",
      display: "inline-block",
    };

    switch (status) {
      case "done":
        return { ...base, backgroundColor: "#2ecc71" };
      case "in_progress":
        return { ...base, backgroundColor: "#f39c12" };
      default:
        return { ...base, backgroundColor: "#7f8c8d" };
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">
      <div className="form-card">

        <h1 className="form-title">Tasks</h1>

        {error && <p style={{ color: "#ff8fab" }}>{error}</p>}
        {loading && <p>Loading...</p>}

        {/* CREATE TASK */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          <input
            className="form-input"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
          />

          <input
            className="form-input"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />

          <select
            className="form-input"
            value={newTask.assigned_to}
            onChange={(e) =>
              setNewTask({ ...newTask, assigned_to: e.target.value })
            }
          >
            <option value="">Assign User</option>
            {users.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <button className="form-btn" onClick={createTask}>
            Add Task
          </button>
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select
            className="form-input"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TASK CARDS */}
        {tasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id || task._id} className="page-card" style={{ marginBottom: "15px" }}>

              <h3>{task.title}</h3>
              <p>{task.description}</p>

              <div style={{ marginBottom: "10px" }}>
                <span style={statusBadge(task.status)}>
                  {task.status || "pending"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                <select
                  className="form-input"
                  value={task.assigned_to || ""}
                  onChange={(e) =>
                    updateTask(task.id || task._id, {
                      assigned_to: e.target.value || null,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-input"
                  value={task.status || "pending"}
                  onChange={(e) =>
                    updateTask(task.id || task._id, {
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button className="logout-btn" onClick={() => deleteTask(task.id || task._id)}>
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}