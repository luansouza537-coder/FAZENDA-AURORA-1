import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiomeType, LandLot, InsuranceState, MachineState } from '../types';

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
  loanActive: boolean;
  loanAmount: number;
  loanInterestRate: number;
  loanWeeksLeft: number;
  loanDaysUntilInterest: number;
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
  setLoanActive: (v: boolean) => void;
  setLoanAmount: (v: number) => void;
  setLoanInterestRate: (v: number) => void;
  setLoanWeeksLeft: (v: number) => void;
  setLoanDaysUntilInterest: (v: number) => void;
  addLog: (msg: string, type: string) => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
  checkAndUnlockAchievement: (id: string) => void;
}

const MelhoriasModal: React.FC<MelhoriasModalProps> = (p) => {
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
            <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">🔧 Melhorias da Fazenda</h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Expanda o terreno, instale infraestrutura e proteja sua fazenda</p>
            <button onClick={p.onClose} className="absolute top-4 right-4 text-[#fcd57e] bg-orange-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
          </div>
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
              <p className="text-xs text-stone-500 font-mono mb-2">Reduz conta de água por nível (máx 75%). Atual: Nível {p.wellLevel}/5 (-{Math.round(Math.min(p.wellLevel * 15, 75))}% água) • Compra sequencial</p>
              <div className="grid grid-cols-5 gap-1">
                {[{ lvl: 1, price: 700 }, { lvl: 2, price: 2000 }, { lvl: 3, price: 5500 }, { lvl: 4, price: 25000 }, { lvl: 5, price: 70000 }].map(({ lvl, price }) => {
                  const canBuy = p.gold >= price && p.wellLevel === lvl - 1;
                  return (
                    <button key={lvl} disabled={p.wellLevel >= lvl || !canBuy}
                      onClick={() => { if (canBuy) { p.setGold(prev => prev - price); p.setWellLevel(lvl); p.addLog(`💧 Poço d'água nível ${lvl} instalado! Água -${Math.round(Math.min(lvl * 15, 75))}%.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
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
                Reduz manutenção e conta de energia das máquinas. Atual: Nível {p.solarLevel}/4<br/>
                Nv1: -15% manutenção, -40% energia | Nv2: -30% manutenção, -70% energia<br/>
                Nv3: -45% manutenção, energia GRATUITA 🆓 | Nv4: energia GRATUITA + 10% felicidade animais
              </p>
              <div className="grid grid-cols-4 gap-1">
                {[{ lvl: 1, price: 1200, minFarm: 1 }, { lvl: 2, price: 3500, minFarm: 1 }, { lvl: 3, price: 9000, minFarm: 5 }, { lvl: 4, price: 40000, minFarm: 14 }].map(({ lvl, price, minFarm }) => {
                  const requiresFarmLevel = lvl >= 3 && p.farmLevel < minFarm;
                  const canAfford = p.gold >= price && p.solarLevel === lvl - 1 && !requiresFarmLevel;
                  return (
                    <button key={lvl} disabled={p.solarLevel >= lvl || !canAfford}
                      onClick={() => { if (canAfford) { p.setGold(prev => prev - price); p.setSolarLevel(lvl); p.addLog(`☀️ Gerador solar nível ${lvl} instalado! Manutenção ${lvl * 15}% mais barata.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } else if (requiresFarmLevel) { p.addLog(`☀️ Gerador solar nível ${lvl} requer Fazenda Nível ${minFarm}!`, 'error'); } }}
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
              <p className="text-xs text-stone-500 font-mono mb-2">Nv1: secas -40% impacto | Nv2: imunidade total a secas | Nv3: +1 felicidade/dia animais. Atual: Nível {p.irrigationLevel}/3 • Compra sequencial</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ lvl: 1, price: 1500 }, { lvl: 2, price: 4500 }, { lvl: 3, price: 20000 }].map(({ lvl, price }) => {
                  const requiresFarmLevel12 = lvl === 3 && p.farmLevel < 12;
                  const canBuy = p.gold >= price && p.irrigationLevel === lvl - 1 && !requiresFarmLevel12;
                  return (
                    <button key={lvl} disabled={p.irrigationLevel >= lvl || !canBuy}
                      onClick={() => { if (canBuy) { p.setGold(prev => prev - price); p.setIrrigationLevel(lvl); p.addLog(`🌊 Irrigação nível ${lvl} instalada!`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                      className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${p.irrigationLevel >= lvl ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : canBuy ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                    >
                      {p.irrigationLevel >= lvl ? `✅ Nv${lvl}` : p.irrigationLevel < lvl - 1 || requiresFarmLevel12 ? `🔒 Nv${lvl}` : `Nv${lvl} (${price.toLocaleString()}💰)`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seguros */}
            {[
              { key: 'insurance', label: '🛡️ Seguro Agrícola', color: 'emerald', price: 400, days: 7, desc: `Reduz impacto de eventos negativos em 70% por 7 dias. ${p.insurance.active ? `Ativo: ${p.insurance.daysLeft} dias restantes` : 'Inativo'}`, state: p.insurance, setState: (v: InsuranceState) => p.setInsurance(v), logMsg: '🛡️ Seguro agrícola contratado por 7 dias por 400 moedas!' },
              { key: 'theft', label: '🔒 Seguro contra Roubo', color: 'orange', price: 300, days: 10, desc: `Bloqueia completamente roubo noturno por 10 dias. ${p.insuranceTheft.active ? `Ativo: ${p.insuranceTheft.daysLeft} dias restantes` : 'Inativo'}`, state: p.insuranceTheft, setState: (v: InsuranceState) => p.setInsuranceTheft(v), logMsg: '🔒 Seguro contra Roubo contratado por 10 dias!' },
              { key: 'climate', label: '🌦️ Seguro Climático', color: 'sky', price: 350, days: 10, desc: `Protege contra secas e tempestades: sem custo extra de água por 10 dias. ${p.insuranceClimate.active ? `Ativo: ${p.insuranceClimate.daysLeft} dias restantes` : 'Inativo'}`, state: p.insuranceClimate, setState: (v: InsuranceState) => p.setInsuranceClimate(v), logMsg: '🌦️ Seguro Climático contratado por 10 dias!' },
            ].map(({ key, label, color, price, days, desc, state, setState, logMsg }) => (
              <div key={key} className={`bg-white border-4 border-${color}-300 rounded-3xl p-4`}>
                <h4 className={`font-display font-black text-sm uppercase text-${color}-800 mb-1`}>{label}</h4>
                <p className="text-xs text-stone-500 font-mono mb-2">{desc}</p>
                <button disabled={state.active || p.gold < price}
                  onClick={() => { if (!state.active && p.gold >= price) { p.setGold(prev => prev - price); setState({ active: true, daysLeft: days }); p.addLog(logMsg, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); } }}
                  className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${state.active ? `bg-${color}-100 border-${color}-300 text-${color}-700` : p.gold >= price ? `bg-${color}-500 hover:bg-${color}-400 text-white border-${color}-700` : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                >
                  {state.active ? `✅ Ativo (${state.daysLeft}d)` : `Contratar (${price}💰 / ${days} dias)`}
                </button>
              </div>
            ))}

            {/* Empréstimo */}
            <div className="bg-white border-4 border-violet-300 rounded-3xl p-4">
              <h4 className="font-display font-black text-sm uppercase text-violet-800 mb-1">🏦 Banco Rural — Empréstimo</h4>
              {p.loanActive ? (
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 font-mono">Empréstimo ativo: <strong>{p.loanAmount.toLocaleString()}💰</strong></p>
                  <p className="text-xs text-stone-500 font-mono">Juros semanais: <strong>{Math.round(p.loanInterestRate * 100)}%</strong> — Próximo em {p.loanDaysUntilInterest}d</p>
                  <p className="text-xs text-stone-500 font-mono">Semanas restantes: <strong>{p.loanWeeksLeft}</strong></p>
                  <button disabled={p.gold < p.loanAmount}
                    onClick={() => { if (p.gold >= p.loanAmount) { p.setGold(prev => prev - p.loanAmount); p.setLoanActive(false); p.setLoanAmount(0); p.setLoanWeeksLeft(0); p.addLog(`🏦 Empréstimo quitado antecipadamente! -${p.loanAmount}💰`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); setTimeout(() => p.checkAndUnlockAchievement('loan_paid'), 0); } }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer mt-2 ${p.gold >= p.loanAmount ? 'bg-violet-500 hover:bg-violet-400 text-white border-violet-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    Quitar Antecipado ({p.loanAmount.toLocaleString()}💰)
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 font-mono">Receba ouro agora e pague juros semanais. Escolha o valor:</p>
                  {[
                    { amount: 500, rate: 0.05, weeks: 4, label: 'Pequeno (500💰, 5%/sem, 4 sem)' },
                    { amount: 1500, rate: 0.08, weeks: 5, label: 'Médio (1.500💰, 8%/sem, 5 sem)' },
                    { amount: 4000, rate: 0.12, weeks: 6, label: 'Grande (4.000💰, 12%/sem, 6 sem)' },
                    { amount: 10000, rate: 0.15, weeks: 8, label: 'Mega (10.000💰, 15%/sem, 8 sem)' },
                  ].map(opt => (
                    <button key={opt.amount}
                      onClick={() => { p.setGold(prev => prev + opt.amount); p.setLoanActive(true); p.setLoanAmount(opt.amount); p.setLoanInterestRate(opt.rate); p.setLoanWeeksLeft(opt.weeks); p.setLoanDaysUntilInterest(7); p.addLog(`🏦 Empréstimo de ${opt.amount}💰 obtido! Juros: ${Math.round(opt.rate*100)}%/semana por ${opt.weeks} semanas.`, 'success'); p.triggerAudioResult(() => p.sfx.playSound('levelup')); setTimeout(() => p.checkAndUnlockAchievement('loan_taken'), 0); }}
                      className="w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 bg-violet-500 hover:bg-violet-400 text-white border-violet-700 transition-all cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
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

          </div>
          <div className="bg-orange-50 p-4 border-t border-orange-100 flex justify-end shrink-0">
            <button onClick={p.onClose} className="bg-orange-600 hover:bg-orange-500 text-white border-b-4 border-orange-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider cursor-pointer">
              Fechar Melhorias
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MelhoriasModal;
