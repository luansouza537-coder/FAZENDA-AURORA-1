/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnimalType = 'vaca' | 'ovelha' | 'boi' | 'galinha' | 'cabra' | 'lhama' | 'pato' | 'ganso' | 'bufalo' | 'pavao' | 'codorna' | 'alpaca' | 'minhoca' | 'caracol' | 'coelho_angora' | 'bicho_seda' | 'ra' | 'avestruz' | 'jacare';

export type AnimalTrait = 'gulosa' | 'preguicosa' | 'feliz' | 'estressada' | 'saudavel' | 'trabalhadora';

export type FarmSpecialization = 'leiteira' | 'fibras' | 'avicultura' | 'diversificada' | 'organica' | 'exotica' | null;

export interface FairResult {
  day: number;
  category: string;
  winner: string;
  earned: number;
}

export interface Animal {
  id: number;
  type: AnimalType;
  name: string;
  hunger: number;     // 0 to 100
  happiness: number;  // 0 to 100
  trait?: AnimalTrait; // Personality trait with mechanical effects

  // Custom new features
  consecutiveHappyDays?: number; // Days consecutive with 100 happiness
  daysBelow80?: number;          // Days consecutive with happiness < 80
  isBestFriend?: boolean;        // Best Friend status indicator

  // Funcionalidade 1 & 2: Ciclo de vida e idade
  age?: number;    // dias de vida do animal
  maxAge?: number; // idade máxima (morte de velhice)

  // Cow specific
  hasProducedToday?: boolean;

  // Sheep specific
  daysUntilWool?: number;
  daysSinceLastWool?: number;
  woolReady?: boolean;

  // Ox specific
  weightGain?: number; // 0.0 to 1.0 (0% to 100%)

  // Cabra
  lactationCycle?: number;   // dias até próxima cria (0 = em lactação, conta regressiva)
  isLactating?: boolean;     // se está em período de lactação

  // Lhama
  woolAccumulated?: number;  // lã acumulada (só pode colher na primavera)

  // Pato
  feathersReady?: boolean;   // penas prontas para coletar

  // Ganso
  inLayingSeason?: boolean;  // se está na época de postura
  nextAlarmDay?: number;     // dia do próximo evento que o ganso vai alertar
  daysSinceLastGooseEgg?: number; // dias desde o último ovo de ganso
  daysSinceLastGooseFeather?: number; // dias desde a última pena de ganso

  // Búfalo
  heatStress?: boolean;      // se está sofrendo estresse térmico (verão)

  // Fome extrema
  daysWithoutFood?: number;  // dias consecutivos com hunger <= 0
}

// Funcionalidade 4: Contratos de fornecimento
export interface Contract {
  id: string;
  product: 'milk' | 'wool' | 'egg' | 'cheese';
  quantity: number;
  delivered: number;
  pricePerUnit: number;
  deadline: number;
  penalty: number;
  active: boolean;
}

export interface LogMessage {
  id: string;
  day: number;
  message: string;
  type: 'error' | 'success' | 'info' | 'system' | 'event';
}

export interface FarmStats {
  totalEarned: number;
  totalFed: number;
  totalCollected: number;
  totalSold: number;
  // Achievements tracker fields
  totalMilk?: number;
  totalWool?: number;
  totalOxSold?: number;
  totalCheese?: number;
  totalScarf?: number;
  totalEggs?: number;
  totalMayo?: number;
  totalMerchantTrades?: number;
  totalButter?: number;
  totalYogurt?: number;
}
