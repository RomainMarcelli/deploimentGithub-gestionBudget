import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { Link } from "react-router-dom";

interface Project {
  _id: string;
  name: string;
}

function Projet() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [updatedProjectName, setUpdatedProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() === "") return;

    const response = await fetch("http://localhost:5000/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName }),
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setProjectName("");
      toast.success("Projet ajouté avec succès !");
    }
  };

  const deleteProject = async (id: string) => {
    const response = await fetch(`http://localhost:5000/projects/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProjects(projects.filter((project) => project._id !== id));
      toast.success("Projet supprimé avec succès !");
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingProject(id);
    setUpdatedProjectName(name);
  };

  const updateProject = async (id: string) => {
    const response = await fetch(`http://localhost:5000/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updatedProjectName }),
    });

    if (response.ok) {
      const updatedProject = await response.json();
      setProjects(
        projects.map((project) =>
          project._id === id ? updatedProject : project
        )
      );
      setEditingProject(null);
      toast.success("Projet modifié avec succès !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Gestion des Projets</h1>

      <button
        onClick={() => window.location.href = "/collaborateurs"}
        className="bg-blue-500 mb-6 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-all duration-200 flex items-center justify-center shadow-md border"
      >
        <span className="ml-2 font-semibold">Gérer les Collaborateurs</span>
      </button>
      <form onSubmit={addProject} className="bg-white shadow-lg p-6 rounded-xl w-96">
        <label className="block text-gray-700 font-semibold">Nom du projet :</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded-lg mt-2 focus:ring-2 focus:ring-blue-400"
          placeholder="Entrez le nom du projet"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 w-full transition"
        >
          Ajouter Projet
        </button>
      </form>

      {/* Liste des projets affichée sous forme de cartes stylisées */}
      <div className="mt-6 w-full max-w-2xl">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center mb-4 border-l-4 border-blue-500"
          >
            {editingProject === project._id ? (
              <input
                type="text"
                value={updatedProjectName}
                onChange={(e) => setUpdatedProjectName(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <span className="text-gray-800 font-medium">{project.name}</span>
            )}

            <div className="flex space-x-2">
              {editingProject === project._id ? (
                <>
                  {/* Bouton pour valider la modification */}
                  <button
                    onClick={() => updateProject(project._id)}
                    className="bg-green-500 ml-6 text-white px-5 py-2.5 rounded-full hover:bg-green-600 transition-all duration-200 flex items-center justify-center shadow-md border border-green-700"
                  >
                    <span className="ml-2 font-semibold">Confirmer</span>
                  </button>
                  {/* Bouton pour annuler l'édition et revenir en arrière */}
                  <button
                    onClick={() => setEditingProject(null)}
                    className="bg-gray-300 text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-400 transition-all duration-200 flex items-center justify-center shadow-md border border-gray-500"
                  >
                    <span className="ml-2 font-semibold">Annuler</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing(project._id, project.name)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <span>Modifier</span>
                </button>
              )}

              {/* Bouton Supprimer (reste inchangé) */}
              {!editingProject && (
                <button
                  onClick={() => deleteProject(project._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projet;