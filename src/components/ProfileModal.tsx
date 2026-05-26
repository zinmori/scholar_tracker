"use client";

import { useState } from "react";
import { X, User as UserIcon, BookOpen, GraduationCap, Globe } from "lucide-react";
import { User } from "@/types";

interface ProfileModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const STUDY_LEVELS = [
  "Licence",
  "Master",
  "Doctorat",
  "Classes Préparatoires",
  "Double Diplôme",
  "Autre"
];

const STUDY_FIELDS = [
  "Sciences & Technologie",
  "Informatique & IA",
  "Management & Commerce",
  "Arts & Design",
  "Médecine & Santé",
  "Droit & Sciences Politiques",
  "Sciences Humaines",
  "Langues & Communication",
  "Autre"
];

export default function ProfileModal({ user, onClose, onSave }: ProfileModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [studyLevel, setStudyLevel] = useState(user?.preferences?.studyLevel || "");
  const [studyField, setStudyField] = useState(user?.preferences?.studyField || "");
  const [countriesInput, setCountriesInput] = useState(
    user?.preferences?.targetCountries?.join(", ") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Parse target countries by splitting commas
    const targetCountries = countriesInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const payload = {
      name,
      preferences: {
        studyLevel,
        studyField,
        targetCountries,
      },
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      const data = await response.json();
      if (data.success && data.user) {
        // Save back to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        onSave(data.user);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de sauvegarder votre profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            Mon Profil & Préférences
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> Nom complet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: John Doe"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-850 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Study Level */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400" /> Niveau d&apos;études visé
            </label>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-850 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Sélectionnez votre niveau</option>
              {STUDY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Study Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" /> Domaine d&apos;intérêt
            </label>
            <select
              value={studyField}
              onChange={(e) => setStudyField(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-850 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Sélectionnez votre domaine</option>
              {STUDY_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* Target Countries */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-zinc-400" /> Pays cibles (séparés par des virgules)
            </label>
            <input
              type="text"
              value={countriesInput}
              onChange={(e) => setCountriesInput(e.target.value)}
              placeholder="Ex: France, Canada, Allemagne"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-850 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Séparez les pays par des virgules. Utilisé pour calculer la compatibilité des opportunités.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-zinc-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white text-zinc-850 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-xs font-semibold shadow-md shadow-indigo-100"
            >
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
