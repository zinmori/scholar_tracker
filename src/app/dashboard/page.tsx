"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Application, ApplicationStatus, ApplicationType, User } from "@/types";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationForm from "@/components/ApplicationForm";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import StatsCards from "@/components/StatsCards";
import UpcomingDeadlines from "@/components/UpcomingDeadlines";
import DashboardCharts from "@/components/DashboardCharts";
import Filters from "@/components/Filters";
import ExportButtons from "@/components/ExportButtons";
import KanbanBoard from "@/components/KanbanBoard";
import DeadlineCalendar from "@/components/DeadlineCalendar";
import DashboardLayout from "@/components/DashboardLayout";
import { Grid, LayoutGrid, Calendar, ChevronRight, PlusCircle, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "kanban" | "calendar">("grid");

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "Tous">("Tous");
  const [typeFilter, setTypeFilter] = useState<ApplicationType | "Tous">("Tous");
  const [userFilter, setUserFilter] = useState<string>("Tous"); // Filtre admin
  const [sortBy, setSortBy] = useState<"deadline" | "name" | "createdAt" | "status">("deadline");

  const router = useRouter();

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/applications", {
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
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadApplications();

    // Subscribe to profile modifications
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...applications];

    // Recherche
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.country.toLowerCase().includes(q) ||
          (app.city && app.city.toLowerCase().includes(q)) ||
          (app.program && app.program.toLowerCase().includes(q)) ||
          (app.user?.name && app.user.name.toLowerCase().includes(q)) ||
          (app.user?.email && app.user.email.toLowerCase().includes(q))
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
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredApps(filtered);
  }, [applications, searchTerm, statusFilter, typeFilter, userFilter, sortBy, user]);

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

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;

    const statusHistory = [...(app.statusHistory || [])];
    statusHistory.push({
      status: newStatus,
      date: new Date().toISOString(),
      note: "Statut modifié depuis le tableau Kanban",
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          statusHistory,
        }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus, statusHistory } : a))
        );
      } else {
        const err = await response.json();
        alert(err.error || "Erreur de mise à jour");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de mise à jour");
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
    loadApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-indigo-650 animate-pulse uppercase tracking-wider">
          Chargement de Scholar Tracker...
        </div>
      </div>
    );
  }

  // Next deadline calculation
  const getNextDeadlineStr = () => {
    const activeApps = applications.filter(
      (a) => a.status === "En cours" || a.status === "En attente" || a.status === "En révision"
    );
    if (activeApps.length === 0) return "Aucune échéance";
    
    // Sort ascending by date
    const sorted = [...activeApps].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
    const nextApp = sorted[0];
    const diff = new Date(nextApp.deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Date limite passée";
    if (days === 0) return "Aujourd'hui !";
    return `prochaine date limite dans ${days} jour${days > 1 ? "s" : ""}`;
  };

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Bonjour, {user?.name} ! 👋
            </h2>
            <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed max-w-xl">
              Prêt à façonner votre parcours ? Vous avez{" "}
              <strong className="text-white font-semibold">
                {applications.filter((a) => a.status === "En cours").length} candidatures
              </strong>{" "}
              actives et la <span className="text-indigo-400 font-semibold">{getNextDeadlineStr()}</span>.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau dossier
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <StatsCards applications={applications} />

      {/* Grid containing Charts and Upcoming Deadlines side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 items-start">
        <div className="xl:col-span-2">
          <DashboardCharts applications={applications} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Deadlines Urgentes</h3>
          </div>
          <UpcomingDeadlines applications={applications} />
        </div>
      </div>

      {/* Search and Filters panel */}
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

      {/* Main Folder Section with View Switcher */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg w-fit">
            {user?.role === "admin" ? "Dossiers globaux" : "Mes Dossiers de candidature"}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
            Affichage de {filteredApps.length} sur {applications.length} dossier{applications.length > 1 ? "s" : ""}
          </p>
        </div>
        
        {/* View Switcher and Export actions */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-indigo-650 shadow-xs"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grille
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-indigo-650 shadow-xs"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-indigo-650 shadow-xs"
                  : "text-slate-500 hover:text-slate-850"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendrier
            </button>
          </div>
          <ExportButtons applications={filteredApps} />
        </div>
      </div>

      {/* Conditional rendering based on active view mode */}
      {filteredApps.length === 0 && viewMode !== "calendar" ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-slate-500 text-sm font-semibold">
            {applications.length === 0
              ? "Aucune candidature enregistrée."
              : "Aucune candidature ne correspond à vos filtres."}
          </p>
          <p className="text-slate-400 text-xs mt-1.5">
            {applications.length === 0
              ? "Commencez dès maintenant en ajoutant votre premier dossier !"
              : "Essayez de modifier vos critères de recherche ou filtres."}
          </p>
          {applications.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Créer mon premier dossier
            </button>
          )}
        </div>
      ) : (
        <div>
          {viewMode === "grid" && (
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

          {viewMode === "kanban" && (
            <KanbanBoard
              applications={filteredApps}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
            />
          )}

          {viewMode === "calendar" && (
            <DeadlineCalendar applications={filteredApps} onViewDetails={handleViewDetails} />
          )}
        </div>
      )}

      {/* Form Dialog Modal */}
      {showForm && <ApplicationForm application={editingApp} onClose={handleFormClose} />}

      {/* Detail Slide-over Panel */}
      {viewingApp && (
        <ApplicationDetailModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
          onEdit={() => {
            const app = viewingApp;
            setViewingApp(null);
            handleEdit(app);
          }}
        />
      )}
    </DashboardLayout>
  );
}
