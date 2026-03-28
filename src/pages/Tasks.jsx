// File: /cherai/src/pages/Tasks.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        withCredentials: true,
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Tasks error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Users error:", err);
    }
  };

  // Update task and refresh state immediately
  const updateTask = async (id, updatedFields) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        updatedFields,
        { withCredentials: true }
      );

      // Update local tasks state so UI changes instantly
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

  // Filter tasks by assigned user if filter is selected
  const filteredTasks = filterUser
    ? tasks.filter((t) => t.assigned_to === filterUser)
    : tasks;

  return (
    <div>
      <h2>Tasks</h2>

      {/* Filter */}
      <select onChange={(e) => setFilterUser(e.target.value)}>
        <option value="">All Users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* Tasks Table */}
      <table border="1">
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

              {/* Assigned User Dropdown */}
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

              {/* Status Dropdown */}
              <td>
                <select
                  value={task.status || "pending"}
                  onChange={(e) =>
                    updateTask(task.id, { status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
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