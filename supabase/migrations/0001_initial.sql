create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  email text not null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  plain_text text not null default '',
  source_type text not null default 'blank' check (source_type in ('blank', 'txt', 'markdown')),
  original_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_members (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role = 'editor'),
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

create index documents_owner_updated_idx on public.documents(owner_id, updated_at desc);
create index document_members_user_idx on public.document_members(user_id, document_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_document_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id <> old.owner_id then
    raise exception 'Document ownership cannot be changed';
  end if;
  return new;
end;
$$;

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger documents_prevent_owner_change
before update on public.documents
for each row execute function public.prevent_document_owner_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create schema if not exists private;

create or replace function private.is_document_owner(target_document_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.documents
    where id = target_document_id and owner_id = (select auth.uid())
  );
$$;

create or replace function private.can_access_document(target_document_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.document_members
    where document_id = target_document_id and user_id = (select auth.uid())
  );
$$;

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_document_owner(uuid) to authenticated;
grant execute on function private.can_access_document(uuid) to authenticated;

revoke all on public.profiles, public.documents, public.document_members from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, delete on public.document_members to authenticated;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_members enable row level security;

create policy "Authenticated users can view profiles"
on public.profiles for select to authenticated using (true);

create policy "Users can update their own display name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can view owned or shared documents"
on public.documents for select to authenticated
using (private.is_document_owner(id) or private.can_access_document(id));

create policy "Users can create their own documents"
on public.documents for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Owners and editors can update documents"
on public.documents for update to authenticated
using (private.is_document_owner(id) or private.can_access_document(id));

create policy "Owners can delete their documents"
on public.documents for delete to authenticated
using (private.is_document_owner(id));

create policy "Users with document access can see members"
on public.document_members for select to authenticated
using (private.is_document_owner(document_id) or private.can_access_document(document_id));

create policy "Owners can add editors"
on public.document_members for insert to authenticated
with check (
  private.is_document_owner(document_id)
  and user_id <> (select auth.uid())
);

create policy "Owners can remove editors"
on public.document_members for delete to authenticated
using (private.is_document_owner(document_id));
