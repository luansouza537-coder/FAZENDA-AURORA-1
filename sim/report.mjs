// Analisa um .jsonl gerado pelo bot e imprime relatório de balanceamento em markdown.
// Uso: node sim/report.mjs sim/runs/<arquivo>.jsonl [outro.jsonl ...]
import fs from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) { console.error('uso: node sim/report.mjs <run.jsonl> [...]'); process.exit(1); }

const fmt = n => Math.round(n).toLocaleString('pt-BR');

for (const file of files) {
  const rows = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  if (rows.length === 0) { console.log(`\n## ${file}\n(vazio)`); continue; }
  const last = rows[rows.length - 1];

  console.log(`\n# Relatório — ${file}`);
  console.log(`Dias simulados: **${rows.length}** · Nível final: **${last.level}** · Ouro final: **${fmt(last.gold)}** · Dívida: ${fmt(last.debt)} · Animais: ${last.animals} · Lotes: ${last.landLots}`);

  // Dias por nível
  const firstDayAtLevel = {};
  for (const r of rows) if (!(r.level in firstDayAtLevel)) firstDayAtLevel[r.level] = r.day;
  const levels = Object.keys(firstDayAtLevel).map(Number).sort((a, b) => a - b);
  const spans = [];
  for (let i = 0; i < levels.length; i++) {
    const start = firstDayAtLevel[levels[i]];
    const end = i + 1 < levels.length ? firstDayAtLevel[levels[i + 1]] : last.day;
    spans.push({ level: levels[i], days: end - start, start });
  }
  const media = spans.length > 1 ? spans.slice(0, -1).reduce((s, x) => s + x.days, 0) / (spans.length - 1) : 0;
  console.log(`\n## Dias por nível (média ${media.toFixed(1)}d)`);
  console.log('| Nível | Dia de chegada | Dias parado | Gargalo? |');
  console.log('|---|---|---|---|');
  for (const s of spans) {
    const gargalo = media > 0 && s.days > media * 2 && s !== spans[spans.length - 1];
    console.log(`| ${s.level} | ${s.start} | ${s.days}${s === spans[spans.length - 1] ? ' (fim da corrida)' : ''} | ${gargalo ? '⚠️ SIM' : ''} |`);
  }

  // Curva de ouro por semana
  console.log(`\n## Ouro por semana`);
  console.log('| Semana | Mín | Média | Máx | Δ médio/dia |');
  console.log('|---|---|---|---|---|');
  for (let w = 0; w * 7 < rows.length; w++) {
    const chunk = rows.slice(w * 7, w * 7 + 7);
    const golds = chunk.map(r => r.gold);
    const deltas = chunk.map(r => r.goldDelta ?? 0);
    console.log(`| ${w + 1} | ${fmt(Math.min(...golds))} | ${fmt(golds.reduce((a, b) => a + b, 0) / golds.length)} | ${fmt(Math.max(...golds))} | ${fmt(deltas.reduce((a, b) => a + b, 0) / deltas.length)} |`);
  }

  // Quase-falências
  const broke = rows.filter(r => r.gold < 50 || (r.debt ?? 0) > 0);
  if (broke.length > 0) {
    console.log(`\n## ⚠️ Dias de aperto (ouro < 50 ou dívida > 0): ${broke.length}`);
    console.log(broke.slice(0, 10).map(r => `dia ${r.day} (nv${r.level}): 💰${r.gold} dívida ${r.debt}`).join(' · '));
  }

  // Compras nunca alcançadas (referência: pico de ouro)
  const peak = Math.max(...rows.map(r => r.gold));
  console.log(`\n## Poder de compra`);
  console.log(`Pico de ouro na corrida: **${fmt(peak)}**`);
  const alvos = [
    ['Lote 6', 28000], ['Lote 7', 30000], ['Lote 8', 35000], ['Lote 9', 90000], ['Lote 10', 250000],
    ['Solar Nv4', 40000], ['Poço Nv5', 70000], ['Boi Angus', 1500], ['Jacaré', 900],
  ];
  for (const [nome, preco] of alvos) {
    if (preco > peak) console.log(`- ❌ **${nome}** (${fmt(preco)}💰) nunca ficou ao alcance (${(preco / Math.max(peak, 1)).toFixed(1)}× o pico)`);
  }

  // Contratos
  const missed = last.contractsMissedWeeks ?? 0;
  console.log(`\n## Contratos`);
  console.log(`Ativos no fim: ${last.contractsActive} · Semanas de meta perdidas (acumulado): ${missed}${missed > 3 ? ' ⚠️ metas possivelmente altas demais para o plantel' : ''}`);

  // Máquinas
  console.log(`\n## Máquinas compradas: ${last.machines?.join(', ') || 'nenhuma'}`);
}
