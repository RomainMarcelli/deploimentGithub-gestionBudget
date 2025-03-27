import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Typage de l'objet utilisateur (ajuste selon ton modèle User)
interface AuthRequest extends Request {
  user?: JwtPayload | string;
}

// Middleware d'authentification
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Pas de token fourni" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded; // Accessible dans les routes via req.user
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

// Middleware pour vérifier les admins (facultatif)
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user && typeof req.user !== "string" && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès interdit : réservée aux administrateurs" });
  }
}
