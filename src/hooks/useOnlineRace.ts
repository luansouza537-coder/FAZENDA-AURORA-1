import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { OnlineEntry } from '../lib/onlineRace';

// Palpite e reivindicações ficam locais (o dinheiro é da fazenda de cada um)
const LS_KEY = 'aurora_online_race';

interface LocalRaceState {
  bet?: { raceKey: string; runnerKey: string; runnerName: string; amount: number } | null;
  claimed: string[]; // race_keys já reivindicadas
}

function loadLocal(): LocalRaceState {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '') as LocalRaceState; } catch { return { claimed: [] }; }
}
function saveLocal(s: LocalRaceState) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* cheio */ }
}

export function useOnlineRace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Inscreve (ou atualiza) o cavalo do jogador na corrida do dia. */
  const submitEntry = useCallback(async (user: User, entry: Omit<OnlineEntry, 'user_id'>): Promise<boolean> => {
    setError('');
    try {
      const { error: err } = await supabase.from('race_entries').upsert({
        race_key: entry.race_key,
        user_id: user.id,
        farm_name: entry.farm_name,
        horse_name: entry.horse_name,
        speed: Math.round(entry.speed),
        forma: entry.forma,
        vigor: Math.round(entry.vigor),
        moral: Math.round(entry.moral),
        trait: entry.trait ?? null,
      });
      if (err) { setError('Não foi possível inscrever. A arena online já foi criada no Supabase?'); return false; }
      return true;
    } catch {
      setError('Sem conexão com a arena online.');
      return false;
    }
  }, []);

  /** Busca as inscrições de uma corrida. Retorna null em erro (offline/tabela ausente). */
  const fetchEntries = useCallback(async (raceKey: string): Promise<OnlineEntry[] | null> => {
    setLoading(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('race_entries')
        .select('race_key, user_id, farm_name, horse_name, speed, forma, vigor, moral, trait')
        .eq('race_key', raceKey);
      setLoading(false);
      if (err) { setError('Arena online indisponível.'); return null; }
      return (data ?? []) as OnlineEntry[];
    } catch {
      setLoading(false);
      setError('Sem conexão com a arena online.');
      return null;
    }
  }, []);

  // ---- estado local (palpite + reivindicações) ----
  const getBet = useCallback((raceKey: string) => {
    const s = loadLocal();
    return s.bet && s.bet.raceKey === raceKey ? s.bet : null;
  }, []);

  const placeBet = useCallback((raceKey: string, runnerKey: string, runnerName: string, amount: number) => {
    const s = loadLocal();
    s.bet = { raceKey, runnerKey, runnerName, amount };
    saveLocal(s);
  }, []);

  const isClaimed = useCallback((raceKey: string) => loadLocal().claimed?.includes(raceKey) ?? false, []);

  const markClaimed = useCallback((raceKey: string) => {
    const s = loadLocal();
    s.claimed = [...(s.claimed ?? []), raceKey].slice(-30);
    saveLocal(s);
  }, []);

  return { loading, error, submitEntry, fetchEntries, getBet, placeBet, isClaimed, markClaimed };
}
