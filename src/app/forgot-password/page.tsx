"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-550/5 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/50 relative z-10">
        {success ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <CheckCircle className="w-9 h-9 text-emerald-650" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Si un compte existe avec cet email, vous recevrez un lien de
              réinitialisation dans quelques instants. Vérifiez votre boîte de
              réception et vos spams.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-700 transition-colors font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors mb-4"
              >
                <ArrowLeft size={14} />
                <span>Retour à la connexion</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Mot de passe oublié ?
              </h1>
              <p className="text-slate-500 text-xs mt-1.5 leading-normal">
                Entrez votre email pour recevoir un lien de réinitialisation sécurisé.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/5 p-3.5 border border-rose-500/10 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-600 leading-normal">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
