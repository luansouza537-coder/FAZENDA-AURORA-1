import { describe, it, expect } from 'vitest';
import { productScore, marketJudgeScore, resolveProdDuel, marketEntryFee, MARKET_JUDGES, PROD_CATEGORY_INFO } from '../lib/fairJudging';

describe('Feira Regional de Produtos — julgamento de inventário contra Compradores de Mercado', () => {
  it('taxa de inscrição sobe com o nível', () => {
    expect(marketEntryFee(1)).toBeGreaterThan(0);
    expect(marketEntryFee(10)).toBeGreaterThan(marketEntryFee(1));
  });

  it('nota do produto soma o estoque ponderado da categoria', () => {
    const inv = { queijoCoalho: 2, queijoMucarela: 1, queijoBrie: 0, queijo_cabra: 0 };
    const score = productScore(inv, 'queijos');
    expect(score).toBe(2 * 1 + 1 * 2);
  });

  it('estoque maior/melhor gera nota maior', () => {
    const fraco = productScore({ queijoCoalho: 1 }, 'queijos');
    const forte = productScore({ queijoBrie: 5 }, 'queijos');
    expect(forte).toBeGreaterThan(fraco);
  });

  it('comprador é determinístico: mesmo dia = mesma nota', () => {
    const a = marketJudgeScore(0, 'queijos', 8, 100);
    const b = marketJudgeScore(0, 'queijos', 8, 100);
    expect(a).toBe(b);
  });

  it('comprador escala com o nível da fazenda', () => {
    const nivelBaixo = marketJudgeScore(0, 'queijos', 3, 50);
    const nivelAlto = marketJudgeScore(0, 'queijos', 15, 50);
    expect(nivelAlto).toBeGreaterThan(nivelBaixo);
  });

  it('comprador especialista é mais forte na própria categoria', () => {
    const especialidade = marketJudgeScore(0, 'queijos', 10, 200);
    const foraDaEspecialidade = marketJudgeScore(0, 'texteis', 10, 200);
    expect(especialidade).toBeGreaterThan(foraDaEspecialidade);
  });

  it('resolveProdDuel: estoque fraco perde contra o comprador em nível alto', () => {
    const inv = { queijoCoalho: 1 };
    const duelo = resolveProdDuel(300, 15, 'queijos', inv);
    expect(duelo.won).toBe(false);
    expect(duelo.judge.specialty).toBe('queijos');
  });

  it('resolveProdDuel: estoque robusto pode vencer em nível baixo', () => {
    const inv = { queijoBrie: 20, queijoMucarela: 10 };
    const duelo = resolveProdDuel(300, 2, 'queijos', inv);
    expect(duelo.won).toBe(true);
  });

  it('resolveProdDuel indica a amostra consignada (item + qtd) consumida como entrada', () => {
    const inv = { queijoBrie: 5 };
    const duelo = resolveProdDuel(300, 6, 'queijos', inv);
    expect(duelo.stakeItem).toBe(PROD_CATEGORY_INFO.queijos.stakeItem);
    expect(duelo.stakeQty).toBeGreaterThan(0);
  });

  it('3 compradores de mercado, 1 especialista por categoria, sem repetição', () => {
    expect(MARKET_JUDGES.length).toBe(3);
    const specialties = new Set(MARKET_JUDGES.map(j => j.specialty));
    expect(specialties.size).toBe(3);
  });
});
