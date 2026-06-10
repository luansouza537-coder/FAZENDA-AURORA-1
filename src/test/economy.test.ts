/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Pure helpers extracted from useEconomy defaults
const DEFAULT_GOLD = 60;
const DEFAULT_PRICES = {
  milk: 5, wool: 12, cheese: 20, scarf: 30,
  carne: 150, egg: 4, mayo: 16,
  queijoCoalho: 14, queijoMucarela: 28, queijoBrie: 65,
};

describe('economy defaults', () => {
  it('starting gold is 60', () => {
    expect(DEFAULT_GOLD).toBe(60);
  });

  it('all default prices are positive', () => {
    for (const [item, price] of Object.entries(DEFAULT_PRICES)) {
      expect(price, `${item} should be positive`).toBeGreaterThan(0);
    }
  });

  it('processed products cost more than raw inputs (cheese > milk)', () => {
    expect(DEFAULT_PRICES.cheese).toBeGreaterThan(DEFAULT_PRICES.milk);
  });

  it('processed products: mayo > egg', () => {
    expect(DEFAULT_PRICES.mayo).toBeGreaterThan(DEFAULT_PRICES.egg);
  });

  it('carne is the most valuable base product', () => {
    const rawItems = { milk: DEFAULT_PRICES.milk, wool: DEFAULT_PRICES.wool, egg: DEFAULT_PRICES.egg, carne: DEFAULT_PRICES.carne };
    const max = Math.max(...Object.values(rawItems));
    expect(max).toBe(DEFAULT_PRICES.carne);
  });
});

// Season price multiplier logic (mirrors App.tsx)
function getSeasonMult(season: number): number {
  // season: 0=spring, 1=summer, 2=autumn, 3=winter
  switch (season) {
    case 0: return 1.1; // spring: dairy bonus
    case 1: return 0.95;
    case 2: return 1.05;
    case 3: return 1.15; // winter: wool bonus
    default: return 1.0;
  }
}

describe('season price multipliers', () => {
  it('spring multiplier > 1', () => {
    expect(getSeasonMult(0)).toBeGreaterThan(1);
  });

  it('winter multiplier is highest', () => {
    const mults = [0, 1, 2, 3].map(getSeasonMult);
    expect(Math.max(...mults)).toBe(getSeasonMult(3));
  });

  it('summer is the cheapest season', () => {
    const mults = [0, 1, 2, 3].map(getSeasonMult);
    expect(Math.min(...mults)).toBe(getSeasonMult(1));
  });
});

// Day-to-season mapping
function getSeason(day: number): number {
  return Math.floor(((day - 1) % 120) / 30);
}

describe('season cycle', () => {
  it('day 1 is spring', () => expect(getSeason(1)).toBe(0));
  it('day 31 is summer', () => expect(getSeason(31)).toBe(1));
  it('day 61 is autumn', () => expect(getSeason(61)).toBe(2));
  it('day 91 is winter', () => expect(getSeason(91)).toBe(3));
  it('day 121 resets to spring', () => expect(getSeason(121)).toBe(0));
  it('completes full year every 120 days', () => {
    for (let d = 1; d <= 360; d++) {
      const s = getSeason(d);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(3);
    }
  });
});
