import { useEffect, useState } from "react";
import axios from "axios";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    axios.get("/api/tasks")
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, []);
  return tasks;
};

export const usePolicies = () => {
  const [policies, setPolicies] = useState([]);
  useEffect(() => {
    axios.get("/api/policies")
      .then(res => setPolicies(res.data))
      .catch(err => console.error(err));
  }, []);
  return policies;
};