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
  burst?: number;       // Tiro (30-100) — pesa nas provas curtas
  stamina?: number;     // Fôlego (30-100) — pesa nas longas
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
  { name: 'Poeira de Ouro', owner: 'Haras Dourado' },
  { name: 'Vassoura Doida', owner: 'Chácara da Bisa' },
  { name: 'Meteoro Manso', owner: 'Recanto do Ipê' },
  { name: 'Barba de Milho', owner: 'Sítio Boa Prosa' },
  { name: 'Sombra Ligeira', owner: 'Fazenda Lua Cheia' },
  { name: 'Teimoso Real', owner: 'Coudelaria Imperial' },
];

const MIN_RUNNERS = 6;

export type RaceDistance = 'curta' | 'media' | 'longa';
export const DISTANCE_INFO: Record<RaceDistance, { label: string; emoji: string }> = {
  curta: { label: 'Prova Curta — 1.000m', emoji: '⚡' },
  media: { label: 'Prova Média — 1.800m', emoji: '🏇' },
  longa: { label: 'Prova Longa — 2.600m', emoji: '🐢' },
};

/** Distância do dia (determinística pela semente da corrida). */
export function raceDistance(raceKey: string): RaceDistance {
  const r = mulberry32(hashStr('dist|' + raceKey))();
  return r < 0.34 ? 'curta' : r < 0.67 ? 'media' : 'longa';
}

/** Estilo de corrida: o trait interage com a distância da prova. */
export function distanceTraitMod(trait: string | null | undefined, dist: RaceDistance): number {
  switch (trait) {
    case 'preguicosa':  // Disparador: explode na largada, cansa
      return dist === 'curta' ? 1.10 : dist === 'longa' ? 0.90 : 1.0;
    case 'trabalhadora': // Fôlego de aço: cresce com a distância
      return dist === 'curta' ? 0.95 : dist === 'longa' ? 1.12 : 1.05;
    case 'gulosa':      // Energia rápida: bom no tiro curto, apaga no fim
      return dist === 'curta' ? 1.02 : dist === 'longa' ? 0.93 : 0.97;
    case 'saudavel':    // Constante
      return 1.03;
    default:            // feliz / estressada (a sorte extra cuida) / sem trait
      return 1.0;
  }
}

/** Velocidade efetiva: o peso de Tiro/Fôlego depende da distância da prova. */
export function effectiveSpeed(speed: number, burst: number, stamina: number, dist: RaceDistance): number {
  if (dist === 'curta') return speed * 0.7 + burst * 0.45;
  if (dist === 'longa') return speed * 0.7 + stamina * 0.45;
  return speed * 0.85 + burst * 0.15 + stamina * 0.15;
}

/** Desempenho base (sem sorte) a partir dos stats congelados na inscrição. */
export function basePerformance(e: Pick<OnlineEntry, 'speed' | 'burst' | 'stamina' | 'forma' | 'vigor' | 'moral' | 'trait'>, dist: RaceDistance = 'media'): number {
  // 'estressada' vira sorte extra na resolução (±17,5%, semeada)
  const S = effectiveSpeed(e.speed, e.burst ?? 40, e.stamina ?? 40, dist);
  return S * e.forma * (0.7 + 0.3 * (e.vigor / 100)) * (0.5 + 0.5 * (e.moral / 100)) * distanceTraitMod(e.trait, dist);
}

