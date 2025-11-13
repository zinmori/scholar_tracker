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
  "En cours": "bg-blue-100 text-blue-800",
  Soumise: "bg-purple-100 text-purple-800",
  "En révision": "bg-yellow-100 text-yellow-800",
  Acceptée: "bg-green-100 text-green-800",
  Refusée: "bg-red-100 text-red-800",
  "En attente": "bg-gray-100 text-gray-800",
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
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
        isUrgent
          ? "border-2 border-orange-400"
          : isOverdue
          ? "border-2 border-red-400"
          : ""
      }`}
    >
      {/* Badge urgent/expiré */}
      {isUrgent && (
        <div className="mb-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Urgent - {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant
            {daysLeft > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {isOverdue && (
        <div className="mb-2">
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Date dépassée
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {application.name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            {application.type === "Université" ? (
              <GraduationCap className="w-4 h-4" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )}
            {application.type}
          </p>
          {showOwner && application.user && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {application.user.name}
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[application.status]
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {application.program && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Programme:</span>{" "}
            {application.program}
          </p>
        )}
        <p className="text-sm text-gray-700 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Pays:</span> {application.country}
          {application.city && `, ${application.city}`}
        </p>
        <p
          className={`text-sm flex items-center gap-1 ${
            isUrgent || isOverdue
              ? "font-bold text-orange-700"
              : "text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Date limite:</span>{" "}
          {formatDate(application.deadline)}
        </p>
        {application.amount ? (
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Montant:</span>{" "}
            {application.amount.toLocaleString("fr-FR")} €
          </p>
        ) : null}
        {application.applicationFee ? (
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="font-medium">Frais:</span>{" "}
            {application.applicationFee.toLocaleString("fr-FR")} €
          </p>
        ) : null}
        {totalDocs > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Documents:
            </span>
            <div className="flex items-center gap-1">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(completedDocs / totalDocs) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">
                {completedDocs}/{totalDocs}
              </span>
            </div>
          </div>
        )}
      </div>

      {application.notes && (
        <p className="text-sm text-gray-600 mb-4 italic">{application.notes}</p>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(application)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>
        <button
          onClick={() => onEdit(application)}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(application.id)}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
