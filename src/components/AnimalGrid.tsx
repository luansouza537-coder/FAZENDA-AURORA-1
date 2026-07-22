/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { Animal, AnimalType, FarmStats, FarmWorker } from '../types';
import { AnimalCard, AnimalListRow } from './AnimalCard';
import CaipiraHen from './CaipiraHen';
import JerseyCow from './JerseyCow';
import AngusOx from './AngusOx';

interface AnimalGridProps {
  animals: Animal[];
  landLots: number;
  showBuyMenu: boolean;
  setShowBuyMenu: (v: boolean) => void;
  showProfitPanel: boolean;
  setShowProfitPanel: (fn: (prev: boolean) => boolean) => void;
  showRankingModal: boolean;
  setShowRankingModal: (v: boolean) => void;
  debugMode: boolean;
  setDebugMode: (fn: (prev: boolean) => boolean) => void;
  isGameOver: boolean;
  advanceDay: (e: React.MouseEvent | null) => void;
  gold: number;
  farmLevel: number;
  getAnimalPurchasePrice: (type: string) => number;
  buyAnimal: (type: string, e: React.MouseEvent) => void;
  buyAnimalFilhote: (type: string, e: React.MouseEvent) => void;
  stats: FarmStats;
  currentDay: number;
  inventory: Record<string, number>;
  feedAnimal: (id: number, e?: React.MouseEvent) => void;
  collectMilk: (id: number, e?: React.MouseEvent) => void;
  collectWool: (id: number, e?: React.MouseEvent) => void;
  collectEgg: (id: number, e?: React.MouseEvent) => void;
  sellOx: (id: number, e?: React.MouseEvent) => void;
  calculateBoiValue: (animal: Animal) => number;
  calculateFrangoValue?: (animal: Animal) => number;
  sellFrango?: (id: number, e: React.MouseEvent) => void;
  sellAngus?: (id: number, e: React.MouseEvent) => void;
  calculateAngusValue?: (animal: Animal) => number;
  sellBoer?: (id: number, e: React.MouseEvent) => void;
  calculateBoerValue?: (animal: Animal) => number;
  sellPirarucu?: (id: number, e: React.MouseEvent) => void;
  calculatePirarucuValue?: (animal: Animal) => number;
  collectPeixe?: (id: number, e: React.MouseEvent) => void;
  collectLeiteJersey?: (id: number, e: React.MouseEvent) => void;
  getFrangoEmoji?: (weight: number) => string;
  calculatePorcoValue: (animal: Animal) => number;
  sellPorco: (id: number, e?: React.MouseEvent) => void;
  sellPeru: (id: number, e?: React.MouseEvent) => void;
  calculatePeruValue: (animal: Animal) => number;
  animalFilter: string;
  setAnimalFilter: (v: string) => void;
  animalSort: 'happiness' | 'production' | 'age' | 'name' | 'ready';
  setAnimalSort: (v: 'happiness' | 'production' | 'age' | 'name' | 'ready') => void;
  animalSortDir: 'asc' | 'desc';
  setAnimalSortDir: (fn: (d: 'asc' | 'desc') => 'asc' | 'desc') => void;
  animalViewMode: 'card' | 'list';
  setAnimalViewMode: (fn: (m: 'card' | 'list') => 'card' | 'list') => void;
  editingId: number | null;
  setEditingId: (v: number | null) => void;
  tempName: string;
  setTempName: (v: string) => void;
  licencaCriadouro: boolean;
  licencaExotica: boolean;
  reproducaoAtiva: boolean;
  REPRODUCAO_CONFIG: Partial<Record<AnimalType, { gestacao: number; minAge: number }>>;
  collectGoatMilk: (id: number, e?: React.MouseEvent) => void;
  collectSheepMilk: (id: number, e?: React.MouseEvent) => void;
  collectLlamaWool: (id: number, e?: React.MouseEvent) => void;
  collectDuckEgg: (id: number, e?: React.MouseEvent) => void;
  collectGooseProduct: (id: number, e?: React.MouseEvent) => void;
  collectBuffaloMilk: (id: number, e?: React.MouseEvent) => void;
  collectAlpacaWool: (id: number, e?: React.MouseEvent) => void;
  collectCoelhoWool: (id: number, e?: React.MouseEvent) => void;
  collectCabraAngoraMohair: (id: number, e?: React.MouseEvent) => void;
  collectBichoSeda: (id: number, e?: React.MouseEvent) => void;
  feedBichoSeda: (id: number, e?: React.MouseEvent) => void;
  collectRa: (id: number, e?: React.MouseEvent) => void;
  trainHorse?: (id: number, e?: React.MouseEvent, focus?: 'speed' | 'burst' | 'stamina') => void;
  collectAvestruzPena: (id: number, e?: React.MouseEvent) => void;
  sellAvestruz: (id: number, e?: React.MouseEvent) => void;
  sellJacare: (id: number, e?: React.MouseEvent) => void;
  sellAnimal: (id: number, e: React.MouseEvent) => void;
  retireAnimal: (id: number, e?: React.MouseEvent) => void;
  getAnimalDailyProfit: (type: Animal['type']) => { revenue: number; cost: number; profit: number };
  getTraitInfo: (trait: NonNullable<Animal['trait']>) => { emoji: string; label: string; description: string };
  getLifePhase: (animal: Animal) => { phase: string; label: string; emoji: string; prodMult: number; color: string };
  getBoiEmoji: (weight: number) => string;
  renderGrowthBadge: (weight: number) => React.ReactNode;
  setCruzarModal: (v: { animalId: number; type: AnimalType } | null) => void;
  saveRename: (id: number) => void;
  startRename: (id: number, currentName: string) => void;
  addLog: (message: string, type?: string) => void;
  workers: FarmWorker[];
  workerTypes: { role: string; emoji: string; name: string }[];
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (name: string) => void };
  initGame: () => void;
  sendToAbatedouro?: (animalId: number, animalType: 'boi' | 'porco') => void;
  abatedouroUnlocked?: boolean;
  hasCertSanitario?: boolean;
  collectMel?: (id: number, e?: React.MouseEvent) => void;
  collectHumus?: (id: number, e: React.MouseEvent) => void;
  collectMuco?: (id: number, e: React.MouseEvent) => void;
}

