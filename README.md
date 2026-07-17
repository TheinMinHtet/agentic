# Agentic Workflow

## Supabase Auth Setup

Install the new dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

In Supabase Auth settings, disable email confirmation so email/password signup returns an active session immediately.

Create the `users` table with these columns:

```sql
create table public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);
```

Recommended RLS policy if Row Level Security is enabled:

```sql
alter table public.users enable row level security;

create policy "Users can insert their own profile"
on public.users for insert
with check (auth.uid() = user_id);

create policy "Users can read their own profile"
on public.users for select
using (auth.uid() = user_id);
```

Auth routes:

- `/register` creates a Supabase Auth user, validates matching passwords, then inserts `user_id`, `username`, and `email` into `public.users`.
- `/login` signs in with Supabase Auth.
- `/dashboard` is protected by `src/app/dashboard/layout.tsx`; unauthenticated users are redirected to `/login`.
- Logout is handled from the navbar with `supabase.auth.signOut()`.
