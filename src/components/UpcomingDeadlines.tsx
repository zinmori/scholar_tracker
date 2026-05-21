import { Application } from "@/types";
import { AlertTriangle, GraduationCap, DollarSign } from "lucide-react";

interface UpcomingDeadlinesProps {
  applications: Application[];
}

export default function UpcomingDeadlines({
  applications,
}: UpcomingDeadlinesProps) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingApps = applications
    .filter((app) => {
      const deadline = new Date(app.deadline);
      return (
        deadline >= now &&
        deadline <= sevenDaysFromNow &&
        (app.status === "En cours" || app.status === "En attente")
      );
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

  if (upcomingApps.length === 0) return null;

  const getDaysUntil = (deadline: string) => {
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-900">
          Échéances Imminentes ({upcomingApps.length})
        </h3>
      </div>
      <div className="space-y-2">
        {upcomingApps.map((app) => {
          const daysLeft = getDaysUntil(app.deadline);
          return (
            <div
              key={app.id}
              className="bg-white border border-zinc-200/60 rounded-lg p-3 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                {app.type === "Université" ? (
                  <GraduationCap className="w-4 h-4 text-zinc-400" />
                ) : (
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-900">{app.name}</p>
                  <p className="text-xs text-zinc-500">{app.country}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-xs font-medium text-zinc-600">
                    {formatDate(app.deadline)}
                  </p>
                </div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    daysLeft <= 2
                      ? "text-rose-600 bg-rose-50 border-rose-100"
                      : "text-zinc-600 bg-zinc-50 border-zinc-200"
                  }`}
                >
                  {daysLeft === 0
                    ? "Aujourd'hui"
                    : daysLeft === 1
                    ? "Demain"
                    : `J-${daysLeft}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
