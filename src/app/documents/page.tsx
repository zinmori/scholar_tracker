"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Document, DocumentType, User } from "@/types";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentList from "@/components/DocumentList";
import { FileText, Filter, ArrowLeft, LogOut, Users } from "lucide-react";

export default function DocumentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<DocumentType | "Tous">("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadDocuments();
  }, [router]);

  const loadDocuments = async () => {
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
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...documents];

    // Filtre par type
    if (typeFilter !== "Tous") {
      filtered = filtered.filter((doc) => doc.type === typeFilter);
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
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

      // Recharger les documents
      loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Erreur lors de la suppression du document");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm font-medium text-zinc-500 animate-pulse">Chargement...</div>
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
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2.5">
                  <FileText className="w-7 h-7 text-zinc-900" />
                  Mes Documents
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  Gérez vos documents de candidature
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === "admin" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200/80 rounded-full text-[10px] sm:text-xs font-medium">
                  <Users className="w-3 h-3 text-zinc-700" />
                  Admin
                </span>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-zinc-850">
                  {user?.name}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{user?.email}</p>
              </div>
              <div className="w-px h-4 bg-zinc-200 hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
            <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1.5 tracking-tight">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
            <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">CV</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1.5 tracking-tight">{stats.cv}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
            <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Lettres</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1.5 tracking-tight">
              {stats.letters}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs">
            <p className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Espace utilisé</p>
            <p className="text-2xl font-semibold text-zinc-900 mt-1.5 tracking-tight">
              {formatTotalSize(stats.totalSize)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Uploader - Left Side */}
          <div className="lg:col-span-1">
            <DocumentUploader onUploadSuccess={loadDocuments} />
          </div>

          {/* Documents List - Right Side */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200/80 mb-4 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900">Filtres</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Rechercher
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom du fichier..."
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Type de document
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as DocumentType | "Tous")
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors"
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

            {/* Results Header */}
            <div className="mb-4">
              <p className="text-xs font-medium text-zinc-500">
                {filteredDocs.length} sur {documents.length} document
                {documents.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Documents List */}
            <DocumentList
              documents={filteredDocs}
              onDelete={handleDelete}
              showOwner={user?.role === "admin"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
