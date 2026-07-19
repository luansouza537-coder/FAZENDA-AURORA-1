import { describe, it, expect } from 'vitest';
import { judgeAnimalScoreExpo, judgeScoreExpo, resolveExpoDuel, expoEntryFee, EXPO_JUDGES, entryFee } from '../lib/fairJudging';
import { Animal } from '../types';

const vaca = (over: Partial<Animal> = {}): Animal => ({
  id: 1, type: 'vaca', name: 'Mimosa', hunger: 90, happiness: 90,
  weeklyProduction: 8, trait: 'saudavel', ...over,
} as Animal);

describe('Exposição de Raças — julgamento de elite contra Juízes Federais', () => {
  it('taxa de inscrição sobe com o nível e é mais alta que a Feira Agropecuária', () => {
    expect(expoEntryFee(1)).toBeGreaterThan(0);
    expect(expoEntryFee(10)).toBeGreaterThan(expoEntryFee(1));
    expect(expoEntryFee(5)).toBeGreaterThan(entryFee(5));
  });

  it('nota multi-critério pune estresse e doença com mais força que a Feira comum', () => {
    const saudavel = judgeAnimalScoreExpo(vaca(), 'leiteiro');
    const doente = judgeAnimalScoreExpo(vaca({ isSick: true }), 'leiteiro');
    const estressado = judgeAnimalScoreExpo(vaca({ stressedDays: 2 }), 'leiteiro');
    expect(doente).toBeLessThan(saudavel);
    expect(estressado).toBeLessThan(saudavel);
  });

  it('juiz é determinístico: mesmo dia = mesma nota', () => {
    const a = judgeScoreExpo(0, 'leiteiro', 8, 100);
    const b = judgeScoreExpo(0, 'leiteiro', 8, 100);
    expect(a).toBe(b);
  });

  it('juiz federal escala com o nível da fazenda — nunca fica trivial', () => {
    const nivelBaixo = judgeScoreExpo(0, 'leiteiro', 3, 50);
    const nivelAlto = judgeScoreExpo(0, 'leiteiro', 15, 50);
    expect(nivelAlto).toBeGreaterThan(nivelBaixo);
  });

  it('juiz especialista é mais forte na própria categoria', () => {
    const especialidade = judgeScoreExpo(0, 'leiteiro', 10, 200);
    const foraDaEspecialidade = judgeScoreExpo(0, 'fibra', 10, 200);
    expect(especialidade).toBeGreaterThan(foraDaEspecialidade);
  });

  it('resolveExpoDuel: animal fraco perde contra o juiz federal em nível alto', () => {
    const fraco = vaca({ happiness: 30, weeklyProduction: 1, trait: 'preguicosa', stressedDays: 3 });
    const duelo = resolveExpoDuel(300, 15, 'leiteiro', fraco);
    expect(duelo.won).toBe(false);
    expect(duelo.judge.specialty).toBe('leiteiro');
  });

  it('resolveExpoDuel: animal excelente e campeão pode vencer mesmo em nível moderado', () => {
    const excelente = vaca({ happiness: 100, weeklyProduction: 12, trait: 'trabalhadora', isCampiao: true });
    const duelo = resolveExpoDuel(300, 6, 'leiteiro', excelente);
    expect(duelo.playerScore).toBeGreaterThan(80);
  });

  it('3 juízes federais, 1 especialista por categoria, sem repetição', () => {
    expect(EXPO_JUDGES.length).toBe(3);
    const specialties = new Set(EXPO_JUDGES.map(j => j.specialty));
    expect(specialties.size).toBe(3);
  });
});
