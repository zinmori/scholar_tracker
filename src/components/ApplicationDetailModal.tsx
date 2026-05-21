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
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              {application.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
              {application.type === "Université" ? (
                <GraduationCap className="w-3.5 h-3.5" />
              ) : (
                <DollarSign className="w-3.5 h-3.5" />
              )}
              {application.type} • {application.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                Informations Générales
              </h3>
              <div>
                <p className="text-xs font-medium text-zinc-400">Statut</p>
                <p className="text-sm text-zinc-800 font-medium mt-0.5">{application.status}</p>
              </div>
              {application.program && (
                <div>
                  <p className="text-xs font-medium text-zinc-400">Programme</p>
                  <p className="text-sm text-zinc-800 mt-0.5">
                    {application.program}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-zinc-400 font-medium">
                  Localisation
                </p>
                <p className="text-sm text-zinc-800 mt-0.5">
                  {application.country}
                  {application.city && `, ${application.city}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">Date limite</p>
                <p className="text-sm text-zinc-950 font-semibold mt-0.5">
                  {formatDate(application.deadline)}
                </p>
              </div>
              {application.submittedDate && (
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Date de soumission
                  </p>
                  <p className="text-sm text-zinc-800 mt-0.5">
                    {formatDate(application.submittedDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-zinc-400" />
                Informations Financières
              </h3>
              {application.amount ? (
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Montant de la bourse
                  </p>
                  <p className="text-xl text-zinc-950 font-bold mt-0.5">
                    {application.amount.toLocaleString("fr-FR")} €
                  </p>
                </div>
              ) : null}
              {application.applicationFee ? (
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Frais de candidature
                  </p>
                  <p className="text-sm text-zinc-850 font-semibold mt-0.5">
                    {application.applicationFee.toLocaleString("fr-FR")} €
                  </p>
                </div>
              ) : null}
              {application.website && (
                <div>
                  <p className="text-xs font-medium text-zinc-400">Site web</p>
                  <a
                    href={application.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-900 hover:text-zinc-700 underline underline-offset-4 flex items-center gap-1 transition-colors font-medium mt-1 inline-flex"
                  >
                    Visiter le site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-3">
                Documents Requis
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
                <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-3">
                  Historique des Statuts
                </h3>
                <StatusTimeline history={application.statusHistory} />
              </div>
            )}

          {/* Notes */}
          {application.notes && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                Notes
              </h3>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap bg-zinc-50 border border-zinc-100 p-4 rounded-lg leading-relaxed">
                {application.notes}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          <div className="text-[10px] font-medium text-zinc-400 pt-4 border-t border-zinc-100 flex items-center gap-4">
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
        <div className="sticky bottom-0 bg-zinc-50 px-6 py-4 border-t border-zinc-100 flex gap-3 z-10">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-zinc-900 text-white border border-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-zinc-800 border border-zinc-200 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
