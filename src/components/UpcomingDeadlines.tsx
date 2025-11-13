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
    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Deadlines Urgentes ({upcomingApps.length})
          </h3>
          <div className="space-y-2">
            {upcomingApps.map((app) => {
              const daysLeft = getDaysUntil(app.deadline);
              return (
                <div
                  key={app.id}
                  className="bg-white rounded p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {app.type === "Université" ? (
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-600">{app.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(app.deadline)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        daysLeft <= 2
                          ? "text-red-600"
                          : daysLeft <= 5
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {daysLeft === 0
                        ? "Aujourd'hui !"
                        : daysLeft === 1
                        ? "Demain !"
                        : `Dans ${daysLeft} jours`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
