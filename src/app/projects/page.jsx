"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services/dataService";
import { FolderKanban, Plus, Search } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isDemo, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const data = await dataService.getProjects(user?.id, isDemo);
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user?.id, isDemo]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadProjects();
    }
  }, [user, loading, router, loadProjects]);

  const handleCreateProject = async (formData) => {
    setSaving(true);
    try {
      await dataService.createProject(formData, user.id, isDemo);
      setIsModalOpen(false);
      await loadProjects();
    } catch (err) {
      alert(err.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project and all its tasks?")) return;
    try {
      await dataService.deleteProject(projectId, isDemo);
      await loadProjects();
    } catch (err) {
      alert(err.message || "Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-emerald-400" />
            Projects Directory
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Create, view, and organize your development workspaces.
          </p>
        </div>

        <button
          id="open-create-project-modal-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="projects-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl bg-slate-900/80 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "active", "completed", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                statusFilter === st
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h2 className="text-sm font-semibold text-white">No projects found</h2>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery ? "Try refining your search terms." : "Create your first project to start organizing tasks."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateProject}
        saving={saving}
      />
    </div>
  );
}
