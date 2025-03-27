import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// ✅ Créer un utilisateur (par exemple un admin au départ)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password, role } = req.body;
  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "Utilisateur déjà existant" });
      return;
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await User.create({ username, password: hashedPassword, role });

    res.status(201).json({ message: "Utilisateur créé", user: newUser.username });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Connexion d'un utilisateur
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: "Utilisateur non trouvé" });
      return;
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Mot de passe incorrect" });
      return;
    }

    // Génération du token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
