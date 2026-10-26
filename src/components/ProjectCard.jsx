"use client";

import Link from "next/link";
import { ListTodo, Calendar, Trash2 } from "lucide-react";

export default function ProjectCard({ project, onDelete }) {
  const pTasks = project.tasks || [];
  const pDone = pTasks.filter((t) => t.status === "done").length;
  const pPercent =
    pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

  return (
    <Link
      id={`project-item-${project.id}`}
      href={`/projects/${project.id}`}
      className="glass-card rounded-2xl p-5 border border-slate-800 transition hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-base text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
            {project.name}
          </h2>
          <span className="shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase">
            {project.status}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {project.description || "No project description provided."}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ListTodo className="h-3.5 w-3.5 text-slate-500" />
            <span>{pTasks.length} tasks</span>
          </div>
          <span className="text-slate-300 font-semibold">{pPercent}% done</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${pPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>

          <button
            id={`delete-project-${project.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(e, project.id);
            }}
            title="Delete Project"
            className="rounded-md p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
