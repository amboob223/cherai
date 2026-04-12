import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "";
let incidents = [];


export const getAllIncidents = (page, limit) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return incidents.slice(start, end);
};

export const createIncident = async (data) => {
  const res = await API.post("/incidents", data);
  return res.data;
};

export const getIncidents = async (page = 1, limit = 5) => {
  const token = localStorage.getItem("token");

  if (!token) throw new Error("No authentication token found");

  const res = await axios.get(
    `${API_URL}/api/incidents?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  

  return res.data;
};