-- Cria o bucket público de avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Permite leitura pública dos avatares
create policy "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Usuários autenticados podem enviar avatares
create policy "Authenticated upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Usuários podem atualizar seus próprios avatares
create policy "Authenticated update avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Usuários podem excluir seus próprios avatares
create policy "Authenticated delete avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid() = (storage.foldername(name))[1]::uuid
);