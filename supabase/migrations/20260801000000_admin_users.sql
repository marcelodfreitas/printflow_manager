-- Recria a função get_platform_users do zero.
-- Rode este script no SQL Editor do Supabase.

drop function if exists public.get_platform_users();

create function public.get_platform_users()
returns table (
  id uuid,
  name text,
  email text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_email text;
begin
  select u.email
    into caller_email
    from auth.users u
   where u.id = auth.uid();

  if caller_email is distinct from 'marcelo.lempek@gmail.com' then
    raise exception 'Acesso negado: somente o administrador pode visualizar os usuários.';
  end if;

  return query
    select
      u.id::uuid,
      coalesce(u.raw_user_meta_data ->> 'name', '')::text as name,
      u.email::text,
      u.created_at::timestamptz
    from auth.users u
    order by u.created_at desc;
end;
$$;

revoke execute on function public.get_platform_users() from public, anon;
grant execute on function public.get_platform_users() to authenticated;
