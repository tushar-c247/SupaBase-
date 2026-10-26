"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services/dataService";
import { ArrowLeft, Plus } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import TaskDrawer from "@/components/TaskDrawer";

export default function ProjectDetailsPage({ params }) {
  // Unwrap params using React 19 `use()`
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const router = useRouter();
  const { user, isDemo, loading } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Active Selected Task for Drawer / Detail
  const [activeTask, setActiveTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Create / Edit Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load project metadata and tasks
  const loadProjectAndTasks = useCallback(async () => {
    setFetching(true);
    try {
      const proj = await dataService.getProjectById(projectId, isDemo);
      const taskList = await dataService.getTasks(projectId, isDemo);
      setProject(proj);
      setTasks(taskList || []);
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setFetching(false);
    }
  }, [projectId, isDemo]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user && projectId) {
      loadProjectAndTasks();
    }
  }, [user, loading, projectId, router, loadProjectAndTasks]);

  // When a task is selected, load its comments & attachments and subscribe to Realtime
  useEffect(() => {
    if (!activeTask) return;

    let unsubscribe = () => {};

    const loadDetails = async () => {
      try {
        const comments = await dataService.getComments(activeTask.id, isDemo);
        const attachments = await dataService.getAttachments(activeTask.id, isDemo);
        setTaskComments(comments || []);
        setTaskAttachments(attachments || []);

        // Subscribe to Supabase Realtime changes
        unsubscribe = dataService.subscribeToTaskChanges(activeTask.id, (type, payload) => {
          if (type === "comment") {
            if (payload.eventType === "INSERT") {
              setTaskComments((prev) => [...prev, payload.new]);
            } else if (payload.eventType === "DELETE") {
              setTaskComments((prev) => prev.filter((c) => c.id !== payload.old.id));
            }
          } else if (type === "attachment") {
            if (payload.eventType === "INSERT") {
              setTaskAttachments((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === "DELETE") {
              setTaskAttachments((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          }
        });
      } catch (err) {
        console.error("Error loading task details:", err);
      }
    };

    loadDetails();

    return () => {
      unsubscribe();
    };
  }, [activeTask, isDemo]);

  // Handle Task Creation & Editing
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        const updated = await dataService.updateTask(editingTask.id, formData, isDemo);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...updated } : t)));
        if (activeTask && activeTask.id === editingTask.id) {
          setActiveTask({ ...activeTask, ...updated });
        }
      } else {
        const created = await dataService.createTask(
          { ...formData, project_id: projectId },
          user.id,
          isDemo
        );
        setTasks((prev) => [created, ...prev]);
      }
      setIsTaskModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to save task");
    }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await dataService.deleteTask(taskId, isDemo);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTask && activeTask.id === taskId) {
        setActiveTask(null);
      }
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await dataService.updateTask(taskId, { status: newStatus }, isDemo);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      if (activeTask && activeTask.id === taskId) {
        setActiveTask({ ...activeTask, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment
  const handleAddComment = async (content) => {
    if (!activeTask) return;
    try {
      const comment = await dataService.addComment(
        { task_id: activeTask.id, content },
        user.id,
        user.email,
        isDemo
      );
      setTaskComments((prev) => [...prev, comment]);

      // Update comment count on task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTask.id
            ? { ...t, comments: [...(t.comments || []), { id: comment.id }] }
            : t
        )
      );
    } catch (err) {
      alert(err.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dataService.deleteComment(commentId, isDemo);
      setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  };

  // File Upload to Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeTask) return;

    setUploadingFile(true);
    try {
      const att = await dataService.uploadAttachment(activeTask.id, file, user.id, isDemo);
      setTaskAttachments((prev) => [att, ...prev]);

      // Update attachment count on task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTask.id
            ? { ...t, attachments: [...(t.attachments || []), { id: att.id }] }
            : t
        )
      );
    } catch (err) {
      alert(err.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDeleteAttachment = async (att) => {
    if (!confirm(`Delete attachment "${att.file_name}"?`)) return;
    try {
      await dataService.deleteAttachment(att, isDemo);
      setTaskAttachments((prev) => prev.filter((a) => a.id !== att.id));
    } catch (err) {
      alert(err.message || "Failed to delete attachment");
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Loading project workspace...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="mt-1 text-xs text-slate-400">The requested project could not be located.</p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  // Calculate task statistics
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const percentDone = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation & Project Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-4 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="w-40 sm:w-48 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-200 font-semibold">{percentDone}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${percentDone}%` }}
                />
              </div>
            </div>

            <button
              id="create-task-btn"
              onClick={handleOpenCreateTask}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Todo */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                To Do ({todoTasks.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px] rounded-2xl bg-slate-950/40 p-2.5 border border-slate-900">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={activeTask?.id === task.id}
                onSelect={setActiveTask}
                onEdit={handleOpenEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-center py-10 text-[11px] text-slate-600">No tasks in To Do</p>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                In Progress ({inProgressTasks.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px] rounded-2xl bg-slate-950/40 p-2.5 border border-slate-900">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={activeTask?.id === task.id}
                onSelect={setActiveTask}
                onEdit={handleOpenEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-center py-10 text-[11px] text-slate-600">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Done ({doneTasks.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px] rounded-2xl bg-slate-950/40 p-2.5 border border-slate-900">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={activeTask?.id === task.id}
                onSelect={setActiveTask}
                onEdit={handleOpenEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
            {doneTasks.length === 0 && (
              <p className="text-center py-10 text-[11px] text-slate-600">No completed tasks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Drawer Component */}
      <TaskDrawer
        task={activeTask}
        onClose={() => setActiveTask(null)}
        onStatusChange={handleStatusChange}
        comments={taskComments}
        attachments={taskAttachments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onFileUpload={handleFileUpload}
        onDeleteAttachment={handleDeleteAttachment}
        uploadingFile={uploadingFile}
        isDemo={isDemo}
      />

      {/* Task Modal Component */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  );
}
