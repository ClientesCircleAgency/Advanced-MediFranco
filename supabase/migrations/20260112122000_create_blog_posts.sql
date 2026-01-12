-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  content text not null,
  author text not null,
  images text[] default array[]::text[],
  slug text unique,
  published_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- Policies
create policy "Public blog posts are viewable by everyone"
  on public.blog_posts for select
  using (true);

create policy "Admins can insert blog posts"
  on public.blog_posts for insert
  with check (auth.role() = 'authenticated');

create policy "Admins can update blog posts"
  on public.blog_posts for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete blog posts"
  on public.blog_posts for delete
  using (auth.role() = 'authenticated');

-- Triggers for updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.blog_posts
  for each row execute procedure moddatetime (updated_at);
