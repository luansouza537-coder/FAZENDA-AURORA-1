// Bot de progressão econômica — joga Fazenda Aurora do dia 1 até o nível 18.
// Uso: node sim/bot.mjs [maxDays] [nomeDaCorrida]
// Pré-requisito: npm run preview -- --port 4174 rodando.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const MAX_DAYS = Number(process.argv[2] ?? 400);
const RUN_NAME = process.argv[3] ?? `run-${Date.now()}`;
const OUT_DIR = path.join(import.meta.dirname, 'runs');
fs.mkdirSync(OUT_DIR, { recursive: true });
const RESUME = process.argv[4] === 'resume';
const OUT = path.join(OUT_DIR, `${RUN_NAME}.jsonl`);
const SAVE_FILE = path.join(OUT_DIR, `${RUN_NAME}-save.json`);
if (!RESUME) fs.writeFileSync(OUT, '');

const RESERVA = 250; // ouro de segurança para contas semanais

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(4000);
page.on('dialog', d => d.accept().catch(() => {}));

const state = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('aurora_farm_save')); } catch { return null; } });
const log = (...a) => console.log(`[dia]`, ...a);

async function clickIf(locator) {
  try {
    const el = locator.first();
    if (await el.count() === 0) return false;
    if (!(await el.isEnabled().catch(() => false))) return false;
    await el.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
    await el.click({ timeout: 2000 });
    return true;
  } catch { return false; }
}

async function fecharModais() {
  // fecha level-up, resumo semanal e sobras genéricas
  for (let i = 0; i < 4; i++) {
    const closed =
      (await clickIf(page.locator('button', { hasText: /Continuar Fazenda!/i }))) ||
      (await clickIf(page.locator('button', { hasText: /^Fechar( Relatório)?$/i }))) ||
      (await clickIf(page.locator('button:has-text("✕")')));
    if (!closed) break;
    await page.waitForTimeout(350);
  }
  await page.keyboard.press('Escape').catch(() => {});
}

async function comprarRacao(save) {
  // garante ~2 dias de estoque por tipo necessário
  const need = { racaoBovina: 0, racaoOvinos: 0, racaoAves: 0, racaoAquatica: 0 };
  for (const a of save.animals ?? []) {
    if (['vaca', 'boi', 'bufalo', 'vaca_jersey', 'boi_angus'].includes(a.type)) need.racaoBovina++;
    else if (['ovelha', 'cabra', 'lhama', 'alpaca', 'ovelha_leiteira', 'cabra_angora'].includes(a.type)) need.racaoOvinos++;
    else if (['galinha', 'codorna', 'pavao', 'frango_corte', 'galinha_caipira', 'peru'].includes(a.type)) need.racaoAves++;
    else if (['pato', 'ganso'].includes(a.type)) need.racaoAquatica++;
  }
  const labels = { racaoBovina: 'Ração Bovina', racaoOvinos: 'Ração de Ovinos', racaoAves: 'Ração de Aves', racaoAquatica: 'Ração Aquática' };
  for (const [key, count] of Object.entries(need)) {
    if (count === 0) continue;
    const stock = save.inventory?.[key] ?? 0;
    if (stock >= count * 2) continue;
    const row = page.locator(`[data-onboarding="silo-racoes"] div`)
      .filter({ hasText: labels[key] })
      .filter({ has: page.locator('button', { hasText: /\+1u/ }) })
      .last();
    const tried = count >= 5
      ? (await clickIf(row.locator('button', { hasText: /\+50u/ }))) || (await clickIf(row.locator('button', { hasText: /\+10u/ })))
      : await clickIf(row.locator('button', { hasText: /\+10u/ }));
    if (!tried) { // fallback: compra unitária quando o ouro está curto
      for (let i = 0; i < Math.min(count * 2 - stock, 5); i++) await clickIf(row.locator('button', { hasText: /\+1u/ }));
    }
    await page.waitForTimeout(200);
  }
}

