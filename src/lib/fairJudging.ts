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
