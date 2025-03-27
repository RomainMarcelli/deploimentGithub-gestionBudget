import { useState, useEffect } from "react";

interface Project {
  _id: string;
  name: string;
  totalCost: number;
}

interface RecapData {
  month: string;
  year: number;
  projects: Project[];
  totalMonthCost: number;
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

function Recap() {
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [totalOverallCost, setTotalOverallCost] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "current">("all");

  const currentMonth = new Date().toISOString().slice(5, 7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/projects/recap?year=${selectedYear}`);
        const data = await res.json();
        console.log("✅ Données récupérées:", data);

        const formattedData: RecapData[] = data.map((item: any) => ({
          month: item.month,
          year: item.year,
          projects: item.projects,
          totalMonthCost: item.totalMonthCost,
        }));

        setRecapData(formattedData);

        const total = formattedData.reduce((acc, cur) => acc + (cur.totalMonthCost || 0), 0);
        setTotalOverallCost(total);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, [selectedYear]);

  const colors = [
    "bg-red-100 text-red-800 border-red-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-pink-100 text-pink-800 border-pink-300",
  ];

  const filteredMonths = months.filter((month) => {
    const exists = recapData.some(
      (item) => item.month === month.value && item.year === selectedYear
    );
    if (!exists) return false;
    if (filter === "current") return month.value === currentMonth;
    return true;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">📊 Récapitulatif des Dépenses</h1>
      <p className="text-gray-600 mb-6">Visualisez toutes vos dépenses ici.</p>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2 font-medium text-gray-700">📆 Sélectionner une année :</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md shadow-md bg-white"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-gray-700">📂 Affichage :</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "current")}
            className="border border-gray-300 p-2 rounded-md shadow-md bg-white"
          >
            <option value="all">Tous les mois</option>
            <option value="current">Mois courant uniquement</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4 border">📅 Mois</th>
              <th className="p-4 border">📂 Projets</th>
              <th className="p-4 border text-center">💰 Coût Total par Projet (€)</th>
              <th className="p-4 border text-center">📊 Coût Total du Mois (€)</th>
            </tr>
          </thead>
          <tbody>
            {filteredMonths.map((month) => {
              const monthData = recapData.find(
                (item) => item.month === month.value && item.year === selectedYear
              );

              return (
                <tr key={`${month.value}-${selectedYear}`} className="border">
                  <td className="p-4 border font-medium text-center">
                    {month.label} {selectedYear}
                  </td>
                  <td className="p-4 border">
                    {monthData && monthData.projects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {monthData.projects.map((project, index) => (
                          <span
                            key={project._id}
                            className={`px-3 py-1 rounded-full border text-sm font-medium ${colors[index % colors.length]}`}
                          >
                            {project.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucun projet</span>
                    )}
                  </td>
                  <td className="p-4 border text-center">
                    {monthData && monthData.projects.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {monthData.projects.map((project, index) => (
                          <span
                            key={project._id}
                            className={`px-3 py-1 rounded-md font-medium ${colors[index % colors.length]}`}
                          >
                            {project.totalCost.toLocaleString()} €
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4 border text-center font-bold">
                    {monthData ? `${monthData.totalMonthCost.toLocaleString()} €` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200">
              <td colSpan={3} className="p-4 border text-right font-semibold">💵 Coût Total Global :</td>
              <td className="p-4 border text-center font-bold text-green-600">
                {totalOverallCost.toLocaleString()} €
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Recap;