import mongoose from "mongoose";

// Interface TypeScript pour un projet
export interface IProject extends mongoose.Document {
  name: string;
}

// Schéma Mongoose
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export const Project = mongoose.model<IProject>("Project", projectSchema);
