"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Document, DocumentType, User } from "@/types";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Filter, HardDrive, Files, ShieldAlert } from "lucide-react";

export default function DocumentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<DocumentType | "Tous">("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const loadDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadDocuments();
  }, [router, loadDocuments]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...documents];

    if (typeFilter !== "Tous") {
      filtered = filtered.filter((doc) => doc.type === typeFilter);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.originalName.toLowerCase().includes(q) ||
          doc.description?.toLowerCase().includes(q) ||
          doc.user?.name.toLowerCase().includes(q)
      );
    }

    setFilteredDocs(filtered);
  }, [documents, typeFilter, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Erreur lors de la suppression du document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-indigo-650 animate-pulse uppercase tracking-wider">
          Chargement de l&apos;espace documents...
        </div>
      </div>
    );
  }

  const documentTypes: (DocumentType | "Tous")[] = [
    "Tous",
    "CV",
    "Lettre de motivation",
    "Relevé de notes",
    "Diplôme",
    "Passeport",
    "Photo",
    "Autre",
  ];

  const stats = {
    total: documents.length,
    cv: documents.filter((d) => d.type === "CV").length,
    letters: documents.filter((d) => d.type === "Lettre de motivation").length,
    transcripts: documents.filter((d) => d.type === "Relevé de notes").length,
    totalSize: documents.reduce((acc, doc) => acc + doc.size, 0),
  };

  const formatTotalSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  return (
    <DashboardLayout>
      {/* Welcome & Info */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Gestionnaire de Documents 📂
          </h2>
          <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed max-w-xl">
            Centralisez, déposez et liez vos justificatifs, CV et relevés de notes directement à vos candidatures en cours. Stockage Cloud sécurisé.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Fichiers</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-[9px] text-slate-405 font-bold uppercase">fichiers</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Curriculum Vitae</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{stats.cv}</span>
            <span className="text-[9px] text-slate-405 font-bold uppercase">déposés</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lettres Motivation</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{stats.letters}</span>
            <span className="text-[9px] text-slate-405 font-bold uppercase">rédigées</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Espace utilisé</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-indigo-650 tracking-tight">
              {formatTotalSize(stats.totalSize)}
            </span>
            <span className="text-[9px] text-slate-405 font-bold uppercase">occupé</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Side */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Téléverser un document</h3>
          </div>
          <DocumentUploader onUploadSuccess={loadDocuments} />
        </div>

        {/* List Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Filter className="w-4 h-4 text-slate-450" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtrer mes documents</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                  Nom du document
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Recherche par nom ou mots-clés..."
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
                  Catégorie de fichier
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DocumentType | "Tous")}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              {filteredDocs.length} document{filteredDocs.length > 1 ? "s" : ""} trouvé{filteredDocs.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Documents Grid List */}
          <DocumentList
            documents={filteredDocs}
            onDelete={handleDelete}
            showOwner={user?.role === "admin"}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
