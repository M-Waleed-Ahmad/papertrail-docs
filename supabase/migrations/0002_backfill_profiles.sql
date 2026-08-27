-- Run this migration once when Auth users were created before 0001_initial.sql.
-- The trigger in 0001 continues to create profiles for every future account.
insert into public.profiles (id, display_name, email)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), split_part(email, '@', 1)),
  email
from auth.users
on conflict (id) do nothing;
