import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CollaboratorList from "../components/CollaboratorList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Project {
    _id: string;  // ID du projet
    name: string; // Nom du projet
}

interface Collaborator {
    _id: string;
    name: string;
    totalDaysWorked: number;
    tjm?: number; //  Ajoute cette ligne
    projects: {
        projectId: Project;
        daysWorked: number;
    }[];
}


function Collaborateurs() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState("");
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [editingCollaborator, setEditingCollaborator] = useState<string | null>(null);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedProjects, setUpdatedProjects] = useState<string[]>([]);
    const [showOnlyCollaborators, setShowOnlyCollaborators] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(5, 7));
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [updatedTjm, setUpdatedTjm] = useState<number | "">("");
    const [tjm, setTjm] = useState<number | "">("");
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        fetchCollaborators(selectedMonth, currentYear);
        fetchProjects();
    }, [selectedMonth, currentYear]);

    const fetchCollaborators = async (month = selectedMonth, year = currentYear) => {
        try {
            const response = await fetch(`http://localhost:5000/collaborators?month=${month}&year=${year}`);
            if (!response.ok) throw new Error("Erreur lors de la récupération des collaborateurs");

            const data = await response.json();

            //  Transformation des données pour bien récupérer les jours travaillés du bon mois
            const updatedCollaborators = data.map((collab: Collaborator) => ({
                ...collab,
                projects: collab.projects.map((p) => ({
                    ...p,
                    daysWorked: p.daysWorked ?? 0, //  Ajoute une valeur par défaut si `daysWorked` est null
                })),
                totalDaysWorked: collab.projects.reduce((total, p) => total + (p.daysWorked ?? 0), 0), //  Calcule correctement le total
            }));

            setCollaborators(updatedCollaborators);
        } catch (error) {
            console.error("Erreur lors du chargement des collaborateurs :", error);
        }
    };

    const fetchProjects = async () => {
        const response = await fetch("http://localhost:5000/projects");
        const data = await response.json();
        setProjects(data);
    };

    const addCollaborator = async () => {
        const formattedProjects = selectedProjects.map((id) => id); // 🔥 On envoie uniquement des strings

        const response = await fetch("http://localhost:5000/collaborators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                projects: formattedProjects, //  Correction ici
                month: selectedMonth,
                year: currentYear,
                tjm: tjm === "" ? null : tjm, //  Envoie le TJM ici !
            }),
        });

        if (response.ok) {
            fetchCollaborators(selectedMonth, currentYear); //  Met à jour la liste avec le bon mois
            setName("");
            setSelectedProjects([]);
            setTjm(""); //  Réinitialise aussi le champ TJM après ajout
            toast.success(" Collaborateur ajouté avec succès !");
        }

    };

    const deleteCollaborator = async (id: string) => {
        await fetch(`http://localhost:5000/collaborators/${id}`, { method: "DELETE" });
        fetchCollaborators(selectedMonth, currentYear);
        toast.success("Collaborateur supprimé");
    };

    const startEditing = (collab: Collaborator) => {
        setEditingCollaborator(collab._id);
        setUpdatedName(collab.name);
        setUpdatedProjects(collab.projects.map((p) => p.projectId?._id || "")); //  Vérification si `projectId` est défini
        setUpdatedTjm(collab.tjm ?? "");
    };

    const cancelEditing = () => {
        setEditingCollaborator(null);
    };

    const updateCollaborator = async (id: string) => {
        await fetch(`http://localhost:5000/collaborators/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updatedName,
                projects: updatedProjects,
                month: selectedMonth,  //  Ajout du mois sélectionné
                year: currentYear,      //  Ajout de l'année sélectionnée
                tjm: updatedTjm === "" ? null : updatedTjm, //  ajoute ça
            }),
        });

        setEditingCollaborator(null);
        fetchCollaborators(selectedMonth, currentYear); //  Rafraîchir la liste après modification
        toast.success("Collaborateur mis à jour");
    };


    const toggleShowCollaborators = () => {
        setShowOnlyCollaborators(!showOnlyCollaborators);
    };
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                closeOnClick={true}
                pauseOnHover={true}
                draggable={true}
            />
            {/* 🟦 Bouton pour afficher les jours travaillés */}
            <motion.button
                onClick={toggleShowCollaborators}
                whileTap={{ scale: 0.95 }}
                className="mb-6 bg-blue-500 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-all duration-200 flex items-center justify-center shadow-md border border-blue-700"
            >
                {showOnlyCollaborators ? "🔄 Revenir à l'affichage normal" : "📅 Nombre de jours travaillés"}
            </motion.button>

            {/* 🟠 Affichage de la liste des collaborateurs OU des projets */}
            {showOnlyCollaborators ? (
                <CollaboratorList
                    collaborators={collaborators.map((collab) => ({
                        ...collab,
                        projects: collab.projects.map((p) => ({
                            projectId: p.projectId,
                            daysWorked: p.daysWorked ?? 0,
                        })),
                        totalDaysWorked: collab.totalDaysWorked ?? 0,
                    }))}
                    fetchCollaborators={fetchCollaborators}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                />
            ) : (
                <>
                    {/* 🟢 Formulaire d'ajout */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg border border-gray-300"
                    >
                        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
                            👥 Gérer les Collaborateurs
                        </h1>

                        {/* 🟠 Champ pour entrer le nom du collaborateur */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Entrez le nom du collaborateur"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 🟦 Sélection des projets */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Sélectionner des projets :</label>
                            <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-lg shadow-md border border-gray-300">
                                {projects.map((project) => (
                                    <label
                                        key={project._id}
                                        className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            value={project._id}
                                            checked={selectedProjects.includes(project._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProjects([...selectedProjects, project._id]);
                                                } else {
                                                    setSelectedProjects(selectedProjects.filter((id) => id !== project._id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{project.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 🔵 Saisie du TJM */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">TJM (€)</label>
                            <input
                                type="number"
                                value={tjm}
                                onChange={(e) => setTjm(Number(e.target.value))}
                                placeholder="Ex: 500"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 🟢 Bouton Ajouter Collaborateur */}
                        <motion.button
                            onClick={addCollaborator}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                        >
                            Ajouter Collaborateur
                        </motion.button>
                    </motion.div>

                    {/* 🟣 Liste des collaborateurs */}
                    <div className="mt-6 w-full max-w-3xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center border-b pb-2">
                            Liste des Collaborateurs
                        </h2>

                        <div className="space-y-6">
                            <div className="mb-4 w-full max-w-3xl">
                                <input
                                    type="text"
                                    placeholder="🔍 Rechercher par nom ou projet..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {collaborators.filter((collab) => {
                                const nameMatch = collab.name.toLowerCase().includes(searchTerm.toLowerCase());
                                const projectMatch = collab.projects.some((p) =>
                                    p.projectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                                return nameMatch || projectMatch;
                            }).map((collab) => (
                                <motion.div
                                    key={collab._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white shadow-md rounded-lg p-6 border border-gray-300"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        {editingCollaborator === collab._id ? (
                                            <div className="w-full">
                                                {/* Modifier le nom du collaborateur */}
                                                <input
                                                    type="text"
                                                    value={updatedName}
                                                    onChange={(e) => setUpdatedName(e.target.value)}
                                                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Modifier le nom"
                                                />

                                                {/* Champ pour modifier le TJM */}
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">TJM (€)</label>
                                                    <input
                                                        type="number"
                                                        value={updatedTjm}
                                                        onChange={(e) => setUpdatedTjm(Number(e.target.value))}
                                                        className="w-full border border-gray-300 p-2 rounded-lg"
                                                        placeholder="Ex: 600"
                                                    />
                                                </div>

                                                {/* Modifier les projets associés */}
                                                <div className="mt-4">
                                                    <h4 className="text-md font-medium text-gray-700 mb-2">Modifier les projets</h4>
                                                    <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-lg shadow-md border border-gray-300">
                                                        {projects.map((project) => (
                                                            <label
                                                                key={project._id}
                                                                className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    value={project._id}
                                                                    checked={updatedProjects.includes(project._id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setUpdatedProjects([...updatedProjects, project._id]);
                                                                        } else {
                                                                            setUpdatedProjects(updatedProjects.filter((id) => id !== project._id));
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                                />
                                                                <span className="text-gray-700">{project.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-semibold text-gray-900">{collab.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium text-gray-700">TJM : </span>
                                                    {collab.tjm ? `${collab.tjm} €` : "Non défini"}
                                                </p>
                                            </>
                                        )}

                                        <div className="flex space-x-2 mt-3 md:mt-0">
                                            {editingCollaborator === collab._id ? (
                                                <>
                                                    <button
                                                        onClick={() => updateCollaborator(collab._id)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        Valider
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(collab)}
                                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCollaborator(collab._id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Affichage des projets associés */}
                                    {editingCollaborator !== collab._id && (
                                        <div className="border-t mt-4 pt-4">
                                            <h4 className="text-md font-medium text-gray-700 mb-3">Projets associés</h4>
                                            {collab.projects.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {collab.projects.map((project) => (
                                                        <span
                                                            key={project.projectId?._id || Math.random()}
                                                            className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-md border border-blue-300 shadow-sm"
                                                        >
                                                            {project.projectId?.name || "Projet inconnu"} - {project.daysWorked ?? 0} jours
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">Aucun projet attribué</p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
    ;

}
export default Collaborateurs;
