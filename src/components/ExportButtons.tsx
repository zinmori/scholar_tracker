import { Application } from "@/types";
import { FileDown, FileJson, Printer } from "lucide-react";

interface ExportButtonsProps {
  applications: Application[];
}

export default function ExportButtons({ applications }: ExportButtonsProps) {
  const exportToCSV = () => {
    const headers = [
      "Nom",
      "Type",
      "Programme",
      "Pays",
      "Ville",
      "Date limite",
      "Statut",
      "Date de soumission",
      "Montant",
      "Frais",
      "Site web",
      "Notes",
    ];

    const rows = applications.map((app) => [
      app.name,
      app.type,
      app.program || "",
      app.country,
      app.city || "",
      app.deadline,
      app.status,
      app.submittedDate || "",
      app.amount?.toString() || "",
      app.applicationFee?.toString() || "",
      app.website || "",
      app.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `candidatures_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(applications, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `candidatures_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport de Candidatures - Scholar Tracker</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .header { margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .stat { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .stat-label { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Scholar Tracker - Rapport de Candidatures</h1>
            <p>Généré le ${new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${applications.length}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat">
              <div class="stat-value">${
                applications.filter((a) => a.status === "Acceptée").length
              }</div>
              <div class="stat-label">Acceptées</div>
            </div>
            <div class="stat">
              <div class="stat-value">${
                applications.filter(
                  (a) =>
                    a.status === "En cours" ||
                    a.status === "Soumise" ||
                    a.status === "En révision"
                ).length
              }</div>
              <div class="stat-label">En cours</div>
            </div>
            <div class="stat">
              <div class="stat-value">${
                applications.filter((a) => a.status === "Refusée").length
              }</div>
              <div class="stat-label">Refusées</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Pays</th>
                <th>Date limite</th>
                <th>Statut</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${applications
                .map(
                  (app) => `
                <tr>
                  <td>${app.name}</td>
                  <td>${app.type === "Université" ? "🎓" : "💰"} ${
                    app.type
                  }</td>
                  <td>${app.country}${app.city ? `, ${app.city}` : ""}</td>
                  <td>${new Date(app.deadline).toLocaleDateString("fr-FR")}</td>
                  <td>${app.status}</td>
                  <td>${
                    app.amount ? `${app.amount.toLocaleString("fr-FR")} €` : "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        Export CSV
      </button>
      <button
        onClick={exportToJSON}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <FileJson className="w-4 h-4" />
        Backup JSON
      </button>
      <button
        onClick={printReport}
        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Imprimer PDF
      </button>
    </div>
  );
}
