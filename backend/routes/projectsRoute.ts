import express from "express";
import { getProjects, addProject, updateProject, deleteProject, getRecapByMonth } from "../controllers/projectsController";

const router = express.Router();

router.get("/", getProjects);
router.post("/", addProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/recap", getRecapByMonth); // ✅ Nouvelle route pour le récap


export default router;
