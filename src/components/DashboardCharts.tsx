"use client";

import { Application } from "@/types";
import { DollarSign, Globe, PieChart } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie } from "react-chartjs-2";

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
  const statusCounts = {
    "En cours": applications.filter((app) => app.status === "En cours").length,
    Soumise: applications.filter((app) => app.status === "Soumise").length,
    "En révision": applications.filter((app) => app.status === "En révision")
      .length,
    Acceptée: applications.filter((app) => app.status === "Acceptée").length,
    Refusée: applications.filter((app) => app.status === "Refusée").length,
    "En attente": applications.filter((app) => app.status === "En attente")
      .length,
  };

  const statusColors = {
    "En cours": "#3b82f6",
    Soumise: "#8b5cf6",
    "En révision": "#f59e0b",
    Acceptée: "#10b981",
    Refusée: "#ef4444",
    "En attente": "#6b7280",
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Répartition des Statuts
        </h3>
        <div className="flex flex-col items-center">
          {total > 0 ? (
            <>
              <div className="w-48 h-48 mb-4">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="w-full space-y-2">
                {statusData.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-700">{item.status}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune candidature</p>
          )}
        </div>
      </div>

      {/* Statistiques financières */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Statistiques Financières
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm font-medium text-gray-700">
              Bourses potentielles
            </span>
            <span className="text-lg font-bold text-green-600">
              {potentialScholarshipAmount.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm font-medium text-gray-700">
              Total bourses demandées
            </span>
            <span className="text-lg font-bold text-blue-600">
              {totalScholarshipAmount.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded">
            <span className="text-sm font-medium text-gray-700">
              Frais de candidature
            </span>
            <span className="text-lg font-bold text-red-600">
              {totalFees.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
            <span className="text-sm font-medium text-gray-700">
              Taux d&apos;acceptation
            </span>
            <span className="text-lg font-bold text-purple-600">
              {acceptanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Pays */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Top 5 Pays
        </h3>
        <div className="space-y-3">
          {topCountries.length > 0 ? (
            topCountries.map(([country, count]) => (
              <div key={country}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {country}
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {count} candidature{count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(count / maxCountryCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Aucune candidature pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
