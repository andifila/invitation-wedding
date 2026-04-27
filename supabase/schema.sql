-- ============================================================
-- WeddingInvite — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
create type plan_type as enum ('free', 'premium');
create type rsvp_status as enum ('pending', 'attending', 'not_attending');

-- ─────────────────────────────────────────
-- PROFILES  (mirrors auth.users)
-- ─────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  plan        plan_type not null default 'free',
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

-- users can read & update only their own profile
create policy "profiles: own read"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────
-- TEMPLATES
-- ─────────────────────────────────────────
create table templates (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  slug           text not null unique,
  thumbnail_url  text not null default '',
  is_premium     boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

alter table templates enable row level security;

-- everyone can read templates
create policy "templates: public read"
  on templates for select
  using (true);

-- seed default templates
insert into templates (name, slug, thumbnail_url, is_premium, sort_order) values
  ('Garden Bloom',   'garden-bloom',   '', false, 1),
  ('Rustic Gold',    'rustic-gold',    '', false, 2),
  ('Modern Minimal', 'modern-minimal', '', false, 3),
  ('Royal Elegance', 'royal-elegance', '', true,  4),
  ('Floral Dream',   'floral-dream',   '', true,  5);

-- ─────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────
create table invitations (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  template_id      uuid not null references templates(id),
  slug             text not null unique,
  bride_name       text not null,
  groom_name       text not null,
  event_date       date not null,
  event_time       time not null,
  venue_name       text not null,
  venue_address    text not null,
  cover_image_url  text,
  custom_message   text,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table invitations enable row level security;

-- owner: full CRUD
create policy "invitations: owner select"
  on invitations for select
  using (auth.uid() = user_id);

create policy "invitations: owner insert"
  on invitations for insert
  with check (auth.uid() = user_id);

create policy "invitations: owner update"
  on invitations for update
  using (auth.uid() = user_id);

create policy "invitations: owner delete"
  on invitations for delete
  using (auth.uid() = user_id);

-- public: read published invitations by slug (for /invite/[slug])
create policy "invitations: public read published"
  on invitations for select
  using (is_published = true);

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invitations_updated_at
  before update on invitations
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────
-- GUESTS
-- ─────────────────────────────────────────
create table guests (
  id             uuid primary key default uuid_generate_v4(),
  invitation_id  uuid not null references invitations(id) on delete cascade,
  name           text not null,
  phone          text,
  rsvp_status    rsvp_status not null default 'pending',
  message        text,
  created_at     timestamptz not null default now()
);

alter table guests enable row level security;

-- invitation owner: full read/write of their guests
create policy "guests: owner select"
  on guests for select
  using (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.user_id = auth.uid()
    )
  );

create policy "guests: owner insert"
  on guests for insert
  with check (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.user_id = auth.uid()
    )
  );

create policy "guests: owner update"
  on guests for update
  using (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.user_id = auth.uid()
    )
  );

create policy "guests: owner delete"
  on guests for delete
  using (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.user_id = auth.uid()
    )
  );

-- public: anyone can insert a guest (RSVP from invitation page)
create policy "guests: public rsvp insert"
  on guests for insert
  with check (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.is_published = true
    )
  );

-- public: guests can read their own record by name + invitation
create policy "guests: public read own"
  on guests for select
  using (
    exists (
      select 1 from invitations
      where invitations.id = guests.invitation_id
        and invitations.is_published = true
    )
  );

-- ─────────────────────────────────────────
-- HELPER VIEWS (for dashboard stats)
-- ─────────────────────────────────────────
create or replace view invitation_stats as
select
  i.id              as invitation_id,
  i.user_id,
  i.slug,
  i.bride_name,
  i.groom_name,
  i.event_date,
  i.is_published,
  count(g.id)                                                       as total_guests,
  count(g.id) filter (where g.rsvp_status = 'attending')           as attending,
  count(g.id) filter (where g.rsvp_status = 'not_attending')       as not_attending,
  count(g.id) filter (where g.rsvp_status = 'pending')             as pending
from invitations i
left join guests g on g.invitation_id = i.id
group by i.id;
