import { useEffect, useState } from "react";
import api from "../api/api"; // ✅ use centralized API

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  // ✅ Mock users
  useEffect(() => {
    setUsers([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  }, []);

  // ✅ Fetch tasks (debounced)
  useEffect(() => {
    const fetchTasks = async () => {
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
      }
    };

    const delay = setTimeout(fetchTasks, 300);
    return () => clearTimeout(delay);
  }, [search, filterUser]);

  // ✅ Create task
  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const res = await api.post("/tasks", newTask);

      setTasks((prev) => [res.data, ...prev]);
      setNewTask({ title: "", description: "" });
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Update task
  const updateTask = async (id, updatedFields) => {
    try {
      await api.put(`/tasks/${id}`, updatedFields);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...updatedFields } : task
        )
      );
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

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

      {/* ✅ Create Task */}
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

      {/* ✅ Filters */}
      <select onChange={(e) => setFilterUser(e.target.value)}>
        <option value="">All Users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginLeft: "10px" }}
      />

      {/* ✅ Table */}
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

                {/* Assign */}
                <td>
                  <select
                    value={task.assigned_to || ""}
                    onChange={(e) =>
                      updateTask(task.id, {
                        assigned_to: Number(e.target.value),
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
                </td>

                {/* Status */}
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

                {/* Delete */}
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