alter table public.todos
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

drop policy if exists "Users can view own todos" on public.todos;
drop policy if exists "Users can insert own todos" on public.todos;
drop policy if exists "Users can update own todos" on public.todos;
drop policy if exists "Users can delete own todos" on public.todos;

create policy "Users can view own todos"
on public.todos
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own todos"
on public.todos
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own todos"
on public.todos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own todos"
on public.todos
for delete
to authenticated
using ((select auth.uid()) = user_id);

update storage.buckets
set public = false
where id = 'wishlist-images';

drop policy if exists "Users can read own wishlist images" on storage.objects;
drop policy if exists "Users can upload own wishlist images" on storage.objects;
drop policy if exists "Users can delete own wishlist images" on storage.objects;

create policy "Users can read own wishlist images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wishlist-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1
      from public.todos
      where todos.image_path = name
        and todos.user_id = (select auth.uid())
    )
  )
);

create policy "Users can upload own wishlist images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wishlist-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete own wishlist images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wishlist-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1
      from public.todos
      where todos.image_path = name
        and todos.user_id = (select auth.uid())
    )
  )
);
