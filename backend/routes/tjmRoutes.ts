import express from "express";
import { updateTjm, getCollaboratorsWithTjm } from "../controllers/tjmController";

const router = express.Router();

router.put("/:id/update-tjm", updateTjm);
router.get("/", getCollaboratorsWithTjm);

export default router;
