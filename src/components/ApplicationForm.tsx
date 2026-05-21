"use client";

import { useState, FormEvent } from "react";
import {
  Application,
  ApplicationType,
  ApplicationStatus,
  DocumentItem,
} from "@/types";
import DocumentChecklist from "./DocumentChecklist";

interface ApplicationFormProps {
  application: Application | null;
  onClose: () => void;
}

const APPLICATION_TYPES: ApplicationType[] = ["Université", "Bourse"];
const STATUSES: ApplicationStatus[] = [
  "En cours",
  "Soumise",
  "En révision",
  "Acceptée",
  "Refusée",
  "En attente",
];

export default function ApplicationForm({
  application,
  onClose,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    type: application?.type || ("Université" as ApplicationType),
    name: application?.name || "",
    program: application?.program || "",
    country: application?.country || "",
    city: application?.city || "",
    deadline: application?.deadline || "",
    status: application?.status || ("En cours" as ApplicationStatus),
    submittedDate: application?.submittedDate || "",
    amount: application?.amount || 0,
    applicationFee: application?.applicationFee || 0,
    website: application?.website || "",
    notes: application?.notes || "",
    statusNote: "",
  });
  const [documents, setDocuments] = useState<DocumentItem[]>(
    application?.documents || []
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "applicationFee" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Créer l'historique si le statut a changé
    const statusHistory = application?.statusHistory || [];
    if (!application || formData.status !== application.status) {
      statusHistory.push({
        status: formData.status,
        date: new Date().toISOString(),
        note: formData.statusNote || undefined,
      });
    }

    const payload = {
      ...formData,
      documents,
      statusHistory,
    };

    // Supprimer statusNote du payload
    delete (payload as any).statusNote;

    try {
      const token = localStorage.getItem("token");
      const url = application
        ? `/api/applications/${application.id}`
        : "/api/applications";
      const method = application ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-zinc-100 z-10">
          <h2 className="text-lg font-semibold text-zinc-950">
            {application ? "Modifier" : "Nouvelle"} Candidature
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              >
                {APPLICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Nom de l&apos;université / bourse *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
            />
          </div>

          {formData.type === "Université" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Programme d&apos;études
              </label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Pays *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Date limite *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Date de soumission
              </label>
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>
          </div>

          {formData.type === "Bourse" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Montant (€)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Frais de candidature (€)
                </label>
                <input
                  type="number"
                  name="applicationFee"
                  value={formData.applicationFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
                />
              </div>
            </div>
          )}

          {formData.type === "Université" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Frais de candidature (€)
              </label>
              <input
                type="number"
                name="applicationFee"
                value={formData.applicationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Site web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Documents requis
            </label>
            <DocumentChecklist documents={documents} onUpdate={setDocuments} />
          </div>

          {application && formData.status !== application.status && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Note sur le changement de statut (optionnel)
              </label>
              <input
                type="text"
                name="statusNote"
                value={formData.statusNote}
                onChange={handleChange}
                placeholder="Ex: Entretien prévu le 15 mars"
                className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors text-zinc-800 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white text-zinc-800 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white border border-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
