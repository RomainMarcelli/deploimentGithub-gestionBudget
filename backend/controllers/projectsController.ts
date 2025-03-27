import { Request, Response, NextFunction } from "express";
import { Project } from "../models/projectsModel";
import Collaborator from "../models/collaboratorModel"; // Import du modèle des collaborateurs

// 🔹 Récupérer tous les projets
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// 🔹 Ajouter un projet
export const addProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newProject = new Project({ name: req.body.name });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};

// 🔹 Mettre à jour un projet
export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedProject) {
      res.status(404).json({ error: "Projet non trouvé" });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// 🔹 Supprimer un projet
export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      res.status(404).json({ error: "Projet non trouvé" });
      return;
    }

    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};


export const getRecapByMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year } = req.query;
    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const recapData = await Collaborator.aggregate([
      { $unwind: "$workloads" },
      { $match: { "workloads.year": selectedYear } }, // Filtrer par année uniquement dans les workloads
      {
        $lookup: {
          from: "projects",
          localField: "workloads.projectId",
          foreignField: "_id",
          as: "projectInfo"
        }
      },
      { $unwind: "$projectInfo" },
      {
        $group: {
          _id: {
            month: "$workloads.month",
            projectId: "$workloads.projectId"
          },
          projectName: { $first: "$projectInfo.name" },
          totalCost: {
            $sum: {
              $multiply: ["$workloads.daysWorked", "$tjm"]
            }
          },
          year: { $first: "$workloads.year" }
        }
      },
      {
        $group: {
          _id: {
            month: "$_id.month",
            year: "$year"
          },
          projects: {
            $push: {
              _id: "$_id.projectId",
              name: "$projectName",
              totalCost: "$totalCost"
            }
          },
          totalMonthCost: { $sum: "$totalCost" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          projects: 1,
          totalMonthCost: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    console.log("📊 Résultat final du recap :", JSON.stringify(recapData, null, 2));
    res.status(200).json(recapData);
  } catch (error) {
    console.error("❌ Erreur lors du récapitulatif des projets :", error);
    next(error);
  }
};
