import { Application } from "@/types";
import DocumentChecklist from "./DocumentChecklist";
import StatusTimeline from "./StatusTimeline";
import {
  X,
  GraduationCap,
  DollarSign,
  FileText,
  Wallet,
  Calendar,
  Globe,
  ExternalLink,
} from "lucide-react";

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}

export default function ApplicationDetailModal({
  application,
  onClose,
  onEdit,
}: ApplicationDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {application.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              {application.type === "Université" ? (
                <GraduationCap className="w-4 h-4" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              {application.type} • {application.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations Générales
              </h3>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <p className="text-base text-gray-900">{application.status}</p>
              </div>
              {application.program && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Programme</p>
                  <p className="text-base text-gray-900">
                    {application.program}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Localisation
                </p>
                <p className="text-base text-gray-900">
                  {application.country}
                  {application.city && `, ${application.city}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date limite</p>
                <p className="text-base text-gray-900 font-semibold">
                  {formatDate(application.deadline)}
                </p>
              </div>
              {application.submittedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date de soumission
                  </p>
                  <p className="text-base text-gray-900">
                    {formatDate(application.submittedDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Informations Financières
              </h3>
              {application.amount ? (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Montant de la bourse
                  </p>
                  <p className="text-2xl text-green-600 font-bold">
                    {application.amount.toLocaleString("fr-FR")} €
                  </p>
                </div>
              ) : null}
              {application.applicationFee ? (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Frais de candidature
                  </p>
                  <p className="text-lg text-red-600 font-semibold">
                    {application.applicationFee.toLocaleString("fr-FR")} €
                  </p>
                </div>
              ) : null}
              {application.website && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Site web</p>
                  <a
                    href={application.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
                  >
                    Visiter le site <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
                📄 Documents Requis
              </h3>
              <DocumentChecklist
                documents={application.documents}
                onUpdate={() => {}}
                readOnly={true}
              />
            </div>
          )}

          {/* Historique */}
          {application.statusHistory &&
            application.statusHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">
                  📅 Historique des Statuts
                </h3>
                <StatusTimeline history={application.statusHistory} />
              </div>
            )}

          {/* Notes */}
          {application.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {application.notes}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          <div className="text-xs text-gray-500 pt-4 border-t flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Créée le {formatDate(application.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Modifiée le {formatDate(application.updatedAt)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
