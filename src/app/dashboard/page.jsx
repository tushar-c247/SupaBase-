"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services/dataService";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  ListTodo,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isDemo, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [fetching, setFetching] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setFetching(true);
    try {
      const data = await dataService.getProjects(user?.id, isDemo);
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [user?.id, isDemo]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, loading, router, loadDashboardData]);

  if (loading || (!user && fetching)) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Project Dashboard</h1>
            {isDemo && (
              <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                Demo Session
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Welcome back, <span className="text-slate-200">{user?.email}</span>. Here is your POC workspace activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            id="dashboard-view-projects-btn"
            href="/projects"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            <FolderKanban className="h-4 w-4" />
            <span>Manage Projects</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Projects</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalProjects}</span>
            <span className="text-[11px] text-slate-500">active containers</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ListTodo className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalTasks}</span>
            <span className="text-[11px] text-slate-500">tracked items</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">In Progress</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{inProgressTasks}</span>
            <span className="text-[11px] text-amber-400/80">needs attention</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Task Completion</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{completionRate}%</span>
            <span className="text-[11px] text-teal-400">{completedTasks} completed</span>
          </div>
        </div>
      </div>

      {/* POC Flow Navigation Roadmap */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          POC Architecture Flow Progress
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: "1. Auth", desc: "Login/Signup", done: true },
            { step: "2. Dashboard", desc: "Overview metrics", done: true },
            { step: "3. Projects", desc: "Containers", done: true },
            { step: "4. Details", desc: "Workspaces", done: true },
            { step: "5. Tasks", desc: "Kanban / CRUD", done: true },
            { step: "6. Comments", desc: "Discussions", done: true },
            { step: "7. Realtime", desc: "Websockets", done: true },
            { step: "8. Files", desc: "Storage Bucket", done: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 flex flex-col items-center justify-center gap-1"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                ✓
              </div>
              <span className="font-semibold text-slate-200 text-[11px]">{item.step}</span>
              <span className="text-[10px] text-slate-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects List */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-emerald-400" />
            Recent Projects
          </h2>
          <Link
            id="dashboard-all-projects-link"
            href="/projects"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-10">
            <FolderKanban className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No projects found. Create your first project to get started!</p>
            <Link
              href="/projects"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((p) => {
              const pTasks = p.tasks || [];
              const pDone = pTasks.filter((t) => t.status === "done").length;
              const pPercent = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

              return (
                <Link
                  key={p.id}
                  id={`project-card-${p.id}`}
                  href={`/projects/${p.id}`}
                  className="rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 p-5 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">{p.description || "No description provided."}</p>
                    </div>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {pDone} / {pTasks.length} tasks completed
                    </span>
                    <span className="text-slate-200 font-semibold">{pPercent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${pPercent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
