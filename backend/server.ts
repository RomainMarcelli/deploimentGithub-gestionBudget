import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectsRoute";
import collaboratorRoutes from "./routes/collaboratorRoutes";
import tjmRoutes from "./routes/tjmRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use("/projects", projectRoutes);
app.use("/collaborators", collaboratorRoutes);
app.use("/api/tjm", tjmRoutes);
app.use("/auth", userRoutes); // ➜ /auth/login et /auth/register


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion MongoDB:", err));

app.listen(PORT, () => console.log(`🚀 Serveur backend lancé sur le port ${PORT}`));
