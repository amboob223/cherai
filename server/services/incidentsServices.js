import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "";
let incidents = [];


export const getAllIncidents = (page, limit) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return incidents.slice(start, end);
};

export const createIncident = (data) => {
  const newIncident = {
    _id: Date.now().toString(),
    ...data,
  };

  incidents.push(newIncident);
  return newIncident;
};



export const getIncidents = async (page = 1, limit = 5) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const offset = (page - 1) * limit;
  try {
    const res = await axios.get(`${API_URL}/api/incidents?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};