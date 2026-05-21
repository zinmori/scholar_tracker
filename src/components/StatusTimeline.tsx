import { StatusHistoryItem } from "@/types";

interface StatusTimelineProps {
  history: StatusHistoryItem[];
}

const statusDotColors: Record<string, string> = {
  "En cours": "bg-zinc-400",
  Soumise: "bg-zinc-700",
  "En révision": "bg-amber-500",
  Acceptée: "bg-emerald-600",
  Refusée: "bg-rose-600",
  "En attente": "bg-zinc-300",
};

export default function StatusTimeline({ history }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-xs text-zinc-400 italic text-center py-4">
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
    <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
      {sortedHistory.map((item, index) => (
        <div key={index} className="relative flex gap-4">
          <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border border-zinc-200 flex items-center justify-center z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${statusDotColors[item.status] || "bg-zinc-300"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-950">{item.status}</span>
              {index === 0 && (
                <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-semibold uppercase tracking-wider rounded">
                  Actuel
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">{formatDate(item.date)}</p>
            {item.note && (
              <p className="text-xs text-zinc-600 mt-1.5 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100 italic leading-relaxed">
                &quot;{item.note}&quot;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
