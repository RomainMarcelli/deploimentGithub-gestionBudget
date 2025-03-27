import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

interface Project {
    _id: string;
    name: string;
}

interface Collaborator {
    _id: string;
    name: string;
    totalDaysWorked: number;
    projects: {
        projectId: Project;
        daysWorked: number;
    }[];
}

interface Props {
    collaborators: Collaborator[];
    fetchCollaborators: (month: string, year: number) => void;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    currentYear: number;
    setCurrentYear: (year: number) => void;
}

function CollaboratorList({
    collaborators,
    fetchCollaborators,
    selectedMonth,
    setSelectedMonth,
    currentYear,
    setCurrentYear
}: Props) {

    const [daysWorked, setDaysWorked] = useState<{ [key: string]: number }>({});

    const months = [
        { value: "01", label: "Janvier" },
        { value: "02", label: "Février" },
        { value: "03", label: "Mars" },
        { value: "04", label: "Avril" },
        { value: "05", label: "Mai" },
        { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" },
        { value: "08", label: "Août" },
        { value: "09", label: "Septembre" },
        { value: "10", label: "Octobre" },
        { value: "11", label: "Novembre" },
        { value: "12", label: "Décembre" },
    ];


    useEffect(() => {
        fetchCollaborators(selectedMonth, currentYear); // ✅ Récupère les collaborateurs avec le bon mois et année
    }, [selectedMonth, currentYear]); // 🔥 Dépendances mises à jour pour recharger la liste à chaque changement de mois
    

    useEffect(() => {
        const updatedDaysWorked: { [key: string]: number } = {};
        collaborators.forEach(collab => {
            collab.projects.forEach(project => {
                const key = `${collab._id}-${project.projectId?._id}-${selectedMonth}-${currentYear}`;
                updatedDaysWorked[key] = project.daysWorked ?? 0; // ✅ Charge les jours du bon mois
            });
        });

        setDaysWorked(updatedDaysWorked);
    }, [collaborators, selectedMonth, currentYear]);
    

    // ✅ Met à jour l'état local quand on modifie un input
    const handleInputChange = (collabId: string, projectId: string, value: number) => {
        setDaysWorked(prev => ({
            ...prev,
            [`${collabId}-${projectId}-${selectedMonth}-${currentYear}`]: value
        }));
    };

    // ✅ Met à jour les jours travaillés pour un projet spécifique
    const handleUpdateDays = async (collabId: string, projectId: string) => {
        const key = `${collabId}-${projectId}-${selectedMonth}-${currentYear}`;
        if (daysWorked[key] == null) return; // ✅ Vérification
    
        try {
            const response = await fetch(`https://deploiement-recapexcel.onrender.com/collaborators/${collabId}/add-days`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    days: daysWorked[key],
                    month: selectedMonth, // ✅ S'assure que le mois est envoyé
                    year: currentYear, // ✅ S'assure que l'année est envoyée
                }),
            });
    
            if (response.ok) {
                fetchCollaborators(selectedMonth, currentYear);
                toast.success("Jours de travail enregistrés avec succès !", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.error("Échec de l'enregistrement. Réessayez !", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur !", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };     

    // ✅ Met à jour tous les projets d'un coup
    const handleSaveAll = async () => {
        const updates = Object.entries(daysWorked).map(([key, days]) => {
            const [collabId, projectId, month, year] = key.split("-");
    
            return fetch(`https://deploiement-recapexcel.onrender.com/collaborators/${collabId}/add-days`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, days, month, year }), // ✅ Envoie le bon mois et année
            });
        });
    
        try {
            await Promise.all(updates);
            toast.success("Tous les jours de travail ont été enregistrés !", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            fetchCollaborators(selectedMonth, currentYear); // 🔥 Rafraîchir les données
            setDaysWorked({});
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement global !", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };    

    return (
        <div className="mt-6 w-full max-w-lg">
            <ToastContainer />
            {/* Sélection du mois */}
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Sélectionner un mois :</label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                >
                    {months.map((month) => (
                        <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>
            </div>

            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                Liste des Collaborateurs - {selectedMonth}/{currentYear}
            </h2>

            {/* Liste des collaborateurs */}
            <div className="grid grid-cols-1 gap-4 mt-6">
                {collaborators.map((collab) => (
                    <motion.div
                        key={collab._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 text-left"
                    >
                        <h3 className="text-lg font-semibold text-gray-800">{collab.name}</h3>

                        {/* Liste des projets et jours travaillés */}
                        <div className="mt-3">
                            {collab.projects.length > 0 ? (
                                collab.projects.map((project) => {
                                    const key = `${collab._id}-${project.projectId?._id}-${selectedMonth}-${currentYear}`;
                                    return (
                                        <div
                                            key={project.projectId?._id || Math.random()}
                                            className="flex justify-between items-center bg-blue-50 p-2 rounded-md shadow-sm mb-2"
                                        >
                                            {/* Nom du projet */}
                                            <span className="text-blue-700 font-medium">
                                                {project.projectId?.name ?? "Projet inconnu"}
                                            </span>

                                            {/* Champ de saisie du nombre de jours travaillés */}
                                            <input
                                                type="number"
                                                value={daysWorked[key] ?? project.daysWorked ?? 0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        collab._id,
                                                        project.projectId?._id!,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="border border-gray-300 p-2 rounded-md w-20 text-center"
                                                min="0"
                                            />

                                            {/* Bouton Enregistrer individuel */}
                                            <button
                                                onClick={() =>
                                                    handleUpdateDays(collab._id, project.projectId?._id!)
                                                }
                                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                                            >
                                                Enregistrer
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-gray-500 text-sm">Aucun projet attribué</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bouton Tout enregistrer */}
            <button
                onClick={handleSaveAll}
                disabled={Object.keys(daysWorked).length === 0} // Désactivé si rien n'a été modifié
                className={`w-full mt-4 p-3 rounded-md transition ${Object.keys(daysWorked).length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
            >
                Tout enregistrer
            </button>

        </div>
    );
}

export default CollaboratorList;
