/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { getFarmTitle, getXpForLevel, XP_THRESHOLDS } from '../hooks/useFarm';

describe('getFarmTitle', () => {
  it('returns correct title for level 1', () => {
    expect(getFarmTitle(1)).toBe('Fazenda Iniciante 🧑‍🌾');
  });

  it('returns correct title for level 10', () => {
    expect(getFarmTitle(10)).toBe('Fazenda Centenária 🌾');
  });

  it('returns correct title for level 20', () => {
    const title = getFarmTitle(20);
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });
});

describe('getXpForLevel', () => {
  it('level 1 requires 0 XP', () => {
    expect(getXpForLevel(1)).toBe(0);
  });

  it('XP required increases monotonically', () => {
    for (let lvl = 2; lvl <= 20; lvl++) {
      expect(getXpForLevel(lvl)).toBeGreaterThan(getXpForLevel(lvl - 1));
    }
  });

  it('levels beyond 20 extend beyond 49000', () => {
    expect(getXpForLevel(21)).toBeGreaterThan(49000);
    expect(getXpForLevel(22)).toBeGreaterThan(getXpForLevel(21));
  });

  it('matches XP_THRESHOLDS for levels 1-20', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      expect(getXpForLevel(lvl)).toBe(XP_THRESHOLDS[lvl]);
    }
  });
});
