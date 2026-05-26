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
  const pending = applications.filter(app => {
    const isOverdue = (app.status === "En cours" || app.status === "En attente") && new Date(app.deadline).getTime() - new Date().getTime() < 0;
    return (app.status === "En cours" || app.status === "En attente" || app.status === "Soumise" || app.status === "En révision") && !isOverdue;
  }).length;
  const rejected = applications.filter(
    (app) => app.status === "Refusée"
  ).length;

  const stats = [
    {
      label: "Total",
      value: total,
      bgClass: "bg-zinc-50 text-zinc-500 border border-zinc-200/50",
      icon: BarChart3,
    },
    {
      label: "Acceptées",
      value: accepted,
      bgClass: "bg-emerald-50 text-emerald-600 border border-emerald-100/60",
      icon: CheckCircle,
    },
    {
      label: "En cours",
      value: pending,
      bgClass: "bg-amber-50 text-amber-600 border border-amber-100/60",
      icon: Clock,
    },
    {
      label: "Refusées",
      value: rejected,
      bgClass: "bg-rose-50 text-rose-600 border border-rose-100/60",
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
            className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-zinc-950 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
