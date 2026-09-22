-- Real, admin-managed blog articles, replacing the hardcoded catalog in
-- data/articles.ts. All articles are authored under the platform's own
-- name ("Motqen Team") rather than individual teachers.
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  excerpt text not null,
  excerpt_en text,
  content text not null,
  content_en text,
  category text not null default 'عام' check (category in ('الحفظ', 'التجويد', 'التربية', 'عام')),
  image text,
  status text not null default 'published' check (status in ('published', 'draft')),
  views int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "articles: public reads published" on public.articles
  for select using (status = 'published' or public.is_admin());

create policy "articles: admins manage" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

-- Lets any visitor (even logged out) bump a published article's view count
-- without granting broad UPDATE access to the table.
create or replace function public.increment_article_views(article_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles set views = views + 1 where slug = article_slug and status = 'published';
end;
$$;

grant execute on function public.increment_article_views(text) to anon, authenticated;
