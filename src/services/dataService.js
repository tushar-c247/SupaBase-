import { createClient } from "@/utils/supabase/client";

// Initial seed data for demo mode
const INITIAL_DEMO_PROJECTS = [
  {
    id: "proj-1",
    name: "Supabase Mobile App",
    description: "Build iOS and Android client using Next.js & Capacitor with Supabase Auth",
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "proj-2",
    name: "Customer Analytics Dashboard",
    description: "Real-time user engagement metrics pipeline with PostgreSQL aggregations",
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_DEMO_TASKS = [
  {
    id: "task-101",
    project_id: "proj-1",
    title: "Implement Supabase Auth with Google & GitHub OAuth",
    description: "Configure callback URL in Supabase dashboard and setup PKCE flow in Next.js",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "task-102",
    project_id: "proj-1",
    title: "Setup Push Notifications via Supabase Webhooks",
    description: "Trigger edge functions upon new comment or task assignment",
    status: "todo",
    priority: "medium",
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "task-103",
    project_id: "proj-1",
    title: "Initial database migration with RLS",
    description: "Write schema.sql with foreign keys, indexes, and row level security",
    status: "done",
    priority: "urgent",
    due_date: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const INITIAL_DEMO_COMMENTS = [
  {
    id: "comm-1",
    task_id: "task-101",
    user_email: "alex@team.io",
    content: "OAuth redirect URIs verified in staging environment.",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "comm-2",
    task_id: "task-101",
    user_email: "demo.developer@example.com",
    content: "Testing token refresh with the middleware now.",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const INITIAL_DEMO_ATTACHMENTS = [
  {
    id: "att-1",
    task_id: "task-101",
    file_name: "auth_architecture_diagram.png",
    file_path: "mock/auth_architecture_diagram.png",
    file_size: 248000,
    file_type: "image/png",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Helper to get demo storage
function getDemoStorage(key, initial) {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(`demo_${key}`);
  if (!stored) {
    localStorage.setItem(`demo_${key}`, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
}

function setDemoStorage(key, data) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`demo_${key}`, JSON.stringify(data));
  }
}

export const dataService = {
  // ================= PROJECTS =================
  async getProjects(userId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*, tasks(id, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }

    const projects = getDemoStorage("projects", INITIAL_DEMO_PROJECTS);
    const tasks = getDemoStorage("tasks", INITIAL_DEMO_TASKS);
    return projects.map((p) => ({
      ...p,
      tasks: tasks.filter((t) => t.project_id === p.id),
    }));
  },

  async getProjectById(projectId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (error) throw error;
      return data;
    }

    const projects = getDemoStorage("projects", INITIAL_DEMO_PROJECTS);
    return projects.find((p) => p.id === projectId) || null;
  },

  async createProject(project, userId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ ...project, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const projects = getDemoStorage("projects", INITIAL_DEMO_PROJECTS);
    const newProj = {
      ...project,
      id: "proj-" + Date.now(),
      user_id: userId,
      status: project.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setDemoStorage("projects", updated);
    return newProj;
  },

  async deleteProject(projectId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      return true;
    }

    const projects = getDemoStorage("projects", INITIAL_DEMO_PROJECTS);
    setDemoStorage("projects", projects.filter((p) => p.id !== projectId));
    return true;
  },

  // ================= TASKS =================
  async getTasks(projectId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, comments(id), attachments(id)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }

    const tasks = getDemoStorage("tasks", INITIAL_DEMO_TASKS);
    const comments = getDemoStorage("comments", INITIAL_DEMO_COMMENTS);
    const attachments = getDemoStorage("attachments", INITIAL_DEMO_ATTACHMENTS);
    return tasks
      .filter((t) => t.project_id === projectId)
      .map((t) => ({
        ...t,
        comments: comments.filter((c) => c.task_id === t.id),
        attachments: attachments.filter((a) => a.task_id === t.id),
      }));
  },

  async createTask(task, userId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...task, created_by: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const tasks = getDemoStorage("tasks", INITIAL_DEMO_TASKS);
    const newTask = {
      ...task,
      id: "task-" + Date.now(),
      created_by: userId,
      status: task.status || "todo",
      priority: task.priority || "medium",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
      attachments: [],
    };
    const updated = [newTask, ...tasks];
    setDemoStorage("tasks", updated);
    return newTask;
  },

  async updateTask(taskId, updates, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const tasks = getDemoStorage("tasks", INITIAL_DEMO_TASKS);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    setDemoStorage("tasks", updated);
    return updated.find((t) => t.id === taskId);
  },

  async deleteTask(taskId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      return true;
    }

    const tasks = getDemoStorage("tasks", INITIAL_DEMO_TASKS);
    setDemoStorage("tasks", tasks.filter((t) => t.id !== taskId));
    return true;
  },

  // ================= COMMENTS =================
  async getComments(taskId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    }

    const comments = getDemoStorage("comments", INITIAL_DEMO_COMMENTS);
    return comments.filter((c) => c.task_id === taskId);
  },

  async addComment(comment, userId, userEmail, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ ...comment, user_id: userId, user_email: userEmail }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const comments = getDemoStorage("comments", INITIAL_DEMO_COMMENTS);
    const newComment = {
      ...comment,
      id: "comm-" + Date.now(),
      user_id: userId,
      user_email: userEmail,
      created_at: new Date().toISOString(),
    };
    const updated = [...comments, newComment];
    setDemoStorage("comments", updated);
    return newComment;
  },

  async deleteComment(commentId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      return true;
    }

    const comments = getDemoStorage("comments", INITIAL_DEMO_COMMENTS);
    setDemoStorage("comments", comments.filter((c) => c.id !== commentId));
    return true;
  },

  // ================= ATTACHMENTS =================
  async getAttachments(taskId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }

    const attachments = getDemoStorage("attachments", INITIAL_DEMO_ATTACHMENTS);
    return attachments.filter((a) => a.task_id === taskId);
  },

  async uploadAttachment(taskId, file, userId, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      // 1. Upload to Supabase Storage bucket 'task-attachments'
      const fileExt = file.name.split(".").pop();
      const filePath = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert record in attachments table
      const { data, error: dbError } = await supabase
        .from("attachments")
        .insert([
          {
            task_id: taskId,
            user_id: userId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    }

    // Demo Mode attachment simulation
    const attachments = getDemoStorage("attachments", INITIAL_DEMO_ATTACHMENTS);
    const newAtt = {
      id: "att-" + Date.now(),
      task_id: taskId,
      user_id: userId,
      file_name: file.name,
      file_path: `mock/${file.name}`,
      file_size: file.size,
      file_type: file.type,
      created_at: new Date().toISOString(),
    };
    const updated = [newAtt, ...attachments];
    setDemoStorage("attachments", updated);
    return newAtt;
  },

  async deleteAttachment(attachment, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      await supabase.storage.from("task-attachments").remove([attachment.file_path]);
      const { error } = await supabase.from("attachments").delete().eq("id", attachment.id);
      if (error) throw error;
      return true;
    }

    const attachments = getDemoStorage("attachments", INITIAL_DEMO_ATTACHMENTS);
    setDemoStorage("attachments", attachments.filter((a) => a.id !== attachment.id));
    return true;
  },

  getAttachmentUrl(filePath, isDemo) {
    const supabase = createClient();
    if (!isDemo && supabase) {
      const { data } = supabase.storage.from("task-attachments").getPublicUrl(filePath);
      return data.publicUrl;
    }
    return "#";
  },

  // ================= REALTIME SUBSCRIPTION =================
  subscribeToTaskChanges(taskId, callback) {
    const supabase = createClient();
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`task-realtime-${taskId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `task_id=eq.${taskId}` },
        (payload) => callback("comment", payload)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attachments", filter: `task_id=eq.${taskId}` },
        (payload) => callback("attachment", payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
