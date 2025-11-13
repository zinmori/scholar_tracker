"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  User as UserIcon,
  HardDrive,
} from "lucide-react";
import { Document, DocumentType, User } from "@/types";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  showOwner?: boolean;
}

const documentTypeColors: Record<DocumentType, string> = {
  CV: "bg-blue-100 text-blue-800",
  "Lettre de motivation": "bg-purple-100 text-purple-800",
  "Relevé de notes": "bg-green-100 text-green-800",
  Diplôme: "bg-yellow-100 text-yellow-800",
  Passeport: "bg-red-100 text-red-800",
  Photo: "bg-pink-100 text-pink-800",
  Autre: "bg-gray-100 text-gray-800",
};

const documentTypeIcons: Record<DocumentType, string> = {
  CV: "📄",
  "Lettre de motivation": "✉️",
  "Relevé de notes": "📊",
  Diplôme: "🎓",
  Passeport: "🛂",
  Photo: "📸",
  Autre: "📎",
};

export default function DocumentList({
  documents,
  onDelete,
  showOwner = false,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    return "📄";
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-lg font-medium">Aucun document</p>
        <p className="text-gray-400 text-sm mt-1">
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
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {getFileIcon(doc.mimeType)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {doc.originalName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        documentTypeColors[doc.type]
                      }`}
                    >
                      <span>{documentTypeIcons[doc.type]}</span>
                      {doc.type}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(doc.size)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.description}
                    </p>
                  )}
                  {showOwner && doc.user && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <UserIcon className="w-3 h-3" />
                      {doc.user.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Visualiser"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.path}
                    download={doc.originalName}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
