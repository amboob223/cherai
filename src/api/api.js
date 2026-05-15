import axios from "axios";

// =========================
// BASE URL (PRODUCTION SAFE)
// =========================
const api = axios.create({
  baseURL: "https://cherai-kosc.onrender.com/api",
  withCredentials: true,
});

// =========================
// ATTACH JWT TOKEN
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;