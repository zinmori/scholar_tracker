import { DocumentItem } from "@/types";
import { useState } from "react";
import { CheckCircle, Trash2, Plus } from "lucide-react";

interface DocumentChecklistProps {
  documents: DocumentItem[];
  onUpdate: (documents: DocumentItem[]) => void;
  readOnly?: boolean;
}

export default function DocumentChecklist({
  documents,
  onUpdate,
  readOnly = false,
}: DocumentChecklistProps) {
  const [newDocName, setNewDocName] = useState("");

  const toggleDocument = (index: number) => {
    if (readOnly) return;
    const updated = [...documents];
    updated[index] = {
      ...updated[index],
      completed: !updated[index].completed,
      completedDate: !updated[index].completed
        ? new Date().toISOString()
        : undefined,
    };
    onUpdate(updated);
  };

  const addDocument = () => {
    if (!newDocName.trim()) return;
    const updated = [
      ...documents,
      { name: newDocName.trim(), completed: false },
    ];
    onUpdate(updated);
    setNewDocName("");
  };

  const removeDocument = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const completed = documents.filter((d) => d.completed).length;
  const total = documents.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Barre de progression */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Progression des documents
            </span>
            <span className="text-xs font-bold text-zinc-900">
              {completed}/{total}
            </span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5">
            <div
              className="bg-zinc-900 h-1.5 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Liste des documents */}
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 bg-zinc-50 border border-zinc-100 rounded-lg hover:bg-zinc-100/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={doc.completed}
              onChange={() => toggleDocument(index)}
              disabled={readOnly}
              className="h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-950 focus:ring-offset-0 cursor-pointer"
            />
            <span
              className={`flex-1 text-sm ${
                doc.completed ? "line-through text-zinc-400" : "text-zinc-700 font-medium"
              }`}
            >
              {doc.name}
            </span>
            {doc.completed && doc.completedDate && (
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
                <CheckCircle className="w-3 h-3" />
                {new Date(doc.completedDate).toLocaleDateString("fr-FR")}
              </span>
            )}
            {!readOnly && (
              <button
                onClick={() => removeDocument(index)}
                className="text-rose-600 hover:text-rose-700 transition-colors text-sm px-2"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Ajouter un document */}
      {!readOnly && (
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addDocument()}
            placeholder="Ajouter un document..."
            className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
          />
          <button
            onClick={addDocument}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-zinc-400 italic text-center py-2">
          Aucun document requis
        </p>
      )}
    </div>
  );
}
