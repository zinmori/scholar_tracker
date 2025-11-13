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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  Mes Documents
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Gérez vos documents de candidature
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Admin
                </span>
              )}
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Documents</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">CV</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.cv}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Lettres</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {stats.letters}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Espace utilisé</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtres</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rechercher
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom du fichier..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de document
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as DocumentType | "Tous")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              <p className="text-sm text-gray-600">
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
