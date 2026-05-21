"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Application, User } from "@/types";
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Check,
  MapPin,
  Award,
  BookOpen,
  AlertTriangle,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";

interface Opportunity {
  _id: string;
  name: string;
  program?: string;
  type: "Université" | "Bourse";
  country: string;
  city?: string;
  deadline: string;
  amount?: number;
  website: string;
  notes?: string;
  source: string;
  scrapedAt: string;
}

export default function OpportunitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredOpps, setFilteredOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [countryFilter, setCountryFilter] = useState<string>("Tous");

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadData();
  }, [router]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch both opportunities and user applications in parallel
      const [oppsResponse, appsResponse] = await Promise.all([
        fetch("/api/opportunities", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (oppsResponse.status === 401 || appsResponse.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const oppsData = await oppsResponse.json();
      const appsData = await appsResponse.json();

      setOpportunities(oppsData.opportunities || []);
      setApplications(appsData.applications || []);
    } catch (error) {
      console.error("Error loading opportunities dashboard data:", error);
      showToast("Erreur lors de la récupération des données", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    showToast("Synchronisation des opportunités en cours...", "info");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/opportunities/scrape", {
        method: "POST",
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
      if (response.ok) {
        showToast(
          `Sync réussie ! ${data.addedCount} nouvelles ajoutées, ${data.updatedCount} mises à jour.`,
          "success"
        );
        // Reload data to reflect updates
        await loadData();
      } else {
        throw new Error(data.error || "Erreur lors de la synchronisation");
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      showToast(error.message || "Échec de la synchronisation automatique", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (opp: Opportunity) => {
    setImportingId(opp._id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/opportunities/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opportunityId: opp._id }),
      });

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        showToast(`"${opp.name}" a été importée avec succès !`, "success");
        // Reload user applications to update the imported state
        const appsResponse = await fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      } else {
        throw new Error(data.error || "Erreur lors de l'importation");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      showToast(error.message || "Impossible d'importer cette opportunité", "error");
    } finally {
      setImportingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  // Client-side filtering & sorting
  useEffect(() => {
    let filtered = [...opportunities];

    // Text search
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.name.toLowerCase().includes(query) ||
          opp.country.toLowerCase().includes(query) ||
          (opp.program && opp.program.toLowerCase().includes(query)) ||
          (opp.source && opp.source.toLowerCase().includes(query)) ||
          (opp.notes && opp.notes.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== "Tous") {
      filtered = filtered.filter((opp) => opp.type === typeFilter);
    }

    // Country filter
    if (countryFilter !== "Tous") {
      filtered = filtered.filter((opp) => opp.country === countryFilter);
    }

    // Sort by deadline ascending (closest first)
    filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    setFilteredOpps(filtered);
  }, [opportunities, searchTerm, typeFilter, countryFilter]);

  // Extract unique countries for filter dropdown
  const countries = ["Tous", ...Array.from(new Set(opportunities.map((o) => o.country)))].sort();

  // Helper to check if opportunity is already imported
  const isImported = (opp: Opportunity) => {
    return applications.some((app) => app.name.toLowerCase().trim() === opp.name.toLowerCase().trim());
  };

  // Helper to check if deadline is soon (within 15 days)
  const isDeadlineSoon = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15;
  };

  // Format deadline date in French
  const formatDeadline = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm font-medium text-zinc-500 animate-pulse">Chargement des opportunités...</div>
      </div>
    );
  }

  // Stats computation
  const stats = {
    total: opportunities.length,
    scholarships: opportunities.filter((o) => o.type === "Bourse").length,
    universities: opportunities.filter((o) => o.type === "Université").length,
    imported: opportunities.filter((o) => isImported(o)).length,
  };

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border text-zinc-800 bg-white border-zinc-200/80 font-medium transition-all`}
          >
            {toast.type === "success" && <Check className="w-4 h-4 text-emerald-600" />}
            {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-zinc-900" />}
            <span className="text-xs">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Back & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Retour au tableau de bord"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2.5">
                  <BookOpen className="w-7 h-7 text-zinc-900" />
                  Opportunités Externes
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                  Découvrez et importez des bourses et admissions universitaires
                </p>
              </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handleSync}
                disabled={syncing}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${syncing
                    ? "bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed"
                    : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 active:scale-98"
                  }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Synchronisation..." : "Synchroniser"}
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-semibold text-zinc-850">{user?.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{user?.email}</p>
                </div>
                <div className="w-px h-4 bg-zinc-200 hidden md:block"></div>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Total Disponibles</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.total}</span>
              <span className="text-[10px] text-zinc-400 font-medium">Actives</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Bourses d'Études</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.scholarships}</span>
              <span className="text-[10px] text-zinc-400 font-medium">offres</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Admissions Univ.</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.universities}</span>
              <span className="text-[10px] text-zinc-400 font-medium">programmes</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-zinc-450 uppercase tracking-wider">Déjà Suivies</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{stats.imported}</span>
              <span className="text-[10px] text-zinc-400 font-medium">importées</span>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200/80 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-900">Recherche & Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Text Search */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                Recherche
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Bourse, université, pays..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                Type d'opportunité
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors"
              >
                <option value="Tous">Tous les types ({stats.total})</option>
                <option value="Bourse">Bourses d'excellence ({stats.scholarships})</option>
                <option value="Université">Admissions universitaires ({stats.universities})</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                Pays de destination
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-zinc-900 transition-colors"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "Tous" ? "Tous les pays" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs font-medium text-zinc-500">
            {filteredOpps.length} opportunité{filteredOpps.length > 1 ? "s" : ""} trouvée{filteredOpps.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Opportunities Grid */}
        {filteredOpps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-xs">
            <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 text-base font-medium">Aucune opportunité disponible.</p>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-sm mx-auto">
              {opportunities.length === 0
                ? "Cliquez sur 'Synchroniser' ci-dessus pour lancer la recherche et le scraping des flux externes."
                : "Essayez de modifier vos critères de filtrage ou de recherche."}
            </p>
            {opportunities.length === 0 && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="mt-6 px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 mx-auto shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                Lancer la première synchronisation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpps.map((opp) => {
              const imported = isImported(opp);
              const soon = isDeadlineSoon(opp.deadline);
              const isExpanded = !!expandedNotes[opp._id];

              return (
                <div
                  key={opp._id}
                  className={`bg-white rounded-xl border hover:border-zinc-350/80 shadow-xs hover:shadow-md transition-all duration-205 flex flex-col justify-between overflow-hidden ${imported ? "border-emerald-200 bg-emerald-50/5" : "border-zinc-200/80"
                    }`}
                >
                  {/* Card Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Meta: Type Badge & Location */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${opp.type === "Bourse"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-zinc-100 text-zinc-800 border-zinc-200/80"
                            }`}
                        >
                          {opp.type}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          {opp.country}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-semibold text-zinc-900 leading-snug mb-2" title={opp.name}>
                        {opp.name}
                      </h4>

                      {/* Program/Field */}
                      {opp.program && (
                        <p className="text-xs text-zinc-500 font-medium mb-3 flex items-start gap-1">
                          <Award className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-400" />
                          <span>{opp.program}</span>
                        </p>
                      )}

                      {/* Amount Details if Bourse */}
                      {opp.amount !== undefined && opp.amount > 0 && (
                        <div className="mb-4 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-800">
                            Financement : {opp.amount.toLocaleString("fr-FR")} € / mois
                          </span>
                        </div>
                      )}

                      {/* Description / Notes */}
                      {opp.notes && (
                        <div className="mb-4 text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-100 relative">
                          <p className="leading-relaxed">
                            {isExpanded || opp.notes.length <= 110
                              ? opp.notes
                              : `${opp.notes.substring(0, 107)}...`}
                          </p>
                          {opp.notes.length > 110 && (
                            <button
                              onClick={() => toggleNotes(opp._id)}
                              className="mt-2 text-zinc-900 font-semibold hover:underline flex items-center gap-0.5 focus:outline-none"
                            >
                              {isExpanded ? (
                                <>
                                  Voir moins <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Voir plus <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deadline & Source */}
                    <div className="border-t border-zinc-100 pt-4 mt-2">
                      <div className="flex flex-col gap-2">
                        {/* Deadline */}
                        <div
                          className={`flex items-center gap-2 text-xs font-medium ${soon ? "text-amber-700 bg-amber-50/50 border border-amber-100/50 p-2 rounded-lg" : "text-zinc-650"
                            }`}
                        >
                          <Calendar className={`w-4 h-4 ${soon ? "text-amber-500" : "text-zinc-400"}`} />
                          <span>
                            Date limite : <strong className="font-semibold">{formatDeadline(opp.deadline)}</strong>
                            {soon && " (Bientôt !)"}
                          </span>
                        </div>

                        {/* Source */}
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Source : {opp.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-zinc-50/50 px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <a
                      href={opp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                    >
                      <span>Site officiel</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>

                    {imported ? (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-default"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-650" />
                        Importée
                      </button>
                    ) : (
                      <button
                        onClick={() => handleImport(opp)}
                        disabled={importingId !== null}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${importingId !== null
                            ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                            : "bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-850"
                          }`}
                      >
                        {importingId === opp._id ? "Importation..." : "Importer"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
