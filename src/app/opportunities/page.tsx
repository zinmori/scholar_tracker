"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Application, User } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Check,
  MapPin,
  Award,
  AlertTriangle,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
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

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

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
      console.error("Error loading opportunities:", error);
      showToast("Erreur lors de la récupération des données", "error");
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
    loadData();

    // Subscribe to profile modifications
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router, loadData]);

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
          `Sync réussie ! ${data.addedCount} nouvelles opportunités, ${data.updatedCount} mises à jour.`,
          "success"
        );
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
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'importation");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      showToast(error.message || "Impossible d'importer cette opportunité", "error");
    } finally {
      setImportingId(null);
    }
  };

  // Client-side filtering & sorting
  useEffect(() => {
    let filtered = [...opportunities];

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

    if (typeFilter !== "Tous") {
      filtered = filtered.filter((opp) => opp.type === typeFilter);
    }

    if (countryFilter !== "Tous") {
      filtered = filtered.filter((opp) => opp.country === countryFilter);
    }

    // Sort by match score if preferences exist, otherwise by deadline
    filtered.sort((a, b) => {
      const scoreA = calculateMatchScore(a);
      const scoreB = calculateMatchScore(b);

      if (scoreA !== null && scoreB !== null) {
        return scoreB - scoreA; // Descending match score
      }
      if (scoreA !== null) return -1;
      if (scoreB !== null) return 1;

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    setFilteredOpps(filtered);
  }, [opportunities, searchTerm, typeFilter, countryFilter, user]);

  const calculateMatchScore = (opp: Opportunity) => {
    if (!user || !user.preferences) return null;
    const { preferences } = user;

    let matches = 0;
    let totalCriteria = 0;

    // 1. Country Match
    if (preferences.targetCountries && preferences.targetCountries.length > 0) {
      totalCriteria++;
      const userCountries = preferences.targetCountries.map((c) => c.toLowerCase().trim());
      if (userCountries.includes(opp.country.toLowerCase().trim())) {
        matches++;
      }
    }

    // 2. Study Level Match
    if (preferences.studyLevel) {
      totalCriteria++;
      const level = preferences.studyLevel.toLowerCase();
      const content = `${opp.name} ${opp.program || ""} ${opp.notes || ""}`.toLowerCase();
      if (content.includes(level)) {
        matches++;
      }
    }

    // 3. Study Field Match
    if (preferences.studyField) {
      totalCriteria++;
      const field = preferences.studyField.toLowerCase();
      const content = `${opp.name} ${opp.program || ""} ${opp.notes || ""}`.toLowerCase();
      
      const keywords = field.split(/[\s&/]+/).filter((k) => k.length > 2);
      const matchesKeyword = keywords.some((k) => content.includes(k));

      if (matchesKeyword) {
        matches++;
      }
    }

    if (totalCriteria === 0) return null;
    return Math.round((matches / totalCriteria) * 100);
  };

  const countries = ["Tous", ...Array.from(new Set(opportunities.map((o) => o.country)))].sort();

  const isImported = (opp: Opportunity) => {
    return applications.some((app) => app.name.toLowerCase().trim() === opp.name.toLowerCase().trim());
  };

  const isDeadlineSoon = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15;
  };

  const formatDeadline = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs font-bold text-indigo-650 animate-pulse uppercase tracking-wider">
          Chargement des opportunités externes...
        </div>
      </div>
    );
  }

  const stats = {
    total: opportunities.length,
    scholarships: opportunities.filter((o) => o.type === "Bourse").length,
    universities: opportunities.filter((o) => o.type === "Université").length,
    imported: opportunities.filter((o) => isImported(o)).length,
  };

  return (
    <DashboardLayout>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-slate-800 bg-white/95 backdrop-blur-md border-slate-200/80 font-bold text-xs">
            {toast.type === "success" && <Check className="w-4 h-4 text-emerald-600" />}
            {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-indigo-600" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header and Sync bar */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Découverte d&apos;opportunités 🌐
              </h2>
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5" />
                IA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed max-w-xl">
              Opportunités extraites et analysées par IA depuis les sites sources. Ordonnées selon votre compatibilité.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 ${
                syncing
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-white text-slate-900 hover:bg-slate-100 shadow-slate-950/20"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Analyse IA en cours..." : "Synchroniser avec l'IA"}
            </button>
            {syncing && (
              <p className="text-[10px] text-slate-500 font-medium animate-pulse">
                ⏳ Analyse des 10 derniers articles par source (~2 min)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Disponibles</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Offres</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bourses d&apos;Études</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-950 tracking-tight">{stats.scholarships}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Dispos</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admissions Univ.</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-950 tracking-tight">{stats.universities}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Programmes</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Importés dans Suivi</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-slate-950 tracking-tight">{stats.imported}</span>
            <span className="text-[9px] text-slate-450 font-bold uppercase">Suivis</span>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 mb-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-slate-450" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtrer les opportunités</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Text Search */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Recherche libre
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Bourse, université, spécialité..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Type d&apos;opportunité
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Tous">Tous les types ({stats.total})</option>
              <option value="Bourse">Bourses d&apos;excellence ({stats.scholarships})</option>
              <option value="Université">Admissions universitaires ({stats.universities})</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Pays de destination
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
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

      {/* Grid List */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          {filteredOpps.length} offre{filteredOpps.length > 1 ? "s" : ""} trouvée{filteredOpps.length > 1 ? "s" : ""}
        </p>
      </div>

      {filteredOpps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-semibold">Aucune opportunité trouvée.</p>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto">
            {opportunities.length === 0
              ? "Cliquez sur 'Synchroniser avec l'IA' ci-dessus pour déclencher l'analyse intelligente des sites sources."
              : "Essayez de modifier vos critères de filtrage."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpps.map((opp) => {
            const imported = isImported(opp);
            const soon = isDeadlineSoon(opp.deadline);
            const isExpanded = !!expandedNotes[opp._id];
            const matchScore = calculateMatchScore(opp);

            return (
              <div
                key={opp._id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                  imported ? "border-emerald-200 bg-emerald-50/5" : "border-slate-200/80"
                }`}
              >
                {/* Score matching banner */}
                {matchScore !== null && matchScore >= 50 && (
                  <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-indigo-600 h-1 z-10"></div>
                )}

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Badges & Match */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            opp.type === "Bourse"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-700 border-slate-200/80"
                          }`}
                        >
                          {opp.type}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-violet-50 text-violet-700 border-violet-100 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          IA
                        </span>
                        
                        {matchScore !== null && matchScore >= 50 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            {matchScore}% Match
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.country}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2" title={opp.name}>
                      {opp.name}
                    </h4>

                    {/* Program */}
                    {opp.program && (
                      <p className="text-xs text-slate-500 font-semibold mb-3 flex items-start gap-1">
                        <Award className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-405" />
                        <span className="line-clamp-2">{opp.program}</span>
                      </p>
                    )}

                    {/* Amount */}
                    {opp.amount !== undefined && opp.amount > 0 && (
                      <div className="mb-4 bg-emerald-50/50 border border-emerald-100/60 p-2.5 rounded-xl flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-800">
                          Bourse : {opp.amount.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    )}

                    {/* Description Notes */}
                    {opp.notes && (
                      <div className="mb-4 text-xs text-slate-500 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60 relative">
                        <p className="leading-relaxed">
                          {isExpanded || opp.notes.length <= 110
                            ? opp.notes
                            : `${opp.notes.substring(0, 107)}...`}
                        </p>
                        {opp.notes.length > 110 && (
                          <button
                            onClick={() => toggleNotes(opp._id)}
                            className="mt-2 text-indigo-650 font-bold hover:underline flex items-center gap-0.5 focus:outline-none"
                          >
                            {isExpanded ? "Voir moins" : "Voir plus"}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deadline & Info */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <div
                        className={`flex items-center gap-2 text-xs font-bold ${
                          soon ? "text-amber-700 bg-amber-50/50 border border-amber-100/50 p-2 rounded-xl" : "text-slate-600"
                        }`}
                      >
                        <Calendar className={`w-4 h-4 ${soon ? "text-amber-500" : "text-slate-400"}`} />
                        <span>
                          Date limite : <strong>{formatDeadline(opp.deadline)}</strong>
                          {soon && " (Bientôt !)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-violet-400" />
                        <span>IA · {opp.source}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import actions */}
                <div className="bg-slate-50/60 px-6 py-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
                  <a
                    href={opp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                  >
                    <span>Lien officiel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {imported ? (
                    <span className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Importée
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImport(opp)}
                      disabled={importingId !== null}
                      className="px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100/50 active:scale-95 disabled:opacity-50"
                    >
                      {importingId === opp._id ? "Importation..." : "Importer dans Suivi"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
