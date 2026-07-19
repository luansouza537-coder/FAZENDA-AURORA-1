// 🎪 Feira Agropecuária — julgamento contra Criadores Rivais fixos (offline, determinístico).
// Substitui o antigo "npcScore() aleatório" por 4 duelos 1x1 nomeados, cada um especialista
// numa categoria e escalando com o nível da fazenda — nunca fica fácil de vencer.
import { Animal } from '../types';
import { hashStr, mulberry32 } from './onlineRace';

export type FairCategory = 'leiteiro' | 'fibra' | 'aves' | 'organico';

export interface Breeder {
  name: string;
  farm: string;
  specialty: FairCategory;
}

// Cada criador é especialista em UMA categoria (forte lá) e mediano nas outras 3.
export const BREEDERS: Breeder[] = [
  { name: 'Dona Marlene', farm: 'Sítio Vale Verde', specialty: 'leiteiro' },
  { name: 'Seu Osvaldo', farm: 'Fazenda Serra Alta', specialty: 'fibra' },
  { name: 'Dona Isaura', farm: 'Haras Dona Isaura', specialty: 'aves' },
  { name: 'Seu Belarmino', farm: 'Chácara Bom Retiro', specialty: 'organico' },
];

export const CATEGORY_INFO: Record<FairCategory, { label: string; emoji: string; animalTypes: string[]; productionScale: number; minLevel: number }> = {
  leiteiro:  { label: 'Melhor Leiteiro', emoji: '🥛', animalTypes: ['vaca', 'cabra', 'bufalo', 'alpaca'], productionScale: 8, minLevel: 1 },
  fibra:     { label: 'Melhor Fibra',    emoji: '🧶', animalTypes: ['ovelha', 'lhama', 'alpaca', 'coelho_angora', 'cabra_angora'], productionScale: 12, minLevel: 1 },
  aves:      { label: 'Melhor Ave',      emoji: '🥚', animalTypes: ['galinha', 'pato', 'ganso', 'codorna'], productionScale: 10, minLevel: 1 },
  organico:  { label: 'Melhor Orgânico', emoji: '🌿', animalTypes: ['minhoca', 'caracol'], productionScale: 15, minLevel: 6 },
};

/** Taxa de inscrição por categoria — sobe com o nível, não é de graça tentar. */
export function entryFee(farmLevel: number): number {
  return 60 + farmLevel * 8;
}

/**
 * Nota do animal do jogador (0-100+): 40% produção semanal, 30% felicidade,
 * 30% saúde/apresentação (penaliza estresse e doença). Pune quem só empurra
 * produção bruta e ignora o bem-estar — precisa de cuidado consistente.
 */
export function judgeAnimalScore(animal: Animal, category: FairCategory): number {
  const scale = CATEGORY_INFO[category].productionScale;
  const productionScore = Math.min(100, (animal.weeklyProduction ?? 0) * scale);
  const healthPenalty = (animal.isSick ? 40 : 0) + ((animal.stressedDays ?? 0) > 0 ? 20 : 0);
  const healthScore = Math.max(0, 100 - healthPenalty);
  const traitBonus: Record<string, number> = {
    trabalhadora: 8, saudavel: 6, feliz: 5, estressada: -6, gulosa: -3, preguicosa: -8,
  };
  const bonus = traitBonus[animal.trait ?? 'feliz'] ?? 0;
  const campiao = animal.isCampiao ? 6 : 0;
  return Math.round(productionScore * 0.4 + animal.happiness * 0.3 + healthScore * 0.3 + bonus + campiao);
}

/**
 * Nota do criador rival na categoria: cresce com o nível da fazenda (nunca fica trivial),
 * bônus extra se for a especialidade dele, ±variação determinística pelo dia (não é RNG puro —
 * mesmo dia = mesma nota, mas o jogador não sabe o número exato de antemão).
 */
export function rivalScore(breederIndex: number, category: FairCategory, farmLevel: number, day: number): number {
  const breeder = BREEDERS[breederIndex];
  const isSpecialty = breeder.specialty === category;
  const base = 45 + farmLevel * 3 + (isSpecialty ? farmLevel * 1.5 : 0);
  const rng = mulberry32(hashStr(`fair|${day}|${breeder.name}|${category}`));
  const variance = (rng() * 16) - 8; // ±8
  return Math.round(base + variance);
}

export interface FairDuelResult {
  category: FairCategory;
  playerAnimalName: string;
  playerScore: number;
  breeder: Breeder;
  rivalScore: number;
  won: boolean;
  fee: number;
}

