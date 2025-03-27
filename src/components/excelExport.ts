import * as XLSX from "xlsx";

interface ExcelData {
  Nom: string;
  Projets: string;
  "Jours Travaillés par Projet": string;
  "TJM par Projet (€)": string;
  "Total Jours Travaillés": number;
  "TJM Total (€)": string;
  Commentaires: string;
  Mois: string;
}

// 🎨 Couleurs associées aux mois
const monthColors: { [key: string]: string } = {
  "01": "FFDDDD", // Janvier - Rouge clair
  "02": "FFF4CC", // Février - Jaune clair
  "03": "DFFFD6", // Mars - Vert clair
  "04": "D6EAF8", // Avril - Bleu clair
  "05": "E5CCFF", // Mai - Violet clair
  "06": "FFD6E5", // Juin - Rose clair
  "07": "FFD699", // Juillet - Orange clair
  "08": "EAEAEA", // Août - Gris clair
  "09": "D6CCFF", // Septembre - Indigo clair
  "10": "B8E2DC", // Octobre - Teal clair
  "11": "E5FFC2", // Novembre - Lime clair
  "12": "D6F5FF", // Décembre - Cyan clair
};

export const exportToStyledExcel = async (data: ExcelData[], fileName: string) => {
  try {
    // 🔥 Charger le modèle Excel depuis un fichier local
    const response = await fetch("/template.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // 📝 Sélectionner la première feuille
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // ✅ Ajouter les nouvelles données à partir de la ligne 2
    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A2", skipHeader: true });

    // 🎨 Appliquer les couleurs en fonction du mois
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const moisCell = XLSX.utils.encode_cell({ r: row, c: 7 }); // Colonne "Mois"
      const moisValue = worksheet[moisCell]?.v;
      const bgColor = monthColors[moisValue] || "FFFFFF"; // Blanc par défaut

      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: bgColor } },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    // ✅ Ajuster la largeur des colonnes
    worksheet["!cols"] = [
      { wch: 20 }, // Nom
      { wch: 40 }, // Projets
      { wch: 25 }, // Jours Travaillés par Projet
      { wch: 25 }, // TJM par Projet (€)
      { wch: 20 }, // Total Jours Travaillés
      { wch: 20 }, // TJM Total (€)
      { wch: 30 }, // Commentaires
      { wch: 10 }, // Mois
    ];

    // 📁 Générer et télécharger le fichier Excel
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("❌ Erreur lors de l'export Excel :", error);
  }
};
