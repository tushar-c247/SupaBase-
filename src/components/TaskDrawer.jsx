"use client";

import { useState } from "react";
import {
  X,
  Radio,
  Calendar,
  Paperclip,
  Upload,
  FileText,
  ExternalLink,
  Trash2,
  MessageSquare,
  Clock,
  Send,
} from "lucide-react";
import { PRIORITY_STYLES } from "./TaskCard";
import { dataService } from "@/services/dataService";

export default function TaskDrawer({
  task,
  onClose,
  onStatusChange,
  comments,
  attachments,
  onAddComment,
  onDeleteComment,
  onFileUpload,
  onDeleteAttachment,
  uploadingFile,
  isDemo,
}) {
  const [commentText, setCommentText] = useState("");

  if (!task) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="glass-panel h-full sm:h-[95vh] w-full max-w-xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                PRIORITY_STYLES[task.priority]
              }`}
            >
              {task.priority}
            </span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime Live Indicator */}
            <div
              title="Supabase Realtime WebSocket Active"
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] text-emerald-400"
            >
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Realtime Live</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task Info */}
          <div>
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description || "No description provided."}
            </p>
            {task.due_date && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-emerald-400" />
                <span>File Attachments ({attachments.length})</span>
              </h3>

              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition">
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
                <input
                  type="file"
                  disabled={uploadingFile}
                  onChange={onFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center">
                <Paperclip className="mx-auto h-6 w-6 text-slate-600 mb-1" />
                <p className="text-xs text-slate-500">
                  No attachments yet. Upload documents or images directly to Supabase Storage.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => {
                  const fileUrl = dataService.getAttachmentUrl(att.file_path, isDemo);
                  return (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
                        <div className="truncate">
                          <p className="text-slate-200 font-medium truncate">{att.file_name}</p>
                          <p className="text-[10px] text-slate-500">
                            {(att.file_size / 1024).toFixed(1)} KB •{" "}
                            {new Date(att.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {fileUrl !== "#" ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1 text-slate-400 hover:text-emerald-400"
                            title="Open / Download"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500">Demo File</span>
                        )}
                        <button
                          onClick={() => onDeleteAttachment(att)}
                          className="rounded p-1 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments Section (Supabase Realtime) */}
          <div className="border-t border-slate-800/80 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>Discussion & Realtime Comments ({comments.length})</span>
            </h3>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  No comments yet. Start the conversation below!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-400">
                        {c.user_email || "Team Member"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={() => onDeleteComment(c.id)}
                          className="text-slate-600 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                id="new-comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment... (instant realtime sync)"
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                id="submit-comment-btn"
                type="submit"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 p-2.5 text-slate-950 transition shadow"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
