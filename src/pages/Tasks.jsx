import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import logo from "../assests/logo.png";

const Tasks = () => {

  // =========================
  // STATE
  // =========================
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  // FETCH DATA
  // =========================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksRes, employeesRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/employees"),
      ]);

      setTasks(tasksRes.data || []);
      setEmployees(employeesRes.data || []);

    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================
  // CREATE EMPLOYEE
  // =========================
  const createEmployee = async () => {
    try {

      if (!newEmployee.name.trim()) {
        alert("Employee name required");
        return;
      }

      setError("");
      setSuccess("");

      const res = await api.post("/employees", {
        name: newEmployee.name,
        email: newEmployee.email,
      });

      setEmployees((prev) => [...prev, res.data]);

      setNewEmployee({
        name: "",
        email: "",
      });

      setSuccess("Employee added");

    } catch (err) {
      console.error("CREATE EMPLOYEE ERROR:", err);
      setError(
        err.response?.data?.message || "Failed to create employee"
      );
    }
  };

  // =========================
  // CREATE TASK
  // =========================
  const createTask = async () => {
    try {

      if (!newTask.title.trim()) {
        alert("Task title required");
        return;
      }

      setError("");
      setSuccess("");

      const payload = {
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to || null,
        status: "pending",
      };

      const res = await api.post("/tasks", payload);

      // INSTANT UI UPDATE
      setTasks((prev) => [res.data, ...prev]);

      setNewTask({
        title: "",
        description: "",
        assigned_to: "",
      });

      setSuccess("Task created");

    } catch (err) {
      console.error("CREATE TASK ERROR:", err);

      setError(
        err.response?.data?.message || "Failed to create task"
      );
    }
  };

  // =========================
  // UPDATE TASK
  // =========================
  const updateTask = async (id, updates) => {
    try {

      const task = tasks.find((t) => t.id === id);

      const res = await api.put(`/tasks/${id}`, {
        ...task,
        ...updates,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? res.data : t
        )
      );

    } catch (err) {
      console.error("UPDATE TASK ERROR:", err);

      setError(
        err.response?.data?.message || "Failed to update task"
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id) => {
    try {

      setError("");
      setSuccess("");

      await api.delete(`/tasks/${id}`);

      setTasks((prev) =>
        prev.filter((t) => t.id !== id)
      );

      setSuccess("Task deleted");

    } catch (err) {
      console.error("DELETE TASK ERROR:", err);

      setError(
        err.response?.data?.message || "Failed to delete task"
      );
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="page-center">

      <div className="form-card">

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <img
            src={logo}
            alt="CherAI Logo"
            style={{
              width: "175px",
              height: "175px",
              objectFit: "contain",
            }}
          />

          <h1 className="form-title" style={{ margin: 0 }}>
            Tasks
          </h1>
        </div>

        <p
          style={{
            color: "#aaa",
            marginBottom: "25px",
          }}
        >
          Manage assignments and compliance work
        </p>

        {error && (
          <p style={{ color: "#ff8fab" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "#4ade80" }}>
            {success}
          </p>
        )}

        {loading && (
          <p style={{ color: "white" }}>
            Loading...
          </p>
        )}

        {/* =========================
            CREATE EMPLOYEE
        ========================= */}
        <div
          className="page-card"
          style={{ marginBottom: "20px" }}
        >

          <h3>Add Employee</h3>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >

            <input
              className="form-input"
              placeholder="Employee Name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  name: e.target.value,
                })
              }
            />

            <input
              className="form-input"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  email: e.target.value,
                })
              }
            />

            <button
              className="form-btn"
              onClick={createEmployee}
              type="button"
            >
              Add Employee
            </button>

          </div>

        </div>

        {/* =========================
            CREATE TASK
        ========================= */}
        <div
          className="page-card"
          style={{ marginBottom: "20px" }}
        >

          <h3>Create Task</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "15px",
            }}
          >

            <input
              className="form-input"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  title: e.target.value,
                })
              }
            />

            <textarea
              className="form-textarea"
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  description: e.target.value,
                })
              }
            />

            <select
              className="form-input"
              value={newTask.assigned_to}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  assigned_to: e.target.value,
                })
              }
            >
              <option value="">
                Assign Employee
              </option>

              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name}
                </option>
              ))}
            </select>

            <button
              className="form-btn"
              onClick={createTask}
              type="button"
            >
              Create Task
            </button>

          </div>

        </div>

        {/* =========================
            TASK LIST
        ========================= */}
        {tasks.length === 0 ? (

          <p style={{ color: "#ccc" }}>
            No tasks found
          </p>

        ) : (

          tasks.map((task) => (

            <div
              key={task.id}
              className="page-card"
              style={{ marginBottom: "15px" }}
            >

              <h3>{task.title}</h3>

              <p style={{ color: "#ccc" }}>
                {task.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                }}
              >

                {/* ASSIGN EMPLOYEE */}
                <select
                  className="form-input"
                  value={task.assigned_to || ""}
                  onChange={(e) =>
                    updateTask(task.id, {
                      assigned_to:
                        e.target.value || null,
                    })
                  }
                >
                  <option value="">
                    Unassigned
                  </option>

                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                    >
                      {emp.name}
                    </option>
                  ))}
                </select>

                {/* STATUS */}
                <select
                  className="form-input"
                  value={task.status || "pending"}
                  onChange={(e) =>
                    updateTask(task.id, {
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="done">
                    Done
                  </option>
                </select>

                {/* DELETE */}
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
};

export default Tasks;