/** Resolve um duelo 1x1: seu melhor animal da categoria vs o criador especialista dela. */
export function resolveDuel(day: number, farmLevel: number, category: FairCategory, animal: Animal): FairDuelResult {
  const breederIndex = BREEDERS.findIndex(b => b.specialty === category);
  const breeder = BREEDERS[breederIndex];
  const playerScore = judgeAnimalScore(animal, category);
  const rival = rivalScore(breederIndex, category, farmLevel, day);
  return {
    category,
    playerAnimalName: animal.name,
    playerScore,
    breeder,
    rivalScore: rival,
    won: playerScore > rival,
    fee: entryFee(farmLevel),
  };
}

// =====================================================================================
// 🏅 Exposição de Raças — versão "elite" da Feira Agropecuária: juízes federais mais
// exigentes, taxa mais alta, e o vencedor ganha o título permanente de Campeão(ã).
// =====================================================================================

export type ExpoCategory = 'leiteiro' | 'fibra' | 'exotico';

export interface ExpoJudge {
  name: string;
  title: string;
  specialty: ExpoCategory;
}

export const EXPO_JUDGES: ExpoJudge[] = [
  { name: 'Dr. Aurélio Pontes', title: 'Juiz Federal de Pecuária Leiteira', specialty: 'leiteiro' },
  { name: 'Dra. Cecília Bandeira', title: 'Juíza Federal de Fibras Nobres', specialty: 'fibra' },
  { name: 'Dr. Hermenegildo Fontoura', title: 'Juiz Federal de Espécies Exóticas', specialty: 'exotico' },
];

export const EXPO_CATEGORY_INFO: Record<ExpoCategory, { label: string; emoji: string; animalTypes: string[]; productionScale: number; minLevel: number }> = {
  leiteiro: { label: 'Raça Leiteira de Elite', emoji: '🥇', animalTypes: ['vaca', 'cabra', 'bufalo', 'alpaca'], productionScale: 8, minLevel: 5 },
  fibra:    { label: 'Raça de Fibra de Elite', emoji: '🎖️', animalTypes: ['ovelha', 'lhama', 'alpaca', 'coelho_angora', 'cabra_angora'], productionScale: 12, minLevel: 5 },
  exotico:  { label: 'Raça Exótica de Elite',  emoji: '🦎', animalTypes: ['avestruz', 'jacare', 'bicho_seda'], productionScale: 10, minLevel: 12 },
};

/** Taxa de inscrição da Exposição: bem mais salgada que a Feira comum — não é para amadores. */
export function expoEntryFee(farmLevel: number): number {
  return 150 + farmLevel * 18;
}

/**
 * Nota do animal na Exposição: julgamento mais rígido — produção pesa menos, apresentação
 * (saúde/traço/título de campeão) pesa mais. Estresse e doença doem mais que na Feira comum.
 */
export function judgeAnimalScoreExpo(animal: Animal, category: ExpoCategory): number {
  const scale = EXPO_CATEGORY_INFO[category].productionScale;
  const productionScore = Math.min(100, (animal.weeklyProduction ?? 0) * scale);
  const healthPenalty = (animal.isSick ? 55 : 0) + ((animal.stressedDays ?? 0) > 0 ? 30 : 0);
  const healthScore = Math.max(0, 100 - healthPenalty);
  const traitBonus: Record<string, number> = {
    trabalhadora: 10, saudavel: 9, feliz: 6, estressada: -10, gulosa: -5, preguicosa: -12,
  };
  const bonus = traitBonus[animal.trait ?? 'feliz'] ?? 0;
  const campiao = animal.isCampiao ? 12 : 0;
  return Math.round(productionScore * 0.3 + animal.happiness * 0.3 + healthScore * 0.4 + bonus + campiao);
}

/** Nota do juiz federal: base mais alta, escala mais forte com nível, e mais especialista. */
export function judgeScoreExpo(judgeIndex: number, category: ExpoCategory, farmLevel: number, day: number): number {
  const judge = EXPO_JUDGES[judgeIndex];
  const isSpecialty = judge.specialty === category;
  const base = 58 + farmLevel * 3.6 + (isSpecialty ? farmLevel * 2 : 0);
  const rng = mulberry32(hashStr(`expo|${day}|${judge.name}|${category}`));
  const variance = (rng() * 14) - 7; // ±7
  return Math.round(base + variance);
}

export interface ExpoDuelResult {
  category: ExpoCategory;
  playerAnimalName: string;
  playerAnimalId: number;
  playerScore: number;
  judge: ExpoJudge;
  rivalScore: number;
  won: boolean;
  fee: number;
}