async function alimentarEColetar() {
  const feed = page.locator('button', { hasText: /ALIMENTAR \(/i });
  const n = Math.min(await feed.count(), 40);
  for (let i = 0; i < n; i++) { await clickIf(feed.nth(i)); await page.waitForTimeout(120); }
  const collect = page.locator('button:has-text("COLETAR"):not([disabled])');
  const c = Math.min(await collect.count(), 40);
  for (let i = c - 1; i >= 0; i--) { await clickIf(collect.nth(i)); await page.waitForTimeout(120); }
}

async function venderTudo() {
  if (!(await clickIf(page.locator('[data-onboarding="financas-btn"]')))) return;
  await page.waitForTimeout(500);
  if (await clickIf(page.locator('button', { hasText: /Vender Tudo/i }))) {
    await page.waitForTimeout(500);
    await clickIf(page.locator('button', { hasText: /Confirmar Venda!/i }));
  } else {
    await fecharModais();
  }
  await page.waitForTimeout(400);
  await fecharModais();
}

async function comprarMaquinas(save) {
  const m = save.machines ?? {};
  const wants = [
    { flag: m.feederPurchased, lvl: 4, price: 1500, label: /Comprar \(1\.500💰\)/ },
    { flag: m.collectorPurchased, lvl: 5, price: 1800, label: /Comprar \(1\.800💰\)/ },
    { flag: m.milkerPurchased, lvl: 6, price: 2500, label: /Comprar \(2\.500💰\)/ },
  ].filter(w => !w.flag && (save.farmLevel ?? 1) >= w.lvl && save.gold > w.price + RESERVA);
  if (wants.length === 0) return;
  if (!(await clickIf(page.locator('[data-onboarding="loja-btn"]')))) return;
  await page.waitForTimeout(600);
  await clickIf(page.locator('button', { hasText: /Automação/i }));
  await page.waitForTimeout(400);
  for (const w of wants) { await clickIf(page.locator('button', { hasText: w.label })); await page.waitForTimeout(400); }
  await clickIf(page.locator('button', { hasText: /Fechar Loja/i }));
  await page.waitForTimeout(300);
}

async function expandirLote(save) {
  const cap = (save.landLots ?? 1) * 5;
  if ((save.animals?.length ?? 0) < cap) return;
  if (!(await clickIf(page.locator('[data-onboarding="loja-btn"]')))) return;
  await page.waitForTimeout(600);
  await clickIf(page.locator('button', { hasText: /Terrenos & Biomas/i }));
  await page.waitForTimeout(400);
  await clickIf(page.locator('button:not([disabled])', { hasText: /Lote \d/ }));
  await page.waitForTimeout(400);
  await clickIf(page.locator('button', { hasText: /Fechar Loja/i }));
  await page.waitForTimeout(300);
}

async function comprarAnimal(save) {
  const cap = (save.landLots ?? 1) * 5;
  if ((save.animals?.length ?? 0) >= cap) return;
  // prioridade: vaca (leite = renda estável) > galinha (barata); sem reserva no bootstrap
  const reserva = (save.animals?.length ?? 0) === 0 ? 0 : RESERVA;
  const alvo = save.gold > 400 + reserva ? 'Vaca' : save.gold > 45 + reserva ? 'Galinha' : null;
  if (!alvo) return;
  if (!(await clickIf(page.locator('[data-onboarding="buy-animal-btn"]')))) return;
  await page.waitForTimeout(600);
  for (let i = 0; i < 2; i++) {
    if (!(await clickIf(page.locator(`button[title*="${alvo}"]`).first()))) break;
    await page.waitForTimeout(400);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function assinarContratos() {
  if (!(await clickIf(page.locator('[data-onboarding="mais-btn"]')))) return;
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-onboarding="contratos-btn"]')?.click());
  await page.waitForTimeout(900);
  const modal = page.locator('div[class*="z-[99]"]').first();
  // abre as duas primeiras famílias e assina o que estiver disponível (máx 2/visita)
  let signed = 0;
  for (const fam of ['Laticínios', 'Ovos']) {
    await clickIf(modal.locator('button', { hasText: new RegExp(fam, 'i') }));
    await page.waitForTimeout(400);
    for (let i = 0; i < 4 && signed < 2; i++) {
      // expande um card e tenta assinar
      const card = modal.locator('button', { hasText: /🧒 NV \d/ }).nth(i);
      if (!(await clickIf(card))) break;
      await page.waitForTimeout(300);
      if (await clickIf(modal.locator('button', { hasText: /Assinar contrato/i }))) signed++;
      await page.waitForTimeout(300);
    }
  }
  await fecharModais();
}

async function avancarDia() {
  await clickIf(page.locator('[data-onboarding="advance-day"]'));
  await page.waitForTimeout(1000);
  await clickIf(page.locator('button', { hasText: /Avançar para o Dia/i }));
  await page.waitForTimeout(1800);
  await fecharModais();
}

// ---------- boot ----------
await page.goto('http://localhost:4174', { timeout: 30000 });
await page.evaluate(() => localStorage.clear());
const seed = RESUME && fs.existsSync(SAVE_FILE)
  ? JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'))
  : { gold: 100, currentDay: 1, farmLevel: 1, farmXp: 0, onboardingStep: 0, inventory: { racaoBovina: 5, racaoAves: 5 }, animals: [] };
await page.evaluate((sv) => localStorage.setItem('aurora_farm_save', JSON.stringify(sv)), seed);
await page.reload({ timeout: 30000 }); await page.waitForTimeout(1800);
await clickIf(page.getByText('▶ Continuar')); await page.waitForTimeout(2200);

let prevGold = seed.gold ?? 100;
for (let step = 0; step < MAX_DAYS; step++) {
  let save = await state();
  if (!save) { log('sem save — abortando'); break; }

  await comprarRacao(save);
  await alimentarEColetar();
  await venderTudo();
  save = await state() ?? save;
  await comprarMaquinas(save);
  await expandirLote(save);
  await comprarAnimal(save);
  if ((save.currentDay ?? 1) % 7 === 0) await assinarContratos();
  await avancarDia();

  const s = await state();
  if (!s) break;
  const contracts = (s.contracts ?? []).filter(c => c.contractType === 'long');
  const snap = {
    day: s.currentDay, level: s.farmLevel, xp: s.farmXp, gold: s.gold, debt: s.debt ?? 0,
    animals: (s.animals ?? []).length,
    byType: (s.animals ?? []).reduce((acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; }, {}),
    landLots: s.landLots ?? 1,
    machines: Object.entries(s.machines ?? {}).filter(([k, v]) => k.endsWith('Purchased') && v).map(([k]) => k.replace('Purchased', '')),
    contractsActive: contracts.filter(c => c.active).length,
    contractsMissedWeeks: contracts.reduce((n, c) => n + (c.missedWeeks ?? 0), 0),
    goldDelta: s.gold - prevGold,
    minHunger: Math.min(...(s.animals ?? []).map(a => Math.round(a.hunger ?? 0)), 999),
    minHappy: Math.min(...(s.animals ?? []).map(a => Math.round(a.happiness ?? 0)), 999),
    feedStock: { aves: s.inventory?.racaoAves ?? 0, bovina: s.inventory?.racaoBovina ?? 0 },
    eggStock: s.inventory?.egg ?? 0,
  };
  prevGold = s.gold;
  fs.appendFileSync(OUT, JSON.stringify(snap) + '\n');
  fs.writeFileSync(SAVE_FILE, JSON.stringify(s));
  log(`d${snap.day} nv${snap.level} xp${snap.xp} 💰${snap.gold} 🐄${snap.animals} lotes${snap.landLots} Δ${snap.goldDelta}`);

  if ((s.farmLevel ?? 1) >= 18) { log('🏆 nível 18 alcançado!'); break; }
  if ((s.debt ?? 0) > 1000) { log('💀 game over por dívida'); break; }
  if ((s.animals ?? []).length === 0 && s.gold < 35 && s.currentDay > 5) { log('💀 game over sem animais/ouro'); break; }
}

await browser.close();
console.log(`\nsnapshots em: ${OUT}`);
