import { describe, it, expect } from 'vitest';
import { judgeAnimalScore, rivalScore, resolveDuel, entryFee, BREEDERS } from '../lib/fairJudging';
import { Animal } from '../types';

const vaca = (over: Partial<Animal> = {}): Animal => ({
  id: 1, type: 'vaca', name: 'Mimosa', hunger: 90, happiness: 90,
  weeklyProduction: 8, trait: 'saudavel', ...over,
} as Animal);

describe('Feira Agropecuária — julgamento contra Criadores Rivais', () => {
  it('taxa de inscrição sobe com o nível (nunca é de graça)', () => {
    expect(entryFee(1)).toBeGreaterThan(0);
    expect(entryFee(10)).toBeGreaterThan(entryFee(1));
  });

  it('nota multi-critério pune estresse e doença mesmo com boa produção', () => {
    const saudavel = judgeAnimalScore(vaca(), 'leiteiro');
    const doente = judgeAnimalScore(vaca({ isSick: true }), 'leiteiro');
    const estressado = judgeAnimalScore(vaca({ stressedDays: 2 }), 'leiteiro');
    expect(doente).toBeLessThan(saudavel);
    expect(estressado).toBeLessThan(saudavel);
  });

  it('rival é determinístico: mesmo dia = mesma nota', () => {
    const a = rivalScore(0, 'leiteiro', 8, 100);
    const b = rivalScore(0, 'leiteiro', 8, 100);
    expect(a).toBe(b);
  });

  it('rival escala com o nível da fazenda — nunca fica trivial', () => {
    const nivelBaixo = rivalScore(0, 'leiteiro', 3, 50);
    const nivelAlto = rivalScore(0, 'leiteiro', 15, 50);
    expect(nivelAlto).toBeGreaterThan(nivelBaixo);
  });

  it('especialista é mais forte na própria categoria do que em outra', () => {
    const especialidade = rivalScore(0, 'leiteiro', 10, 200); // Dona Marlene é leiteira
    const foraDaEspecialidade = rivalScore(0, 'fibra', 10, 200);
    expect(especialidade).toBeGreaterThan(foraDaEspecialidade);
  });

  it('resolveDuel: animal fraco perde contra o rival especialista em nível alto', () => {
    const fraco = vaca({ happiness: 30, weeklyProduction: 1, trait: 'preguicosa', stressedDays: 3 });
    const duelo = resolveDuel(300, 15, 'leiteiro', fraco);
    expect(duelo.won).toBe(false);
    expect(duelo.breeder.specialty).toBe('leiteiro');
  });

  it('resolveDuel: animal excelente pode vencer mesmo em nível alto', () => {
    const excelente = vaca({ happiness: 100, weeklyProduction: 12, trait: 'trabalhadora', isCampiao: true });
    const duelo = resolveDuel(300, 8, 'leiteiro', excelente);
    expect(duelo.playerScore).toBeGreaterThan(90);
  });

  it('4 criadores, 1 especialista por categoria, sem repetição', () => {
    expect(BREEDERS.length).toBe(4);
    const specialties = new Set(BREEDERS.map(b => b.specialty));
    expect(specialties.size).toBe(4);
  });
});
