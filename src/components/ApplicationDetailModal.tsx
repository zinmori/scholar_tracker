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
  MapPin,
  Clock,
  Edit,
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      ></div>

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200/80 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate leading-snug">
              {application.name}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              {application.type === "Université" ? (
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{application.type}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {application.country}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* General Information */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/40 p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-150 pb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Informations Générales
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Statut actuel</p>
                <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold border border-indigo-100 bg-indigo-50 text-indigo-700">
                  {application.status}
                </span>
              </div>
              
              {application.program && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Programme</p>
                  <p className="text-xs text-slate-800 font-semibold mt-1">{application.program}</p>
                </div>
              )}
              
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Lieu</p>
                <p className="text-xs text-slate-800 font-semibold mt-1">
                  {application.country}
                  {application.city && `, ${application.city}`}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Date limite</p>
                <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(application.deadline)}
                </p>
              </div>

              {application.submittedDate && (
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Date de soumission</p>
                  <p className="text-xs text-slate-800 font-semibold mt-1">
                    {formatDate(application.submittedDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          {(application.amount || application.applicationFee || application.website) && (
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/40 p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-150 pb-2">
                <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                Détails Financiers & Liens
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {application.amount ? (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Montant de la bourse</p>
                    <p className="text-lg text-emerald-650 font-bold mt-0.5">
                      {application.amount.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                ) : null}

                {application.applicationFee ? (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Frais de candidature</p>
                    <p className="text-xs text-slate-800 font-bold mt-1">
                      {application.applicationFee.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                ) : null}

                {application.website && (
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Site internet</p>
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-650 hover:text-indigo-700 underline underline-offset-4 flex items-center gap-1.5 font-bold mt-1.5"
                    >
                      Site officiel de l&apos;offre <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist Tasks / Documents */}
          {application.documents && application.documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-1">
                Tâches & Documents Requis
              </h3>
              <div className="bg-slate-50/30 border border-slate-150 rounded-2xl p-4">
                <DocumentChecklist
                  documents={application.documents}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              </div>
            </div>
          )}

          {/* Timeline History */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-1">
                Historique d&apos;évolution
              </h3>
              <div className="bg-slate-50/30 border border-slate-150 rounded-2xl p-4">
                <StatusTimeline history={application.statusHistory} />
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-1">
                Notes personnelles
              </h3>
              <p className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50/50 border border-slate-200/40 p-4 rounded-2xl leading-relaxed italic">
                &ldquo;{application.notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-150 bg-slate-50 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-indigo-600 text-white hover:bg-indigo-650 text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            Modifier le dossier
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