/** Resolve o duelo de elite: melhor animal da categoria vs juiz federal especialista. */
export function resolveExpoDuel(day: number, farmLevel: number, category: ExpoCategory, animal: Animal): ExpoDuelResult {
  const judgeIndex = EXPO_JUDGES.findIndex(j => j.specialty === category);
  const judge = EXPO_JUDGES[judgeIndex];
  const playerScore = judgeAnimalScoreExpo(animal, category);
  const rival = judgeScoreExpo(judgeIndex, category, farmLevel, day);
  return {
    category,
    playerAnimalName: animal.name,
    playerAnimalId: animal.id,
    playerScore,
    judge,
    rivalScore: rival,
    won: playerScore > rival,
    fee: expoEntryFee(farmLevel),
  };
}

// =====================================================================================
// 🛒 Feira Regional de Produtos — julgamento de inventário (não de animais) contra
// compradores/juízes de mercado nomeados. Entrar consome uma "amostra consignada" do
// produto (estoque perdido independente do resultado) — não é de graça tentar vender.
// =====================================================================================

export type ProdCategory = 'queijos' | 'texteis' | 'raro';

export interface MarketJudge {
  name: string;
  title: string;
  specialty: ProdCategory;
}

export const MARKET_JUDGES: MarketJudge[] = [
  { name: 'Sr. Norberto Salgado', title: 'Comprador-Chefe de Laticínios', specialty: 'queijos' },
  { name: 'Sra. Adelaide Fiorotti', title: 'Compradora de Têxteis Finos', specialty: 'texteis' },
  { name: 'Sr. Rutherford Vance', title: 'Curador de Artigos Raros', specialty: 'raro' },
];

export interface ProdCategoryInfo {
  label: string;
  emoji: string;
  minLevel: number;
  minQty: number; // quantidade mínima total para poder entrar
  weights: Partial<Record<string, number>>; // peso de cada chave de inventário
  stakeItem: string; // item consumido como amostra consignada (entrada)
  stakeQty: number;
}

export const PROD_CATEGORY_INFO: Record<ProdCategory, ProdCategoryInfo> = {
  queijos: {
    label: 'Melhores Queijos', emoji: '🧀', minLevel: 6, minQty: 2,
    weights: { queijoCoalho: 1, queijoMucarela: 2, queijoBrie: 4, queijo_cabra: 2 },
    stakeItem: 'queijoBrie', stakeQty: 1,
  },
  texteis: {
    label: 'Melhores Têxteis', emoji: '🧶', minLevel: 6, minQty: 2,
    weights: { scarf: 1, cachecol_angora: 2, tecido_alpaca: 3, manta_premium: 6 },
    stakeItem: 'manta_premium', stakeQty: 1,
  },
  raro: {
    label: 'Artigos Raros', emoji: '🏺', minLevel: 15, minQty: 1,
    weights: { bolsa_exotica: 5, colete_couro: 4 },
    stakeItem: 'bolsa_exotica', stakeQty: 1,
  },
};

/** Taxa de inscrição (em moedas) além da amostra consignada — cobre logística da feira. */
export function marketEntryFee(farmLevel: number): number {
  return 40 + farmLevel * 5;
}

/** Nota do produto: soma ponderada do estoque disponível na categoria. */
export function productScore(inventory: Partial<Record<string, number>>, category: ProdCategory): number {
  const info = PROD_CATEGORY_INFO[category];
  let score = 0;
  for (const key of Object.keys(info.weights)) {
    score += (inventory[key] ?? 0) * (info.weights[key] ?? 0);
  }
  return Math.round(score);
}

/** Nota do comprador/juiz de mercado: escala com nível, mais forte na própria especialidade. */
export function marketJudgeScore(judgeIndex: number, category: ProdCategory, farmLevel: number, day: number): number {
  const judge = MARKET_JUDGES[judgeIndex];
  const isSpecialty = judge.specialty === category;
  const base = 6 + farmLevel * 0.9 + (isSpecialty ? farmLevel * 0.6 : 0);
  const rng = mulberry32(hashStr(`prod|${day}|${judge.name}|${category}`));
  const variance = (rng() * 4) - 2; // ±2
  return Math.round(base + variance);
}

export interface ProdDuelResult {
  category: ProdCategory;
  playerScore: number;
  judge: MarketJudge;
  rivalScore: number;
  won: boolean;
  fee: number;
  stakeItem: string;
  stakeQty: number;
}

