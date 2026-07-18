-- 🏇 Corrida Online — Fazenda Aurora (Fase 4)
-- Rode UMA VEZ no Supabase: Dashboard → SQL Editor → colar → Run.

create table if not exists race_entries (
  race_key text not null,              -- data real da corrida, ex: '2026-07-18'
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_name text not null,
  horse_name text not null,
  speed int not null default 40,
  forma numeric not null default 1,    -- multiplicador de idade (0.6-1.0)
  vigor int not null default 100,      -- fome no momento da inscrição
  moral int not null default 100,      -- felicidade no momento da inscrição
  trait text,
  created_at timestamptz not null default now(),
  primary key (race_key, user_id)
);

alter table race_entries enable row level security;

-- Todos os logados podem VER as inscrições (é uma corrida pública!)
create policy "race entries are public to players" on race_entries
  for select using (auth.role() = 'authenticated');
-- Cada jogador só inscreve/atualiza o próprio cavalo
create policy "own entry insert" on race_entries
  for insert with check (auth.uid() = user_id);
create policy "own entry update" on race_entries
  for update using (auth.uid() = user_id);
