import mongoose, { Schema, Document, Types } from "mongoose";

// ✅ Interface pour les projets assignés
interface IProject {
  projectId: Types.ObjectId;
  daysWorked: number;
}

// ✅ Interface pour les jours travaillés par mois/année
interface WorkByMonth {
    projectId: Types.ObjectId;
    daysWorked: number;
    month: string;
    year: number;
    comments?: string; // ✅ Ajout ici
  }
  

// ✅ Interface principale
export interface ICollaborator extends Document {
  name: string;
  totalDaysWorked: number;
  projects: IProject[];
  workloads?: WorkByMonth[]; // ✅ Liste des jours par projet et par mois
  comments?: string;
  tjm?: number;
}

// ✅ Schéma mongoose
const CollaboratorSchema = new Schema<ICollaborator>({
  name: { type: String, required: true },
  totalDaysWorked: { type: Number, default: 0 },
  projects: [
    {
      projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
      daysWorked: { type: Number, default: 0 },
    },
  ],
  workloads: [
    {
      projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
      daysWorked: { type: Number, default: 0 },
      month: { type: String, required: true },
      year: { type: Number, required: true },
      comments: { type: String, default: "" },
    },
  ],
  tjm: { type: Number, default: null },
});

console.log("🔵 Modèle Collaborator chargé avec succès.");

const Collaborator = mongoose.model<ICollaborator>("Collaborator", CollaboratorSchema);
export default Collaborator;
