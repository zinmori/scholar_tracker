import { Application } from "@/types";
import { BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";

interface StatsCardsProps {
  applications: Application[];
}

export default function StatsCards({ applications }: StatsCardsProps) {
  const total = applications.length;
  const accepted = applications.filter(
    (app) => app.status === "Acceptée"
  ).length;
  const pending = applications.filter(
    (app) =>
      app.status === "En cours" ||
      app.status === "Soumise" ||
      app.status === "En révision"
  ).length;
  const rejected = applications.filter(
    (app) => app.status === "Refusée"
  ).length;

  const stats = [
    {
      label: "Total",
      value: total,
      color: "#3b82f6",
      icon: BarChart3,
    },
    {
      label: "Acceptées",
      value: accepted,
      color: "#10b981",
      icon: CheckCircle,
    },
    {
      label: "En cours",
      value: pending,
      color: "#eab308",
      icon: Clock,
    },
    {
      label: "Refusées",
      value: rejected,
      color: "#ef4444",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <Icon className="w-10 h-10" style={{ color: stat.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
