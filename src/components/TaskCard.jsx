"use client";

import { MessageSquare, Paperclip, Edit2, Trash2 } from "lucide-react";

export const PRIORITY_STYLES = {
  urgent: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-slate-400 bg-slate-800 border-slate-700",
};

export default function TaskCard({
  task,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) {
  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => onSelect(task)}
      className={`glass-card rounded-xl p-4 border transition cursor-pointer hover:border-emerald-500/50 hover:shadow-lg ${
        isSelected
          ? "border-emerald-500 bg-slate-900/90 shadow-md shadow-emerald-500/10"
          : "border-slate-800/80 bg-slate-900/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-100 line-clamp-2">
          {task.title}
        </h3>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase border ${
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <MessageSquare className="h-3 w-3" />
            {task.comments?.length || 0}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Paperclip className="h-3 w-3" />
            {task.attachments?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id={`edit-task-btn-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e, task);
            }}
            title="Edit task"
            className="p-1 text-slate-500 hover:text-white transition"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            id={`delete-task-btn-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e, task.id);
            }}
            title="Delete task"
            className="p-1 text-slate-500 hover:text-red-400 transition"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
