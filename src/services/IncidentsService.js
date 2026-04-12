import axios from "axios";

// Create reusable API instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ Get incidents with pagination
export const getIncidents = async (page = 1, limit = 5) => {
  try {
    const res = await API.get(`/incidents?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error(
      "Get Incidents Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Create incident (optional but useful for Day 29+)
export const createIncident = async (data) => {
  // const token = localStorage.getItem("token");

  const res = await API.post("/incidents", data);

  return res.data;
};

// ✅ Delete incident (optional)
export const deleteIncident = async (id) => {
  try {
    const res = await API.delete(`/incidents/${id}`);
    return res.data;
  } catch (error) {
    console.error(
      "Delete Incident Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};