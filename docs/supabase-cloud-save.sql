-- ☁️ Salvamento na nuvem — Fazenda Aurora
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → colar → Run.

create table if not exists player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null,
  game_day int not null default 1,
  farm_level int not null default 1,
  updated_at timestamptz not null default now()
);

alter table player_saves enable row level security;

-- Cada jogador só lê e escreve o próprio save
create policy "own save select" on player_saves
  for select using (auth.uid() = user_id);
create policy "own save insert" on player_saves
  for insert with check (auth.uid() = user_id);
create policy "own save update" on player_saves
  for update using (auth.uid() = user_id);
