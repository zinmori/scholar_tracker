"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        setError(data.error || "Identifiants invalides");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-md w-full space-y-8 bg-white/[0.03] backdrop-blur-xl p-8 border border-white/10 rounded-3xl shadow-2xl relative z-10">
        <div>
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-fuchsia-550 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Scholar Tracker
          </h2>
          <p className="mt-2 text-center text-xs text-slate-300 font-medium">
            Connectez-vous pour piloter vos candidatures et bourses
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10.5 pr-4 py-3 border border-white/10 placeholder-slate-400 text-white bg-slate-900/50 backdrop-blur-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-350 transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10.5 pr-4 py-3 border border-white/10 placeholder-slate-400 text-white bg-slate-900/50 backdrop-blur-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-rose-400 leading-normal">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30"
            >
              {loading ? "Connexion..." : "Se connecter"}
              {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-300 font-medium">
              Nouveau sur Scholar Tracker ?{" "}
              <Link
                href="/register"
                className="font-bold text-white hover:text-indigo-400 transition-colors underline underline-offset-4"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