/** Resolve o duelo de produtos: sua nota de estoque ponderada vs o comprador especialista. */
export function resolveProdDuel(day: number, farmLevel: number, category: ProdCategory, inventory: Partial<Record<string, number>>): ProdDuelResult {
  const judgeIndex = MARKET_JUDGES.findIndex(j => j.specialty === category);
  const judge = MARKET_JUDGES[judgeIndex];
  const info = PROD_CATEGORY_INFO[category];
  const playerScore = productScore(inventory, category);
  const rival = marketJudgeScore(judgeIndex, category, farmLevel, day);
  return {
    category,
    playerScore,
    judge,
    rivalScore: rival,
    won: playerScore > rival,
    fee: marketEntryFee(farmLevel),
    stakeItem: info.stakeItem,
    stakeQty: info.stakeQty,
  };
}

// =====================================================================================
// 🎭 Festival Cultural da Aurora — sua fazenda inteira vs uma fazenda rival nomeada,
// em 3 sub-rodadas. Vence quem ganhar 2 de 3. Perder dói: sem prêmio de consolação gordo.
// =====================================================================================

export type FestivalRound = 'producao' | 'bemestar' | 'prestigio';

export const RIVAL_FARM = { name: 'Fazenda Horizonte Dourado', owner: 'Comendador Aristides Villaverde' };

export const FESTIVAL_ROUND_INFO: Record<FestivalRound, { label: string; emoji: string }> = {
  producao:  { label: 'Produção Geral',           emoji: '🌾' },
  bemestar:  { label: 'Bem-Estar Animal',          emoji: '💚' },
  prestigio: { label: 'Prestígio & Diversidade',   emoji: '⭐' },
};

/** Taxa de inscrição do Festival: evento grande, taxa alta. */
export function festivalEntryFee(farmLevel: number): number {
  return 200 + farmLevel * 20;
}

/** Nota do jogador em cada sub-rodada. */
export function festivalPlayerRoundScore(round: FestivalRound, animals: Animal[], farmLevel: number, prestigePoints: number): number {
  if (round === 'producao') {
    return Math.round(animals.reduce((sum, a) => sum + (a.weeklyProduction ?? 0), 0) * 6 + farmLevel * 5);
  }
  if (round === 'bemestar') {
    if (animals.length === 0) return 0;
    const avgHappiness = animals.reduce((sum, a) => sum + a.happiness, 0) / animals.length;
    const sickPenalty = animals.filter(a => a.isSick).length * 8;
    const stressPenalty = animals.filter(a => (a.stressedDays ?? 0) > 0).length * 5;
    return Math.max(0, Math.round(avgHappiness - sickPenalty - stressPenalty));
  }
  // prestigio: diversidade de tipos + pontos de prestígio + nível
  const diversity = new Set(animals.map(a => a.type)).size;
  return Math.round(diversity * 8 + prestigePoints * 0.5 + farmLevel * 4);
}

/** Nota da fazenda rival na sub-rodada: determinística, escala com nível — nunca é trivial. */
export function festivalRivalRoundScore(round: FestivalRound, farmLevel: number, day: number): number {
  const base = round === 'producao' ? 55 : round === 'bemestar' ? 60 : 50;
  const scaled = base + farmLevel * 6.5;
  const rng = mulberry32(hashStr(`festival|${day}|${RIVAL_FARM.name}|${round}`));
  const variance = (rng() * 24) - 12; // ±12
  return Math.round(scaled + variance);
}

export interface FestivalRoundResult {
  round: FestivalRound;
  playerScore: number;
  rivalScore: number;
  won: boolean;
}

export interface FestivalResult {
  day: number;
  fee: number;
  rounds: FestivalRoundResult[];
  roundsWon: number;
  overallWon: boolean;
}

/** Resolve o Festival: 3 sub-rodadas, vence quem ganhar 2 de 3. */
export function resolveFestival(day: number, farmLevel: number, animals: Animal[], prestigePoints: number): FestivalResult {
  const roundOrder: FestivalRound[] = ['producao', 'bemestar', 'prestigio'];
  const rounds: FestivalRoundResult[] = roundOrder.map(round => {
    const playerScore = festivalPlayerRoundScore(round, animals, farmLevel, prestigePoints);
    const rivalScore = festivalRivalRoundScore(round, farmLevel, day);
    return { round, playerScore, rivalScore, won: playerScore > rivalScore };
  });
  const roundsWon = rounds.filter(r => r.won).length;
  return {
    day,
    fee: festivalEntryFee(farmLevel),
    rounds,
    roundsWon,
    overallWon: roundsWon >= 2,
  };
}
