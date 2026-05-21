import { Application } from "@/types";
import {
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  DollarSign,
  AlertCircle,
  User,
} from "lucide-react";

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onViewDetails: (app: Application) => void;
  showOwner?: boolean; // Pour afficher le propriétaire (admin)
}

const statusColors: Record<string, string> = {
  "En cours": "bg-zinc-50 text-zinc-700 border border-zinc-200",
  Soumise: "bg-zinc-100 text-zinc-800 border border-zinc-200",
  "En révision": "bg-amber-50 text-amber-700 border border-amber-100",
  Acceptée: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Refusée: "bg-rose-50 text-rose-700 border border-rose-100",
  "En attente": "bg-zinc-50 text-zinc-500 border border-zinc-200/60",
};

export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onViewDetails,
  showOwner = false,
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getDaysUntilDeadline = () => {
    const now = new Date();
    const deadline = new Date(application.deadline);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline();
  const isUrgent =
    daysLeft >= 0 &&
    daysLeft <= 7 &&
    (application.status === "En cours" || application.status === "En attente");
  const isOverdue =
    daysLeft < 0 &&
    (application.status === "En cours" || application.status === "En attente");

  const completedDocs =
    application.documents?.filter((d) => d.completed).length || 0;
  const totalDocs = application.documents?.length || 0;

  return (
    <div
      className={`bg-white rounded-xl border p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isUrgent
          ? "border-amber-300 shadow-xs"
          : isOverdue
          ? "border-rose-300 shadow-xs"
          : "border-zinc-200/80 shadow-xs"
      }`}
    >
      <div>
        {/* Badge urgent/expiré */}
        {isUrgent && (
          <div className="mb-3">
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100/80 text-[10px] font-semibold uppercase tracking-wider rounded inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Urgent - {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant
              {daysLeft > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {isOverdue && (
          <div className="mb-3">
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100/80 text-[10px] font-semibold uppercase tracking-wider rounded inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Date dépassée
            </span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 mb-1 leading-snug">
              {application.name}
            </h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              {application.type === "Université" ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <DollarSign className="w-3.5 h-3.5" />
              )}
              {application.type}
            </p>
            {showOwner && application.user && (
              <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1 font-medium">
                <User className="w-3 h-3" />
                {application.user.name}
              </p>
            )}
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              statusColors[application.status] || "bg-zinc-50 text-zinc-700 border-zinc-200"
            }`}
          >
            {application.status}
          </span>
        </div>

        <div className="space-y-2 mb-4 border-t border-zinc-100 pt-3">
          {application.program && (
            <p className="text-xs text-zinc-600">
              <span className="font-medium text-zinc-400 mr-1">Programme:</span>{" "}
              {application.program}
            </p>
          )}
          <p className="text-xs text-zinc-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-400">Pays:</span> {application.country}
            {application.city && `, ${application.city}`}
          </p>
          <p className="text-xs text-zinc-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-400">Date limite:</span>{" "}
            <span className={isUrgent ? "text-amber-700 font-semibold" : isOverdue ? "text-rose-700 font-semibold" : ""}>
              {formatDate(application.deadline)}
            </span>
          </p>
          {application.amount ? (
            <p className="text-xs text-zinc-600 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium text-zinc-400">Montant:</span>{" "}
              {application.amount.toLocaleString("fr-FR")} €
            </p>
          ) : null}
          {application.applicationFee ? (
            <p className="text-xs text-zinc-600 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium text-zinc-400">Frais:</span>{" "}
              {application.applicationFee.toLocaleString("fr-FR")} €
            </p>
          ) : null}
          {totalDocs > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-medium text-zinc-400">
                Documents:
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                <div className="w-24 bg-zinc-100 rounded-full h-1.5">
                  <div
                    className="bg-zinc-950 h-1.5 rounded-full transition-all"
                    style={{ width: `${(completedDocs / totalDocs) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {completedDocs}/{totalDocs}
                </span>
              </div>
            </div>
          )}
        </div>

        {application.notes && (
          <div className="mb-4 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100">
            <p className="text-xs text-zinc-500 italic leading-relaxed line-clamp-2">
              "{application.notes}"
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-zinc-100">
        <button
          onClick={() => onViewDetails(application)}
          className="flex-1 px-3 py-2 bg-white text-zinc-800 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          Détails
        </button>
        <button
          onClick={() => onEdit(application)}
          className="flex-1 px-3 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(application.id)}
          className="px-3 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50/50 transition-colors inline-flex items-center justify-center text-xs font-medium"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
