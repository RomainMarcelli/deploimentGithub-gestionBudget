import { Request, Response, NextFunction } from "express";

// Middleware pour vérifier le rôle admin
export const checkAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // @ts-ignore : pour éviter les erreurs si req.user n'existe pas dans les types
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Accès interdit : Administrateur requis" });
    return;
  }
  next();
};
