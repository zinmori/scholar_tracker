"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { User, Application } from "@/types";
import ProfileModal from "./ProfileModal";
import NotificationCenter from "./NotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Load user details
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));

    // Fetch applications to supply to the NotificationCenter
    const loadApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error("Error loading layout applications:", error);
      }
    };
    loadApplications();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSaveProfile = (updatedUser: User) => {
    setUser(updatedUser);
    // Reload user on window to notify potential subscribers
    window.dispatchEvent(new Event("storage"));
  };

  const navItems = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      path: "/dashboard",
      show: true,
    },
    {
      label: "Opportunités",
      icon: BookOpen,
      path: "/opportunities",
      show: true,
    },
    {
      label: "Mes Documents",
      icon: FileText,
      path: "/documents",
      show: true,
    },
    {
      label: "Utilisateurs",
      icon: Users,
      path: "/admin/users",
      show: user?.role === "admin",
    },
  ];

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200/80 fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Scholar Tracker</h1>
            <span className="text-[10px] font-semibold text-slate-400 mt-1 block">Votre avenir, tracé</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-650 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40">
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                  {user.name}
                  {user.role === "admin" && (
                    <Shield className="w-3 h-3 text-indigo-600" />
                  )}
                </p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-655 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-rose-100 bg-white hover:bg-rose-50 text-[10px] font-bold text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="lg:hidden w-full h-16 bg-white border-b border-slate-200/80 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-900">Scholar Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NotificationCenter applications={applications} />
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-16 border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-650"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                      {item.label}
                    </button>
                  );
                })}
            </nav>
            <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                </div>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 items-center justify-between px-8">
          <div>
            {/* Contextual path labels */}
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
              {pathname === "/dashboard"
                ? "Tableau de bord"
                : pathname === "/opportunities"
                ? "Opportunités"
                : pathname === "/documents"
                ? "Documents"
                : pathname === "/admin/users"
                ? "Administration"
                : "Scholar Tracker"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter applications={applications} />
            <div className="h-4 w-px bg-slate-200"></div>
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-800">{user.name}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">{user.role === "admin" ? "Administrateur" : "Étudiant"}</p>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center justify-center font-bold text-xs"
                >
                  {getInitials(user.name)}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-4 lg:p-8 pt-20 lg:pt-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Shared profile editor */}
      {isProfileModalOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
