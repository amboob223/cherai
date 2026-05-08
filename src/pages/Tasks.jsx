import {
  useEffect,
  useState,
  useCallback,
} from "react";

import api from "../api/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] =
    useState("");
  const [search, setSearch] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const [newTask, setNewTask] =
    useState({
      title: "",
      description: "",
      assigned_to: "",
    });

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");

        setUsers(res.data || []);
      } catch (err) {
        console.error(
          "Users fetch error:",
          err.response?.data ||
            err.message
        );
      }
    };

    fetchUsers();
  }, []);

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = useCallback(
    async () => {
      setLoading(true);

      try {
        console.log(
          "TOKEN:",
          localStorage.getItem(
            "token"
          )
        );

        const res = await api.get(
          "/tasks",
          {
            params: {
              search,
              assigned_to:
                filterUser,
            },
          }
        );

        console.log(
          "TASKS RESPONSE:",
          res.data
        );

        setTasks(res.data || []);
      } catch (err) {
        console.error(
          "Tasks fetch error:",
          err.response?.data ||
            err.message
        );
      } finally {
        setLoading(false);
      }
    },
    [search, filterUser]
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(delay);
  }, [fetchTasks]);

  // =========================
  // CREATE TASK
  // =========================
  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert("Task title required");
      return;
    }

    try {
      const res = await api.post(
        "/tasks",
        {
          title: newTask.title,
          description:
            newTask.description,
          assigned_to:
            newTask.assigned_to ||
            null,
          status: "pending",
        }
      );

      console.log(
        "TASK CREATED:",
        res.data
      );

      setNewTask({
        title: "",
        description: "",
        assigned_to: "",
      });

      fetchTasks();
    } catch (err) {
      console.error(
        "Create task error:",
        err.response?.data ||
          err.message
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);

      fetchTasks();
    } catch (err) {
      console.error(
        "Delete task error:",
        err.response?.data ||
          err.message
      );
    }
  };

  // =========================
  // UPDATE TASK
  // =========================
  const updateTask = async (
    id,
    updatedFields
  ) => {
    try {
      const res = await api.put(
        `/tasks/${id}`,
        updatedFields
      );

      console.log(
        "UPDATED TASK:",
        res.data
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? res.data
            : task
        )
      );
    } catch (err) {
      console.error(
        "Update task error:",
        err.response?.data ||
          err.message
      );
    }
  };

  // =========================
  // STATUS COLORS
  // =========================
  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case "done":
        return {
          backgroundColor: "green",
          color: "white",
        };

      case "in_progress":
        return {
          backgroundColor: "orange",
          color: "white",
        };

      default:
        return {
          backgroundColor: "gray",
          color: "white",
        };
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tasks</h2>

      {loading && <p>Loading...</p>}

      {/* CREATE TASK */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask({
              ...newTask,
              title:
                e.target.value,
            })
          }
        />

        <input
          placeholder="Description"
          value={
            newTask.description
          }
          onChange={(e) =>
            setNewTask({
              ...newTask,
              description:
                e.target.value,
            })
          }
        />

        <select
          value={
            newTask.assigned_to
          }
          onChange={(e) =>
            setNewTask({
              ...newTask,
              assigned_to:
                e.target.value,
            })
          }
        >
          <option value="">
            Assign User
          </option>

          {users.map((u) => (
            <option
              key={u.id}
              value={u.id}
            >
              {u.name}
            </option>
          ))}
        </select>

        <button onClick={createTask}>
          Add Task
        </button>
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <select
          value={filterUser}
          onChange={(e) =>
            setFilterUser(
              e.target.value
            )
          }
        >
          <option value="">
            All Users
          </option>

          {users.map((u) => (
            <option
              key={u.id}
              value={u.id}
            >
              {u.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* TASK TABLE */}
      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse:
            "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Assigned</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign:
                    "center",
                }}
              >
                No tasks found
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>

                <td>
                  {task.description}
                </td>

                {/* ASSIGNED */}
                <td>
                  <select
                    value={
                      task.assigned_to ||
                      ""
                    }
                    onChange={(e) =>
                      updateTask(
                        task.id,
                        {
                          assigned_to:
                            e.target
                              .value ||
                            null,
                        }
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {users.map((u) => (
                      <option
                        key={u.id}
                        value={u.id}
                      >
                        {u.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* STATUS */}
                <td>
                  <select
                    value={
                      task.status ||
                      "pending"
                    }
                    style={getStatusStyle(
                      task.status
                    )}
                    onChange={(e) =>
                      updateTask(
                        task.id,
                        {
                          status:
                            e.target
                              .value,
                        }
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In
                      Progress
                    </option>

                    <option value="done">
                      Done
                    </option>
                  </select>
                </td>

                <td>
                  <button
                    onClick={() =>
                      deleteTask(
                        task.id
                      )
                    }
                  >
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