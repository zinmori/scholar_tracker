"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info and token in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        router.push("/dashboard");
      } else {
        setError(data.error || "Erreur lors de la création du compte");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-550/5 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-xl p-8 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 relative z-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Retour à la connexion</span>
          </Link>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900 bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-950">
            Créer un compte
          </h2>
          <p className="mt-1 text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            Rejoignez Scholar Tracker dès aujourd&apos;hui
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-2.5 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-2.5 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
                  placeholder="jean.dupont@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">
                Mot de passe (min. 6 caractères)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-2.5 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-2.5 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/5 p-3 border border-rose-500/10 flex gap-2.5 items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-rose-600 leading-normal">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
              {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/"
                className="font-bold text-indigo-650 hover:text-indigo-700 transition-colors underline underline-offset-4"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
