import { useEffect, useState } from "react";
import axios from "axios";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [search, setSearch] = useState("");

  // ✅ Fetch users once
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/tasks", {
          params: {
            search: search || "",
            assigned_to: filterUser || "",
            status: "", // add later if you want
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

  // ✅ Fetch tasks (with search)
  useEffect(() => {
    const delay = setTimeout(() => {
      axios
        .get("http://localhost:5000/tasks", {
          params: { search },
        })
        .then((res) => setTasks(res.data))
        .catch((err) => console.error(err));
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setUsers([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
    } catch (err) {
      console.error("Users error:", err);
    }
  };

  const updateTask = async (id, updatedFields) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        updatedFields,
        { withCredentials: true }
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
      <table border="1" style={{ marginTop: "20px" }}>
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