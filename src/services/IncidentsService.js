import api from "../api/api";

export const createIncident = (data) => {
  return api.post("/incidents", data).then(res => res.data);
};

export const getIncidents = (page, limit) => {
  return api.get(`/incidents?page=${page}&limit=${limit}`).then(res => res.data);
};

export const deleteIncident = (id) => {
  return api.delete(`/incidents/${id}`).then(res => res.data);
};