/** Resolve a corrida: mesma entrada → mesma ordem final, em qualquer cliente. */
export function resolveOnlineRace(raceKey: string, entries: OnlineEntry[]): OnlineRunner[] {
  const dist = raceDistance(raceKey);
  const week = Math.floor(Date.parse(raceKey + 'T00:00:00Z') / 86400000 / 7);
  // ordena inscritos por user_id para a semente não depender da ordem do fetch
  const sorted = [...entries].sort((a, b) => a.user_id.localeCompare(b.user_id));

  const runners: OnlineRunner[] = sorted.map(e => {
    const rng = mulberry32(hashStr(raceKey + '|' + e.user_id));
    const luckSpan = e.trait === 'estressada' ? 0.35 : 0.2; // ±10% (±17,5% p/ temperamental)
    const luck = 1 + (rng() * luckSpan - luckSpan / 2);
    return {
      key: e.user_id,
      name: e.horse_name,
      owner: e.farm_name,
      isNpc: false,
      performance: basePerformance(e, dist) * luck,
    };
  });

  // completa o grid com NPCs de ficha real (carreira determinística por semana)
  const fill = npcLineup(raceKey, week, Math.max(0, MIN_RUNNERS - runners.length), 'B');
  fill.forEach((card, i) => {
    const rng = mulberry32(hashStr(raceKey + '|npc:' + i));
    const luck = 1 + (rng() * 0.2 - 0.1);
    runners.push({
      key: 'npc:' + i,
      name: card.name,
      owner: card.owner,
      isNpc: true,
      performance: npcPerformance(card, dist) * luck,
    });
  });

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

export interface FieldRunner {
  key: string;
  name: string;
  owner: string;
  isNpc: boolean;
  base: number;   // desempenho SEM a sorte — usado para odds justas
}

/** Grid provisório do dia (inscritos + NPCs de preenchimento), sem revelar a sorte. */
export function previewField(raceKey: string, entries: OnlineEntry[]): FieldRunner[] {
  const dist = raceDistance(raceKey);
  const week = Math.floor(Date.parse(raceKey + 'T00:00:00Z') / 86400000 / 7);
  const sorted = [...entries].sort((a, b) => a.user_id.localeCompare(b.user_id));
  const field: FieldRunner[] = sorted.map(e => ({
    key: e.user_id, name: e.horse_name, owner: e.farm_name, isNpc: false, base: basePerformance(e, dist),
  }));
  const fill = npcLineup(raceKey, week, Math.max(0, MIN_RUNNERS - field.length), 'B');
  fill.forEach((card, i) => {
    field.push({ key: 'npc:' + i, name: card.name, owner: card.owner, isNpc: true, base: npcPerformance(card, dist) });
  });
  return field;
}

/** Odds estilo turfe sobre o grid provisório (casa fica ~10%; travadas na hora do palpite). */
export function fieldOdds(field: FieldRunner[]): Record<string, number> {
  const total = field.reduce((s, r) => s + r.base, 0);
  const odds: Record<string, number> = {};
  for (const r of field) {
    const prob = r.base / total;
    odds[r.key] = Math.min(8, Math.max(1.2, Math.round((0.9 / prob) * 10) / 10));
  }
  return odds;
}

// ===== Fichas de NPC com carreira (determinísticas — sem armazenamento) =====
// Cada NPC tem stats próprios que evoluem por semana: sobe até o auge (~15 semanas
// de carreira), decai e "renova a dinastia" (novato com o mesmo nome, stats novos).
export interface NpcCard {
  name: string;
  owner: string;
  speed: number;
  burst: number;
  stamina: number;
  trait: string | null;
  fase: 'novato' | 'auge' | 'veterano';
}

const NPC_TRAITS = ['trabalhadora', 'preguicosa', 'gulosa', 'saudavel', 'estressada', null];
const CAREER_WEEKS = 30;

export function npcCard(npcIndex: number, week: number, tier: 'B' | 'A' = 'B'): NpcCard {
  const base = NPC_POOL[npcIndex % NPC_POOL.length];
  // geração atual da "dinastia" deste NPC
  const born = hashStr('born|' + base.name) % CAREER_WEEKS;
  const careerAge = ((week + born) % CAREER_WEEKS + CAREER_WEEKS) % CAREER_WEEKS;
  const gen = Math.floor((week + born) / CAREER_WEEKS);
  const rng = mulberry32(hashStr('npc|' + base.name + '|g' + gen));
  const tierMult = tier === 'A' ? 1.3 : 1.0;
  // potencial da geração
  const potSpeed = (45 + Math.floor(rng() * 35)) * tierMult;
  const potBurst = (35 + Math.floor(rng() * 45)) * tierMult;
  const potStamina = (35 + Math.floor(rng() * 45)) * tierMult;
  const trait = NPC_TRAITS[Math.floor(rng() * NPC_TRAITS.length)];
  // curva de carreira: cresce até a semana 15, declina depois
  const curve = careerAge <= 15 ? 0.7 + (careerAge / 15) * 0.4 : 1.1 - ((careerAge - 15) / 15) * 0.35;
  const fase: NpcCard['fase'] = careerAge < 8 ? 'novato' : careerAge <= 20 ? 'auge' : 'veterano';
  return {
    name: base.name,
    owner: base.owner,
    speed: Math.min(100 * tierMult, Math.round(potSpeed * curve)),
    burst: Math.min(100 * tierMult, Math.round(potBurst * curve)),
    stamina: Math.min(100 * tierMult, Math.round(potStamina * curve)),
    trait,
    fase,
  };
}

/** Escalação de NPCs para uma corrida (rotação por semana + fichas reais). */
export function npcLineup(seedKey: string, week: number, count: number, tier: 'B' | 'A' = 'B'): NpcCard[] {
  const offset = hashStr('lineup|' + seedKey) % NPC_POOL.length;
  return Array.from({ length: count }, (_, i) => npcCard(offset + i, week, tier));
}

/** Desempenho de um NPC numa prova (usa a ficha real, não o elástico). */
export function npcPerformance(card: NpcCard, dist: RaceDistance): number {
  const S = effectiveSpeed(card.speed, card.burst, card.stamina, dist);
  // NPCs correm sempre bem cuidados (vigor/moral ~85) — o desafio é a ficha deles
  return S * 1.0 * (0.7 + 0.3 * 0.85) * (0.5 + 0.5 * 0.85) * distanceTraitMod(card.trait, dist);
}
