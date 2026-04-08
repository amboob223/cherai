import express from "express";
import * as controller from "../controllers/incidentsController.js";

const router = express.Router();

router.get("/", controller.getIncidents);
router.post("/", controller.createIncident);

export default router;