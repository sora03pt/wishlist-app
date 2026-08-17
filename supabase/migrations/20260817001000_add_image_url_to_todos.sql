alter table public.todos
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('wishlist-images', 'wishlist-images', true)
on conflict (id) do update set public = true;
