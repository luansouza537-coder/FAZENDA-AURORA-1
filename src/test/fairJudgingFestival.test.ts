import { describe, it, expect } from 'vitest';
import { festivalEntryFee, festivalPlayerRoundScore, festivalRivalRoundScore, resolveFestival, RIVAL_FARM, FESTIVAL_ROUND_INFO } from '../lib/fairJudging';
import { Animal } from '../types';

const mkAnimal = (over: Partial<Animal> = {}): Animal => ({
  id: 1, type: 'vaca', name: 'Mimosa', hunger: 90, happiness: 90,
  weeklyProduction: 8, trait: 'saudavel', ...over,
} as Animal);

describe('Festival Cultural da Aurora — fazenda inteira vs Fazenda Horizonte Dourado', () => {
  it('taxa de inscrição sobe com o nível', () => {
    expect(festivalEntryFee(1)).toBeGreaterThan(0);
    expect(festivalEntryFee(10)).toBeGreaterThan(festivalEntryFee(1));
  });

  it('rival da fazenda tem nome próprio e as 3 rodadas têm rótulo', () => {
    expect(RIVAL_FARM.name.length).toBeGreaterThan(0);
    expect(Object.keys(FESTIVAL_ROUND_INFO).length).toBe(3);
  });

  it('rodada de produção soma produção semanal escalada', () => {
    const semAnimais = festivalPlayerRoundScore('producao', [], 5, 0);
    const comAnimais = festivalPlayerRoundScore('producao', [mkAnimal(), mkAnimal({ id: 2 })], 5, 0);
    expect(comAnimais).toBeGreaterThan(semAnimais);
  });

  it('rodada de bem-estar pune doença/estresse', () => {
    const saudavel = festivalPlayerRoundScore('bemestar', [mkAnimal()], 5, 0);
    const doente = festivalPlayerRoundScore('bemestar', [mkAnimal({ isSick: true })], 5, 0);
    expect(doente).toBeLessThan(saudavel);
  });

  it('rodada de prestígio cresce com diversidade e pontos de prestígio', () => {
    const poucoDiverso = festivalPlayerRoundScore('prestigio', [mkAnimal()], 5, 0);
    const diverso = festivalPlayerRoundScore('prestigio', [mkAnimal(), mkAnimal({ id: 2, type: 'ovelha' })], 5, 0);
    expect(diverso).toBeGreaterThan(poucoDiverso);
    const comPrestigio = festivalPlayerRoundScore('prestigio', [mkAnimal()], 5, 100);
    expect(comPrestigio).toBeGreaterThan(poucoDiverso);
  });

  it('fazenda rival é determinística: mesmo dia = mesma nota', () => {
    const a = festivalRivalRoundScore('producao', 8, 100);
    const b = festivalRivalRoundScore('producao', 8, 100);
    expect(a).toBe(b);
  });

  it('fazenda rival escala com o nível da fazenda — nunca fica trivial', () => {
    const nivelBaixo = festivalRivalRoundScore('producao', 3, 50);
    const nivelAlto = festivalRivalRoundScore('producao', 20, 50);
    expect(nivelAlto).toBeGreaterThan(nivelBaixo);
  });

  it('resolveFestival: fazenda fraca perde a maioria das rodadas em nível alto', () => {
    const resultado = resolveFestival(300, 20, [], 0);
    expect(resultado.roundsWon).toBeLessThan(2);
    expect(resultado.overallWon).toBe(false);
  });

  it('resolveFestival: fazenda forte e diversificada pode vencer em nível baixo', () => {
    const animais = [
      mkAnimal({ weeklyProduction: 12, happiness: 100, trait: 'trabalhadora' }),
      mkAnimal({ id: 2, type: 'ovelha', weeklyProduction: 10, happiness: 100 }),
      mkAnimal({ id: 3, type: 'galinha', weeklyProduction: 10, happiness: 100 }),
    ];
    const resultado = resolveFestival(300, 3, animais, 200);
    expect(resultado.roundsWon).toBeGreaterThanOrEqual(2);
    expect(resultado.overallWon).toBe(true);
  });

  it('resolveFestival: vence com 2 de 3 rodadas (best-of-3)', () => {
    const resultado = resolveFestival(300, 8, [mkAnimal()], 20);
    expect(resultado.overallWon).toBe(resultado.roundsWon >= 2);
  });
});
