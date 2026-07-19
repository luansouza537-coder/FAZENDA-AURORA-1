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
// Nível efetivo usado para escalar a nota do rival — acima disso a nota PLATÔ em vez de
// crescer para sempre. Cálculo do teto do jogador para calibrar (judgeAnimalScore):
//   máximo absoluto (produção 100 + felicidade 100 + saúde 100 + trabalhadora + campeão):
//     100*0.4 + 100*0.3 + 100*0.3 + 8 + 6 = 116
//   "bem cuidado" (sem campeão, felicidade 90, sem trait ideal):     ~105-111
//   negligenciado (produção baixa, felicidade 30, doente/estressado): ~13
// Com CAP=16: base fora-de-especialidade = 45+16*2.5 = 85 (±8 → 77-93) — bem cuidado (105+)
// vence quase sempre, como esperado (especialidade é a categoria "difícil" do rival).
// base de especialidade = 45+16*2.5+16*1.8 = 113.8 (±8 → 105.8-121.8) — disputa real contra
// o teto do jogador (105-116): joga limpo o suficiente para vencer parte dos dias, nunca é
// garantido, nunca é impossível. Negligenciado (13) perde sempre em qualquer nível.
const FAIR_LEVEL_CAP = 16;

export function rivalScore(breederIndex: number, category: FairCategory, farmLevel: number, day: number): number {
  const breeder = BREEDERS[breederIndex];
  const isSpecialty = breeder.specialty === category;
  const scalingLevel = Math.min(farmLevel, FAIR_LEVEL_CAP);
  const base = 45 + scalingLevel * 2.5 + (isSpecialty ? scalingLevel * 1.8 : 0);
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

// Teto do jogador na Exposição (judgeAnimalScoreExpo, mais rígida que a Feira comum):
//   máximo absoluto (produção 100 + felicidade 100 + saúde 100 + trabalhadora + campeão):
//     100*0.3 + 100*0.3 + 100*0.4 + 10 + 12 = 122
//   "bem cuidado" SEM título de campeão:  ~107
//   "bem cuidado" COM título de campeão:  ~119
//   negligenciado: ~3 (sempre perde, qualquer nível)
// CAP mais alto que a Feira comum (20 vs 16) — a Exposição é a versão "elite", deve continuar
// mais difícil no mesmo nível efetivo. Fora da especialidade do juiz: base = 58+20*2.0 = 98
// (±7 → 91-105) — um animal "bem cuidado" (107) vence com folga, mas não é garantido no topo
// da variância do juiz. Na especialidade do juiz: base = 58+20*2.0+20*0.9 = 116 (±7 →
// 109-123) — aqui só um animal excelente COM título de campeão (119) tem chance real de
// vencer, o que é a progressão pretendida: "construa seu campeão antes de tentar a Exposição
// na especialidade do juiz".
const EXPO_LEVEL_CAP = 20;

export function judgeScoreExpo(judgeIndex: number, category: ExpoCategory, farmLevel: number, day: number): number {
  const judge = EXPO_JUDGES[judgeIndex];
  const isSpecialty = judge.specialty === category;
  const scalingLevel = Math.min(farmLevel, EXPO_LEVEL_CAP);
  const base = 58 + scalingLevel * 2.0 + (isSpecialty ? scalingLevel * 0.9 : 0);
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

// productScore NÃO tem teto (proporcional ao estoque) — então em vez de um platô "abaixo do
// teto do jogador", calibramos para que o esforço de estocagem seja o que decide, usando
// PROD_CATEGORY_INFO.weights como referência (peso médio por categoria):
//   queijos (pesos 1,2,4,2, média 2.25, minQty=2): minQty→~4.5 | minQty*3→~13.5 | minQty*8→~36
//   texteis (pesos 1,2,3,6, média 3.00, minQty=2): minQty→~6.0 | minQty*3→~18.0 | minQty*8→~48
//   raro    (pesos 5,4,     média 4.50, minQty=1): minQty→~4.5 | minQty*3→~13.5 | minQty*8→~36
// Queremos: entrante no minQty exato arrisca perder; ~3x minQty vence a maioria mas não
// sempre; ~8x minQty vence quase sempre. Isso exige um rival cujo platô fique bem ACIMA do
// valor de minQty mas bem ABAIXO do valor de minQty*8 — por isso o base/factor sobem bastante
// em relação à versão antiga (que platôava em ~36, perto até do valor de minQty*8, tornando o
// mercado quase sempre trivial para quem estocava um pouco).
// resolveProdDuel sempre usa o comprador cuja especialidade é a categoria julgada, então é o
// platô "com especialidade" que decide os duelos reais. CAP=20, platô de especialidade:
//   base = 5 + 20*0.15 + 20*0.1 = 10 (±6 → faixa 4-16)
// Comparando com a referência de estoque (peso médio) de queijos: minQty→~4.5, minQty*3→~13.5,
// minQty*8→~36. Contra a faixa 4-16: minQty perde na esmagadora maioria dos dias (só ganha se
// o comprador rolar bem perto do piso) — "arrisca perder"; minQty*3 vence em ~79% dos dias
// (vence sempre que o comprador rola abaixo de 13.5, ou seja (13.5-4)/12) — "vence a maioria,
// não sempre"; minQty*8 vence em 100% dos dias (sempre acima do teto 16) — "vence quase
// sempre". O platô fora-de-especialidade (base = 5+20*0.15 = 8, faixa 2-14) só é relevante se
// o comprador julgar fora da própria especialidade, o que não acontece nos duelos normais.
const PROD_LEVEL_CAP = 20;

/** Nota do comprador/juiz de mercado: escala com nível (platô em PROD_LEVEL_CAP), mais forte na própria especialidade. */
export function marketJudgeScore(judgeIndex: number, category: ProdCategory, farmLevel: number, day: number): number {
  const judge = MARKET_JUDGES[judgeIndex];
  const isSpecialty = judge.specialty === category;
  const scalingLevel = Math.min(farmLevel, PROD_LEVEL_CAP);
  const base = 5 + scalingLevel * 0.15 + (isSpecialty ? scalingLevel * 0.1 : 0);
  const rng = mulberry32(hashStr(`prod|${day}|${judge.name}|${category}`));
  const variance = (rng() * 12) - 6; // ±6 (era ±2 — faixa estreita demais para ser interessante)
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

/**
 * Nota do jogador em cada sub-rodada. O termo de nível em 'producao'/'prestigio' usa o
 * mesmo platô (FESTIVAL_LEVEL_CAP) do lado do rival — sem isso, o bônus de nível do
 * PRÓPRIO jogador crescia sem limite enquanto o rival platôava, e uma fazenda largada
 * passava a vencer sozinha só de nível alto (90%+ no nível 30, 100% no nível 40+),
 * sem relação nenhuma com produção/diversidade real. Com o platô nos dois lados, o
 * termo de nível empata no endgame e quem decide o resultado volta a ser o cuidado
 * (produção do rebanho, diversidade de tipos, prestígio acumulado).
 */
export function festivalPlayerRoundScore(round: FestivalRound, animals: Animal[], farmLevel: number, prestigePoints: number): number {
  const scalingLevel = Math.min(farmLevel, FESTIVAL_LEVEL_CAP);
  if (round === 'producao') {
    return Math.round(animals.reduce((sum, a) => sum + (a.weeklyProduction ?? 0), 0) * 6 + scalingLevel * 5);
  }
  if (round === 'bemestar') {
    if (animals.length === 0) return 0;
    const avgHappiness = animals.reduce((sum, a) => sum + a.happiness, 0) / animals.length;
    const sickPenalty = animals.filter(a => a.isSick).length * 8;
    const stressPenalty = animals.filter(a => (a.stressedDays ?? 0) > 0).length * 5;
    return Math.max(0, Math.round(avgHappiness - sickPenalty - stressPenalty));
  }
  // prestigio: diversidade de tipos + pontos de prestígio + nível (nível capado, ver acima)
  const diversity = new Set(animals.map(a => a.type)).size;
  return Math.round(diversity * 8 + prestigePoints * 0.5 + scalingLevel * 4);
}

// 'bemestar' é o único round com teto real no lado do jogador (festivalPlayerRoundScore
// devolve avgHappiness - penalidades, e felicidade é 0-100 — não passa de 100 nunca). Os
// outros dois ('producao' escala com produção*herd, 'prestigio' com pontos de prestígio) NÃO
// têm teto — por isso só 'bemestar' precisa de um platô agressivo e baixo; os outros dois só
// precisam não crescer para sempre sem limite de nível (a antiga fórmula base+nivel*6.5 sem
// cap tornava qualquer round, incluindo esses, impossível em algum nível alto o suficiente).
//
// bemestar — teto do jogador:
//   perfeito (felicidade média 100, zero penalidade):        100 (teto absoluto, nunca passa)
//   bem cuidado (felicidade média ~90, sem penalidades):      90
//   negligenciado (felicidade ~30, alguns doentes/estressados): ~17
//   CAP_BEMESTAR=12 (platô bem mais cedo que os outros rounds, já que o teto do jogador é
//   fixo e baixo): base = 60+12*2.0 = 84 (±12 → 72-96) — perfeito (100) vence sempre;
//   bem cuidado (90) vence a maior parte das vezes (90 > rival na maior parte da faixa
//   72-96); negligenciado (~17) perde sempre, em qualquer nível.
//
// producao/prestigio — sem teto no jogador, mas o termo `farmLevel*5`/`farmLevel*4` do
// PRÓPRIO jogador não é capado, então o rival não pode escalar tão rápido quanto o antigo
// fator 6.5/nível sem sobrar nenhuma fazenda "modesta" competitiva no endgame. Testado
// numericamente: uma fazenda modesta (2 animais, produção 3/semana cada, ~70 pts de
// prestígio) em nível 20 dá producao=136 e prestigio=131. Com CAP=12 (mesmo cap do
// bemestar): rival producao = 55+12*6.5=133 (±12 → 121-145, jogador modesto vence ~58% dos
// dias) e rival prestigio = 50+12*6.5=128 (±12 → 116-140, vence ~62% dos dias) — competitivo,
// nem trivial nem impossível, e uma fazenda maior sempre pode superar o platô com folga.
const FESTIVAL_LEVEL_CAP = 12;
const FESTIVAL_BEMESTAR_CAP = 12;

/** Nota da fazenda rival na sub-rodada: determinística, escala com nível até um platô — nunca é trivial nem impossível. */
export function festivalRivalRoundScore(round: FestivalRound, farmLevel: number, day: number): number {
  const base = round === 'producao' ? 55 : round === 'bemestar' ? 60 : 50;
  const cap = round === 'bemestar' ? FESTIVAL_BEMESTAR_CAP : FESTIVAL_LEVEL_CAP;
  const factor = round === 'bemestar' ? 2.0 : 6.5;
  const scalingLevel = Math.min(farmLevel, cap);
  const scaled = base + scalingLevel * factor;
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
