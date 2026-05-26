"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, FileCheck, AlertTriangle } from "lucide-react";
import { Application } from "@/types";

interface NotificationCenterProps {
  applications: Application[];
}

interface NotificationItem {
  id: string;
  type: "deadline" | "checklist";
  title: string;
  message: string;
  dateString?: string;
  urgency: "high" | "medium" | "info";
  appId: string;
}

export default function NotificationCenter({ applications }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotifications = (): NotificationItem[] => {
    const list: NotificationItem[] = [];
    const now = new Date();

    applications.forEach((app) => {
      // 1. Check deadline
      const deadline = new Date(app.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isPending = app.status === "En cours" || app.status === "En attente" || app.status === "En révision";

      if (isPending) {
        if (diffDays < 0) {
          list.push({
            id: `deadline-overdue-${app.id}`,
            type: "deadline",
            title: "Date limite dépassée !",
            message: `La date limite pour "${app.name}" (${app.type}) est passée.`,
            urgency: "high",
            appId: app.id,
          });
        } else if (diffDays <= 3) {
          list.push({
            id: `deadline-urgent-${app.id}`,
            type: "deadline",
            title: "Deadline imminente !",
            message: `Plus que ${diffDays} jour${diffDays > 1 ? "s" : ""} pour finaliser "${app.name}".`,
            urgency: "high",
            appId: app.id,
          });
        } else if (diffDays <= 7) {
          list.push({
            id: `deadline-warning-${app.id}`,
            type: "deadline",
            title: "Échéance proche",
            message: `La deadline de "${app.name}" approche (${diffDays} jours restants).`,
            urgency: "medium",
            appId: app.id,
          });
        }
      }

      // 2. Check checklist documents
      if (isPending && app.documents && app.documents.length > 0) {
        const incomplete = app.documents.filter((doc) => !doc.completed);
        if (incomplete.length > 0) {
          list.push({
            id: `checklist-${app.id}`,
            type: "checklist",
            title: "Tâches / Docs manquants",
            message: `Il reste ${incomplete.length} tâche${incomplete.length > 1 ? "s" : ""} ou document${incomplete.length > 1 ? "s" : ""} à compléter pour "${app.name}".`,
            urgency: "info",
            appId: app.id,
          });
        }
      }
    });

    return list;
  };

  const notifications = getNotifications();
  const count = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/80 rounded-xl transition-all duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform active:scale-90" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200/80 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
            <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
              {count} alerte{count > 1 ? "s" : ""}
            </span>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-50">
            {count === 0 ? (
              <div className="py-12 px-5 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-zinc-800">Tout est à jour !</p>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                  Pas d&apos;échéances urgentes ni de documents manquants.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-zinc-50/50 transition-colors flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                      item.urgency === "high"
                        ? "bg-rose-50 text-rose-600"
                        : item.urgency === "medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {item.type === "deadline" ? (
                      <Calendar className="w-3.5 h-3.5" />
                    ) : item.urgency === "high" ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <FileCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
