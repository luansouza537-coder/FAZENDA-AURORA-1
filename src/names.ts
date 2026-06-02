/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COW_NAMES = [
  'Mimosa', 'Estrela', 'Branquinha', 'Belinha', 'Malhada', 
  'Clarinha', 'Mumu', 'Joia', 'Amora', 'Melisse', 'Dune'
];

export const SHEEP_NAMES = [
  'Puffy', 'Algodão', 'Floquinho', 'Nuvem', 'Fofinha', 
  'Perlina', 'Suave', 'Mel', 'Lanosa', 'Pipoca', 'Alpaca'
];

export const CHICKEN_NAMES = [
  'Pipoca', 'Frajola', 'Amarelinha', 'Chica', 'Cocó', 
  'Giselda', 'Pintada', 'Pena', 'Carijó', 'Gajeta'
];

export const OX_NAMES = [
  'Rodeio', 'Trovão', 'Brutus', 'Forte', 'Dourado', 
  'Guerreiro', 'Barão', 'Gigante', 'Hércules', 'Xerife', 'Urso'
];

export function getRandomName(type: 'vaca' | 'ovelha' | 'boi' | 'galinha'): string {
  if (type === 'galinha') {
    return CHICKEN_NAMES[Math.floor(Math.random() * CHICKEN_NAMES.length)];
  }
  const names = type === 'vaca' ? COW_NAMES : type === 'ovelha' ? SHEEP_NAMES : OX_NAMES;
  return names[Math.floor(Math.random() * names.length)];
}

export function getUniqueOxName(currentAnimals: { type: string; name: string }[]): string {
  const existingNumbers = new Set(
    currentAnimals
      .filter(a => a.type === 'boi')
      .map(a => {
        const match = a.name.match(/Boi\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null)
  );
  
  let attempts = 0;
  while (attempts < 1000) {
    const r = Math.floor(Math.random() * 200) + 1;
    if (!existingNumbers.has(r)) {
      return `Boi ${r}`;
    }
    attempts++;
  }
  // Safe fallback
  return `Boi ${Math.floor(Math.random() * 200) + 1}`;
}
