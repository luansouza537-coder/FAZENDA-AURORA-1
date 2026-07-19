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

  it('nota do comprador tem platô: não cresce sem limite além do nível de cap', () => {
    const nivel30 = marketJudgeScore(0, 'queijos', 30, 50);
    const nivel100 = marketJudgeScore(0, 'queijos', 100, 50);
    expect(nivel30).toBe(nivel100);
  });

  // Estoque total `qty` distribuído em partes iguais entre os 4 itens da categoria (peso médio
  // ~2.25 para queijos), reproduzindo o comportamento "estoca um pouco de tudo" usado na
  // calibração (ex.: qty=6 → 1.5 de cada item → nota ~ 6*2.25 = 13.5).
  const stockAtQty = (qty: number) => {
    const each = qty / 4;
    return { queijoCoalho: each, queijoMucarela: each, queijoBrie: each, queijo_cabra: each };
  };

  it('entrante no minQty exato tem chance real de perder em nível alto (não é garantido)', () => {
    const info = PROD_CATEGORY_INFO.queijos;
    const inv = stockAtQty(info.minQty);
    let perdeuAlgumDia = false;
    for (let day = 0; day < 60; day++) {
      const duelo = resolveProdDuel(day, 20, 'queijos', inv);
      if (!duelo.won) perdeuAlgumDia = true;
    }
    expect(perdeuAlgumDia).toBe(true);
  });

  it('estoque em ~8x minQty vence o comprador com folga em quase todos os dias, em nível alto', () => {
    const info = PROD_CATEGORY_INFO.queijos;
    const inv = stockAtQty(info.minQty * 8);
    let vitorias = 0;
    const total = 40;
    for (let day = 0; day < total; day++) {
      const duelo = resolveProdDuel(day, 20, 'queijos', inv);
      if (duelo.won) vitorias++;
    }
    expect(vitorias / total).toBeGreaterThan(0.9);
  });

  it('estoque em ~3x minQty vence a maioria das vezes, mas não sempre, em nível alto', () => {
    const info = PROD_CATEGORY_INFO.queijos;
    const inv = stockAtQty(info.minQty * 3);
    let vitorias = 0;
    const total = 60;
    for (let day = 0; day < total; day++) {
      const duelo = resolveProdDuel(day, 20, 'queijos', inv);
      if (duelo.won) vitorias++;
    }
    const taxa = vitorias / total;
    expect(taxa).toBeGreaterThan(0.5);
    expect(taxa).toBeLessThan(1);
  });
});
