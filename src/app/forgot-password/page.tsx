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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl p-8 border border-white/10 rounded-3xl shadow-2xl relative z-10">
        {success ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-5 animate-bounce">
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Email envoyé !
            </h2>
            <p className="text-slate-300 text-xs mb-6 leading-relaxed">
              Si un compte existe avec cet email, vous recevrez un lien de
              réinitialisation dans quelques instants. Vérifiez votre boîte de
              réception et vos spams.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-350 transition-colors font-bold text-xs"
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={14} />
                <span>Retour à la connexion</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-white">
                Mot de passe oublié ?
              </h1>
              <p className="text-slate-300 text-xs mt-1.5 leading-normal">
                Entrez votre email pour recevoir un lien de réinitialisation sécurisé.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1.5 ml-1"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-10.5 pr-4 py-3 border border-white/10 placeholder-slate-400 text-white bg-slate-900/50 backdrop-blur-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/10 p-3.5 border border-rose-500/20 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-450 leading-normal">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-650 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30"
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
