alter table public.todos
  add column if not exists price integer,
  add column if not exists url text,
  add column if not exists memo text,
  add column if not exists category text;
