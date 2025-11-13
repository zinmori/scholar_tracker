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
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Progression des documents
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {completed}/{total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all"
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
            className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <input
              type="checkbox"
              checked={doc.completed}
              onChange={() => toggleDocument(index)}
              disabled={readOnly}
              className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span
              className={`flex-1 text-sm ${
                doc.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {doc.name}
            </span>
            {doc.completed && doc.completedDate && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {new Date(doc.completedDate).toLocaleDateString("fr-FR")}
              </span>
            )}
            {!readOnly && (
              <button
                onClick={() => removeDocument(index)}
                className="text-red-600 hover:text-red-700 text-sm px-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Ajouter un document */}
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addDocument()}
            placeholder="Ajouter un document..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={addDocument}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {total === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-2">
          Aucun document requis
        </p>
      )}
    </div>
  );
}
