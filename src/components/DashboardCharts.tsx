"use client";

import { Application } from "@/types";
import { DollarSign, Globe, PieChart } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardChartsProps {
  applications: Application[];
}

export default function DashboardCharts({
  applications,
}: DashboardChartsProps) {
  // Calculs pour les statistiques
  const total = applications.length;
  const accepted = applications.filter(
    (app) => app.status === "Acceptée"
  ).length;
  const acceptanceRate =
    total > 0 ? ((accepted / total) * 100).toFixed(1) : "0";

  const totalScholarshipAmount = applications
    .filter((app) => app.type === "Bourse" && app.amount)
    .reduce((sum, app) => sum + (app.amount || 0), 0);

  const potentialScholarshipAmount = applications
    .filter(
      (app) =>
        app.type === "Bourse" &&
        app.amount &&
        (app.status === "Acceptée" ||
          app.status === "En révision" ||
          app.status === "Soumise")
    )
    .reduce((sum, app) => sum + (app.amount || 0), 0);

  const totalFees = applications
    .filter((app) => app.applicationFee)
    .reduce((sum, app) => sum + (app.applicationFee || 0), 0);

  // Top pays
  const countryCounts = applications.reduce((acc, app) => {
    acc[app.country] = (acc[app.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCountryCount = Math.max(...Object.values(countryCounts), 1);

    // Données pour le camembert des statuts
  const enCoursActive = applications.filter(app =>
    app.status === "En cours" &&
    new Date(app.deadline).getTime() - Date.now() >= 0
  ).length;
  const enAttenteActive = applications.filter(app =>
    app.status === "En attente" &&
    new Date(app.deadline).getTime() - Date.now() >= 0
  ).length;
  const expired = applications.filter(app =>
    (app.status === "En cours" || app.status === "En attente") &&
    new Date(app.deadline).getTime() - Date.now() < 0
  ).length;

  const statusCounts = {
    "En cours": enCoursActive,
    Expirée: expired,
    Soumise: applications.filter((app) => app.status === "Soumise").length,
    "En révision": applications.filter((app) => app.status === "En révision").length,
    Acceptée: applications.filter((app) => app.status === "Acceptée").length,
    Refusée: applications.filter((app) => app.status === "Refusée").length,
    "En attente": enAttenteActive,
  };

  const statusColors = {
    "En cours": "#71717a", // Zinc 500
    Expirée: "#ff6b6b", // Rose accent for expired
    Soumise: "#3b82f6", // Blue 500
    "En révision": "#f59e0b", // Amber 500
    Acceptée: "#10b981", // Emerald 500
    Refusée: "#f43f5e", // Rose 500
    "En attente": "#d4d4d8", // Zinc 300
  };

  const statusData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1),
      color: statusColors[status as keyof typeof statusColors],
    }));

  // Données pour Chart.js
  const chartData = {
    labels: statusData.map((item) => item.status),
    datasets: [
      {
        data: statusData.map((item) => item.count),
        backgroundColor: statusData.map((item) => item.color),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Camembert des statuts */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-zinc-400" />
          Répartition des Statuts
        </h3>
        <div className="flex flex-col items-center">
          {total > 0 ? (
            <>
              <div className="w-44 h-44 mb-6">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="w-full space-y-2.5">
                {statusData.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-zinc-600">{item.status}</span>
                    </div>
                    <span className="font-medium text-zinc-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-zinc-400 text-center py-8 text-sm">Aucune candidature</p>
          )}
        </div>
      </div>

      {/* Statistiques financières */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-zinc-400" />
          Statistiques Financières
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Bourses potentielles
            </span>
            <span className="text-base font-bold text-zinc-900">
              {potentialScholarshipAmount.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Total bourses demandées
            </span>
            <span className="text-base font-bold text-zinc-900">
              {totalScholarshipAmount.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Frais de candidature
            </span>
            <span className="text-base font-bold text-zinc-900">
              {totalFees.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Taux d&apos;acceptation
            </span>
            <span className="text-base font-bold text-zinc-900">
              {acceptanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Pays */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-400" />
          Top 5 Pays
        </h3>
        <div className="space-y-4">
          {topCountries.length > 0 ? (
            topCountries.map(([country, count]) => (
              <div key={country}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700">
                    {country}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {count} candidature{count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                  <div
                    className="bg-zinc-900 h-1.5 rounded-full transition-all"
                    style={{ width: `${(count / maxCountryCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-400 text-center py-4 text-sm">
              Aucune candidature pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
