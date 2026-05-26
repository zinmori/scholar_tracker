"use client";

import { Application, ApplicationStatus } from "@/types";
import {
  Calendar,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

interface KanbanBoardProps {
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onViewDetails: (app: Application) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

const COLUMNS: { label: string; status: ApplicationStatus; colorClass: string; bgHeaderClass: string }[] = [
  {
    label: "En cours",
    status: "En cours",
    colorClass: "border-slate-200 text-slate-700 bg-slate-100/50",
    bgHeaderClass: "bg-slate-100 text-slate-700",
  },
  {
    label: "En attente",
    status: "En attente",
    colorClass: "border-zinc-300 text-zinc-650 bg-zinc-50",
    bgHeaderClass: "bg-zinc-100 text-zinc-600",
  },
  {
    label: "Soumise",
    status: "Soumise",
    colorClass: "border-blue-200 text-blue-700 bg-blue-50/20",
    bgHeaderClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "En révision",
    status: "En révision",
    colorClass: "border-amber-200 text-amber-700 bg-amber-50/20",
    bgHeaderClass: "bg-amber-100 text-amber-700",
  },
  {
    label: "Acceptée",
    status: "Acceptée",
    colorClass: "border-emerald-250 text-emerald-750 bg-emerald-50/20",
    bgHeaderClass: "bg-emerald-500 text-white shadow-md shadow-emerald-100",
  },
  {
    label: "Refusée",
    status: "Refusée",
    colorClass: "border-rose-250 text-rose-750 bg-rose-50/20",
    bgHeaderClass: "bg-rose-500 text-white shadow-md shadow-rose-100",
  },
  {
    label: "Expirée",
    status: "Expirée",
    colorClass: "border-rose-300 text-rose-700 bg-rose-50/20",
    bgHeaderClass: "bg-rose-500 text-white",
  },
];

export default function KanbanBoard({
  applications,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
}: KanbanBoardProps) {
  const getDaysUntilDeadline = (deadlineStr: string) => {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const moveLeft = (app: Application) => {
    const currentIndex = COLUMNS.findIndex((c) => c.status === app.status);
    if (currentIndex > 0) {
      onStatusChange(app.id, COLUMNS[currentIndex - 1].status);
    }
  };

  const moveRight = (app: Application) => {
    const currentIndex = COLUMNS.findIndex((c) => c.status === app.status);
    if (currentIndex < COLUMNS.length - 1) {
      onStatusChange(app.id, COLUMNS[currentIndex + 1].status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-thin">
      {COLUMNS.map((col) => {
        const colApps = col.status === "Expirée"
          ? applications.filter(
              (app) =>
                (app.status === "En cours" || app.status === "En attente") &&
                new Date(app.deadline).getTime() - new Date().getTime() < 0
            )
          : applications.filter((app) => {
              if (app.status !== col.status) return false;
              // For En cours and En attente, hide overdue items (they belong to Expirée)
              if (col.status === "En cours" || col.status === "En attente") {
                return new Date(app.deadline).getTime() - new Date().getTime() >= 0;
              }
              return true;
            });
        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-80 bg-slate-50/60 rounded-2xl border border-slate-200/60 flex flex-col max-h-[70vh] overflow-hidden"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${col.bgHeaderClass}`}>
                  {col.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {colApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="p-3 flex-grow overflow-y-auto space-y-3 scrollbar-thin">
              {colApps.length === 0 ? (
                <div className="py-12 text-center text-[11px] font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                  Aucune candidature
                </div>
              ) : (
                colApps.map((app) => {
                  const daysLeft = getDaysUntilDeadline(app.deadline);
                  const isUrgent =
                    daysLeft >= 0 &&
                    daysLeft <= 7 &&
                    (app.status === "En cours" || app.status === "En attente");
                  const isOverdue =
                    daysLeft < 0 &&
                    (app.status === "En cours" || app.status === "En attente");

                  const completedDocs = app.documents?.filter((d) => d.completed).length || 0;
                  const totalDocs = app.documents?.length || 0;

                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between ${
                        isUrgent
                          ? "border-amber-300 bg-amber-50/5"
                          : isOverdue
                          ? "border-rose-300 bg-rose-50/5"
                          : "border-slate-200/80"
                      }`}
                    >
                      <div>
                        {/* Urgent Alert */}
                        {isUrgent && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-55 px-2 py-0.5 rounded inline-flex items-center gap-0.5 mb-2 uppercase tracking-wide">
                            <AlertTriangle className="w-2.5 h-2.5" /> Urgent ({daysLeft}j)
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-55 px-2 py-0.5 rounded inline-flex items-center gap-0.5 mb-2 uppercase tracking-wide">
                            <AlertTriangle className="w-2.5 h-2.5" /> Expiré
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-650 transition-colors line-clamp-2 leading-tight">
                            {app.name}
                          </h4>
                          <span className="flex-shrink-0 text-[10px] text-slate-400">
                            {app.type === "Université" ? (
                              <GraduationCap className="w-3.5 h-3.5" />
                            ) : (
                              <DollarSign className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>

                        {app.program && (
                          <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">
                            {app.program}
                          </p>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{app.country}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className={`font-semibold ${isUrgent ? "text-amber-700" : isOverdue ? "text-rose-700" : ""}`}>
                              {new Date(app.deadline).toLocaleDateString("fr-FR")}
                            </span>
                          </p>
                        </div>

                        {totalDocs > 0 && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <div className="w-16 bg-slate-100 rounded-full h-1">
                              <div
                                className="bg-indigo-600 h-1 rounded-full"
                                style={{ width: `${(completedDocs / totalDocs) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">
                              Docs: {completedDocs}/{totalDocs}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onViewDetails(app)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Détails"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onEdit(app)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDelete(app.id)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Column Navigation Controls */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveLeft(app)}
                            disabled={COLUMNS.findIndex((c) => c.status === app.status) === 0}
                            className="p-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-md transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-650" />
                          </button>
                          <button
                            onClick={() => moveRight(app)}
                            disabled={COLUMNS.findIndex((c) => c.status === app.status) === COLUMNS.length - 1}
                            className="p-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-md transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-slate-655" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
