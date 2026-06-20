/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Animal } from '../types';
import { InventoryState } from './useAnimals';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'epic';
  goal: number;
  current: number;
  reward: number;
  expiresOnDay: number;
  completed: boolean;
  claimed: boolean;
  missionKey: 'sell_milk' | 'sell_any' | 'happy_animals' | 'earn_gold' | 'feed_animals' | 'collect_items' | 'collect_silk' | 'sell_exotic' | 'organic_day' | 'sell_cheese' | 'have_animals' | 'sell_wool';
}

export interface UseMissionsProps {
  animals: Animal[];
  farmLevel: number;
  inventory: InventoryState;
}

export function useMissions({ animals: _animals, farmLevel: _farmLevel, inventory: _inventory }: UseMissionsProps) {
  const generateDailyMissions = (_day: number): Mission[] => {
    return [];
  };

  const generateWeeklyMissions = (_day: number): Mission[] => {
    return [];
  };

  const generateEpicMissions = (_day: number): Mission[] => {
    return [];
  };

  return { generateDailyMissions, generateWeeklyMissions, generateEpicMissions };
}
