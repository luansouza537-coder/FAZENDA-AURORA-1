import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiomeType, LandLot, InsuranceState, MachineState } from '../types';
import { MERCHANT_SPECIAL_ITEMS } from '../data/merchantItems';

interface MelhoriasModalProps {
  gold: number;
  farmLevel: number;
  currentDay: number;
  landLots: number;
  wellLevel: number;
  solarLevel: number;
  irrigationLevel: number;
  maxPrateleiras: number;
  insurance: InsuranceState;
  insuranceTheft: InsuranceState;
  insuranceClimate: InsuranceState;
  hasStable: boolean;
  hasSilo: boolean;
  hasFridge: boolean;
  hasTipBox: boolean;
  hasTourism: boolean;
  hasLaboratorio: boolean;
  hasPastagem: boolean;
  hasExportCenter: boolean;
  hasAcademia: boolean;
  licencaExotica: boolean;
  machines: MachineState;
  milkerLevel: number;
  shearerLevel: number;
  feederLevel: number;
  landBiomes: LandLot[];
  biomeWeeklyIncome: Record<string, number>;
  onClose: () => void;
  setGold: (fn: (prev: number) => number) => void;
  setLandLots: (v: number) => void;
  setWellLevel: (v: number) => void;
  setSolarLevel: (v: number) => void;
  setIrrigationLevel: (v: number) => void;
  setMaxPrateleiras: (v: number) => void;
  setInsurance: (v: InsuranceState) => void;
  setInsuranceTheft: (v: InsuranceState) => void;
  setInsuranceClimate: (v: InsuranceState) => void;
  setHasStable: (v: boolean) => void;
  setHasSilo: (v: boolean) => void;
  setHasFridge: (v: boolean) => void;
  setHasTipBox: (v: boolean) => void;
  setHasTourism: (v: boolean) => void;
  setHasLaboratorio: (v: boolean) => void;
  setHasPastagem: (v: boolean) => void;
  setHasExportCenter: (v: boolean) => void;
  setHasAcademia: (v: boolean) => void;
  setLicencaExotica: (v: boolean) => void;
  setMilkerLevel: (fn: (prev: number) => number) => void;
  setShearerLevel: (fn: (prev: number) => number) => void;
  setFeederLevel: (fn: (prev: number) => number) => void;
  setLandBiomes: (fn: (prev: LandLot[]) => LandLot[]) => void;
  addLog: (msg: string, type: string) => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
  checkAndUnlockAchievement: (id: string) => void;
  vehicleTiers: Record<string, number>;
  setVehicleTier: (cat: string, tier: number) => void;
  getFreightMultiplier: (cat: string) => number;
  ownedOneTimeEffects: string[];
  onBuyConsumivel: (item: typeof MERCHANT_SPECIAL_ITEMS[number]) => void;
  abatedouroUnlocked: boolean;
  setAbatedouroUnlocked: (v: boolean) => void;
  lastUpgradeDay: number;
  setLastUpgradeDay: (v: number) => void;
  celeiroLevel: number;
  setCeleiroLevel: (v: number) => void;
  camaraFriaLevel: number;
  setCamaraFriaLevel: (v: number) => void;
  buyMachine: (key: 'milker' | 'shearer' | 'feeder') => void;
  toggleMachine: (key: 'milker' | 'shearer' | 'feeder') => void;
}

const VEHICLE_CATEGORIES = [
  { key: 'animais',    label: '🐄 Animais Vivos',           desc: 'Boi e outros animais de corte engordados',           penalty: [12, 6, 0], winterExtra: [8, 4, 0], vehicles: ['Carrocinha', 'Caminhão Boiadeiro', 'Carreta Dupla'],          prices: [0, 800, 3000] },
  { key: 'laticinios', label: '🧀 Laticínios (Refrigerado)', desc: 'Leite, queijos, manteiga e derivados',            penalty: [10, 5, 0], winterExtra: [8, 4, 0], vehicles: ['Caixote de Gelo', 'Baú Refrigerado', 'Câmara Frigorífica'],   prices: [0, 600, 2500] },
  { key: 'ovos',      label: '🥚 Ovos e Derivados',         desc: 'Ovos, maionese, patê e conservas de ovo',          penalty: [8,  4, 0], winterExtra: [6, 3, 0], vehicles: ['Cesto de Palha', 'Caixote Acolchoado', 'Van de Ovos'],        prices: [0, 300, 1200] },
  { key: 'texteis',   label: '🧶 Têxteis e Fios',           desc: 'Lãs, cachecóis, tapetes e tecidos',               penalty: [7,  3, 0], winterExtra: [4, 2, 0], vehicles: ['Mochila de Fazenda', 'Furgão Coberto', 'Trailer Têxtil'],     prices: [0, 300, 1200] },
  { key: 'carnes',    label: '🥩 Carnes e Proteínas',       desc: 'Carne de avestruz, jacaré, rã e peixe',           penalty: [10, 5, 0], winterExtra: [8, 4, 0], vehicles: ['Caminhão Simples', 'Baú Frigorífico', 'Carreta Frigorífica'], prices: [0, 600, 2500] },
  { key: 'organicos', label: '🌿 Orgânicos e Naturais',     desc: 'Mel, cogumelo, húmus, muco e seda bruta',         penalty: [5,  2, 0], winterExtra: [3, 1, 0], vehicles: ['Carroça de Mão', 'Carrinho Motorizado', 'Furgão Verde'],      prices: [0, 200, 800]  },
  { key: 'luxo',      label: '💎 Luxo, Exóticos e Gourmet', desc: 'Penas, couros, cosméticos e kits premium',        penalty: [8,  4, 0], winterExtra: [6, 3, 0], vehicles: ['Caixinha de Papelão', 'Maleta Segura', 'Transportadora Premium'], prices: [0, 500, 2000] },
];

