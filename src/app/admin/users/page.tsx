"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  ArrowLeft,
  Shield,
  User as UserIcon,
} from "lucide-react";

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

    // Check if user is admin
    if (user.role !== "admin") {
      alert(
        "Accès refusé. Seuls les administrateurs peuvent accéder à cette page."
      );
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

      // Only include password if it's provided
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

      // Reset form and refresh users
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm font-medium text-zinc-500 animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2.5">
                <Users className="w-7 h-7 text-zinc-900" />
                Gestion des utilisateurs
              </h1>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-xs font-semibold rounded-lg shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter un utilisateur
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 mb-6 shadow-xs animate-in fade-in duration-200">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
              {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 focus:outline-none focus:border-zinc-900 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 focus:outline-none focus:border-zinc-900 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Mot de passe{" "}
                    {editingUser && "(laisser vide pour ne pas changer)"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 focus:outline-none focus:border-zinc-900 transition-colors"
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "user",
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-850 focus:outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-850 text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingUser ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60">
                  Utilisateur
                </th>
                <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60">
                  Rôle
                </th>
                <th className="px-6 py-3.5 text-right text-[10px] font-semibold text-zinc-450 uppercase tracking-wider border-b border-zinc-200/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {users.map((user) => (
                <tr key={user.id || user._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-zinc-100 border border-zinc-200/40 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-zinc-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-650">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === "admin" ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200/80 rounded-full text-[10px] font-semibold w-fit">
                        <Shield className="w-3.5 h-3.5 text-zinc-700" />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-zinc-50 text-zinc-600 border border-zinc-200/40 rounded-full text-[10px] font-semibold w-fit inline-block">
                        Utilisateur
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== user.id &&
                        currentUser?._id !== user._id && (
                          <button
                            onClick={() =>
                              handleDelete(user.id || user._id || "")
                            }
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-all"
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
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-xs text-zinc-500 text-sm font-medium">
            Aucun utilisateur trouvé
          </div>
        )}
      </main>
    </div>
  );
}
