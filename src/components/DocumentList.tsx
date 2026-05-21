import { useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  User as UserIcon,
  HardDrive,
  FileImage,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { Document, DocumentType, User } from "@/types";
import { downloadDocument, viewDocument } from "@/lib/documentHelpers";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  showOwner?: boolean;
}

const documentTypeColors: Record<DocumentType, string> = {
  CV: "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  "Lettre de motivation": "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  "Relevé de notes": "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  Diplôme: "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  Passeport: "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  Photo: "bg-zinc-100 text-zinc-800 border-zinc-200/80",
  Autre: "bg-zinc-50 text-zinc-650 border-zinc-200/60",
};

export default function DocumentList({
  documents,
  onDelete,
  showOwner = false,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id: string, originalName: string) => {
    setDownloadingId(id);
    try {
      await downloadDocument(id, originalName);
    } catch (error) {
      alert("Erreur lors du téléchargement du document");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = async (id: string) => {
    setViewingId(id);
    try {
      await viewDocument(id);
    } catch (error) {
      alert("Erreur lors de l'affichage du document");
    } finally {
      setViewingId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileImage className="w-5 h-5 text-zinc-400" />;
    }
    if (
      mimeType.includes("sheet") ||
      mimeType.includes("excel") ||
      mimeType.includes("csv")
    ) {
      return <FileSpreadsheet className="w-5 h-5 text-zinc-400" />;
    }
    return <FileText className="w-5 h-5 text-zinc-400" />;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
        <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-500 text-base font-medium">Aucun document</p>
        <p className="text-zinc-400 text-xs mt-1.5">
          Uploadez votre premier document pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white p-5 rounded-xl border border-zinc-200/80 hover:border-zinc-300/80 shadow-xs hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/60 rounded-lg flex items-center justify-center">
                {getFileIcon(doc.mimeType)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-900 truncate">
                    {doc.originalName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        documentTypeColors[doc.type]
                      }`}
                    >
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                      <HardDrive className="w-3.5 h-3.5" />
                      {formatFileSize(doc.size)}
                    </span>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                  {showOwner && doc.user && (
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-2 font-medium">
                      <UserIcon className="w-3 h-3" />
                      {doc.user.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleView(doc.id)}
                    disabled={viewingId === doc.id}
                    className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 rounded-lg transition-all disabled:opacity-50"
                    title="Visualiser"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName)}
                    disabled={downloadingId === doc.id}
                    className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 rounded-lg transition-all disabled:opacity-50"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-zinc-450 hover:text-rose-600 hover:bg-rose-50/50 border border-transparent hover:border-rose-100/50 rounded-lg transition-all disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
