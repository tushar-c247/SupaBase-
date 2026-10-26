"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, startDemo, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccessMsg(
          "Account created! Check your email for confirmation, or sign in.",
        );
        router.push("/dashboard");  
      } else {
        await signIn(email, password);
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    startDemo();
    router.push("/dashboard");
  };

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {isSignUp
                ? "Sign up with Supabase Authentication to manage projects"
                : "Sign in with your email to access your projects and tasks"}
            </p>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Processing..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="mt-5 text-center">
            <button
              id="auth-toggle-mode-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up with Supabase"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-950 px-2 text-slate-500">
                Or Explore Instantly
              </span>
            </div>
          </div>

          {/* 1-Click Demo Mode Button */}
          <button
            id="auth-demo-mode-btn"
            type="button"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 py-2.5 text-xs font-semibold text-emerald-400 transition"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Launch Interactive Demo Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
