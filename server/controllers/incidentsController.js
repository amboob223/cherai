import * as service from "../services/incidentsService.js";

export const getIncidents = (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const data = service.getAllIncidents(Number(page), Number(limit));

  res.json({ incidents: data });
};

export const createIncident = (req, res) => {
  const incident = service.createIncident(req.body);
  res.status(201).json(incident);
};