"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  LayoutDashboard,
  FolderKanban,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isDemo, signOut } = useAuth();

  if (!user && pathname === "/login") return null;

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                TaskPulse
              </span>
              <span className="text-[10px] text-slate-400">Next.js + Supabase POC</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isDemo && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
              <Sparkles className="h-3 w-3" />
              <span>Demo Mode</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-900/60 border border-slate-800 px-2.5 py-1 text-xs text-slate-300">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="max-w-[160px] truncate">{user.email}</span>
              </div>
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition shadow-md shadow-emerald-500/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
