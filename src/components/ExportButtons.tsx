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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 30px; color: #18181b; background-color: #ffffff; }
            h1 { font-size: 20px; font-weight: 600; margin: 0 0 4px 0; color: #09090b; }
            p { font-size: 13px; color: #71717a; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
            th, td { border-bottom: 1px solid #e4e4e7; padding: 10px 12px; text-align: left; }
            th { background-color: #f4f4f5; color: #27272a; font-weight: 600; }
            tr:nth-child(even) { background-color: #fafafa; }
            .header { margin-bottom: 24px; border-bottom: 1px solid #e4e4e7; padding-bottom: 16px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
            .stat { padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px; text-align: left; }
            .stat-value { font-size: 20px; font-weight: 600; color: #09090b; }
            .stat-label { font-size: 11px; font-weight: 500; text-transform: uppercase; tracking-wider; color: #71717a; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Scholar Tracker - Rapport de Candidatures</h1>
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
                  <td>${app.type}</td>
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
        className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1.5 shadow-xs"
      >
        <FileDown className="w-3.5 h-3.5 text-zinc-500" />
        Export CSV
      </button>
      <button
        onClick={exportToJSON}
        className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1.5 shadow-xs"
      >
        <FileJson className="w-3.5 h-3.5 text-zinc-500" />
        Backup JSON
      </button>
      <button
        onClick={printReport}
        className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1.5 shadow-xs"
      >
        <Printer className="w-3.5 h-3.5 text-zinc-500" />
        Imprimer PDF
      </button>
    </div>
  );
}
