"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  ShieldAlert,
  Mail,
  Lock,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  _id?: string;
}

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "user" as "admin" | "user",
  });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    if (user.role !== "admin") {
      alert("Accès refusé. Seuls les administrateurs peuvent accéder à cette page.");
      router.push("/dashboard");
      return;
    }

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const userId = editingUser?.id || editingUser?._id;
      const url = editingUser ? `/api/users/${userId}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const body: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Une erreur est survenue");
        return;
      }

      setFormData({ email: "", name: "", password: "", role: "user" });
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses candidatures seront également supprimées."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Une erreur est survenue");
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: "", name: "", password: "", role: "user" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xs font-bold text-indigo-650 animate-pulse uppercase tracking-wider">
          Chargement du panneau administrateur...
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Gestion des Utilisateurs 👥
            </h2>
            <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed max-w-xl">
              Gérez les privilèges d&apos;accès, créez des comptes administrateurs ou étudiants et modifiez les utilisateurs existants.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un utilisateur
            </button>
          )}
        </div>
      </div>

      {/* User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/85 p-6 mb-6 shadow-sm animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            {editingUser ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                  Mot de passe {editingUser && "(vide pour ne pas changer)"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                  Rôle applicatif
                </label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "user",
                      })
                    }
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="user">Utilisateur standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-colors"
              >
                {editingUser ? "Sauvegarder" : "Créer le compte"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-455 uppercase tracking-widest border-b border-slate-200/60">
                  Nom d&apos;utilisateur
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-455 uppercase tracking-widest border-b border-slate-200/60">
                  Adresse email
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-455 uppercase tracking-widest border-b border-slate-200/60">
                  Rôle
                </th>
                <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-455 uppercase tracking-widest border-b border-slate-200/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id || u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-slate-100 border border-slate-200/40 rounded-xl flex items-center justify-center font-bold text-xs text-slate-600">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-xs font-bold text-slate-800">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.role === "admin" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg w-fit">
                        <Shield className="w-3 h-3 text-indigo-600" />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg w-fit inline-block">
                        Étudiant
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== u.id && currentUser?._id !== u._id && (
                        <button
                          onClick={() => handleDelete(u.id || u._id || "")}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs font-semibold">
            Aucun utilisateur enregistré.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
