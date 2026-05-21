"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { DocumentType } from "@/types";

interface DocumentUploaderProps {
  onUploadSuccess: () => void;
  applicationId?: string;
}

const documentTypes: DocumentType[] = [
  "CV",
  "Lettre de motivation",
  "Relevé de notes",
  "Diplôme",
  "Passeport",
  "Photo",
  "Autre",
];

export default function DocumentUploader({
  onUploadSuccess,
  applicationId,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("CV");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", documentType);
      formData.append("description", description);
      if (applicationId) {
        formData.append("applicationId", applicationId);
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      // Réinitialiser le formulaire
      setSelectedFile(null);
      setDescription("");
      setDocumentType("CV");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">
        Uploader un document
      </h3>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-zinc-900 bg-zinc-50/80"
            : "border-zinc-200/80 bg-zinc-50/20 hover:bg-zinc-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-zinc-950 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <p className="font-semibold text-zinc-900 text-xs truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-8 h-8 text-zinc-450 mx-auto mb-3" />
            <p className="text-zinc-800 text-xs font-semibold mb-1">
              Glissez-déposez un fichier ici
            </p>
            <p className="text-[10px] text-zinc-400">
              ou cliquez pour sélectionner (max 10MB)
            </p>
          </label>
        )}
      </div>

      {/* Form Fields */}
      {selectedFile && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
              Type de document *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 focus:outline-none focus:border-zinc-900 transition-colors"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: CV mise à jour février 2026"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2.5 bg-zinc-950 text-white rounded-lg hover:bg-zinc-850 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Uploader le document
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
