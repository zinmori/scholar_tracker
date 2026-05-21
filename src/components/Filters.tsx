import { ApplicationStatus, ApplicationType, Application } from "@/types";
import { Search, Filter, SortAsc, Users } from "lucide-react";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ApplicationStatus | "Tous";
  onStatusFilterChange: (value: ApplicationStatus | "Tous") => void;
  typeFilter: ApplicationType | "Tous";
  onTypeFilterChange: (value: ApplicationType | "Tous") => void;
  sortBy: "deadline" | "name" | "createdAt" | "status";
  onSortChange: (value: "deadline" | "name" | "createdAt" | "status") => void;
  // Filtres admin
  isAdmin?: boolean;
  userFilter?: string;
  onUserFilterChange?: (value: string) => void;
  applications?: Application[]; // Pour obtenir la liste des utilisateurs
}

const STATUSES: (ApplicationStatus | "Tous")[] = [
  "Tous",
  "En cours",
  "Soumise",
  "En révision",
  "Acceptée",
  "Refusée",
  "En attente",
];

const TYPES: (ApplicationType | "Tous")[] = ["Tous", "Université", "Bourse"];

export default function Filters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
  isAdmin = false,
  userFilter = "Tous",
  onUserFilterChange,
  applications = [],
}: FiltersProps) {
  // Extraire la liste unique des utilisateurs (pour les admins)
  const uniqueUsers = isAdmin
    ? Array.from(
        new Map(
          applications
            .filter((app) => app.user)
            .map((app) => [app.userId, app.user])
        ).values()
      )
    : [];

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-4 mb-6">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"
        } gap-4`}
      >
        {/* Recherche */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-zinc-400" />
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Nom, pays, ville..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
          />
        </div>

        {/* Filtre par statut */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-zinc-400" />
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as ApplicationStatus | "Tous")
            }
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm bg-white"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par type */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-zinc-400" />
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(e.target.value as ApplicationType | "Tous")
            }
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm bg-white"
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par utilisateur (admin uniquement) */}
        {isAdmin && onUserFilterChange && (
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-400" />
              Utilisateur
            </label>
            <select
              value={userFilter}
              onChange={(e) => onUserFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm bg-white"
            >
              <option value="Tous">Tous les utilisateurs</option>
              {uniqueUsers.map((user) => (
                <option key={user?.id} value={user?.id}>
                  {user?.name} ({user?.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tri */}
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1.5 flex items-center gap-1.5">
            <SortAsc className="w-4 h-4 text-zinc-400" />
            Trier par
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm bg-white"
          >
            <option value="deadline">Date limite</option>
            <option value="name">Nom</option>
            <option value="createdAt">Date de création</option>
            <option value="status">Statut</option>
          </select>
        </div>
      </div>
    </div>
  );
}
