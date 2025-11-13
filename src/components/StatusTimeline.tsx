import { StatusHistoryItem } from "@/types";

interface StatusTimelineProps {
  history: StatusHistoryItem[];
}

const statusIcons: Record<string, string> = {
  "En cours": "🔵",
  Soumise: "🟣",
  "En révision": "🟡",
  Acceptée: "🟢",
  Refusée: "🔴",
  "En attente": "⚪",
};

export default function StatusTimeline({ history }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic text-center py-4">
        Aucun historique disponible
      </p>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      {sortedHistory.map((item, index) => (
        <div
          key={index}
          className="flex gap-3 pb-3 border-b border-gray-200 last:border-0"
        >
          <div className="flex-shrink-0 text-2xl">
            {statusIcons[item.status] || "⚪"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{item.status}</span>
              {index === 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Actuel
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
            {item.note && (
              <p className="text-sm text-gray-700 mt-1 italic">
                &quot;{item.note}&quot;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
