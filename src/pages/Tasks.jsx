import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import logo from "../assests/logo.png";

export default function Tasks() {

  // =========================
  // STATE
  // =========================
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
  });

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
  });

  // =========================
  // FETCH EMPLOYEES
  // =========================
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("EMPLOYEE FETCH ERROR:", err);
      setError("Failed to load employees");
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // =========================
  // CREATE EMPLOYEE
  // =========================
  const createEmployee = async () => {
    if (!newEmployee.name.trim()) {
      alert("Employee name required");
      return;
    }

    try {
      await api.post("/employees", newEmployee);

      setNewEmployee({ name: "", email: "" });

      // refresh dropdown instantly
      fetchEmployees();

    } catch (err) {
      console.error("CREATE EMPLOYEE ERROR:", err);
      setError("Failed to create employee");
    }
  };

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("TASK FETCH ERROR:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // =========================
  // CREATE TASK (FIXED + INSTANT UI UPDATE)
  // =========================
  const createTask = async () => {
    if (!newTask.title.trim()) {
      alert("Task title required");
      return;
    }

    try {
      const res = await api.post("/tasks", {
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to || null,
        status: "pending",
      });

      // 🔥 INSTANT RENDER (THIS FIXES YOUR ISSUE)
      setTasks((prev) => [res.data, ...prev]);

      setNewTask({
        title: "",
        description: "",
        assigned_to: "",
      });

    } catch (err) {
      console.error("CREATE TASK ERROR:", err);
      setError("Failed to create task");
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== id));
    } catch (err) {
      console.error("DELETE TASK ERROR:", err);
    }
  };

  // =========================
  // UPDATE TASK
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
      console.error("UPDATE TASK ERROR:", err);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">
      <div className="form-card">

        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px"
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: "40px", height: "40px", objectFit: "contain" }}
          />

          <h1 className="form-title" style={{ margin: 0 }}>
            Tasks
          </h1>
        </div>

        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Manage assignments and track compliance work
        </p>

        {error && <p style={{ color: "#ff8fab" }}>{error}</p>}
        {loading && <p>Loading...</p>}

        {/* =========================
            CREATE EMPLOYEE
        ========================= */}
        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px"
        }}>

          <input
            className="form-input"
            placeholder="Employee name"
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
          />

          <input
            className="form-input"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
          />

          <button className="form-btn" onClick={createEmployee}>
            Add Employee
          </button>

        </div>

        {/* =========================
            CREATE TASK
        ========================= */}
        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px"
        }}>

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
            <option value="">Assign Employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <button className="form-btn" onClick={createTask}>
            Add Task
          </button>

        </div>

        {/* =========================
            TASK LIST (FIXED RENDERING)
        ========================= */}
        {tasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="page-card"
              style={{ marginBottom: "15px" }}
            >

              <h3>{task.title}</h3>
              <p style={{ color: "#ccc" }}>{task.description}</p>

              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px"
              }}>

                <select
                  className="form-input"
                  value={task.assigned_to || ""}
                  onChange={(e) =>
                    updateTask(task.id, {
                      assigned_to: e.target.value || null
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

                <select
                  className="form-input"
                  value={task.status || "pending"}
                  onChange={(e) =>
                    updateTask(task.id, {
                      status: e.target.value
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button
                  className="logout-btn"
                  onClick={() => deleteTask(task.id)}
                >
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