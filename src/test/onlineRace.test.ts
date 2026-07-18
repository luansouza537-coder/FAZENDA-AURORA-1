import { describe, it, expect } from 'vitest';
import { resolveOnlineRace, basePerformance, raceKeyToday, raceKeyYesterday, OnlineEntry } from '../lib/onlineRace';

describe('Corrida Online — resolução determinística', () => {
  const entries = [
    { race_key: '2026-07-18', user_id: 'aaa', farm_name: 'Sítio A', horse_name: 'Vendaval', speed: 70, forma: 1, vigor: 95, moral: 90, trait: 'trabalhadora' },
    { race_key: '2026-07-18', user_id: 'bbb', farm_name: 'Sítio B', horse_name: 'Cometa', speed: 55, forma: 0.9, vigor: 80, moral: 70, trait: 'estressada' },
    { race_key: '2026-07-18', user_id: 'ccc', farm_name: 'Sítio C', horse_name: 'Faísca', speed: 62, forma: 1, vigor: 100, moral: 100, trait: null },
  ] as OnlineEntry[];

  it('mesma entrada → exatamente o mesmo resultado (qualquer cliente)', () => {
    const r1 = resolveOnlineRace('2026-07-18', entries);
    const r2 = resolveOnlineRace('2026-07-18', entries);
    expect(r1.map(r => r.key)).toEqual(r2.map(r => r.key));
    expect(r1.map(r => r.performance)).toEqual(r2.map(r => r.performance));
  });

  it('ordem do fetch não muda o resultado', () => {
    const shuffled = [entries[2], entries[0], entries[1]];
    const r1 = resolveOnlineRace('2026-07-18', entries);
    const r2 = resolveOnlineRace('2026-07-18', shuffled);
    expect(r1.map(r => r.key)).toEqual(r2.map(r => r.key));
  });

  it('dia diferente → corrida diferente (semente muda)', () => {
    const r1 = resolveOnlineRace('2026-07-18', entries);
    const r2 = resolveOnlineRace('2026-07-19', entries);
    expect(r1.map(r => r.performance)).not.toEqual(r2.map(r => r.performance));
  });

  it('completa o grid até 6 com NPCs determinísticos', () => {
    const r = resolveOnlineRace('2026-07-18', entries);
    expect(r.length).toBe(6);
    expect(r.filter(x => x.isNpc).length).toBe(3);
    // corrida vazia: 6 NPCs
    const vazia = resolveOnlineRace('2026-07-18', []);
    expect(vazia.length).toBe(6);
    expect(vazia.every(x => x.isNpc)).toBe(true);
  });

  it('desempenho base reflete os stats (mérito, não sorte)', () => {
    const forte = basePerformance({ speed: 90, forma: 1, vigor: 100, moral: 100, trait: 'trabalhadora' });
    const fraco = basePerformance({ speed: 40, forma: 0.75, vigor: 40, moral: 30, trait: 'preguicosa' });
    expect(forte).toBeGreaterThan(fraco * 2);
  });

  it('chaves de corrida: hoje e ontem em UTC', () => {
    const now = new Date('2026-07-18T15:00:00Z');
    expect(raceKeyToday(now)).toBe('2026-07-18');
    expect(raceKeyYesterday(now)).toBe('2026-07-17');
  });
});
