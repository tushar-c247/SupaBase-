"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function TaskModal({ isOpen, onClose, onSave, editingTask }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        status: editingTask.status,
        priority: editingTask.priority,
        due_date: editingTask.due_date ? editingTask.due_date.split("T")[0] : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      });
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            {editingTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement OAuth Flow"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Task instructions, acceptance criteria..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="task-status-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Due Date
            </label>
            <input
              id="task-due-date-input"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
