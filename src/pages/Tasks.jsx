import { useEffect, useState } from "react";
import axios from "axios";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");

  // ✅ Fetch users (mock for now)
  useEffect(() => {
    setUsers([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  }, []);

  // ✅ Fetch tasks (clean + debounced)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks", {
          params: {
            search: search || "",
            assigned_to: filterUser || "",
          },
        });

        setTasks(res.data);
      } catch (err) {
        console.error("Tasks fetch error:", err);
      }
    };

    const delay = setTimeout(fetchTasks, 300);
    return () => clearTimeout(delay);
  }, [search, filterUser]);

  const updateTask = async (id, updatedFields) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        updatedFields
      );

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
    if (status === "in_progress") return { background: "orange", color: "white" };
    return { background: "gray", color: "white" };
  };

  const filteredTasks = filterUser
    ? tasks.filter((t) => String(t.assigned_to) === String(filterUser))
    : tasks;

  return (
    <div>
      <h2>Tasks</h2>

      {/* Filters */}
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

      {/* Table */}
      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>

        <tbody>
          {filteredTasks.map((task) => (
            <tr
              key={task.id}
              style={{
                backgroundColor: isOverdue(task.due_date)
                  ? "#ffcccc"
                  : "white",
              }}
            >
              <td>{task.title}</td>

              {/* Assign user */}
              <td>
                <select
                  value={task.assigned_to || ""}
                  onChange={(e) =>
                    updateTask(task.id, { assigned_to: e.target.value })
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}