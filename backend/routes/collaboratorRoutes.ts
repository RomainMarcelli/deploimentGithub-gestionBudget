import express from "express";
import {
    getCollaborators, getCollaboratorById, // ✅ Nouvelle route ajoutée ici
    addCollaborator, updateCollaborator, deleteCollaborator, addDaysWorked, updateCollaboratorComment
} from "../controllers/collaboratorController";

const router = express.Router();

router.get("/", getCollaborators);
router.get("/:id", getCollaboratorById); // ✅ Nouvelle route GET /:id pour récupérer un collaborateur par son ID
router.post("/", addCollaborator);
router.put("/:id", updateCollaborator);
router.delete("/:id", deleteCollaborator);
router.put("/:id/add-days", addDaysWorked);
router.put("/:id/comment", updateCollaboratorComment); // ✅ Nouvelle route API


export default router;
