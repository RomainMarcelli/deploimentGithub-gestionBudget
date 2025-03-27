import { Request, Response, NextFunction } from "express";
import Collaborator from "../models/collaboratorModel";
import { Project } from "../models/projectsModel";
import mongoose from "mongoose";

// 📌 Fonction pour récupérer le mois actuel (ex: "03" pour mars)
const getCurrentMonth = (): string => {
    return new Date().toISOString().slice(5, 7);
};

// 📌 Fonction pour récupérer l'année actuelle
const getCurrentYear = (): number => {
    return new Date().getFullYear();
};
export const getCollaboratorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "ID invalide" });
            return;
        }

        const collaborator = await Collaborator.findById(id)
            .populate("projects.projectId")
            .populate("workloads.projectId");

        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        const filteredWorkloads = collaborator.workloads?.filter(
            (w) => w.month === month && w.year === Number(year)
        ) || [];

        const projectsWithDays = collaborator.projects.map((p) => {
            const projectIdStr = (p.projectId as any)._id?.toString?.() || p.projectId?.toString?.();
            const workload = filteredWorkloads.find((w) => {
                const workloadProjectIdStr = (w.projectId as any)._id?.toString?.() || w.projectId?.toString?.();
                return workloadProjectIdStr === projectIdStr;
            });

            return {
                projectId: p.projectId,
                daysWorked: workload?.daysWorked || 0,
            };
        });

        const monthComment = filteredWorkloads.find(w => w.comments)?.comments || "";

        res.status(200).json({
            _id: collaborator._id,
            name: collaborator.name,
            tjm: collaborator.tjm,
            comments: monthComment,
            projects: projectsWithDays,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du collaborateur :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

export const getCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { month, year } = req.query;

        const collaborators = await Collaborator.find({})
            .populate("projects.projectId")
            .populate("workloads.projectId");

        const filtered = collaborators.map((collab) => {
            const filteredWorkloads = collab.workloads?.filter(
                (w) => w.month === month && w.year === Number(year)
            ) || [];

            const projectsWithDays = collab.projects.map((p) => {
                const projectIdStr = (p.projectId as any)._id?.toString?.() || p.projectId?.toString?.();

                const workload = filteredWorkloads.find((w) => {
                    const workloadProjectIdStr = (w.projectId as any)._id?.toString?.() || w.projectId?.toString?.();
                    return workloadProjectIdStr === projectIdStr;
                });

                return {
                    ...p,
                    daysWorked: workload?.daysWorked || 0,
                    projectId: p.projectId,
                };
            });

            const monthComment = filteredWorkloads.find(w => w.comments)?.comments || "";

            return {
                ...collab.toObject(),
                projects: projectsWithDays,
                comments: monthComment,
            };
        });

        res.status(200).json(filtered);
    } catch (error) {
        console.error("Erreur lors de la récupération des collaborateurs :", error);
        next(error);
    }
};

export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects, tjm  } = req.body;

        const existingProjects = await Project.find({ _id: { $in: projects } });
        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        const formattedProjects = projects.map((projId: string) => ({
            projectId: new mongoose.Types.ObjectId(projId),
            daysWorked: 0,
        }));

        const newCollaborator = new Collaborator({
            name,
            projects: formattedProjects,
            tjm: tjm || null, // ✅ Utilise bien le TJM ici
        });

        await newCollaborator.save();

        const populatedCollaborator = await Collaborator.findById(newCollaborator._id).populate("projects.projectId");

        res.status(201).json(populatedCollaborator);
    } catch (error) {
        next(error);
    }
};

export const updateCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects, tjm  } = req.body;

        const existingProjects = await Project.find({ _id: { $in: projects } });
        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        const collaborator = await Collaborator.findById(req.params.id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        const updatedProjects = projects.map((projId: string) => {
            const existingProject = collaborator.projects.find(p => p.projectId.toString() === projId);
            return {
                projectId: new mongoose.Types.ObjectId(projId),
                daysWorked: existingProject ? existingProject.daysWorked : 0
            };
        });

        const updatedCollaborator = await Collaborator.findByIdAndUpdate(
            req.params.id,
            { name, projects: updatedProjects, tjm },
            { new: true }
        ).populate("projects.projectId");

        res.status(200).json(updatedCollaborator);
    } catch (error) {
        next(error);
    }
};

export const addDaysWorked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { projectId, days, month, year } = req.body;
        const { id } = req.params;

        if (days == null || days < 0) {
            res.status(400).json({ error: "Le nombre de jours doit être supérieur ou égal à 0" });
            return;
        }

        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        if (!collaborator.workloads) {
            collaborator.workloads = [];
        }

        const existing = collaborator.workloads.find(
            (w) => w.projectId.toString() === projectId && w.month === month && w.year === Number(year)
        );

        if (existing) {
            existing.daysWorked = days;
        } else {
            collaborator.workloads.push({
                projectId: new mongoose.Types.ObjectId(projectId),
                daysWorked: days,
                month,
                year: Number(year),
            });
        }

        await collaborator.save();
        res.status(200).json({ message: "Jours mis à jour", collaborator });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur interne du serveur", details: error });
    }
};

export const deleteCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deletedCollaborator = await Collaborator.findByIdAndDelete(req.params.id);

        if (!deletedCollaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        res.status(200).json({ message: "Collaborateur supprimé avec succès" });
    } catch (error) {
        next(error);
    }
};

export const updateCollaboratorComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { comments, month, year } = req.body;
        const { id } = req.params;

        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        const workloadComment = collaborator.workloads?.find(
            (w) => w.month === month && w.year === Number(year)
        );

        if (workloadComment) {
            (workloadComment as any).comments = comments;
        } else {
            collaborator.workloads?.push({
                projectId: new mongoose.Types.ObjectId(), // Placeholder ID
                daysWorked: 0,
                month,
                year: Number(year),
                comments,
            } as any);
        }

        await collaborator.save();
        res.status(200).json({ message: "Commentaire mis à jour", collaborator });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur", details: error });
    }
};
