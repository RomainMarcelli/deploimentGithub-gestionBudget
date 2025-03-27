import { Request, Response, NextFunction } from "express";
import Collaborator from "../models/collaboratorModel"; // ✅ Assurez-vous que le modèle inclut `tjm`

export const updateTjm = async (req: Request, res: Response): Promise<void> =>{
    try {
        const { tjm } = req.body;
        const { id } = req.params;

        console.log("🔵 Requête reçue pour mettre à jour le TJM");
        console.log("📌 ID du collaborateur :", id);
        console.log("📌 Valeur TJM reçue :", tjm);

        if (tjm == null || tjm < 0) {
            console.error("❌ Erreur : Le TJM doit être un nombre positif");
            res.status(400).json({ error: "Le TJM doit être un nombre positif" });
            return 
        }

        const collaborator = await Collaborator.findById(id);

        if (!collaborator) {
            console.error("❌ Collaborateur non trouvé avec l'ID :", id);
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return 
        }

        console.log("✅ Collaborateur trouvé :", collaborator.name);

        collaborator.tjm = tjm;
        await collaborator.save();

        console.log("✅ TJM mis à jour avec succès pour :", collaborator.name);

        res.status(200).json({ message: "TJM mis à jour avec succès", collaborator });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du TJM :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// ✅ Récupérer tous les collaborateurs avec leur TJM
export const getCollaboratorsWithTjm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const collaborators = await Collaborator.find().select("name tjm");
        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erreur lors de la récupération des collaborateurs avec TJM :", error);
        next(error);
    }
};
