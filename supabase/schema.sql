-- ============================================================
-- Supabase Schema: Projects -> Tasks -> Comments -> Attachments
-- With Realtime and Storage Buckets
-- (Idempotent script: Safe to run multiple times)
-- ============================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tasks Table (belongs to project)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamp with time zone,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Comments Table (belongs to task)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Attachments Table (files attached to tasks)
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- Indexes for High Performance
-- ============================================================
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_comments_task_id on public.comments(task_id);
create index if not exists idx_comments_created_at on public.comments(created_at);
create index if not exists idx_attachments_task_id on public.attachments(task_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;

-- Projects RLS
drop policy if exists "Users can view their projects" on public.projects;
create policy "Users can view their projects"
  on public.projects for select using (auth.uid() = user_id);

drop policy if exists "Users can insert projects" on public.projects;
create policy "Users can insert projects"
  on public.projects for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their projects" on public.projects;
create policy "Users can update their projects"
  on public.projects for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their projects" on public.projects;
create policy "Users can delete their projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Tasks RLS
drop policy if exists "Users can view tasks in their projects" on public.tasks;
create policy "Users can view tasks in their projects"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create tasks in their projects" on public.tasks;
create policy "Users can create tasks in their projects"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update tasks in their projects" on public.tasks;
create policy "Users can update tasks in their projects"
  on public.tasks for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete tasks in their projects" on public.tasks;
create policy "Users can delete tasks in their projects"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Comments RLS
drop policy if exists "Users can view comments on accessible tasks" on public.comments;
create policy "Users can view comments on accessible tasks"
  on public.comments for select
  using (
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      where tasks.id = comments.task_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create comments on accessible tasks" on public.comments;
create policy "Users can create comments on accessible tasks"
  on public.comments for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      where tasks.id = comments.task_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Attachments RLS
drop policy if exists "Users can view attachments on accessible tasks" on public.attachments;
create policy "Users can view attachments on accessible tasks"
  on public.attachments for select
  using (
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      where tasks.id = attachments.task_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can upload attachments on accessible tasks" on public.attachments;
create policy "Users can upload attachments on accessible tasks"
  on public.attachments for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.tasks
      join public.projects on projects.id = tasks.project_id
      where tasks.id = attachments.task_id
      and projects.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their attachments" on public.attachments;
create policy "Users can delete their attachments"
  on public.attachments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Auto-update updated_at timestamp triggers
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_projects_updated_at on public.projects;
create trigger trigger_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_tasks_updated_at on public.tasks;
create trigger trigger_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_comments_updated_at on public.comments;
create trigger trigger_comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Enable Supabase Realtime for instant updates
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attachments'
  ) then
    alter publication supabase_realtime add table public.attachments;
  end if;
end $$;

-- ============================================================
-- Storage Bucket for Attachments
-- ============================================================
-- 1. Create task-attachments bucket
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', true)
on conflict (id) do update set public = true;

-- 2. Storage Policies
drop policy if exists "Allow authenticated uploads to task-attachments" on storage.objects;
create policy "Allow authenticated uploads to task-attachments"
  on storage.objects for insert
  with check (bucket_id = 'task-attachments' and auth.role() = 'authenticated');

drop policy if exists "Allow public downloads from task-attachments" on storage.objects;
create policy "Allow public downloads from task-attachments"
  on storage.objects for select
  using (bucket_id = 'task-attachments');

drop policy if exists "Allow owner deletion from task-attachments" on storage.objects;
create policy "Allow owner deletion from task-attachments"
  on storage.objects for delete
  using (bucket_id = 'task-attachments' and auth.uid() = owner);
