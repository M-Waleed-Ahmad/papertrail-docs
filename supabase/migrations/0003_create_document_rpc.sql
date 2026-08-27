-- A single authenticated write path for document creation and imports.
-- Ownership is always derived from the session, never from a browser-supplied user id.
create or replace function public.create_document(
  p_title text,
  p_content jsonb,
  p_plain_text text,
  p_source_type text,
  p_original_name text default null
)
returns public.documents
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_document public.documents;
begin
  if (select auth.uid()) is null then
    raise exception 'You must be signed in to create a document';
  end if;

  if char_length(trim(p_title)) not between 1 and 160 then
    raise exception 'Document titles must be between 1 and 160 characters';
  end if;

  if p_source_type not in ('blank', 'txt', 'markdown') then
    raise exception 'Unsupported document source type';
  end if;

  insert into public.documents (owner_id, title, content, plain_text, source_type, original_name)
  values ((select auth.uid()), trim(p_title), p_content, coalesce(p_plain_text, ''), p_source_type, p_original_name)
  returning * into created_document;

  return created_document;
end;
$$;

revoke all on function public.create_document(text, jsonb, text, text, text) from public, anon;
grant execute on function public.create_document(text, jsonb, text, text, text) to authenticated;

notify pgrst, 'reload schema';
