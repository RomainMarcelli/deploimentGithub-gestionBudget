import express from "express";
import { loginUser, registerUser } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkAdmin } from "../middlewares/checkAdmin";

const router = express.Router();

// 🚧 Protéger la route de création d'admin (optionnel)
router.post("/register", authMiddleware, checkAdmin, registerUser);

// Route de connexion
router.post("/login", loginUser);

export default router;
