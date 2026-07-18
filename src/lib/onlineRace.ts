// 🏇 Corrida Online — resolução DETERMINÍSTICA.
// Todos os clientes calculam o mesmo resultado a partir da mesma semente
// (race_key + inscritos), sem precisar de servidor. A "sorte" de cada corredor
// vem de um PRNG semeado por race_key+identidade — igual em qualquer aparelho.

export interface OnlineEntry {
  race_key: string;
  user_id: string;      // uuid do jogador ou 'npc:<n>'
  farm_name: string;
  horse_name: string;
  speed: number;
  forma: number;        // 0.6-1.0 (idade)
  vigor: number;        // fome 0-100
  moral: number;        // felicidade 0-100
  trait?: string | null;
}

export interface OnlineRunner {
  key: string;          // user_id ou npc id
  name: string;
  owner: string;
  isNpc: boolean;
  performance: number;
}

// hash de string → uint32 (FNV-1a)
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// PRNG determinístico (mulberry32)
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NPC_POOL = [
  { name: 'Relâmpago do Vale', owner: 'Haras São Jorge' },
  { name: 'Trovão Manco', owner: 'Sítio do Zé' },
  { name: 'Estrela da Serra', owner: 'Fazenda Mirante' },
  { name: 'Furacão Caipira', owner: 'Rancho Alegre' },
  { name: 'Pé de Vento', owner: 'Coudelaria Sul' },
  { name: 'Serenata da Noite', owner: 'Estância Bela Vista' },
];

const MIN_RUNNERS = 6;

/** Desempenho base (sem sorte) a partir dos stats congelados na inscrição. */
export function basePerformance(e: Pick<OnlineEntry, 'speed' | 'forma' | 'vigor' | 'moral' | 'trait'>): number {
  const traitMod = e.trait === 'trabalhadora' ? 1.05 : e.trait === 'preguicosa' ? 0.95 :
    e.trait === 'saudavel' ? 1.03 : e.trait === 'gulosa' ? 0.97 : 1;
  // 'estressada' vira sorte extra na resolução (±15% adicionais, semeados)
  return e.speed * e.forma * (0.7 + 0.3 * (e.vigor / 100)) * (0.5 + 0.5 * (e.moral / 100)) * traitMod;
}

/** Resolve a corrida: mesma entrada → mesma ordem final, em qualquer cliente. */
export function resolveOnlineRace(raceKey: string, entries: OnlineEntry[]): OnlineRunner[] {
  // ordena inscritos por user_id para a semente não depender da ordem do fetch
  const sorted = [...entries].sort((a, b) => a.user_id.localeCompare(b.user_id));
  // média dos inscritos calibra os NPCs de preenchimento
  const avg = sorted.length > 0
    ? sorted.reduce((s, e) => s + basePerformance(e), 0) / sorted.length
    : 45;

  const runners: OnlineRunner[] = sorted.map(e => {
    const rng = mulberry32(hashStr(raceKey + '|' + e.user_id));
    const luckSpan = e.trait === 'estressada' ? 0.35 : 0.2; // ±10% (±17,5% p/ temperamental)
    const luck = 1 + (rng() * luckSpan - luckSpan / 2);
    return {
      key: e.user_id,
      name: e.horse_name,
      owner: e.farm_name,
      isNpc: false,
      performance: basePerformance(e) * luck,
    };
  });

  // completa o grid com NPCs determinísticos
  for (let i = 0; runners.length < MIN_RUNNERS; i++) {
    const npc = NPC_POOL[i % NPC_POOL.length];
    const rng = mulberry32(hashStr(raceKey + '|npc:' + i));
    runners.push({
      key: 'npc:' + i,
      name: npc.name,
      owner: npc.owner,
      isNpc: true,
      performance: avg * (0.85 + rng() * 0.3),
    });
  }

  return runners.sort((a, b) => b.performance - a.performance);
}

/** Chave da corrida do dia (UTC) e da corrida de ontem. */
export function raceKeyToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
export function raceKeyYesterday(now = new Date()): string {
  const d = new Date(now.getTime() - 86400000);
  return d.toISOString().slice(0, 10);
}
