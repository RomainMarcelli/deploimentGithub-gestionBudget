import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Collaborator {
    _id: string;
    name: string;
    tjm?: number; // ✅ Nouveau champ pour le TJM
}

function TJM() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [selectedCollaborator, setSelectedCollaborator] = useState<string>("");
    const [tjm, setTjm] = useState<number | "">("");

    useEffect(() => {
        fetchCollaborators();
    }, []);

    const fetchCollaborators = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/tjm");
            if (!response.ok) throw new Error("Erreur lors de la récupération des collaborateurs");
            const data = await response.json();
            setCollaborators(data);
        } catch (error) {
            console.error("Erreur lors du chargement des collaborateurs :", error);
        }
    };

    const handleUpdateTjm = async () => {
        if (!selectedCollaborator || tjm === "") return;

        try {
            const response = await fetch(`http://localhost:5000/api/tjm/${selectedCollaborator}/update-tjm`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tjm }),
            });

            if (response.ok) {
                toast.success("✅ TJM mis à jour avec succès !");
                fetchCollaborators(); // 🔥 Met à jour la liste
            } else {
                toast.error("❌ Échec de la mise à jour du TJM.");
            }
        } catch (error) {
            toast.error("❌ Erreur de connexion au serveur !");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

            <h1 className="text-3xl font-bold text-blue-600 mb-4">Gérer le TJM des Collaborateurs</h1>

            {/* Sélection du collaborateur */}
            <select
                value={selectedCollaborator}
                onChange={(e) => setSelectedCollaborator(e.target.value)}
                className="w-full max-w-lg border border-gray-300 p-3 rounded-md mb-4"
            >
                <option value="">Sélectionner un collaborateur</option>
                {collaborators.map((collab) => (
                    <option key={collab._id} value={collab._id}>
                        {collab.name}
                    </option>
                ))}
            </select>

            {/* Saisie du TJM */}
            <input
                type="number"
                placeholder="TJM (€)"
                value={tjm}
                onChange={(e) => setTjm(Number(e.target.value))}
                className="w-full max-w-lg border border-gray-300 p-3 rounded-md mb-4"
            />

            {/* Bouton de sauvegarde */}
            <button
                onClick={handleUpdateTjm}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
                Enregistrer TJM
            </button>

            {/* Liste des collaborateurs avec TJM */}
            <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Liste des Collaborateurs</h2>
            <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-4">
                {collaborators.map((collab) => (
                    <div key={collab._id} className="flex justify-between p-2 border-b">
                        <span>{collab.name}</span>
                        <span className="font-semibold">{collab.tjm ? `${collab.tjm} €` : "Non défini"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TJM;