-- ============================================================
-- Supabase Storage Setup — run once in SQL Editor
-- ============================================================

-- Create public buckets
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('covers', 'covers', true, 5242880),   -- 5 MB
  ('music',  'music',  true, 8388608)    -- 8 MB
on conflict (id) do nothing;

-- ── covers policies ────────────────────────────────────────

create policy "covers: public read"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "covers: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "covers: owner delete"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.role() = 'authenticated');

-- ── music policies ─────────────────────────────────────────

create policy "music: public read"
  on storage.objects for select
  using (bucket_id = 'music');

create policy "music: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'music' and auth.role() = 'authenticated');

create policy "music: owner delete"
  on storage.objects for delete
  using (bucket_id = 'music' and auth.role() = 'authenticated');