const MelhoriasModal: React.FC<MelhoriasModalProps> = (p) => {
  const [activeTab, setActiveTab] = useState<'infraestrutura' | 'consumiveis' | 'automacao'>('infraestrutura');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={p.onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-orange-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-gradient-to-r from-orange-700 to-amber-800 p-5 border-b-4 border-orange-950 text-center shrink-0">
            <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">🏪 Loja da Fazenda</h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Infraestrutura permanente e consumíveis para sua fazenda</p>
            <button onClick={p.onClose} className="absolute top-4 right-4 text-[#fcd57e] bg-orange-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-4 border-orange-200 shrink-0 bg-orange-50">
            <button
              onClick={() => setActiveTab('infraestrutura')}
              className={`flex-1 py-3 text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'infraestrutura' ? 'bg-orange-700 text-white' : 'text-orange-700 hover:bg-orange-100'}`}
            >
              🔧 Infraestrutura
            </button>
            <button
              onClick={() => setActiveTab('consumiveis')}
              className={`flex-1 py-3 text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'consumiveis' ? 'bg-orange-700 text-white' : 'text-orange-700 hover:bg-orange-100'}`}
            >
              🛒 Consumíveis
            </button>
            <button
              onClick={() => setActiveTab('automacao')}
              className={`flex-1 py-3 text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'automacao' ? 'bg-orange-700 text-white' : 'text-orange-700 hover:bg-orange-100'}`}
            >
              ⚙️ Automação
            </button>
          </div>

          {activeTab === 'consumiveis' ? (
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-xs text-stone-500 font-mono mb-4">Itens disponíveis a qualquer momento. Itens únicos só podem ser comprados uma vez.</p>
              <div className="grid grid-cols-2 gap-3">
                {MERCHANT_SPECIAL_ITEMS.map(item => {
                  const isOwned = item.oneTime && p.ownedOneTimeEffects.includes(item.effect);
                  const canAfford = p.gold >= item.price;
                  return (
                    <div key={item.id} className={`bg-white border-2 rounded-2xl p-3 flex flex-col gap-1.5 ${isOwned ? 'border-green-300 opacity-70' : 'border-orange-200'}`}>
                      <span className="text-sm font-black text-stone-800">{item.label}</span>
                      <span className="text-[10px] text-stone-500 font-mono flex-1">{item.desc}</span>
                      {item.oneTime && <span className="text-[9px] text-amber-600 font-mono font-bold uppercase">único</span>}
                      <button
                        disabled={isOwned || !canAfford}
                        onClick={() => p.onBuyConsumivel(item)}
                        className={`mt-1 text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 transition-all cursor-pointer
                          ${isOwned ? 'bg-green-100 border-green-300 text-green-700 cursor-not-allowed' :
                            canAfford ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' :
                            'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {isOwned ? '✅ Adquirido' : `${item.price}💰 Comprar`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Expansão de Terreno */}
            <div className="bg-white border-4 border-green-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-green-800 mb-1">🏡 Expansão de Terreno</h4>
              <p className="text-xs text-stone-500 font-mono mb-3">Cada lote permite +5 animais. Atual: Lote {p.landLots}/10 ({p.landLots * 5} animais máx) • Compra sequencial obrigatória</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { lot: 2, price: 1000, minLevel: 2 }, { lot: 3, price: 3500, minLevel: 4 }, { lot: 4, price: 9000, minLevel: 6 }, { lot: 5, price: 22000, minLevel: 8 },
                  { lot: 6, price: 55000, minLevel: 10 }, { lot: 7, price: 140000, minLevel: 12 }, { lot: 8, price: 350000, minLevel: 14 }, { lot: 9, price: 800000, minLevel: 16 }, { lot: 10, price: 2000000, minLevel: 18 },
                ].map(({ lot, price, minLevel }) => {
                  const canBuy = p.gold >= price && p.landLots === lot - 1 && p.farmLevel >= minLevel;
                  const locked = p.farmLevel < minLevel;
                  const needsPrev = p.landLots < lot - 1;
                  return (
                    <button key={lot} disabled={p.landLots >= lot || !canBuy}
                      onClick={() => { if (canBuy) { p.setGold(prev => prev - price); p.setLandLots(lot); p.addLog(`🏡 Terreno expandido! Agora você tem ${lot} lote(s) e pode ter até ${lot * 5} animais.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                      className={`text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.landLots >= lot ? 'bg-green-100 border-green-300 text-green-700' : canBuy ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                    >
                      {p.landLots >= lot ? `✅ Lote ${lot}` : locked ? `🔒 Lote ${lot} (Nv${minLevel})` : needsPrev ? `🔒 Lote ${lot} (compre anterior)` : `Lote ${lot} (${price}💰)`}
                    </button>
                  );
                })}
              </div>
              <div className="border-t-2 border-green-200 pt-3">
                <h5 className="font-display font-black text-xs uppercase text-green-700 mb-2">🌿 Biomas de Terreno</h5>
                <p className="text-[10px] text-stone-500 font-mono mb-2">Atribua biomas aos lotes para bônus especiais</p>
                <div className="space-y-2">
                  {([
                    { biome: 'pasto' as BiomeType, emoji: '🌾', label: 'Pasto', price: 50, desc: 'Padrão', minLevel: 1 },
                    { biome: 'lago' as BiomeType, emoji: '🌊', label: 'Lago', price: 120, desc: 'Rã 2x, Pato/Ganso +20%', minLevel: 8 },
                    { biome: 'floresta' as BiomeType, emoji: '🌲', label: 'Floresta', price: 150, desc: 'Minhoca/Caracol +50%', minLevel: 10 },
                    { biome: 'pomar' as BiomeType, emoji: '🍎', label: 'Pomar', price: 200, desc: 'Todos +2 felicidade/dia', minLevel: 12 },
                  ]).map(({ biome, emoji, label, price, desc, minLevel }) => {
                    const owned = p.landBiomes.filter(b => b.biome === biome).length;
                    const canBuy = p.farmLevel >= minLevel && p.gold >= price && p.landBiomes.length < p.landLots;
                    return (
                      <div key={biome} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                        <div>
                          <span className="font-mono font-black text-xs text-green-900">{emoji} {label}</span>
                          <span className="text-[10px] text-stone-500 font-mono ml-2">{desc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-500 font-mono">×{owned}</span>
                          <button disabled={!canBuy}
                            onClick={() => { if (!canBuy) return; p.setGold(prev => prev - price); p.setLandBiomes(prev => [...prev, { id: prev.length + 1, biome, purchasedDay: p.currentDay }]); p.addLog(`🌿 Bioma ${label} adicionado ao terreno! (${price}💰)`, 'success'); }}
                            className={`text-[10px] font-black px-2 py-1 rounded-lg border cursor-pointer transition-all ${!canBuy ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' : 'bg-green-500 border-green-700 text-white hover:bg-green-400'}`}
                          >
                            {p.farmLevel < minLevel ? `🔒 Nv${minLevel}` : `+${price}💰`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {p.landBiomes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.landBiomes.map((b, i) => (
                      <span key={i} className="text-[10px] bg-green-100 text-green-800 border border-green-300 rounded-full px-2 py-0.5 font-mono">
                        {b.biome === 'pasto' ? '🌾' : b.biome === 'lago' ? '🌊' : b.biome === 'floresta' ? '🌲' : '🍎'} {b.biome}
                      </span>
                    ))}
                  </div>
                )}
                {p.landBiomes.length > 0 && (Object.values(p.biomeWeeklyIncome).some((v: number) => v > 0)) && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="text-[10px] font-black uppercase text-green-800 mb-2">📊 Receita Semanal por Bioma</div>
                    <div className="space-y-1">
                      {(['lago','floresta','pasto','pomar'] as const).map(key => {
                        const emojis = { lago: '🌊', floresta: '🌲', pasto: '🌾', pomar: '🍎' };
                        const val = p.biomeWeeklyIncome[key] ?? 0;
                        if (!val) return null;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs">{emojis[key]} {key}</span>
                            <div className="flex-1 bg-green-100 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (val / Math.max(...(Object.values(p.biomeWeeklyIncome) as number[]), 1)) * 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-mono font-black text-green-700">+{val}💰</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Poço d'Água */}
            <div className="bg-white border-4 border-blue-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-blue-800 mb-1">💧 Poço d'Água</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Reduz conta de água por nível (máx 75%). Atual: Nível {p.wellLevel}/5 (-{Math.round(Math.min(p.wellLevel * 15, 75))}% água) • 1 upgrade por dia</p>
              {p.lastUpgradeDay === p.currentDay && <p className="text-[10px] text-amber-600 font-mono mb-1">⏳ Já foi feito 1 upgrade hoje. Volte amanhã!</p>}
              <div className="grid grid-cols-5 gap-1">
                {[{ lvl: 1, price: 700 }, { lvl: 2, price: 2000 }, { lvl: 3, price: 5500 }, { lvl: 4, price: 25000 }, { lvl: 5, price: 70000 }].map(({ lvl, price }) => {
                  const canBuy = p.gold >= price && p.wellLevel === lvl - 1 && p.lastUpgradeDay !== p.currentDay;
                  return (
                    <button key={lvl} disabled={p.wellLevel >= lvl || !canBuy}
                      onClick={() => { if (canBuy) { p.setGold(prev => prev - price); p.setWellLevel(lvl); p.setLastUpgradeDay(p.currentDay); p.addLog(`💧 Poço d'água nível ${lvl} instalado! Água -${Math.round(Math.min(lvl * 15, 75))}%.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                      className={`text-xs font-mono font-black py-2 px-1 rounded-xl border-b-2 transition-all cursor-pointer ${p.wellLevel >= lvl ? 'bg-blue-100 border-blue-300 text-blue-700' : canBuy ? 'bg-blue-500 hover:bg-blue-400 text-white border-blue-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                    >
                      {p.wellLevel >= lvl ? `✅ Nv${lvl}` : p.wellLevel < lvl - 1 ? `🔒 Nv${lvl}` : `Nv${lvl} (${price.toLocaleString()}💰)`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gerador Solar */}
            <div className="bg-white border-4 border-yellow-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-yellow-800 mb-1">☀️ Gerador Solar</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">
                Reduz manutenção e conta de energia das máquinas. Atual: Nível {p.solarLevel}/4 • 1 upgrade por dia<br/>
                Nv1: -15% manutenção, -40% energia | Nv2: -30% manutenção, -70% energia<br/>
                Nv3: -45% manutenção, energia GRATUITA 🆓 | Nv4: energia GRATUITA + 10% felicidade animais
              </p>
              <div className="grid grid-cols-4 gap-1">
                {[{ lvl: 1, price: 1200, minFarm: 1 }, { lvl: 2, price: 3500, minFarm: 1 }, { lvl: 3, price: 9000, minFarm: 5 }, { lvl: 4, price: 40000, minFarm: 14 }].map(({ lvl, price, minFarm }) => {
                  const requiresFarmLevel = lvl >= 3 && p.farmLevel < minFarm;
                  const canAfford = p.gold >= price && p.solarLevel === lvl - 1 && !requiresFarmLevel && p.lastUpgradeDay !== p.currentDay;
                  return (
                    <button key={lvl} disabled={p.solarLevel >= lvl || !canAfford}
                      onClick={() => { if (canAfford) { p.setGold(prev => prev - price); p.setSolarLevel(lvl); p.setLastUpgradeDay(p.currentDay); p.addLog(`☀️ Gerador solar nível ${lvl} instalado! Manutenção ${lvl * 15}% mais barata.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } else if (requiresFarmLevel) { p.addLog(`☀️ Gerador solar nível ${lvl} requer Fazenda Nível ${minFarm}!`, 'error'); } }}
                      className={`text-xs font-mono font-black py-2 px-1 rounded-xl border-b-2 transition-all cursor-pointer ${p.solarLevel >= lvl ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                    >
                      {p.solarLevel >= lvl ? `✅ Nv${lvl}` : requiresFarmLevel ? `🔒 Nv${lvl}` : `Nv${lvl} (${price.toLocaleString()}💰)`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Irrigação */}
            <div className="bg-white border-4 border-cyan-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-cyan-800 mb-1">🌊 Sistema de Irrigação</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Nv1: secas -40% impacto | Nv2: imunidade total a secas | Nv3: +1 felicidade/dia animais. Atual: Nível {p.irrigationLevel}/3 • 1 upgrade por dia</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ lvl: 1, price: 1500 }, { lvl: 2, price: 4500 }, { lvl: 3, price: 20000 }].map(({ lvl, price }) => {
                  const requiresFarmLevel12 = lvl === 3 && p.farmLevel < 12;
                  const canBuy = p.gold >= price && p.irrigationLevel === lvl - 1 && !requiresFarmLevel12 && p.lastUpgradeDay !== p.currentDay;
                  return (
                    <button key={lvl} disabled={p.irrigationLevel >= lvl || !canBuy}
                      onClick={() => { if (canBuy) { p.setGold(prev => prev - price); p.setIrrigationLevel(lvl); p.setLastUpgradeDay(p.currentDay); p.addLog(`🌊 Irrigação nível ${lvl} instalada!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                      className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${p.irrigationLevel >= lvl ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : canBuy ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                    >
                      {p.irrigationLevel >= lvl ? `✅ Nv${lvl}` : p.irrigationLevel < lvl - 1 || requiresFarmLevel12 ? `🔒 Nv${lvl}` : `Nv${lvl} (${price.toLocaleString()}💰)`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Celeiro */}
            <div className="bg-white border-4 border-amber-300 rounded-3xl p-4 space-y-3">
              <h4 className="font-display font-black text-sm uppercase text-amber-800 mb-1">📦 Celeiro</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Expanda o espaço para armazenar itens secos: lã, penas, têxteis, mel e mais.</p>
              {([
                { level: 1, label: 'Celeiro Básico', capacity: 60, price: 500, minLevel: 2 },
                { level: 2, label: 'Celeiro Ampliado', capacity: 120, price: 1500, minLevel: 5 },
                { level: 3, label: 'Celeiro Grande', capacity: 250, price: 4000, minLevel: 9 },
                { level: 4, label: 'Celeiro Industrial', capacity: 999, price: 10000, minLevel: 14 },
              ] as const).map(({ level, label, capacity, price, minLevel }) => {
                const purchased = p.celeiroLevel >= level;
                const available = p.celeiroLevel === level - 1;
                const levelOk = p.farmLevel >= minLevel;
                const canBuy = available && levelOk && p.gold >= price;
                return (
                  <div key={level} className={`border-2 rounded-2xl p-3 ${purchased ? 'bg-amber-50 border-amber-400' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-black text-stone-800">{label} {purchased && '✅'}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{capacity === 999 ? 'Ilimitado' : `${capacity}/item`} — itens secos</div>
                        {!levelOk && <div className="text-[10px] text-red-500 font-mono">🔒 Requer Nível {minLevel}</div>}
                      </div>
                      <button disabled={!canBuy} onClick={() => { if (!canBuy) return; p.setGold(prev => prev - price); p.setCeleiroLevel(level); p.addLog(`📦 ${label} construído! Capacidade de estoque ampliada.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); }}
                        className={`shrink-0 text-[10px] font-black uppercase px-2 py-1.5 rounded-xl border-b-2 cursor-pointer transition-all ${purchased ? 'bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed' : canBuy ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}>
                        {purchased ? '✅' : `${price.toLocaleString()}💰`}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="text-[10px] text-amber-700 font-mono">Capacidade atual: {[30,60,120,250,999][p.celeiroLevel] ?? 30}/item</div>
            </div>

            {/* Câmara Fria */}
            <div className="bg-white border-4 border-sky-300 rounded-3xl p-4 space-y-3">
              <h4 className="font-display font-black text-sm uppercase text-sky-800 mb-1">❄️ Câmara Fria</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Armazene leite, ovos, carnes e laticínios com segurança. Integra com a Geladeira existente.</p>
              {([
                { level: 1, label: 'Geladeira Industrial', capacity: 40, price: 800, minLevel: 3 },
                { level: 2, label: 'Câmara Fria Pequena', capacity: 80, price: 2500, minLevel: 6 },
                { level: 3, label: 'Câmara Fria Grande', capacity: 180, price: 6000, minLevel: 11 },
              ] as const).map(({ level, label, capacity, price, minLevel }) => {
                const purchased = p.camaraFriaLevel >= level;
                const available = p.camaraFriaLevel === level - 1;
                const levelOk = p.farmLevel >= minLevel;
                const canBuy = available && levelOk && p.gold >= price;
                return (
                  <div key={level} className={`border-2 rounded-2xl p-3 ${purchased ? 'bg-sky-50 border-sky-400' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-black text-stone-800">{label} {purchased && '✅'}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{capacity}/item — leite, ovos, carnes</div>
                        {!levelOk && <div className="text-[10px] text-red-500 font-mono">🔒 Requer Nível {minLevel}</div>}
                      </div>
                      <button disabled={!canBuy} onClick={() => { if (!canBuy) return; p.setGold(prev => prev - price); p.setCamaraFriaLevel(level); p.addLog(`❄️ ${label} instalada! Capacidade de refrigeração ampliada.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); }}
                        className={`shrink-0 text-[10px] font-black uppercase px-2 py-1.5 rounded-xl border-b-2 cursor-pointer transition-all ${purchased ? 'bg-sky-100 border-sky-300 text-sky-700 cursor-not-allowed' : canBuy ? 'bg-sky-500 hover:bg-sky-400 text-white border-sky-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}>
                        {purchased ? '✅' : `${price.toLocaleString()}💰`}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="text-[10px] text-sky-700 font-mono">Capacidade atual: {[15,40,80,180][p.camaraFriaLevel] ?? 15}/item</div>
            </div>

            {/* Seguros — 3 tiers progressivos e permanentes */}
            <div className="bg-white border-4 border-emerald-300 rounded-3xl p-4 space-y-3">
              <h4 className="font-display font-black text-sm uppercase text-emerald-800 mb-1">🛡️ Sistema de Seguros</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Proteção permanente e progressiva. Cada tier inclui o anterior.</p>
              {([
                { tier: 1 as const, label: '🌱 Seguro Básico', price: 800, minLevel: 2, desc: 'Reduz impacto de pragas e epidemias em 70%. Permanente.', prevActive: true, active: p.insurance.active, onBuy: () => p.setInsurance({ active: true, daysLeft: 9999 }) },
                { tier: 2 as const, label: '🌦️ Seguro Intermediário', price: 2500, minLevel: 6, desc: 'Protege contra secas, tempestades e geadas. Inclui Básico.', prevActive: p.insurance.active, active: p.insuranceClimate.active, onBuy: () => p.setInsuranceClimate({ active: true, daysLeft: 9999 }) },
                { tier: 3 as const, label: '🔒 Seguro Premium', price: 8000, minLevel: 12, desc: 'Bloqueia roubos e garante proteção total. Inclui todos os anteriores.', prevActive: p.insuranceClimate.active, active: p.insuranceTheft.active, onBuy: () => p.setInsuranceTheft({ active: true, daysLeft: 9999 }) },
              ] as const).map(({ tier, label, price, minLevel, desc, prevActive, active, onBuy }) => {
                const levelOk = p.farmLevel >= minLevel;
                const canBuy = !active && prevActive && levelOk && p.gold >= price;
                return (
                  <div key={tier} className={`border-2 rounded-2xl p-3 ${active ? 'bg-emerald-50 border-emerald-400' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-black text-stone-800">{label} {active && '✅'}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{desc}</div>
                        {!levelOk && <div className="text-[10px] text-red-500 font-mono">🔒 Requer Nível {minLevel}</div>}
                        {!prevActive && levelOk && <div className="text-[10px] text-amber-600 font-mono">⚠️ Requer tier anterior</div>}
                      </div>
                      <button
                        disabled={!canBuy}
                        onClick={() => { if (!canBuy) return; p.setGold(prev => prev - price); onBuy(); p.addLog(`🛡️ ${label} contratado! Proteção permanente ativada.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); }}
                        className={`shrink-0 text-[10px] font-black uppercase px-2 py-1.5 rounded-xl border-b-2 cursor-pointer transition-all ${active ? 'bg-emerald-100 border-emerald-300 text-emerald-700 cursor-not-allowed' : canBuy ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {active ? 'Ativo ✅' : `${price.toLocaleString()}💰`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Oficina de Automação */}
            {(p.machines.milkerPurchased || p.machines.shearerPurchased || p.machines.feederPurchased) && (
              <div className="bg-white border-4 border-cyan-300 rounded-3xl p-4">
                <h4 className="font-display font-black text-sm uppercase text-cyan-800 mb-1">⚙️ Oficina de Automação</h4>
                <p className="text-xs text-stone-500 font-mono mb-3">Melhore suas máquinas para aumentar eficiência e produção.</p>
                <div className="space-y-2">
                  {p.machines.milkerPurchased && (
                    <div className="flex items-center justify-between">
                      <div><span className="text-xs font-black text-stone-700">🐄 Ordenhadeira</span><span className="ml-2 text-[10px] text-stone-500 font-mono">Nv{p.milkerLevel}/3 (+{(p.milkerLevel-1)*20}% produção)</span></div>
                      {p.milkerLevel < 3 ? <button disabled={p.gold < p.milkerLevel * 800} onClick={() => { const cost = p.milkerLevel * 800; if (p.gold >= cost) { p.setGold(prev => prev - cost); p.setMilkerLevel(prev => Math.min(3, prev + 1)); p.addLog(`⚙️ Ordenhadeira melhorada para Nv${p.milkerLevel + 1}! +20% de produção de leite!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }} className={`text-xs font-mono font-black py-1 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.gold >= p.milkerLevel * 800 ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}>Nv{p.milkerLevel + 1} ({(p.milkerLevel * 800).toLocaleString()}💰)</button> : <span className="text-xs text-emerald-600 font-black">✅ MAX</span>}
                    </div>
                  )}
                  {p.machines.shearerPurchased && (
                    <div className="flex items-center justify-between">
                      <div><span className="text-xs font-black text-stone-700">✂️ Tosquiadeira</span><span className="ml-2 text-[10px] text-stone-500 font-mono">Nv{p.shearerLevel}/3 (+{(p.shearerLevel-1)*20}% produção)</span></div>
                      {p.shearerLevel < 3 ? <button disabled={p.gold < p.shearerLevel * 800} onClick={() => { const cost = p.shearerLevel * 800; if (p.gold >= cost) { p.setGold(prev => prev - cost); p.setShearerLevel(prev => Math.min(3, prev + 1)); p.addLog(`⚙️ Tosquiadeira melhorada para Nv${p.shearerLevel + 1}! +20% de produção de lã!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }} className={`text-xs font-mono font-black py-1 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.gold >= p.shearerLevel * 800 ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}>Nv{p.shearerLevel + 1} ({(p.shearerLevel * 800).toLocaleString()}💰)</button> : <span className="text-xs text-emerald-600 font-black">✅ MAX</span>}
                    </div>
                  )}
                  {p.machines.feederPurchased && (
                    <div className="flex items-center justify-between">
                      <div><span className="text-xs font-black text-stone-700">🥣 Alimentador</span><span className="ml-2 text-[10px] text-stone-500 font-mono">Nv{p.feederLevel}/3 (+{(p.feederLevel-1)*15}% fome recuperada)</span></div>
                      {p.feederLevel < 3 ? <button disabled={p.gold < p.feederLevel * 600} onClick={() => { const cost = p.feederLevel * 600; if (p.gold >= cost) { p.setGold(prev => prev - cost); p.setFeederLevel(prev => Math.min(3, prev + 1)); p.addLog(`⚙️ Alimentador melhorado para Nv${p.feederLevel + 1}! +15% de fome recuperada!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }} className={`text-xs font-mono font-black py-1 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.gold >= p.feederLevel * 600 ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}>Nv{p.feederLevel + 1} ({(p.feederLevel * 600).toLocaleString()}💰)</button> : <span className="text-xs text-emerald-600 font-black">✅ MAX</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estruturas simples */}
            {[
              { key: 'stable', label: '🏠 Estábulo', color: 'stone', price: 1800, state: p.hasStable, setState: p.setHasStable, desc: `No inverno, animais perdem 50% menos felicidade (recuperam +5 por dia). ${p.hasStable ? '✅ Instalado' : 'Não instalado'}`, log: '🏠 Estábulo construído! Animais mais confortáveis no inverno.', reqLevel: 0 },
              { key: 'silo', label: '🏗️ Silo de Grãos', color: 'orange', price: 2500, state: p.hasSilo, setState: p.setHasSilo, desc: `15% de desconto em todas as compras de ração. ${p.hasSilo ? '✅ Instalado' : 'Não instalado'}`, log: '🏗️ Silo de grãos construído! 15% de desconto em rações.', reqLevel: 0 },
              { key: 'fridge', label: '🧊 Geladeira Industrial', color: 'sky', price: 3500, state: p.hasFridge, setState: p.setHasFridge, desc: `Previne perda de qualidade dos produtos perecíveis (leite, ovos duram 50% mais). ${p.hasFridge ? '✅ Instalada' : 'Não instalada'}`, log: '🧊 Geladeira industrial instalada! Produtos perecíveis duram mais.', reqLevel: 0 },
              { key: 'tipbox', label: '🪙 Caixinha de Gorjeta', color: 'yellow', price: 50, state: p.hasTipBox, setState: p.setHasTipBox, desc: `25% de chance por dia de receber gorjeta de 5-25 moedas de visitantes. ${p.hasTipBox ? '✅ Instalada' : 'Não instalada'}`, log: '🪙 Caixinha de gorjeta colocada! Visitantes poderão deixar gorjetas.', reqLevel: 0 },
            ].map(({ key, label, color, price, state, setState, desc, log }) => (
              <div key={key} className={`bg-white border-4 border-${color}-300 rounded-3xl p-4`}>
                <h4 className={`font-display font-black text-sm uppercase text-${color}-800 mb-1`}>{label}</h4>
                <p className="text-xs text-stone-500 font-mono mb-2">{desc}</p>
                <button disabled={state || p.gold < price}
                  onClick={() => { if (!state && p.gold >= price) { p.setGold(prev => prev - price); setState(true); p.addLog(log, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                  className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${state ? `bg-${color}-100 border-${color}-300 text-${color}-700` : p.gold >= price ? `bg-${color}-500 hover:bg-${color}-400 text-white border-${color}-700` : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                >
                  {state ? `✅ ${label.split(' ').slice(1).join(' ')} Instalado(a)` : `Instalar (${price.toLocaleString()}💰)`}
                </button>
              </div>
            ))}

            {/* Turismo */}
            <div className="bg-white border-4 border-teal-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-teal-800 mb-1">🏕️ Área de Visitantes (Turismo Rural)</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Receba turistas semanalmente! Receita = (nível×20) + (animais×5) + (pavões×30) moedas. Requer Nível 4+. {p.hasTourism ? '✅ Instalada' : 'Não instalada'}</p>
              <button disabled={p.hasTourism || p.gold < 400 || p.farmLevel < 4}
                onClick={() => { if (!p.hasTourism && p.gold >= 400 && p.farmLevel >= 4) { p.setGold(prev => prev - 400); p.setHasTourism(true); p.addLog('🏕️ Área de Visitantes construída! Turistas virão toda semana.', 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.hasTourism ? 'bg-teal-100 border-teal-300 text-teal-700' : p.farmLevel >= 4 && p.gold >= 400 ? 'bg-teal-500 hover:bg-teal-400 text-white border-teal-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
              >
                {p.hasTourism ? '✅ Área de Visitantes Instalada' : p.farmLevel < 4 ? '🔒 Requer Nível 4 (400💰)' : 'Construir Área de Visitantes (400💰)'}
              </button>
            </div>

            {/* Queijaria */}
            <div className="bg-white border-4 border-amber-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-amber-800 mb-1">🧀 Expansão da Queijaria</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Prateleiras atuais: {p.maxPrateleiras}. Mais prateleiras = mais queijos simultaneamente.</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ slots: 4, price: 150 }, { slots: 6, price: 300 }, { slots: 8, price: 500 }].map(({ slots, price }) => (
                  <button key={slots} disabled={p.maxPrateleiras >= slots || p.gold < price}
                    onClick={() => { if (p.gold >= price && p.maxPrateleiras < slots) { p.setGold(prev => prev - price); p.setMaxPrateleiras(slots); p.addLog(`🧀 Queijaria ampliada para ${slots} prateleiras!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                    className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${p.maxPrateleiras >= slots ? 'bg-amber-100 border-amber-300 text-amber-700' : p.gold >= price ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {p.maxPrateleiras >= slots ? `✅ ${slots} prateleiras` : `${slots} prateleiras (${price}💰)`}
                  </button>
                ))}
              </div>
            </div>

            {/* Estruturas de nível alto */}
            {[
              { key: 'lab', label: '🔬 Laboratório de Laticínios', color: 'rose', price: 8000, state: p.hasLaboratorio, setState: p.setHasLaboratorio, desc: `Todos os queijos maturam 1 dia mais rápido. Requer Nível 6. ${p.hasLaboratorio ? '✅ Instalado' : 'Não instalado'}`, log: '🔬 Laboratório de Laticínios construído! Queijos maturam 1 dia mais rápido.', reqLevel: 6 },
              { key: 'past', label: '🌿 Pastagem Ampliada', color: 'green', price: 15000, state: p.hasPastagem, setState: p.setHasPastagem, desc: `+3 felicidade/dia para bovinos e ovinos. Requer Nível 8. ${p.hasPastagem ? '✅ Instalada' : 'Não instalada'}`, log: '🌿 Pastagem Ampliada construída! Bovinos e ovinos ficam mais felizes.', reqLevel: 8 },
              { key: 'export', label: '🚢 Centro de Exportação', color: 'indigo', price: 50000, state: p.hasExportCenter, setState: p.setHasExportCenter, desc: `+20% preço de venda em TODOS os produtos. Requer Nível 12. ${p.hasExportCenter ? '✅ Instalado' : 'Não instalado'}`, log: '🚢 Centro de Exportação construído! Todos os produtos valem +20%.', reqLevel: 12 },
              { key: 'acad', label: '🎓 Academia de Criadores', color: 'violet', price: 120000, state: p.hasAcademia, setState: p.setHasAcademia, desc: `+15% XP por dia + animais jovens crescem 20% mais rápido. Requer Nível 16. ${p.hasAcademia ? '✅ Instalada' : 'Não instalada'}`, log: '🎓 Academia de Criadores construída! +15% XP/dia e filhotes crescem mais rápido.', reqLevel: 16 },
            ].map(({ key, label, color, price, state, setState, desc, log, reqLevel }) => (
              <div key={key} className={`bg-white border-4 border-${color}-300 rounded-3xl p-4`}>
                <h4 className={`font-display font-black text-sm uppercase text-${color}-800 mb-1`}>{label}</h4>
                <p className="text-xs text-stone-500 font-mono mb-2">{desc}</p>
                <button disabled={state || p.gold < price || p.farmLevel < reqLevel}
                  onClick={() => { if (!state && p.gold >= price && p.farmLevel >= reqLevel) { p.setGold(prev => prev - price); setState(true); p.addLog(log, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                  className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${state ? `bg-${color}-100 border-${color}-300 text-${color}-700` : p.farmLevel >= reqLevel && p.gold >= price ? `bg-${color}-500 hover:bg-${color}-400 text-white border-${color}-700` : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                >
                  {state ? `✅ Construído(a)` : p.farmLevel < reqLevel ? `🔒 Requer Nível ${reqLevel} (${price.toLocaleString()}💰)` : `Construir (${price.toLocaleString()}💰)`}
                </button>
              </div>
            ))}

            {/* Licença Exótica */}
            <div className="bg-white border-4 border-purple-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-purple-800 mb-1">🦎 Licença de Fauna Exótica</h4>
              <p className="text-xs text-stone-500 font-mono mb-2">Autoriza criação de jacaré sem multas de fiscalização (5%/dia = -300💰). Requer Nível 18. {p.licencaExotica ? '✅ Obtida' : 'Não obtida'}</p>
              <button disabled={p.licencaExotica || p.gold < 500 || p.farmLevel < 18}
                onClick={() => { if (!p.licencaExotica && p.gold >= 500 && p.farmLevel >= 18) { p.setGold(prev => prev - 500); p.setLicencaExotica(true); p.addLog('🦎 Licença de Fauna Exótica obtida! Jacarés não serão multados.', 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${p.licencaExotica ? 'bg-purple-100 border-purple-300 text-purple-700' : p.farmLevel >= 18 && p.gold >= 500 ? 'bg-purple-500 hover:bg-purple-400 text-white border-purple-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
              >
                {p.licencaExotica ? '✅ Licença Obtida' : p.farmLevel < 18 ? '🔒 Requer Nível 18 (500💰)' : 'Obter Licença (500💰)'}
              </button>
            </div>

            {/* 🏭 ABATEDOURO */}
            {p.farmLevel >= 10 && (
              <div className="bg-white border-4 border-red-300 rounded-3xl p-4">
                <h4 className="font-display font-black text-sm uppercase text-red-800 mb-1">🏭 Abatedouro Parceiro</h4>
                <p className="text-xs text-stone-500 font-mono mb-3">Frigorífico externo que processa bois engordados. Desbloqueia os contratos de abate — os mais lucrativos do jogo. Requer Certificado Sanitário. Custo fixo: +25💰/dia de energia.</p>
                {!p.ownedOneTimeEffects.includes('cert_sanitario') ? (
                  <div className="text-xs text-amber-700 font-mono bg-amber-50 border border-amber-200 rounded-xl p-3">⚠️ Requer Certificado Sanitário (disponível em Consumíveis)</div>
                ) : p.abatedouroUnlocked ? (
                  <div className="text-xs text-green-700 font-mono bg-green-50 border border-green-200 rounded-xl p-3">✅ Abatedouro ativo — contratos disponíveis na aba Contratos</div>
                ) : (
                  <button
                    disabled={p.gold < 8000}
                    onClick={() => {
                      if (p.gold < 8000) return;
                      p.setGold(prev => prev - 8000);
                      p.setAbatedouroUnlocked(true);
                      p.addLog('🏭 Abatedouro Parceiro contratado! Contratos de abate agora disponíveis.', 'success');
                      p.triggerAudioResult(() => p.sfx.playSound('levelup'));
                    }}
                    className={`text-xs font-mono font-black py-2 px-4 rounded-xl border-b-2 transition-all cursor-pointer ${p.gold >= 8000 ? 'bg-red-600 hover:bg-red-500 text-white border-red-800' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {p.gold >= 8000 ? 'Contratar Abatedouro (8.000💰)' : `Precisa de 8.000💰`}
                  </button>
                )}
              </div>
            )}

            {/* 🚚 FROTAS DE TRANSPORTE */}
            <div className="bg-white border-4 border-slate-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-slate-800 mb-1">🚚 Frotas de Transporte</h4>
              <p className="text-xs text-stone-500 font-mono mb-3">Cada categoria de produto tem seu próprio veículo. Sem upgrade, uma % do valor é perdida em frete.</p>
              {(() => {
                const isWinter = Math.floor(((p.currentDay - 1) % 120) / 30) === 3;
                return (
                  <>
                    {isWinter && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-3 py-2 mb-2 text-[10px] font-mono font-black text-blue-700">
                        ❄️ Inverno ativo — frete adicional em veículos sem Upgrade 2!
                      </div>
                    )}
                    <div className="space-y-3">
                      {VEHICLE_CATEGORIES.map(({ key, label, desc, penalty, winterExtra, vehicles, prices }) => {
                        const currentTier = p.vehicleTiers[key] ?? 0;
                        const totalPenalty = penalty[currentTier] + (isWinter ? winterExtra[currentTier] : 0);
                        return (
                          <div key={key} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-display font-black text-xs text-slate-800">{label}</div>
                                <div className="text-[10px] text-stone-500 font-mono">{desc}</div>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${currentTier === 2 ? 'bg-green-100 text-green-700' : isWinter && totalPenalty > penalty[currentTier] ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {currentTier === 2 ? '✅ Sem frete' : `-${totalPenalty}%${isWinter && currentTier < 2 ? ' ❄️' : ''}`}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {vehicles.map((vName, tier) => {
                                const isOwned = currentTier >= tier;
                                const canBuy = currentTier === tier - 1 && p.gold >= prices[tier];
                                const locked = currentTier < tier - 1;
                                const tierPenalty = penalty[tier] + (isWinter ? winterExtra[tier] : 0);
                                return (
                                  <button
                                    key={tier}
                                    disabled={isOwned || locked || !canBuy}
                                    onClick={() => {
                                      if (canBuy) {
                                        p.setGold(prev => prev - prices[tier]);
                                        p.setVehicleTier(key, tier);
                                        p.addLog(`🚚 ${vName} adquirido! Frete de ${label}: -${penalty[tier]}% (base).`, 'success');
                                        p.triggerAudioResult(() => p.sfx.playSound('levelup'));
                                      }
                                    }}
                                    className={`text-[10px] font-mono font-black py-1.5 px-1 rounded-xl border-b-2 transition-all text-center cursor-pointer ${
                                      isOwned ? 'bg-green-100 border-green-300 text-green-700' :
                                      canBuy ? 'bg-slate-600 hover:bg-slate-500 text-white border-slate-800' :
                                      'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                                    }`}
                                  >
                                    {isOwned ? `✅ ${vName}` : locked ? `🔒 ${vName}` : `${vName} (${prices[tier].toLocaleString()}💰)`}
                                    {tier > 0 && (
                                      <><br/><span className="text-[9px] opacity-60">
                                        {tierPenalty === 0 ? '✨ sem frete' : `-${tierPenalty}%${isWinter && tier < 2 ? '❄️' : ''}`}
                                      </span></>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
          )} {/* end infraestrutura tab */}

          {activeTab === 'automacao' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-stone-500 font-mono mb-2">💡 Após compradas, as máquinas operam no final de cada dia com o interruptor <strong>LIGADO</strong>. Consomem energia (⚡) por dia.</p>
              {([
                { key: 'milker' as const, emoji: '🥛', name: 'Ordenhadeira Automática', desc: 'Coleta automaticamente o leite de TODAS as vacas produtoras ao final de cada dia.', cost: 2500, minLevel: 6, energy: 8, purchased: p.machines.milkerPurchased, active: p.machines.milkerActive },
                { key: 'shearer' as const, emoji: '✂️', name: 'Tosquiadeira Elétrica', desc: 'Coleta automaticamente a lã de TODAS as ovelhas com lã madura no fim do dia.', cost: 2000, minLevel: 5, energy: 6, purchased: p.machines.shearerPurchased, active: p.machines.shearerActive },
                { key: 'feeder' as const, emoji: '🌾', name: 'Alimentador Automático', desc: 'Alimenta TODOS os animais no final do dia. Consome ração do Armazém (1 unidade por animal).', cost: 1500, minLevel: 4, energy: 5, purchased: p.machines.feederPurchased, active: p.machines.feederActive },
              ]).map(({ key, emoji, name, desc, cost, minLevel, energy, purchased, active }) => {
                const levelOk = p.farmLevel >= minLevel;
                const canBuy = !purchased && levelOk && p.gold >= cost;
                return (
                  <div key={key} className={`border-4 rounded-3xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${purchased ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-stone-200'}`}>
                    <div className="rounded-2xl w-12 h-12 bg-blue-50 flex items-center justify-center text-2xl shrink-0 border-2 border-blue-100">{emoji}</div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                        <span className="font-display font-black text-sm uppercase text-[#78350f]">{emoji} {name}</span>
                        {!purchased && <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível {minLevel}+</span>}
                        {purchased && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">Adquirido</span>}
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{desc}</p>
                      <p className="text-[10px] text-stone-400 font-mono mt-1 uppercase">⚡ {cost.toLocaleString()}💰 • Nível mín: {minLevel} • <span className="text-orange-500 font-black">{energy}⚡/dia</span></p>
                    </div>
                    <div className="shrink-0">
                      {!purchased ? (
                        <button
                          type="button"
                          onClick={() => p.buyMachine(key)}
                          disabled={!canBuy}
                          className={`font-mono font-black text-xs uppercase px-4 py-2 rounded-2xl border-b-4 transition-all ${canBuy ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 cursor-pointer' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                        >
                          {!levelOk ? `🔒 Nível ${minLevel}` : `Comprar (${cost.toLocaleString()}💰)`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => p.toggleMachine(key)}
                          className={`font-mono font-black text-xs px-4 py-2 rounded-xl border-b-2 cursor-pointer transition-all uppercase ${active ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800' : 'bg-stone-400 hover:bg-stone-300 text-white border-stone-600'}`}
                        >
                          {active ? '🟢 LIGADO' : '🔴 DESLIGADO'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-orange-50 p-4 border-t border-orange-100 flex justify-end shrink-0">
            <button onClick={p.onClose} className="bg-orange-600 hover:bg-orange-500 text-white border-b-4 border-orange-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider cursor-pointer">
              Fechar Loja
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MelhoriasModal;
