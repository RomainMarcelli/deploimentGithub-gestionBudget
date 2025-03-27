import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Project {
    _id: string;
    name: string;
}

interface Collaborator {
    _id: string;
    name: string;
    month: string;
    tjm?: number;
    projects: {
        projectId: Project;
        daysWorked: number;
    }[];
    comments?: string;
}

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

function CollaborateurDetail() {
    const { id } = useParams<{ id: string }>();
    const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(5, 7));
    const [error, setError] = useState<string | null>(null);
    const [commentText, setCommentText] = useState<string>("");
    const [editingComment, setEditingComment] = useState<boolean>(false);

    useEffect(() => {
        const currentYear = new Date().getFullYear();

        fetch(`http://localhost:5000/collaborators/${id}?month=${selectedMonth}&year=${currentYear}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Collaborateur non trouvé");
                }
                return response.json();
            })
            .then((data) => {
                setCollaborator(data);
                setCommentText(data.comments || "");
            })
            .catch((error) => {
                console.error("Erreur de chargement :", error);
                setError("Ce collaborateur n'existe pas.");
            });
    }, [id, selectedMonth]);

    const saveComment = async () => {
        if (!collaborator) return;
      
        try {
          await fetch(`http://localhost:5000/collaborators/${collaborator._id}/comment`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comments: commentText,
              month: selectedMonth,
              year: new Date().getFullYear() // ou stocke selectedYear dans le state si tu veux le gérer manuellement
            }),
          });
      
          // Mise à jour locale du commentaire affiché
          setCollaborator((prev) => (prev ? { ...prev, comments: commentText } : prev));
          setEditingComment(false);
        } catch (error) {
          console.error("Erreur lors de la mise à jour du commentaire :", error);
        }
      };      

    if (error) {
        return <p className="text-center text-red-600 font-semibold">{error}</p>;
    }

    if (!collaborator) {
        return <p className="text-center text-gray-500 font-medium">Chargement...</p>;
    }

    const totalDaysWorked = collaborator.projects.reduce((acc, project) => acc + project.daysWorked, 0);
    const tjmTotal = collaborator.tjm ? totalDaysWorked * collaborator.tjm : 0;

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-blue-600 text-center mb-4">{collaborator.name}</h1>

                {/* Sélection du mois */}
                <div className="mt-6 mb-6">
                    <label className="block text-gray-700 font-medium">📅 Voir les projets d'un autre mois :</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 p-2 rounded-md shadow-md bg-white mt-2"
                    >
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-4 rounded-md shadow">
                        <p className="text-gray-700 font-medium">📅 Mois:</p>
                        <p className="text-lg font-semibold">{months.find(m => m.value === selectedMonth)?.label}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-md shadow">
                        <p className="text-gray-700 font-medium">💰 TJM:</p>
                        <p className="text-lg font-semibold">{collaborator.tjm ? `${collaborator.tjm} €` : "Non défini"}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-md shadow">
                        <p className="text-gray-700 font-medium">📊 Jours travaillés:</p>
                        <p className="text-lg font-semibold">{totalDaysWorked} jours</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-md shadow">
                        <p className="text-gray-700 font-medium">💶 Coût Total</p>
                        <p className="text-lg font-semibold">
                            {collaborator.tjm ? `${tjmTotal.toLocaleString()} €` : "Non défini"}
                        </p>
                    </div>
                </div>

                {/* Ajout/Modification du commentaire */}
                <div className="mt-6 bg-yellow-100 p-4 rounded-md shadow">
                    <p className="text-gray-700 font-medium">📝 Commentaires:</p>
                    {editingComment ? (
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onBlur={saveComment}
                            className="w-full border border-gray-300 p-2 rounded-md mt-2"
                            autoFocus
                        />
                    ) : (
                        <p
                            className="text-gray-600 italic cursor-pointer"
                            onDoubleClick={() => setEditingComment(true)}
                        >
                            {collaborator.comments || "Double-cliquez pour ajouter un commentaire"}
                        </p>
                    )}
                </div>

                {/* Affichage des projets */}
                <h2 className="mt-6 text-2xl font-semibold text-gray-800">📂 Projets en {months.find(m => m.value === selectedMonth)?.label}</h2>
                <div className="bg-white shadow-md p-4 rounded-lg mt-2">
                    {collaborator.projects.length > 0 ? (
                        <ul className="space-y-2">
                            {collaborator.projects.map((project) => (
                                <li key={project.projectId._id} className="flex justify-between bg-gray-50 p-2 rounded-md shadow">
                                    <span className="text-blue-700 font-medium">{project.projectId.name}</span>
                                    <span className="font-bold">{project.daysWorked} jours</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center">Aucun projet attribué ce mois-ci</p>
                    )}
                </div>

                <div className="flex justify-center mt-6">
                    <Link to="/" className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition shadow-md">
                        ⬅ Retour
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CollaborateurDetail;