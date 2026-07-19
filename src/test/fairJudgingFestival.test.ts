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

  it('nota do rival tem platô em cada rodada: não cresce sem limite além do cap', () => {
    for (const round of ['producao', 'bemestar', 'prestigio'] as const) {
      const nivel30 = festivalRivalRoundScore(round, 30, 50);
      const nivel100 = festivalRivalRoundScore(round, 100, 50);
      expect(nivel30).toBe(nivel100);
    }
  });

  it('bem-estar: rival nunca ultrapassa o teto absoluto do jogador (100), em nenhum nível/dia', () => {
    for (const nivel of [5, 12, 20, 40, 80]) {
      for (let day = 0; day < 40; day++) {
        const rival = festivalRivalRoundScore('bemestar', nivel, day);
        expect(rival).toBeLessThan(100);
      }
    }
  });

  it('bem-estar: rebanho impecável (felicidade 100, sem doença/estresse) vence a rodada de bem-estar em nível alto', () => {
    const impecavel = [
      mkAnimal({ happiness: 100 }),
      mkAnimal({ id: 2, happiness: 100 }),
      mkAnimal({ id: 3, happiness: 100 }),
    ];
    const playerScore = festivalPlayerRoundScore('bemestar', impecavel, 25, 0);
    expect(playerScore).toBe(100);
    let venceuAlgumDia = false;
    for (let day = 0; day < 40; day++) {
      const rival = festivalRivalRoundScore('bemestar', 25, day);
      if (playerScore > rival) venceuAlgumDia = true;
    }
    expect(venceuAlgumDia).toBe(true);
  });

  it('bem-estar: rebanho negligenciado (doente/estressado, felicidade baixa) perde consistentemente em qualquer nível', () => {
    const negligenciado = [
      mkAnimal({ happiness: 30, isSick: true }),
      mkAnimal({ id: 2, happiness: 25, stressedDays: 2 }),
    ];
    const playerScore = festivalPlayerRoundScore('bemestar', negligenciado, 25, 0);
    for (const nivel of [1, 12, 25, 50]) {
      for (let day = 0; day < 20; day++) {
        const rival = festivalRivalRoundScore('bemestar', nivel, day);
        expect(playerScore).toBeLessThan(rival);
      }
    }
  });

  it('produção/prestígio: fazenda fraca (baixa produção/diversidade/prestígio) NÃO vence só por ter nível alto', () => {
    // Antes do platô no termo de nível do jogador, uma fazenda com pouquíssima produção
    // vencia sozinha em nível alto (o bônus de nível descolava do rival). Com o platô nos
    // dois lados, nível alto sozinho não deve mais carregar uma fazenda fraca.
    const animaisFracos = [
      mkAnimal({ weeklyProduction: 1, happiness: 60 }),
      mkAnimal({ id: 2, type: 'vaca', weeklyProduction: 1, happiness: 60 }),
    ];
    let venceuProducao = false;
    let venceuPrestigio = false;
    for (let day = 0; day < 60; day++) {
      const playerProd = festivalPlayerRoundScore('producao', animaisFracos, 30, 0);
      const rivalProd = festivalRivalRoundScore('producao', 30, day);
      if (playerProd > rivalProd) venceuProducao = true;
      const playerPrest = festivalPlayerRoundScore('prestigio', animaisFracos, 30, 0);
      const rivalPrest = festivalRivalRoundScore('prestigio', 30, day);
      if (playerPrest > rivalPrest) venceuPrestigio = true;
    }
    expect(venceuProducao).toBe(false);
    expect(venceuPrestigio).toBe(false);
  });

  it('produção/prestígio: fazenda bem manejada (boa produção/diversidade/prestígio) continua competitiva no endgame (não impossível)', () => {
    const animaisBons = [
      ...Array.from({ length: 4 }, (_, i) => mkAnimal({ id: i, type: 'vaca', weeklyProduction: 3, happiness: 90 })),
      ...Array.from({ length: 2 }, (_, i) => mkAnimal({ id: 10 + i, type: 'ovelha', weeklyProduction: 3, happiness: 90 })),
      ...Array.from({ length: 2 }, (_, i) => mkAnimal({ id: 20 + i, type: 'galinha', weeklyProduction: 3, happiness: 90 })),
    ];
    let venceuProducao = false;
    let venceuPrestigio = false;
    for (let day = 0; day < 60; day++) {
      const playerProd = festivalPlayerRoundScore('producao', animaisBons, 30, 0);
      const rivalProd = festivalRivalRoundScore('producao', 30, day);
      if (playerProd > rivalProd) venceuProducao = true;
      const playerPrest = festivalPlayerRoundScore('prestigio', animaisBons, 30, 100);
      const rivalPrest = festivalRivalRoundScore('prestigio', 30, day);
      if (playerPrest > rivalPrest) venceuPrestigio = true;
    }
    expect(venceuProducao).toBe(true);
    expect(venceuPrestigio).toBe(true);
  });

  it('nível sozinho não decide mais o vencedor: platô do jogador acompanha o platô do rival', () => {
    // O termo de nível do jogador (producao/prestigio) deve estar capado no mesmo nível
    // que o do rival — então subir de nível MUITO além do cap não deve inflar o placar
    // do jogador sem que ele também invista em produção/diversidade/prestígio real.
    const animais = [mkAnimal({ weeklyProduction: 3 })];
    const scoreNoCap = festivalPlayerRoundScore('producao', animais, 12, 0);
    const scoreAlemDoCap = festivalPlayerRoundScore('producao', animais, 50, 0);
    expect(scoreAlemDoCap).toBe(scoreNoCap);
  });
});
