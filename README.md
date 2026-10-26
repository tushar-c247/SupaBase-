# Next.js + React + Supabase Starter

A modern full-stack web application starter built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase SSR** (`@supabase/ssr`).

---

## ⚡ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Backend / Auth / Database**: [Supabase](https://supabase.com) with `@supabase/ssr`
- **Icons**: [Lucide React](https://lucide.dev)

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these in your [Supabase Project Dashboard](https://supabase.com/dashboard/project/_/settings/api) under **Settings → API**.

### 2. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📁 Project Architecture

```
├── .env.example                # Supabase environment variables template
├── .env.local                  # Local environment file (gitignored)
├── public/                     # Static assets
└── src/
    ├── app/
    │   ├── globals.css         # Tailwind CSS v4 entry & theme styles
    │   ├── layout.js           # Root layout with Geist font & metadata
    │   └── page.js             # Interactive landing page & status dashboard
    ├── middleware.js           # Next.js middleware refreshing Supabase auth cookies
    └── utils/
        └── supabase/
            ├── client.js       # Browser client for Client Components ("use client")
            ├── server.js       # Server client for Server Components / Server Actions
            └── middleware.js   # Session refresh helper for middleware
```

---

## 🛠️ Supabase Usage Guide

### Client Component (`"use client"`)
```javascript
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Profile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, [supabase]);

  return <div>Logged in as: {user?.email}</div>;
}
```

### Server Component (Async RSC)
```javascript
import { createClient } from "@/utils/supabase/server";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  return (
    <ul>
      {notes?.map((note) => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}
```

---

## 📜 Available Scripts

- `npm run dev` - Starts the local development server on port 3000
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production build
- `npm run lint` - Runs ESLint to check code quality
