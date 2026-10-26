"use client";

import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSave,
  saving,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Title *
            </label>
            <input
              id="project-name-input"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Next.js Mobile Application"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="project-description-input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief summary of project goals and deliverables..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Status
            </label>
            <select
              id="project-status-select"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              id="submit-create-project-btn"
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <span>{saving ? "Creating..." : "Create Project"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
