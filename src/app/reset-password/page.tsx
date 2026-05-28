"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien envoyé par email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-550/5 px-4 relative overflow-hidden">
        {/* Background radial glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 relative z-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <CheckCircle className="w-9 h-9 text-emerald-650" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Mot de passe réinitialisé !
            </h2>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Votre mot de passe a été mis à jour avec succès. Vous allez être
              redirigé vers la page de connexion...
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-700 transition-colors font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-550/5 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-950">
            Nouveau mot de passe
          </h1>
          <p className="text-slate-500 text-xs">
            Choisissez un nouveau mot de passe pour votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/5 p-4 border border-rose-500/10 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-semibold text-rose-600 leading-normal">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-650 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-650 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-zinc-500 text-sm">Chargement...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
