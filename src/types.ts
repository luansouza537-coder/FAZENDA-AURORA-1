/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnimalType = 'vaca' | 'ovelha' | 'boi' | 'galinha';

export interface Animal {
  id: number;
  type: AnimalType;
  name: string;
  hunger: number;     // 0 to 100
  happiness: number;  // 0 to 100
  
  // Custom new features
  consecutiveHappyDays?: number; // Days consecutive with 100 happiness
  daysBelow80?: number;          // Days consecutive with happiness < 80
  isBestFriend?: boolean;        // Best Friend status indicator

  // Cow specific
  hasProducedToday?: boolean;
  
  // Sheep specific
  daysUntilWool?: number;
  daysSinceLastWool?: number;
  woolReady?: boolean;
  
  // Ox specific
  weightGain?: number; // 0.0 to 1.0 (0% to 100%)
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
}
