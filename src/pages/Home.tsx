import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { exportToStyledExcel } from "../components/excelExport";

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

const monthColors: { [key: string]: { bg: string; text: string; tableHeader: string } } = {
  "01": { bg: "bg-red-200", text: "text-red-800", tableHeader: "bg-red-500" },
  "02": { bg: "bg-yellow-200", text: "text-yellow-800", tableHeader: "bg-yellow-500" },
  "03": { bg: "bg-green-200", text: "text-green-800", tableHeader: "bg-green-500" },
  "04": { bg: "bg-blue-200", text: "text-blue-800", tableHeader: "bg-blue-500" },
  "05": { bg: "bg-purple-200", text: "text-purple-800", tableHeader: "bg-purple-500" },
  "06": { bg: "bg-pink-200", text: "text-pink-800", tableHeader: "bg-pink-500" },
  "07": { bg: "bg-orange-200", text: "text-orange-800", tableHeader: "bg-orange-500" },
  "08": { bg: "bg-gray-200", text: "text-gray-800", tableHeader: "bg-gray-500" },
  "09": { bg: "bg-indigo-200", text: "text-indigo-800", tableHeader: "bg-indigo-500" },
  "10": { bg: "bg-teal-200", text: "text-teal-800", tableHeader: "bg-teal-500" },
  "11": { bg: "bg-lime-200", text: "text-lime-800", tableHeader: "bg-lime-500" },
  "12": { bg: "bg-cyan-200", text: "text-cyan-800", tableHeader: "bg-cyan-500" },
};

function Home() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(5, 7));
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const selectedMonthName = months.find((m) => m.value === selectedMonth)?.label || "Mois inconnu";
  const currentColors = monthColors[selectedMonth] || monthColors["01"];

  const exportToExcel = () => {
    const worksheetData = collaborators.map((collab) => {
      const totalDaysWorked = collab.projects.reduce((acc, project) => acc + project.daysWorked, 0);
      const tjmTotal = collab.tjm ? totalDaysWorked * collab.tjm : 0;

      return {
        Nom: collab.name,
        Projets: collab.projects.map((p) => p.projectId?.name).join(", ") || "Aucun projet",
        "Jours Travaillés par Projet": collab.projects.map((p) => `${p.projectId?.name}: ${p.daysWorked} jours`).join(", ") || "Aucun",
        "TJM par Projet (€)": collab.projects.map((p) => (collab.tjm ? `${(p.daysWorked * collab.tjm).toLocaleString()} €` : "Non défini")).join(", ") || "Non défini",
        "Total Jours Travaillés": totalDaysWorked,
        "TJM Total (€)": tjmTotal ? `${tjmTotal.toLocaleString()} €` : "Non défini",
        Commentaires: collab.comments || "Aucun commentaire",
        Mois: selectedMonth,
      };
    });

    exportToStyledExcel(worksheetData, `Suivi_Collaborateurs_${selectedMonthName}_${selectedYear}`);
  };

  useEffect(() => {
    fetch(`http://localhost:5000/collaborators?month=${selectedMonth}&year=${selectedYear}`)
      .then((response) => response.json())
      .then((data) => setCollaborators(data))
      .catch((error) => console.error("Erreur lors du chargement :", error));
  }, [selectedMonth, selectedYear]);

  const saveComment = async (id: string) => {
    if (!commentText[id]?.trim()) {
      setEditingCommentId(null);
      return;
    }

    try {
      await fetch(`http://localhost:5000/collaborators/${id}/comment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: commentText[id],
          month: selectedMonth,
          year: selectedYear
        }),
      });

      setCollaborators((prev) =>
        prev.map((collab) =>
          collab._id === id ? { ...collab, comments: commentText[id] } : collab
        )
      );
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du commentaire :", error);
    } finally {
      setEditingCommentId(null);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${currentColors.bg}`}>
      <h1 className={`text-3xl font-bold ${currentColors.text} mb-6`}>
        Suivi du travail - {selectedMonthName} {selectedYear}
      </h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="font-medium text-gray-700">📅 Sélectionner un mois :</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 p-2 rounded-md shadow-md bg-white"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border border-gray-300 p-2 rounded-md shadow-md bg-white"
        >
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          📥 Exporter en Excel
        </button>
      </div>

      <div className="w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className={`${currentColors.tableHeader} text-white`}>
              <th className="p-4 border">Nom</th>
              <th className="p-4 border">Projets</th>
              <th className="p-4 border text-center">Jours Travaillés</th>
              <th className="p-4 border text-center">TJM par Projet (€)</th>
              <th className="p-4 border text-center">TJM Total (€)</th>
              <th className="p-4 border">Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.map((collab) => (
              <tr key={collab._id} className="border">
                <td className="p-4 border font-medium">
                  <Link to={`/collaborateur/${collab._id}`} className="text-blue-600 hover:underline">
                    {collab.name}
                  </Link>
                </td>
                <td className="p-4 border">
                  {collab.projects.map((p) => (
                    <div key={p.projectId._id}>{p.projectId.name}</div>
                  ))}
                </td>
                <td className="p-4 border text-center">
                  {collab.projects.map((p) => (
                    <div key={p.projectId._id}>{p.daysWorked} jours</div>
                  ))}
                </td>
                <td className="p-4 border text-center">
                  {collab.projects.map((p) => (
                    <div key={p.projectId._id}>
                      {collab.tjm ? `${(p.daysWorked * collab.tjm).toLocaleString()} €` : "Non défini"}
                    </div>
                  ))}
                </td>
                <td className="p-4 border text-center font-bold">
                  {collab.tjm ? `${(collab.tjm * collab.projects.reduce((acc, p) => acc + p.daysWorked, 0)).toLocaleString()} €` : "Non défini"}
                </td>
                <td className="p-4 border text-gray-500 italic">
                  {editingCommentId === collab._id ? (
                    <input
                      type="text"
                      value={commentText[collab._id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [collab._id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveComment(collab._id);
                        }
                      }}
                      onBlur={() => saveComment(collab._id)}
                      className="w-full border p-1 rounded-md"
                      autoFocus
                    />
                  ) : (
                    <span onDoubleClick={() => setEditingCommentId(collab._id)}>
                      {collab.comments || "Double-cliquez pour ajouter"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;