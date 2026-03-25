import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";

import Sidebar from "./components/sidebar";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/policies";
import Tasks from "./pages/Tasks";

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ marginLeft: "200px", padding: "20px", width: "100%" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/policies" element={<Policies />} />
  <Route path="/login" element={<Login />} />
  <Route path="/tasks" element={<Tasks/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;