export default function AnimalGrid({
  animals,
  landLots,
  showBuyMenu,
  setShowBuyMenu,
  showProfitPanel,
  setShowProfitPanel,
  setShowRankingModal,
  debugMode,
  setDebugMode,
  isGameOver,
  advanceDay,
  gold,
  farmLevel,
  getAnimalPurchasePrice,
  buyAnimal,
  buyAnimalFilhote,
  stats,
  currentDay,
  inventory,
  feedAnimal,
  collectMilk,
  collectWool,
  collectEgg,
  sellOx,
  calculateBoiValue,
  calculateFrangoValue,
  sellFrango,
  sellAngus,
  calculateAngusValue,
  sellBoer,
  calculateBoerValue,
  sellPirarucu,
  calculatePirarucuValue,
  collectPeixe,
  collectLeiteJersey,
  getFrangoEmoji,
  calculatePorcoValue,
  sellPorco,
  sellPeru,
  calculatePeruValue,
  animalFilter,
  setAnimalFilter,
  animalSort,
  setAnimalSort,
  animalSortDir,
  setAnimalSortDir,
  animalViewMode,
  setAnimalViewMode,
  editingId,
  setEditingId,
  tempName,
  setTempName,
  licencaCriadouro,
  licencaExotica,
  reproducaoAtiva,
  REPRODUCAO_CONFIG,
  collectGoatMilk,
  collectSheepMilk,
  collectLlamaWool,
  collectDuckEgg,
  collectGooseProduct,
  collectBuffaloMilk,
  collectAlpacaWool,
  collectCoelhoWool,
  collectCabraAngoraMohair,
  collectBichoSeda,
  feedBichoSeda,
  collectRa,
  trainHorse,
  collectAvestruzPena,
  sellAvestruz,
  sellJacare,
  sellAnimal,
  retireAnimal,
  getAnimalDailyProfit,
  getTraitInfo,
  getLifePhase,
  getBoiEmoji,
  renderGrowthBadge,
  setCruzarModal,
  saveRename,
  startRename,
  addLog,
  workers,
  workerTypes,
  triggerAudioResult,
  sfx,
  initGame,
  sendToAbatedouro,
  abatedouroUnlocked,
  hasCertSanitario,
  collectMel,
  collectHumus,
  collectMuco,
}: AnimalGridProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [workersExpanded, setWorkersExpanded] = useState(true);
  const [lucrosCollapsed, setLucrosCollapsed] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('aurora_ui_lucros_collapsed') || 'false'); } catch { return false; }
  });
  const [gridExpanded, setGridExpanded] = useState(true);
  return (
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-[#78350f]/60 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>🌾</span>
                <h2 className="text-[#fef3c7] text-xl sm:text-2xl font-display font-black tracking-wide" style={{ textShadow: '1.5px 1.5px 0px #451a03' }}>
                  CURRAL DA AURORA ({animals.length}/{landLots * 5} Animais)
                </h2>
                <span className="text-[10px] text-amber-200/90 font-mono font-bold block uppercase mt-0.5 tracking-wider leading-none">
                  🏡 Lote {landLots}/5 · Capacidade: {landLots * 5} animais {landLots < 5 ? '· Expanda o terreno!' : '· Máximo atingido'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* DEBUG MODE TOGGLE — apenas em ambiente de desenvolvimento */}
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => setDebugMode(prev => !prev)}
                    className={`${debugMode ? 'bg-orange-600 border-orange-900' : 'bg-stone-800 border-stone-950'} text-white border-b-4 px-3 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer`}
                    title="Modo Debug: mostra fluxo de ouro detalhado no log a cada dia"
                  >
                    {debugMode ? '🔍 DEBUG ON' : '🔍 DEBUG'}
                  </button>
                )}

                {/* ADVANCE DAY */}
                <button
                  type="button"
                  data-onboarding="advance-day"
                  onClick={(e) => {
                    e.preventDefault();
                    advanceDay(e);
                  }}
                  disabled={isGameOver}
                  className="bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-stone-500 text-white border-b-4 border-[#b45309] px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Avançar Dia: passa para o próximo dia, animais perdem fome e podem produzir"
                >
                  🌞 AVANÇAR DIA
                </button>

              </div>
            </div>

            {/* Collapsible Purchasing Tray Drawer */}
            <AnimatePresence>
              {showBuyMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  data-buy-menu="true"
                  className="bg-[#fde68a]/30 border-4 border-[#fbbf24] rounded-[28px] p-5 flex flex-col gap-4 mb-2 shadow-inner overflow-hidden"
                >
                  {/* BUG 1 FIX: grade responsiva com scroll para que todos os animais sejam acessíveis em mobile e desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                  {/* Nível 1 — galinha */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && (
                      <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>
                    )}
                    <span className="text-4xl">🐔</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Galinha de Quintal</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">1 ovo/dia 15💰/u. Chance de ovo fértil e até Ovo Premium!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('galinha')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('galinha', e)}
                      disabled={gold < getAnimalPurchasePrice('galinha')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Galinha. Fornece ovos saudáveis diariamente se alimentada."
                    >
                      Comprar + 1 🌾
                    </button>
                  </div>
                  {/* Nível 1 — boi */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    <span className="text-4xl">🐂</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Boi de Corte</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Engorda diariamente e vale até 300💰 na Feira! Quanto mais gordo, mais rico.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('boi')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('boi', e)}
                        disabled={gold < getAnimalPurchasePrice('boi')}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um Boi adulto. Acumula peso de corte diariamente e vende na feira por alto retorno."
                      >
                        Comprar + 1 🌾
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('boi', e)}
                      disabled={gold < 75}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Boi por 75 moedas fixo (sem desconto de nível). Cresce em 15 dias e vai aparecer na lista de animais."
                    >
                      🍼 Filhote 75💰
                    </button>
                  </div>
                  {/* Nível 1 — vaca */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    <span className="text-4xl">🐄</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Vaca Leiteira</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Leite fresco 22💰/u todo dia. A base de toda fazenda próspera!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('vaca')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('vaca', e)}
                        disabled={gold < getAnimalPurchasePrice('vaca')}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra uma Vaca leiteira. Gera leite diário no Armazém após o primeiro dia."
                      >
                        Comprar + 1 🌾
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('vaca', e)}
                      disabled={gold < 60}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Vaca por 60 moedas. Cresce em 10 dias."
                    >
                      🍼 Filhote 60💰
                    </button>
                  </div>
                  {/* Nível 1 — ovelha */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    <span className="text-4xl">🐑</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Ovelha de Lã</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã a cada 3 dias 20💰/u. Rende cachecol 85💰 se processada!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ovelha')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('ovelha', e)}
                        disabled={gold < getAnimalPurchasePrice('ovelha')}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra uma Ovelha. Fornece lã a cada 3 dias (a cada 2 dias se for melhor amigo)."
                      >
                        Comprar + 1 🌾
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('ovelha', e)}
                      disabled={gold < 40}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Ovelha por 40 moedas. Cresce em 8 dias."
                    >
                      🍼 Filhote 40💰
                    </button>
                  </div>
                  {/* Nível 2 — frango_corte */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    <span className="text-4xl">🐓</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Frango de Corte</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Engorda em ~8 dias e vale até ~45💰 na Feira! Cuidado com o calor do verão — o Estábulo protege.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('frango_corte')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('frango_corte', e)}
                        disabled={gold < getAnimalPurchasePrice('frango_corte') || farmLevel < 2}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um pintinho de corte. Engorda em ~8 dias e é vendido vivo na feira."
                      >
                        {farmLevel < 2 ? '🔒 Nível 2' : 'Comprar + 1 🌾'}
                      </button>
                    </div>
                  </div>
                  {/* Nível 2 — cabra */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 2 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv2+</span>}
                    <span className="text-4xl">🐐</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Cabra Leiteira</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Leite de cabra 38💰/u — o mais caro do básico! Ciclo 20d + deixa todos os animais mais felizes passivamente.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('cabra')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('cabra', e)}
                        disabled={gold < getAnimalPurchasePrice('cabra') || farmLevel < 2}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        {farmLevel < 2 ? 'Nível 2+' : 'Comprar + 1 🌾'}
                      </button>
                    </div>

                    {farmLevel >= 2 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('cabra', e)}
                        disabled={gold < 55}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Cabra por 55 moedas. Cresce em 8 dias."
                      >
                        🍼 Filhote 55💰
                      </button>
                    )}
                  </div>
                  {/* Nível 2 — lhama */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 2 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv2+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🦙</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Lhama de Lã</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã 45💰/u colhida na Primavera. Resistente ao Inverno — nunca perde felicidade no frio!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('lhama')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('lhama', e)}
                      disabled={gold < getAnimalPurchasePrice('lhama') || farmLevel < 2}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 2 ? 'Nível 2+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 3 — pato */}
                  <div className={`flex flex-col items-center p-3.5 rounded-[24px] border-2 w-full max-w-[190px] text-center shadow-md relative ${farmLevel < 3 ? 'bg-stone-100/90 border-stone-300 opacity-70' : 'bg-white/90 border-[#fbbf24]'}`}>
                    {farmLevel < 3 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">🔒 Nv3</span>}
                    <span className="text-4xl">🦆</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Pato de Quintal</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ovo de pato 18💰/u todo dia. Bônus: patrulha o celeiro e reduz pragas em 40%!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('pato')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('pato', e)}
                        disabled={gold < getAnimalPurchasePrice('pato') || farmLevel < 3}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        {farmLevel < 3 ? '🔒 Nível 3' : 'Comprar + 1 🌾'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('pato', e)}
                      disabled={gold < 25 || farmLevel < 3}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Pato por 25 moedas. Cresce em 6 dias. Requer Nível 3."
                    >
                      🍼 Filhote 25💰
                    </button>
                  </div>
                  {/* Nível 4 — galinha_caipira */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 4 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv4+</span>}
                    <CaipiraHen size={46} />
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Galinha Caipira</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ovo premium dia sim, dia não (felicidade 85+). Rende Bolo e Pudim no Ateliê!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('galinha_caipira')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('galinha_caipira', e)}
                      disabled={gold < getAnimalPurchasePrice('galinha_caipira') || farmLevel < 4}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Galinha Caipira. Ovos premium em dias alternados, exige felicidade alta."
                    >
                      {farmLevel < 4 ? 'Nível 4+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 4 — bufalo */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 4 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv4+</span>}
                    <span className="text-4xl">🐃</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Búfalo Leiteiro</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt.0.5 leading-tight">Leite de búfala 28💰/u com ciclo de lactação. Processe e vire Muçarela de Búfala 120💰 — lucro triplo!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('bufalo')}</span>
                    <div className="relative w-full">
                      {farmLevel >= 4 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-full uppercase z-10">10% Off</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => buyAnimal('bufalo', e)}
                        disabled={gold < getAnimalPurchasePrice('bufalo') || farmLevel < 4}
                        className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        {farmLevel < 4 ? 'Nível 4+' : 'Comprar + 1 🌾'}
                      </button>
                    </div>
                    {farmLevel >= 4 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('bufalo', e)}
                        disabled={gold < 110}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Búfalo por 110 moedas. Cresce em 12 dias."
                      >
                        🍼 Filhote 110💰
                      </button>
                    )}
                  </div>
                  {/* Nível 4 — colmeia_abelhas */}
                  <div className={`flex flex-col items-center p-3.5 rounded-[24px] border-2 w-full max-w-[190px] text-center shadow-md relative ${farmLevel < 4 ? 'bg-stone-100/90 border-stone-300 opacity-70' : 'bg-white/90 border-[#fbbf24]'}`}>
                    {farmLevel < 4 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">🔒 Nv4</span>}
                    <span className="text-4xl">🍯</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Colmeia de Abelhas</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Mel 40💰/u a cada 10 dias. Zero ração! Com Apicultor: +1 mel extra e ciclo menor no Inverno.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('colmeia_abelhas')}</span>
                    <button type="button" onClick={(e) => buyAnimal('colmeia_abelhas', e)} disabled={gold < getAnimalPurchasePrice('colmeia_abelhas') || farmLevel < 4}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 4 ? '🔒 Nível 4' : 'Comprar 🍯'}
                    </button>
                  </div>
                  {/* Nível 5 — ovelha_leiteira */}
                  <div className="bg-white/90 rounded-[24px] border-2 border-[#fbbf24] p-3.5 flex flex-col items-center text-center shadow-md relative w-full max-w-[190px]">
                    {farmLevel < 5 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv5+</span>}
                    <span className="text-4xl">🐑</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Ovelha Leiteira</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Leite de ovelha 28💰/u. Produz Pecorino, Ricota e mais! Ciclo longo de 40d mas altamente lucrativo.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ovelha_leiteira')}</span>
                    <button type="button" onClick={(e) => buyAnimal('ovelha_leiteira', e)} disabled={gold < getAnimalPurchasePrice('ovelha_leiteira') || farmLevel < 5}
                      className="mt-2.5 w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 5 ? '🔒 Nível 5' : 'Comprar 🐑'}
                    </button>
                    {farmLevel >= 5 && (
                      <button type="button" onClick={(e) => buyAnimalFilhote('ovelha_leiteira', e)} disabled={gold < 90}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Ovelha Leiteira por 90 moedas. Cresce em 10 dias.">
                        🐑 Filhote (90💰)
                      </button>
                    )}
                  </div>
                  {/* Nível 5 — alpaca */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 5 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv5+</span>}
                    <span className="text-4xl">🦙</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Alpaca</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã premium 65💰/u a cada 4 dias — mais valiosa que a lhama. Cuidado: sofre no Verão!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('alpaca')}</span>
                    <button type="button" onClick={(e) => buyAnimal('alpaca', e)} disabled={gold < getAnimalPurchasePrice('alpaca') || farmLevel < 5}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 5 ? 'Nível 5+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 6 — minhoca */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 6 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv6+</span>}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Minhoca">
                      <ellipse cx="20" cy="28" rx="6" ry="8" fill="#c084fc"/>
                      <ellipse cx="14" cy="22" rx="6" ry="7" fill="#d8b4fe"/>
                      <ellipse cx="22" cy="16" rx="6" ry="7" fill="#c084fc"/>
                      <ellipse cx="27" cy="10" rx="5" ry="6" fill="#e879f9"/>
                      <circle cx="30" cy="7" r="4" fill="#f0abfc"/>
                      <circle cx="28.5" cy="5.5" r="1" fill="#1e1b4b"/>
                      <circle cx="31.5" cy="5.5" r="1" fill="#1e1b4b"/>
                      <line x1="29" y1="4" x2="28" y2="2" stroke="#a21caf" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="31" y1="4" x2="32" y2="2" stroke="#a21caf" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Minhocário</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Húmus 35💰/u a cada 3 dias. Zero ração, zero trabalho. Bônus no bioma Floresta!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('minhoca')}</span>
                    <button type="button" onClick={(e) => buyAnimal('minhoca', e)} disabled={gold < getAnimalPurchasePrice('minhoca') || farmLevel < 6}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 6 ? 'Nível 6+' : 'Comprar Kit 🌿'}
                    </button>
                  </div>
                  {/* Nível 6 — cavalo */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-amber-500 w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 6 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv6+</span>}
                    <span className="text-5xl" style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🐴</span>
                    <h4 className="font-display font-black text-stone-800 text-xs uppercase mt-1">Cavalo 🏇</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Não produz — CORRE! Treine-o e dispute o Grande Prêmio Aurora toda semana. Velocidade de nascença: 40-60.</p>
                    <span className="text-stone-800 text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('cavalo')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('cavalo', e)}
                      disabled={gold < getAnimalPurchasePrice('cavalo') || farmLevel < 6}
                      className="mt-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-amber-800 shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um cavalo de corrida. Treino diário aumenta a velocidade; corridas semanais pagam prêmios."
                    >
                      {farmLevel < 6 ? '🔒 Nível 6' : 'Comprar + 1 🏇'}
                    </button>
                  </div>
                  {/* Nível 7 — caracol */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 7 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv7+</span>}
                    <span className="text-4xl">🐌</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Criatório de Caracóis</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Muco 35💰/u a cada 3 dias. Sem ração! Base de cosméticos premium — Creme 85💰 e Sérum 130💰.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('caracol')}</span>
                    <button type="button" onClick={(e) => buyAnimal('caracol', e)} disabled={gold < getAnimalPurchasePrice('caracol') || farmLevel < 7}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 7 ? 'Nível 7+' : 'Comprar + 1 🌿'}
                    </button>
                  </div>
                  {/* Nível 8 — coelho_angora */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 8 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv8+</span>}
                    <span className="text-4xl">🐰</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Coelho Angorá</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Produz lã angorá de altíssima qualidade através de tosquia gentil a cada temporada. Sem abate — só carinho e tesoura! Transforme a lã em fio e depois em cachecóis premium.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('coelho_angora')}</span>
                    <button type="button" onClick={(e) => buyAnimal('coelho_angora', e)} disabled={gold < getAnimalPurchasePrice('coelho_angora') || farmLevel < 8}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 8 ? 'Nível 8+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 9 — cabra_angora */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 9 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv9+</span>}
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="24" cy="30" rx="15" ry="11" fill="#f5f0e8"/>
                      <circle cx="11" cy="30" r="4.5" fill="#ede8dc"/>
                      <circle cx="13" cy="24" r="4" fill="#ede8dc"/>
                      <circle cx="19" cy="21" r="4.5" fill="#ede8dc"/>
                      <circle cx="26" cy="20" r="4.5" fill="#ede8dc"/>
                      <circle cx="33" cy="22" r="4" fill="#ede8dc"/>
                      <circle cx="36" cy="29" r="4.5" fill="#ede8dc"/>
                      <circle cx="34" cy="36" r="4" fill="#ede8dc"/>
                      <circle cx="14" cy="36" r="4" fill="#ede8dc"/>
                      <ellipse cx="24" cy="29" rx="11" ry="8" fill="#faf8f2"/>
                      <rect x="16" y="38" width="3.5" height="7" rx="1.5" fill="#d4c9b0"/>
                      <rect x="21" y="39" width="3.5" height="7" rx="1.5" fill="#d4c9b0"/>
                      <rect x="27" y="39" width="3.5" height="7" rx="1.5" fill="#d4c9b0"/>
                      <rect x="32" y="38" width="3.5" height="7" rx="1.5" fill="#d4c9b0"/>
                      <ellipse cx="24" cy="15" rx="6" ry="6.5" fill="#f0ebe0"/>
                      <path d="M19 10 C15 6 13 3 16 1 C19 -1 21 2 20 5 C19 7 18 8 19 10" stroke="#b5a07a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                      <path d="M29 10 C33 6 35 3 32 1 C29 -1 27 2 28 5 C29 7 30 8 29 10" stroke="#b5a07a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                      <ellipse cx="18.5" cy="13" rx="2.5" ry="1.5" fill="#e8d5c4" transform="rotate(-30 18.5 13)"/>
                      <ellipse cx="29.5" cy="13" rx="2.5" ry="1.5" fill="#e8d5c4" transform="rotate(30 29.5 13)"/>
                      <ellipse cx="21.5" cy="14.5" rx="1.2" ry="1" fill="#4a3728"/>
                      <ellipse cx="26.5" cy="14.5" rx="1.2" ry="1" fill="#4a3728"/>
                      <circle cx="22" cy="14" r="0.4" fill="white"/>
                      <circle cx="27" cy="14" r="0.4" fill="white"/>
                      <ellipse cx="24" cy="18" rx="2.8" ry="2" fill="#e8c4b8"/>
                      <circle cx="22.8" cy="17.8" r="0.6" fill="#c4957a"/>
                      <circle cx="25.2" cy="17.8" r="0.6" fill="#c4957a"/>
                      <path d="M23 20 Q24 22 25 20" stroke="#d4c9b0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    </svg>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Cabra Angorá</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Produz mohair a cada 25 dias — a fibra mais valiosa da fazenda! Tosquie para coletar 1 mohair (120💰) e transforme em cachecol de luxo (280💰). Usa Ração Ovinos.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('cabra_angora')}</span>
                    <button type="button" onClick={(e) => buyAnimal('cabra_angora', e)} disabled={gold < getAnimalPurchasePrice('cabra_angora') || farmLevel < 9}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 9 ? 'Nível 9+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 10 — bicho_seda */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 10 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv10+</span>}
                    <span className="text-4xl">🥚</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Bicho-da-Seda</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ciclo de 20 dias: Ovo🥚 → Lagarta🐛 → Casulo🫙 → Mariposa🦋. Produz 5 seda bruta (100💰/u) na fase Casulo. Folha de amoreira necessária na fase Lagarta. Pode gerar novos bichos ao virar mariposa!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('bicho_seda')}</span>
                    <button type="button" onClick={(e) => buyAnimal('bicho_seda', e)} disabled={gold < getAnimalPurchasePrice('bicho_seda') || farmLevel < 10}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 10 ? 'Nível 10+' : 'Comprar Lote 🌿'}
                    </button>
                  </div>
                  {/* Nível 11 — codorna */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 11 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv11+</span>}
                    <span className="text-4xl">🐦</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Codorna</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">2 ovos de codorna por dia 22💰 cada! Alta produção, baixo custo. Melhor custo-benefício das aves.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('codorna')}</span>
                    <button type="button" onClick={(e) => buyAnimal('codorna', e)} disabled={gold < getAnimalPurchasePrice('codorna') || farmLevel < 11}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 11 ? 'Nível 11+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 12 — tanque_tilapia */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 12 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv12+</span>}
                    <span className="text-4xl">🐟</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Tanque de Tilápia</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Come Ração de Peixes todo dia! Fome alta = 3 peixes por colheita (ciclo 3-5 dias conforme a estação).</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('tanque_tilapia')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('tanque_tilapia', e)}
                      disabled={gold < getAnimalPurchasePrice('tanque_tilapia') || farmLevel < 12}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Instala um Tanque de Tilápia. Produz peixes em ciclos sazonais, sem fome nem felicidade."
                    >
                      {farmLevel < 12 ? 'Nível 12+' : 'Instalar 🐟'}
                    </button>
                  </div>
                  {/* Nível 13 — ganso */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 13 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv13+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🦢</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Ganso Vigia</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ovo de ganso 50💰/u no Outono e Inverno. Te avisa antes de eventos negativos — segurança grátis!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ganso')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('ganso', e)}
                      disabled={gold < getAnimalPurchasePrice('ganso') || farmLevel < 13}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 13 ? 'Nível 13+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 14 — pavao */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 14 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv14+</span>}
                    {farmLevel >= 14 && <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-amber-900 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">👑 Elite</span>}
                    <span className="text-4xl">🦚</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Pavão de Prestígio</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Penas 80💰/u a cada 7 dias + bônus passivo: +10% felicidade de todos e +3% no preço de venda.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('pavao')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('pavao', e)}
                      disabled={gold < getAnimalPurchasePrice('pavao') || farmLevel < 14}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 14 ? 'Nível 14+' : 'Comprar + 1 🌾'}
                    </button>
                    {farmLevel >= 14 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('pavao', e)}
                        disabled={gold < 175}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Pavão por 175 moedas. Cresce em 20 dias."
                      >
                        🍼 Filhote 175💰
                      </button>
                    )}
                  </div>
                  {/* Nível 15 — vaca_jersey */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 15 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv15+</span>}
                    <JerseyCow size={46} />
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Vaca Jersey</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">1 Leite Premium/dia (14💰), come 25% menos! Destrava Manteiga, Minas, Doce e Gouda Jersey.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('vaca_jersey')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('vaca_jersey', e)}
                      disabled={gold < getAnimalPurchasePrice('vaca_jersey') || farmLevel < 15}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Vaca Jersey. Leite premium diário, consumo de ração reduzido."
                    >
                      {farmLevel < 15 ? 'Nível 15+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 16 — peru */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 16 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv16+</span>}
                    <span className="text-4xl">🦃</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Peru</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Engorda em ~30 dias e vai direto à feira por até 550💰. Usa Ração de Aves. Quanto mais feliz, mais vale!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('peru')}</span>
                    <button type="button" onClick={(e) => buyAnimal('peru', e)} disabled={gold < getAnimalPurchasePrice('peru') || farmLevel < 16}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 16 ? 'Nível 16+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  {/* Nível 17 — cabra_boer */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-orange-500 w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 17 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv17+</span>}
                    <span className="text-4xl">🐐</span>
                    <h4 className="font-display font-black text-orange-800 text-xs uppercase mt-1">Cabra Boer</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Raça de corte sul-africana: engorda rápido e vale bem mais que uma cabra comum na venda. Peso e bem-estar definem o valor final.</p>
                    <span className="text-orange-800 text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('cabra_boer')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('cabra_boer', e)}
                      disabled={gold < getAnimalPurchasePrice('cabra_boer') || farmLevel < 17}
                      className="mt-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-orange-800 shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Cabra Boer. Raça de corte que engorda rápido — venda quando adulta pelo peso."
                    >
                      {farmLevel < 17 ? '🔒 Nível 17' : 'Comprar + 1 🐐'}
                    </button>
                  </div>
                  {/* Nível 18 — tanque_pirarucu */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-cyan-700 w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 18 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv18+</span>}
                    <span className="text-4xl">🐋</span>
                    <h4 className="font-display font-black text-cyan-900 text-xs uppercase mt-1">Tanque de Pirarucu</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Peixe amazônico premium — cresce rápido e vende de uma vez, por peso, quando adulto. Item mais caro que a tilápia comum.</p>
                    <span className="text-cyan-900 text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('tanque_pirarucu')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('tanque_pirarucu', e)}
                      disabled={gold < getAnimalPurchasePrice('tanque_pirarucu') || farmLevel < 18}
                      className="mt-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-cyan-900 shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um Tanque de Pirarucu. Engorda rápido — venda quando adulto pelo peso, valor bem acima da tilápia."
                    >
                      {farmLevel < 18 ? '🔒 Nível 18' : 'Comprar + 1 🐋'}
                    </button>
                  </div>
                  {/* Nível 19 — boi_angus */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-stone-700 w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 19 && <span className="absolute -top-2.5 -right-2 bg-stone-700 text-amber-300 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv19+</span>}
                    <AngusOx size={48} />
                    <h4 className="font-display font-black text-stone-800 text-xs uppercase mt-1">Boi Angus 💎</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Carne premium: vale até ~2.600💰 gordo e feliz! Come 30% mais e engorda devagar — investimento de elite.</p>
                    <span className="text-stone-800 text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('boi_angus')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('boi_angus', e)}
                      disabled={gold < getAnimalPurchasePrice('boi_angus') || farmLevel < 19}
                      className="mt-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 disabled:text-stone-500 text-amber-300 text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-black shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um Boi Angus premium. Marmoreio e bem-estar definem o valor de venda."
                    >
                      {farmLevel < 19 ? '🔒 Nível 19' : 'Comprar + 1 💎'}
                    </button>
                  </div>
                  {/* Nível 20 — jacare */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 20 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv20+</span>}
                    {farmLevel >= 20 && <span className="absolute -top-2.5 -right-2 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">⚠️ Exótico</span>}
                    <span className="text-4xl">🐊</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Jacaré</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Carne 300💰 e couro 500💰 na morte — o animal mais valioso do jogo! Requer Licença Exótica.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('jacare')}</span>
                    <button type="button" onClick={(e) => buyAnimal('jacare', e)} disabled={gold < getAnimalPurchasePrice('jacare') || farmLevel < 20}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 20 ? 'Nível 20+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>
                  </div>{/* fim grid BUG 1 FIX */}
                </motion.div>
              )}
            </AnimatePresence>

            {animals.length === 0 ? (
              <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[48px] p-8 text-center flex flex-col items-center justify-center gap-4 py-12 shadow-[0_12px_0_#d97706]">
                <span className="text-5xl animate-bounce">💀</span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#dc2626] uppercase">
                  O Curral está vazio!
                </h3>
                <p className="text-sm font-sans max-w-sm text-[#78350f] font-semibold">
                  Todos os seus animais foram vendidos ou infelizmente faleceram por fome ou estresse extremo. Abra o catálogo clicando em comprar animal no topo, ou reinicie a fazenda!
                </p>
                {isGameOver && (
                  <div className="mt-2 bg-[#fee2e2] border-2 border-[#ef4444] p-3 rounded-2xl max-w-xs text-[#991b1b] font-mono text-xs font-bold uppercase">
                    ⚠️ <strong>FALÊNCIA!</strong> Moedas insuficientes para comprar animais no mercado.
                  </div>
                )}
                <button
                  onClick={initGame}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] px-6 py-3 rounded-2xl font-display font-black shadow-md active:translate-y-0.5 cursor-pointer flex items-center gap-2 uppercase tracking-wider text-sm hover:scale-105 transition-all animate-pulse"
                >
                  <RotateCcw className="w-4 h-4 text-white stroke-[3]" /> Recomeçar Fazenda do Zero
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 🏡 PAINEL VISUAL DE SLOTS */}
                <div className="col-span-full mb-1">
                  {gridExpanded && <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: landLots * 5 }).map((_, i) => {
                      const lotIndex = Math.floor(i / 5);
                      const slotAnimal = animals[i];
                      const typeEmoji: Record<string, string> = {
                        vaca:'🐄', ovelha:'🐑', boi:'🐂', galinha:'🐔', cabra:'🐐', frango_corte:'🐓', galinha_caipira:'🐔', tanque_tilapia:'🐟', vaca_jersey:'🐄', boi_angus:'🐂', cavalo:'🐴', cabra_boer:'🐐', tanque_pirarucu:'🐋',
                        lhama:'🦙', pato:'🦆', ganso:'🦢', bufalo:'🐃', pavao:'🦚',
                        codorna:'🐦', alpaca:'🦙', minhoca:'🪱', caracol:'🐌',
                        coelho_angora:'🐰', bicho_seda:'🐛', ra:'🐸', avestruz:'🦤', jacare:'🐊',
                        colmeia_abelhas:'🍯', ovelha_leiteira:'🐑',
                      };
                      const lotColors = ['border-amber-400/60','border-green-400/60','border-blue-400/60','border-purple-400/60','border-rose-400/60'];
                      const lotColor = lotColors[lotIndex] ?? 'border-amber-400/60';
                      if (i > 0 && i % 5 === 0) {
                        return (
                          <React.Fragment key={`sep-${i}`}>
                            <div className="w-px h-8 bg-white/20 self-center mx-0.5" />
                            <div
                              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${slotAnimal ? `bg-[#064e3b]/80 ${lotColor}` : 'bg-black/20 border-white/10'}`}
                              title={slotAnimal ? `${slotAnimal.name} (${slotAnimal.type})` : `Slot ${i + 1} — vazio`}
                            >
                              {slotAnimal ? (typeEmoji[slotAnimal.type] ?? '🐾') : <span className="text-white/20 text-xs font-black">+</span>}
                            </div>
                          </React.Fragment>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${slotAnimal ? `bg-[#064e3b]/80 ${lotColor}` : 'bg-black/20 border-white/10'}`}
                          title={slotAnimal ? `${slotAnimal.name} (${slotAnimal.type})` : `Slot ${i + 1} — vazio`}
                        >
                          {slotAnimal ? (typeEmoji[slotAnimal.type] ?? '🐾') : <span className="text-white/20 text-xs font-black">+</span>}
                        </div>
                      );
                    })}
                    {landLots < 5 && (
                      <div className="w-9 h-9 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center" title="Expanda o terreno para mais slots">
                        <span className="text-white/20 text-lg">🔒</span>
                      </div>
                    )}
                  </div>}
                  <div className="flex items-center gap-2 mt-1 ml-0.5">
                    <p className="text-[9px] text-amber-200/50 font-mono">{animals.length}/{landLots * 5} slots ocupados · {landLots} lote(s) · separadores por lote</p>
                    <button
                      onClick={() => setGridExpanded(e => !e)}
                      className="text-[9px] text-[#fbbf24]/60 hover:text-[#fbbf24] font-black cursor-pointer select-none transition-colors"
                      title={gridExpanded ? 'Minimizar animais' : 'Expandir animais'}
                    >
                      {gridExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Worker Visual Feedback Bar */}
                {workers.length > 0 && (
                  <div className="col-span-full mb-3">
                    <button
                      onClick={() => setWorkersExpanded(e => !e)}
                      className="flex items-center gap-1.5 text-[10px] text-[#fbbf24]/80 font-mono font-black uppercase tracking-wider mb-1.5 cursor-pointer hover:text-[#fbbf24] transition-colors"
                    >
                      👷 Funcionários ({workers.length}) {workersExpanded ? '▲' : '▼'}
                    </button>
                    {workersExpanded && (
                      <div className="flex flex-wrap gap-2">
                        {workers.map(worker => {
                          const def = workerTypes.find(w => w.role === worker.role);
                          return (
                            <div key={worker.id} className="flex items-center gap-1.5 bg-gradient-to-r from-[#064e3b] to-[#065f46] border-2 border-[#fbbf24]/70 rounded-full pl-2 pr-3 py-1 shadow-sm">
                              <span className="text-sm leading-none">{def?.emoji ?? '👷'}</span>
                              <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-mono text-[#fef3c7] font-black leading-tight">{worker.name}</span>
                                <span className="text-[8px] text-[#fbbf24]/80 font-mono leading-tight">-{worker.dailyCost}💰/sem</span>
                              </div>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {/* Feature 1: Animal Filter Bar */}
                <div className="col-span-full mb-3">
                  {/* Barra de toggle sempre visível */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] text-[#fef3c7]/60 font-mono">
                      Mostrando {animals.filter(a => {
                        if (animalFilter === 'all') return true;
                        if (animalFilter === 'ready') return (a.type === 'vaca' && !a.hasProducedToday) || (a.type === 'ovelha' && a.woolReady) || ((a.type === 'galinha' || a.type === 'codorna') && !a.hasProducedToday) || (a.type === 'cabra' && a.isLactating) || (a.type === 'lhama' && (a.woolAccumulated ?? 0) > 0) || (a.type === 'pato' && a.hasProducedToday) || (a.type === 'bufalo' && !a.hasProducedToday) || (a.type === 'cabra_angora' && a.woolReady);
                        if (animalFilter === '__bovinos__') return ['vaca','vaca_jersey','boi','boi_angus','bufalo','cavalo'].includes(a.type);
                        if (animalFilter === '__aves__') return ['galinha','codorna','pavao','pato','ganso','avestruz','peru','frango_corte','galinha_caipira'].includes(a.type);
                        if (animalFilter === '__fibras__') return ['ovelha','lhama','alpaca','coelho_angora','cabra_angora','cabra','bicho_seda'].includes(a.type);
                        if (animalFilter === '__exoticos__') return ['jacare','ra','caracol','minhoca'].includes(a.type);
                        return a.type === animalFilter;
                      }).length} de {animals.length} animais
                    </span>
                    {animalFilter !== 'all' && (
                      <span className="text-[9px] font-black bg-[#fbbf24] text-[#78350f] px-2 py-0.5 rounded-full uppercase">
                        Filtro ativo
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setAnimalViewMode(m => m === 'card' ? 'list' : 'card')}
                        className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-[#fbbf24]/60 text-[#fef3c7] bg-transparent hover:bg-[#fbbf24]/10 transition-all"
                        title="Alternar entre modo card e lista compacta"
                      >
                        {animalViewMode === 'card' ? '☰ Lista' : '⊞ Cards'}
                      </button>
                      <button
                        onClick={() => setFiltersExpanded(v => !v)}
                        className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-[#fbbf24]/60 text-[#fef3c7] bg-white/5 hover:bg-[#fbbf24]/20 transition-all flex items-center gap-1.5"
                        title={filtersExpanded ? 'Recolher filtros' : 'Expandir filtros'}
                      >
                        🔽 Filtros {filtersExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Filtros colapsáveis */}
                  <AnimatePresence>
                    {filtersExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2 pt-1">
                          {/* Categoria rápida */}
                          {[
                            { label: '🐾 Todos', value: 'all' },
                            { label: '🐄 Bovinos', value: '__bovinos__' },
                            { label: '🐔 Aves', value: '__aves__' },
                            { label: '🧶 Fibras', value: '__fibras__' },
                            { label: '🦎 Exóticos', value: '__exoticos__' },
                            { label: '⚡ Prontos', value: 'ready' },
                          ].map(f => (
                            <button key={f.value}
                              onClick={() => setAnimalFilter(f.value)}
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 transition-all ${animalFilter === f.value ? 'bg-[#fbbf24] border-[#fbbf24] text-[#78350f]' : 'bg-white/5 hover:bg-[#fbbf24]/20 border-[#fbbf24]/40 text-[#fef3c7]/80 hover:text-[#fef3c7] hover:border-[#fbbf24]/70 transition-all'}`}>
                              {f.label}
                            </button>
                          ))}
                          <select value={animalFilter} onChange={e => setAnimalFilter(e.target.value)}
                            className="bg-[#064e3b] border-2 border-[#fbbf24] text-[#fef3c7] text-xs font-mono rounded-xl px-3 py-1.5">
                            <option value="all">🔍 Por tipo</option>
                            {[...new Set(animals.map(a => a.type))].map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {(['happiness','production','age','name','ready'] as const).map(s => (
                            <button key={s} onClick={() => { if (animalSort === s) setAnimalSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setAnimalSort(s); setAnimalSortDir(() => 'desc'); }}}
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 ${animalSort === s ? 'bg-[#fbbf24] border-[#fbbf24] text-[#78350f]' : 'bg-white/5 hover:bg-[#fbbf24]/20 border-[#fbbf24]/40 text-[#fef3c7]/80 hover:text-[#fef3c7] hover:border-[#fbbf24]/70 transition-all'}`}>
                              {s === 'happiness' ? '😊 Feliz' : s === 'production' ? '📦 Prod' : s === 'age' ? '📅 Idade' : s === 'ready' ? '✅ Prontos' : '🔤 Nome'}
                              {animalSort === s ? (animalSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                            </button>
                          ))}
                          <button onClick={() => { setAnimalFilter('all'); setAnimalSort('production'); setAnimalSortDir(() => 'desc'); }}
                            className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-[#10b981]/60 text-[#10b981] bg-transparent">
                            🏆 Top Prod
                          </button>
                          <button onClick={() => { setAnimalFilter('all'); setAnimalSort('happiness'); setAnimalSortDir(() => 'asc'); }}
                            className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-red-400/60 text-red-400 bg-transparent">
                            ⚠️ Tristes
                          </button>
                          <button onClick={() => setAnimalFilter(animalFilter === 'ready' ? 'all' : 'ready')}
                            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 ${animalFilter === 'ready' ? 'bg-yellow-400 border-yellow-400 text-yellow-900' : 'border-yellow-400/60 text-yellow-300 bg-transparent'}`}>
                            ⚡ Prontos
                          </button>
                          <div className="w-full h-px bg-[#fbbf24]/20 my-0.5" />
                          <button
                            onClick={(e) => { e.preventDefault(); setShowProfitPanel(prev => !prev); triggerAudioResult(() => sfx.playSound('click')); }}
                            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 transition-all ${showProfitPanel ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-emerald-400/60 text-emerald-300 bg-transparent hover:bg-emerald-400/10'}`}
                            title="Painel de Lucro: mostra receita, custo e lucro estimado por animal"
                          >
                            💹 Lucro
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setShowRankingModal(true); triggerAudioResult(() => sfx.playSound('click')); }}
                            className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-amber-400/60 text-amber-300 bg-transparent hover:bg-amber-400/10 transition-all"
                            title="Ranking de Animais por produção semanal"
                          >
                            🏆 Ranking
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {(() => {
                    const filteredAnimals = animals
                      .filter(a => a.type !== 'porco')
                      .filter(a => {
                        if (animalFilter === 'all') return true;
                        if (animalFilter === 'ready') return (a.type === 'vaca' && !a.hasProducedToday) || (a.type === 'ovelha' && a.woolReady) || ((a.type === 'galinha' || a.type === 'codorna') && !a.hasProducedToday) || (a.type === 'cabra' && a.isLactating) || (a.type === 'lhama' && (a.woolAccumulated ?? 0) > 0) || (a.type === 'pato' && a.hasProducedToday) || (a.type === 'bufalo' && !a.hasProducedToday) || (a.type === 'cabra_angora' && a.woolReady);
                        if (animalFilter === '__bovinos__') return ['vaca','vaca_jersey','boi','boi_angus','bufalo','cavalo'].includes(a.type);
                        if (animalFilter === '__aves__') return ['galinha','codorna','pavao','pato','ganso','avestruz','peru','frango_corte','galinha_caipira'].includes(a.type);
                        if (animalFilter === '__fibras__') return ['ovelha','lhama','alpaca','coelho_angora','cabra_angora','cabra','bicho_seda'].includes(a.type);
                        if (animalFilter === '__exoticos__') return ['jacare','ra','caracol','minhoca'].includes(a.type);
                        return a.type === animalFilter;
                      })
                      .sort((a, b) => {
                        let cmp = 0;
                        const isReady = (x: typeof a) =>
                          (x.hasProducedToday ? 1 : 0) + (x.woolReady ? 1 : 0);
                        if (animalSort === 'happiness') cmp = (a.happiness ?? 0) - (b.happiness ?? 0);
                        else if (animalSort === 'production') cmp = (a.weeklyProduction ?? 0) - (b.weeklyProduction ?? 0);
                        else if (animalSort === 'age') cmp = (a.age ?? 0) - (b.age ?? 0);
                        else if (animalSort === 'ready') cmp = isReady(a) - isReady(b);
                        else cmp = a.name.localeCompare(b.name);
                        return animalSortDir === 'asc' ? cmp : -cmp;
                      });
                    if (animalViewMode === 'list') {
                      return (
                        <div key="list-wrapper" className="col-span-full space-y-1">
                          {filteredAnimals.map((animal) => (
                            <AnimalListRow
                              key={animal.id}
                              animal={animal}
                              currentDay={currentDay}
                              inventory={inventory}
                              onFeed={feedAnimal}
                              onCollectMilk={collectMilk}
                              onCollectWool={collectWool}
                              onCollectEgg={collectEgg}
                              onSellOx={sellOx}
                              onSellFrango={sellFrango}
                              onSellAngus={sellAngus}
                              calculateAngusValue={calculateAngusValue}
                              onSellBoer={sellBoer}
                              calculateBoerValue={calculateBoerValue}
                              onSellPirarucu={sellPirarucu}
                              calculatePirarucuValue={calculatePirarucuValue}
                              onCollectPeixe={collectPeixe}
                              onCollectLeiteJersey={collectLeiteJersey}
                              calculateFrangoValue={calculateFrangoValue}
                              calculateBoiValue={calculateBoiValue}
                              calculatePorcoValue={calculatePorcoValue}
                              onSellPorco={sellPorco}
                              onSellPeru={sellPeru}
                              calculatePeruValue={calculatePeruValue}
                              onCollectCabraAngoraMohair={collectCabraAngoraMohair}
                            />
                          ))}
                        </div>
                      );
                    }
                    return filteredAnimals.map((animal) => (
                      <AnimalCard
                        key={animal.id}
                        animal={animal}
                        currentDay={currentDay}
                        inventory={inventory}
                        editingId={editingId}
                        tempName={tempName}
                        showProfitPanel={showProfitPanel}
                        animals={animals}
                        licencaCriadouro={licencaCriadouro}
                        licencaExotica={licencaExotica}
                        reproducaoAtiva={reproducaoAtiva}
                        reproducaoConfig={REPRODUCAO_CONFIG}
                        onFeed={feedAnimal}
                        onCollectMilk={collectMilk}
                        onCollectWool={collectWool}
                        onCollectEgg={collectEgg}
                        onSellOx={sellOx}
                        onSellFrango={sellFrango}
                        onSellAngus={sellAngus}
                        calculateAngusValue={calculateAngusValue}
                        onSellBoer={sellBoer}
                        calculateBoerValue={calculateBoerValue}
                        onSellPirarucu={sellPirarucu}
                        calculatePirarucuValue={calculatePirarucuValue}
                        onCollectPeixe={collectPeixe}
                        onCollectLeiteJersey={collectLeiteJersey}
                        calculateFrangoValue={calculateFrangoValue}
                        getFrangoEmoji={getFrangoEmoji}
                        onCollectGoatMilk={collectGoatMilk}
                        onCollectSheepMilk={collectSheepMilk}
                        onCollectLlamaWool={collectLlamaWool}
                        onCollectDuckEgg={collectDuckEgg}
                        onCollectGooseProduct={collectGooseProduct}
                        onCollectBuffaloMilk={collectBuffaloMilk}
                        onCollectAlpacaWool={collectAlpacaWool}
                        onCollectCoelhoWool={collectCoelhoWool}
                        onCollectBichoSeda={collectBichoSeda}
                        onFeedBichoSeda={feedBichoSeda}
                        onCollectRa={collectRa}
                        onTrainHorse={trainHorse}
                        onCollectAvestruzPena={collectAvestruzPena}
                        onSellAvestruz={sellAvestruz}
                        onSellJacare={sellJacare}
                        onSellAnimal={sellAnimal}
                        onRetireAnimal={retireAnimal}
                        calculateBoiValue={calculateBoiValue}
                        calculatePorcoValue={calculatePorcoValue}
                        onSellPorco={sellPorco}
                        onSellPeru={sellPeru}
                        calculatePeruValue={calculatePeruValue}
                        getAnimalDailyProfit={getAnimalDailyProfit}
                        getTraitInfo={getTraitInfo}
                        getLifePhase={getLifePhase}
                        getBoiEmoji={getBoiEmoji}
                        renderGrowthBadge={renderGrowthBadge}
                        onSetCruzarModal={setCruzarModal}
                        onSetEditingId={setEditingId}
                        onSetTempName={setTempName}
                        onSaveRename={saveRename}
                        onStartRename={startRename}
                        addLog={addLog}
                        sendToAbatedouro={sendToAbatedouro}
                        abatedouroUnlocked={abatedouroUnlocked}
                        hasCertSanitario={hasCertSanitario}
                        onCollectMel={collectMel}
                        onCollectHumus={collectHumus}
                        onCollectMuco={collectMuco}
                        onCollectCabraAngoraMohair={collectCabraAngoraMohair}
                      />
                    ));
                  })()}
                </AnimatePresence>
              </div>
            )}

            {/* --- IN-APP MINI METRICS TRACKER --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_8px_0_#d97706]">
              <h3 className={`font-display font-black text-sm uppercase tracking-wider text-[#78350f] flex items-center gap-1.5 ${lucrosCollapsed ? '' : 'mb-3.5'}`}>
                📈 Relatório Geral de Lucros
                <button
                  type="button"
                  onClick={() => setLucrosCollapsed(prev => { const v = !prev; try { localStorage.setItem('aurora_ui_lucros_collapsed', JSON.stringify(v)); } catch { /* ignore */ } return v; })}
                  className="ml-auto text-[#92400e] hover:text-[#78350f] font-black text-sm px-2 py-0.5 rounded-lg hover:bg-amber-100 transition-all cursor-pointer leading-none"
                  title={lucrosCollapsed ? 'Expandir seção' : 'Recolher seção'}
                >{lucrosCollapsed ? '▼' : '▲'}</button>
              </h3>
              {!lucrosCollapsed && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Total Faturado</div>
                  <div className="text-base font-black text-emerald-700 mt-1">💰 {stats.totalEarned}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Alimentações</div>
                  <div className="text-base font-black text-blue-700 mt-1">🌽 {stats.totalFed}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Itens Coletados</div>
                  <div className="text-base font-black text-purple-700 mt-1">📦 {stats.totalCollected}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Gado Comercializado</div>
                  <div className="text-base font-black text-amber-700 mt-1">🐂 {stats.totalOxSold ?? 0}</div>
                </div>
              </div>
              )}
            </div>

          </div>
  );
}
