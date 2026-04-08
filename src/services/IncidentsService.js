import axios from "axios";

export const getIncidents = async (page = 1, limit = 5) => {
  const token = localStorage.getItem("token"); // must exist

  const offset = (page - 1) * limit;

  const res = await axios.get(`http://localhost:5000/incidents?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ pass token here
    },
  });

  return res.data;
};