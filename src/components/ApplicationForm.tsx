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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {application ? "Modifier" : "Nouvelle"} Candidature
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {APPLICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;université / bourse *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {formData.type === "Université" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programme d&apos;études
              </label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date limite *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de soumission
              </label>
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {formData.type === "Bourse" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (€)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais de candidature (€)
                </label>
                <input
                  type="number"
                  name="applicationFee"
                  value={formData.applicationFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {formData.type === "Université" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frais de candidature (€)
              </label>
              <input
                type="number"
                name="applicationFee"
                value={formData.applicationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Documents requis
            </label>
            <DocumentChecklist documents={documents} onUpdate={setDocuments} />
          </div>

          {application && formData.status !== application.status && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note sur le changement de statut (optionnel)
              </label>
              <input
                type="text"
                name="statusNote"
                value={formData.statusNote}
                onChange={handleChange}
                placeholder="Ex: Entretien prévu le 15 mars"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
