"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Application, ApplicationStatus, ApplicationType } from "@/types";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationForm from "@/components/ApplicationForm";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import StatsCards from "@/components/StatsCards";
import UpcomingDeadlines from "@/components/UpcomingDeadlines";
import DashboardCharts from "@/components/DashboardCharts";
import Filters from "@/components/Filters";
import ExportButtons from "@/components/ExportButtons";
import { Users, LogOut, Shield, FileText, GraduationCap } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "Tous">(
    "Tous"
  );
  const [typeFilter, setTypeFilter] = useState<ApplicationType | "Tous">(
    "Tous"
  );
  const [userFilter, setUserFilter] = useState<string>("Tous"); // Filtre par utilisateur (admin)
  const [sortBy, setSortBy] = useState<
    "deadline" | "name" | "createdAt" | "status"
  >("deadline");

  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));

    const loadApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [router]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...applications];

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.city &&
            app.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.program &&
            app.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.user?.name &&
            app.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (app.user?.email &&
            app.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== "Tous") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== "Tous") {
      filtered = filtered.filter((app) => app.type === typeFilter);
    }

    // Filtre par utilisateur (admin uniquement)
    if (userFilter !== "Tous" && user?.role === "admin") {
      filtered = filtered.filter((app) => app.userId === userFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredApps(filtered);
  }, [
    applications,
    searchTerm,
    statusFilter,
    typeFilter,
    userFilter,
    sortBy,
    user,
  ]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
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

      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const handleViewDetails = (app: Application) => {
    setViewingApp(app);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingApp(null);
    fetchApplications();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-900">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile & Desktop Layout */}
          <div className="flex  justify-between items-center gap-4">
            {/* Title and Badge */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="hidden sm:inline">Scholar Tracker</span>
                <span className="sm:hidden">Scholar</span>
              </h1>
              {user && user.role === "admin" && (
                <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </span>
              )}
            </div>

            {/* User Info & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              {/* User Info - Hidden on mobile */}
              {user && (
                <span className="hidden md:block text-xs lg:text-sm text-gray-600 truncate max-w-[200px]">
                  {user.name}
                </span>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/documents")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Mes </span>Docs
                </button>

                {user && user.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin/users")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">Utilisateurs</span>
                    <span className="lg:hidden">Users</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards applications={applications} />

        {/* Deadlines urgentes */}
        <UpcomingDeadlines applications={applications} />

        {/* Graphiques */}
        <DashboardCharts applications={applications} />

        {/* Filtres */}
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isAdmin={user?.role === "admin"}
          userFilter={userFilter}
          onUserFilterChange={setUserFilter}
          applications={applications}
        />

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.role === "admin"
                ? "Toutes les Candidatures"
                : "Mes Candidatures"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredApps.length} sur {applications.length} candidature
              {applications.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportButtons applications={filteredApps} />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
            >
              + Nouvelle Candidature
            </button>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {applications.length === 0
                ? "Aucune candidature pour le moment."
                : "Aucune candidature ne correspond aux filtres."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {applications.length === 0
                ? "Commencez par ajouter votre première candidature !"
                : "Essayez de modifier vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                showOwner={user?.role === "admin"}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <ApplicationForm application={editingApp} onClose={handleFormClose} />
      )}

      {/* Detail Modal */}
      {viewingApp && (
        <ApplicationDetailModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
          onEdit={() => {
            setViewingApp(null);
            handleEdit(viewingApp);
          }}
        />
      )}
    </div>
  );
}
