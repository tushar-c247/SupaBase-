"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Sparkles,
  ShieldCheck,
  Layers,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  Server,
  Zap,
  Code2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("client");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [statusMessage, setStatusMessage] = useState("");

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    async function checkSupabase() {
      const client = createClient();
      if (!client) {
        setConnectionStatus("unconfigured");
        setStatusMessage(
          "Supabase credentials not detected in .env.local. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect."
        );
        return;
      }

      try {
        const { error } = await client.auth.getSession();
        if (error) {
          setConnectionStatus("error");
          setStatusMessage(error.message);
        } else {
          setConnectionStatus("connected");
          setStatusMessage("Supabase client initialized successfully!");
        }
      } catch (err) {
        setConnectionStatus("error");
        setStatusMessage(err.message || "Failed to reach Supabase endpoint.");
      }
    }

    checkSupabase();
  }, []);

  const codeSnippets = {
    client: `// src/app/example/client-component.js
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ClientExample() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, [supabase]);

  return <div>Welcome {user?.email || "Guest"}</div>;
}`,
    server: `// src/app/example/server-component.js
import { createClient } from "@/utils/supabase/server";

export default async function ServerExample() {
  const supabase = await createClient();
  if (!supabase) {
    return <p>Supabase not configured in .env.local</p>;
  }

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .limit(5);

  return (
    <ul>
      {items?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}`,
    middleware: `// src/middleware.js
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request) {
  // Automatically refreshes auth token cookies across requests
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};`,
    env: `# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080c14] text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background glowing gradients */}
      <div className="glow-gradient pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-70" />
      <div className="pointer-events-none absolute -left-48 top-48 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-96 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20 font-bold text-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white">Next.js + React</span>
              <span className="ml-2 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                Supabase Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              id="header-supabase-doc-link"
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Supabase Docs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              id="header-nextjs-doc-link"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Next.js Docs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Next.js 16 • React 19 • Tailwind CSS v4 • Supabase SSR</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Modern Fullstack <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Next.js & Supabase Setup
            </span>
          </h1>

          <p className="text-base text-slate-400 sm:text-lg leading-relaxed">
            Your project environment has been configured with React 19, the Next.js App Router, Tailwind CSS v4, and official Supabase SSR client utilities for server & client components.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              id="hero-launch-poc-btn"
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              <span>Launch Live POC App</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              id="hero-signin-btn"
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-5 py-2.5 text-xs font-medium text-slate-200 transition"
            >
              <span>Sign In / Demo Mode</span>
            </Link>
          </div>
        </section>

        {/* Live Supabase Connection Banner */}
        <section className="mt-10 max-w-3xl mx-auto">
          <div
            id="supabase-status-card"
            className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-700/50"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    connectionStatus === "connected"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : connectionStatus === "checking"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {connectionStatus === "connected" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : connectionStatus === "checking" ? (
                    <Zap className="h-5 w-5 animate-pulse" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Supabase Connection Status</h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        connectionStatus === "connected"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : connectionStatus === "checking"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {connectionStatus === "connected"
                        ? "Active"
                        : connectionStatus === "checking"
                        ? "Checking..."
                        : "Credentials Needed"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{statusMessage}</p>
                </div>
              </div>

              {connectionStatus !== "connected" && (
                <button
                  id="copy-env-setup-btn"
                  onClick={() =>
                    copyToClipboard(
                      "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=",
                      "env-template"
                    )
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  {copiedKey === "env-template" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy .env Template</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Core Stack Feature Cards */}
        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 group">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Next.js 16 App Router</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Native nested layouts, React Server Components (RSC), Suspense streaming, and Route Handlers out of the box.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 transition hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 group">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">React 19</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Powered by the latest React 19 engine with enhanced hook primitives, concurrent features, and fast client hydration.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 transition hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 group">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Tailwind CSS v4</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Zero-config CSS-native build system with high-performance CSS compilation and streamlined utility tokens.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 transition hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 group">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Supabase SSR</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Pre-wired <code className="text-emerald-400">@supabase/ssr</code> utilities for cookie handling across Client, Server, and Middleware.
            </p>
          </div>
        </section>

        {/* Code Snippets & Architecture Explorer */}
        <section className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Explorer Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Supabase Integration Blueprint</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[
                  { id: "client", label: "Client Component" },
                  { id: "server", label: "Server Component" },
                  { id: "middleware", label: "Session Middleware" },
                  { id: "env", label: ".env.local" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    id={`tab-select-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                      activeTab === tab.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            <div className="relative p-5">
              <button
                id="copy-current-snippet-btn"
                onClick={() => copyToClipboard(codeSnippets[activeTab], activeTab)}
                className="absolute right-6 top-6 flex items-center gap-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 border border-slate-700/80 transition shadow"
              >
                {copiedKey === activeTab ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300/90 pt-4">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section className="mt-14 max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 border border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              Getting Started Checklist
            </h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  1
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Add your Supabase project credentials to <code className="text-emerald-400">.env.local</code>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Retrieve your Project URL and Anon API Key from{" "}
                    <a
                      href="https://supabase.com/dashboard/project/_/settings/api"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      Supabase Project Settings → API
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  2
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Import ready-to-use Supabase clients anywhere in your app
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use <code className="text-slate-300">src/utils/supabase/client.js</code> for Client Components and{" "}
                    <code className="text-slate-300">src/utils/supabase/server.js</code> for Server Actions and RSCs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  3
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Launch the development server
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 font-mono text-xs text-slate-300">
                    <span>npm run dev</span>
                    <button
                      id="copy-npm-run-dev-btn"
                      onClick={() => copyToClipboard("npm run dev", "npm-dev")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === "npm-dev" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>Built with Next.js, React 19, Tailwind CSS v4, and Supabase SSR.</p>
      </footer>
    </div>
  );
}
