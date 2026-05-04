import { useEffect, useState, useCallback } from "react";
import api from "../api/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // =========================
  // USERS (REAL DB)
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };

    fetchUsers();
  }, []);

  // =========================
  // TASKS FETCH
  // =========================
  const fetchTasks = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/tasks", {
        params: {
          search: search || "",
          assigned_to: filterUser || "",
        },
      });

      setTasks(res.data || []);
    } catch (err) {
      console.error("Tasks fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterUser]);

  useEffect(() => {
    const delay = setTimeout(() => fetchTasks(), 300);
    return () => clearTimeout(delay);
  }, [fetchTasks]);

  // =========================
  // CREATE TASK
  // =========================
  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await api.post("/tasks", {
        ...newTask,
        assigned_to: null, // explicit UUID-safe default
      });

      setNewTask({ title: "", description: "" });
      fetchTasks();
    } catch (err) {
      console.error("Create task error:", err);
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
      console.error("Delete error:", err);
    }
  };

  // =========================
  // UPDATE TASK (UUID SAFE)
  // =========================
  const updateTask = async (id, updatedFields) => {
    try {
      await api.put(`/tasks/${id}`, updatedFields);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, ...updatedFields } : task
        )
      );
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const isOverdue = (dueDate) =>
    dueDate && new Date(dueDate) < new Date();

  const getStatusStyle = (status) => {
    if (status === "done") return { background: "green", color: "white" };
    if (status === "in_progress")
      return { background: "orange", color: "white" };
    return { background: "gray", color: "white" };
  };

  const filteredTasks = filterUser
    ? tasks.filter((t) => String(t.assigned_to) === String(filterUser))
    : tasks;

  return (
    <div>
      <h2>Tasks</h2>

      {loading && <p>Loading...</p>}

      {/* CREATE */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask({ ...newTask, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />

        <button onClick={createTask}>Add Task</button>
      </div>

      {/* FILTER */}
      <select onChange={(e) => setFilterUser(e.target.value)}>
        <option value="">All Users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginLeft: "10px" }}
      />

      {/* TABLE */}
      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No tasks found
              </td>
            </tr>
          ) : (
            filteredTasks.map((task) => (
              <tr
                key={task.id}
                style={{
                  backgroundColor: isOverdue(task.due_date)
                    ? "#ffcccc"
                    : "white",
                }}
              >
                <td>{task.title}</td>

                {/* ASSIGN (FIXED: NO Number()) */}
                <td>
                  {currentUser?.role === "admin" ? (
                    <select
                      value={task.assigned_to || ""}
                      onChange={(e) =>
                        updateTask(task.id, {
                          assigned_to: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    users.find((u) => u.id === task.assigned_to)?.name ||
                    "Unassigned"
                  )}
                </td>

                {/* STATUS */}
                <td>
                  <select
                    value={task.status || "pending"}
                    onChange={(e) =>
                      updateTask(task.id, { status: e.target.value })
                    }
                    style={getStatusStyle(task.status)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </td>

                <td>{task.due_date || "-"}</td>

                <td>
                  <button onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}