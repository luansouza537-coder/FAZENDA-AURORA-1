/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pencil, Scissors, Utensils } from 'lucide-react';
import type { Animal, AnimalType, AnimalTrait } from '../types';

// ─── Shared helper types ────────────────────────────────────────────────────

interface LifePhase {
  phase: 'filhote' | 'juvenil' | 'adulto_jovem' | 'adulto' | 'idoso' | 'muito_idoso';
  label: string;
  emoji: string;
  prodMult: number;
  color: string;
}

interface TraitInfo {
  emoji: string;
  label: string;
  description: string;
}

interface DailyProfit {
  revenue: number;
  cost: number;
  profit: number;
}

// ─── AnimalListRow ──────────────────────────────────────────────────────────

export interface AnimalListRowProps {
  animal: Animal;
  currentDay: number;
  inventory: Record<string, number>;
  onFeed: (id: number, e: React.MouseEvent) => void;
  onCollectMilk: (id: number, e: React.MouseEvent) => void;
  onCollectWool: (id: number, e: React.MouseEvent) => void;
  onCollectEgg: (id: number, e: React.MouseEvent) => void;
  onSellOx: (id: number, e: React.MouseEvent) => void;
  onCollectMel?: (id: number, e: React.MouseEvent) => void;
  calculateBoiValue: (animal: Animal) => number;
  calculatePorcoValue: (animal: Animal) => number;
  onSellPorco: (id: number, e: React.MouseEvent) => void;
}

export const AnimalListRow: React.FC<AnimalListRowProps> = ({
  animal,
  currentDay,
  inventory,
  onFeed,
  onCollectMilk,
  onCollectWool,
  onCollectEgg,
  onSellOx,
  onCollectMel,
  calculateBoiValue,
  calculatePorcoValue,
  onSellPorco,
}) => {
  if (animal.type === 'porco') return null;
  const noHungerAnimal = ['minhoca','caracol','colmeia_abelhas'].includes(animal.type);
  const isCritical = animal.happiness < 20 || (!noHungerAnimal && animal.hunger < 25);
  const valueOfOx = animal.type === 'boi' ? calculateBoiValue(animal) : 0;
  const valueOfPorcoRow = animal.type === 'porco' ? calculatePorcoValue(animal) : 0;
  const isReady =
    (animal.type === 'vaca' && animal.hasProducedToday) ||
    (animal.type === 'ovelha' && animal.woolReady) ||
    (animal.type === 'galinha' && animal.hasProducedToday) ||
    (animal.type === 'boi' && (animal.weightGain || 0) >= 0.8) ||
    (animal.type === 'porco' && (animal.weightGain || 0) >= 0.8) ||
    (animal.type === 'cabra' && animal.isLactating && animal.hasProducedToday) ||
    (animal.type === 'pato' && animal.hasProducedToday) ||
    (animal.type === 'bufalo' && animal.hasProducedToday && animal.isLactating !== false);
  const typeLabel: Record<string, string> = {
    vaca: '🐄', ovelha: '🐑', boi: '🐂', galinha: '🐔', cabra: '🐐',
    lhama: '🦙', pato: '🦆', ganso: '🦢', bufalo: '🐃', pavao: '🦚',
    codorna: '🐦', alpaca: '🦙', minhoca: '🪱', caracol: '🐌',
    coelho_angora: '🐰', bicho_seda: '🐛', ra: '🐸', avestruz: '🦤', jacare: '🐊', porco: '🐷',
    colmeia_abelhas: '🍯',
  };
  return (
    <div
      key={animal.id}
      className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 text-sm transition-all ${
        isCritical
          ? 'bg-red-50 border-red-400'
          : animal.isAdult === false
          ? 'bg-blue-50/60 border-blue-200'
          : 'bg-[#fffbeb] border-[#fbbf24]/60'
      }`}
    >
      <span className="text-xl w-6 text-center select-none">{typeLabel[animal.type] ?? '🐾'}</span>
      <span className="font-black text-[#78350f] w-28 truncate text-xs uppercase">{animal.name}</span>
      {animal.isBestFriend && <span className="text-[9px] bg-pink-100 border border-pink-300 text-pink-700 font-black px-1.5 py-0.5 rounded-full">💖 Amigo</span>}
      {animal.isCampiao && <span className="text-[9px] bg-yellow-100 border border-yellow-300 text-yellow-800 font-black px-1.5 py-0.5 rounded-full">🏆</span>}
      {animal.isAdult === false && !['minhoca', 'caracol', 'bicho_seda'].includes(animal.type) && <span className="text-[9px] bg-blue-100 border border-blue-300 text-blue-700 font-black px-1.5 py-0.5 rounded-full">🍼 {Math.max(0, (animal.adulthoodDay ?? 0) - currentDay)}d</span>}
      {animal.isSick && <span className="text-[9px] bg-red-100 border border-red-300 text-red-700 font-black px-1.5 py-0.5 rounded-full animate-pulse">🤒</span>}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-[10px] font-mono text-stone-500">❤️{animal.happiness}%</span>
        {!noHungerAnimal && <span className="text-[10px] font-mono text-stone-500">🍽️{animal.hunger}%</span>}
        {(animal.type === 'boi' || animal.type === 'porco') && <span className="text-[10px] font-mono text-stone-500">🔥{Math.floor((animal.weightGain||0)*100)}%</span>}
        {isCritical && <span className="text-[9px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full animate-pulse">⚠️</span>}
        {isReady && <span className="text-[9px] bg-green-500 text-white font-black px-1.5 py-0.5 rounded-full">✅ Pronto</span>}
      </div>
      <div className="flex gap-1 ml-2 shrink-0">
        {animal.isAdult !== false && (
          <button
            onClick={e => onFeed(animal.id, e)}
            className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer transition-all"
          >🍽️</button>
        )}
        {animal.type === 'vaca' && animal.hasProducedToday && (
          <button onClick={e => onCollectMilk(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200 cursor-pointer">🥛</button>
        )}
        {animal.type === 'ovelha' && animal.woolReady && (
          <button onClick={e => onCollectWool(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200 cursor-pointer">🧶</button>
        )}
        {animal.type === 'galinha' && animal.hasProducedToday && (
          <button onClick={e => onCollectEgg(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200 cursor-pointer">🥚</button>
        )}
        {animal.type === 'boi' && animal.isAdult !== false && (
          <button onClick={e => onSellOx(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 hover:bg-red-200 cursor-pointer">💰{valueOfOx}</button>
        )}
        {animal.type === 'colmeia_abelhas' && animal.melReady && (
          <button onClick={e => onCollectMel?.(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer">🍯</button>
        )}
        {animal.type === 'porco' && animal.isAdult !== false && (
          <button onClick={e => onSellPorco(animal.id, e)} className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 hover:bg-red-200 cursor-pointer">💰{valueOfPorcoRow}</button>
        )}
      </div>
    </div>
  );
};

// ─── AnimalCard ─────────────────────────────────────────────────────────────

export interface AnimalCardProps {
  animal: Animal;
  currentDay: number;
  inventory: Record<string, number>;
  editingId: number | null;
  tempName: string;
  showProfitPanel: boolean;
  animals: Animal[];
  licencaCriadouro: boolean;
  licencaExotica: boolean;
  reproducaoAtiva: { animalId1: number; animalId2: number; gestacaoEnd: number }[];
  reproducaoConfig: Partial<Record<AnimalType, { gestacao: number; minAge: number }>>;
  onFeed: (id: number, e: React.MouseEvent) => void;
  onCollectMilk: (id: number, e: React.MouseEvent) => void;
  onCollectWool: (id: number, e: React.MouseEvent) => void;
  onCollectEgg: (id: number, e: React.MouseEvent) => void;
  onSellOx: (id: number, e: React.MouseEvent) => void;
  onCollectGoatMilk: (id: number, e: React.MouseEvent) => void;
  onCollectSheepMilk: (id: number, e: React.MouseEvent) => void;
  onCollectLlamaWool: (id: number, e: React.MouseEvent) => void;
  onCollectDuckEgg: (id: number, e: React.MouseEvent) => void;
  onCollectGooseProduct: (id: number, e: React.MouseEvent) => void;
  onCollectBuffaloMilk: (id: number, e: React.MouseEvent) => void;
  onCollectAlpacaWool: (id: number, e: React.MouseEvent) => void;
  onCollectCoelhoWool: (id: number, e: React.MouseEvent) => void;
  onCollectBichoSeda: (id: number, e: React.MouseEvent) => void;
  onFeedBichoSeda: (id: number, e: React.MouseEvent) => void;
  onCollectRa: (id: number, e: React.MouseEvent) => void;
  onCollectAvestruzPena: (id: number, e: React.MouseEvent) => void;
  onSellAvestruz: (id: number, e: React.MouseEvent) => void;
  onSellJacare: (id: number, e: React.MouseEvent) => void;
  onCollectMel?: (id: number, e: React.MouseEvent) => void;
  onCollectHumus?: (id: number, e: React.MouseEvent) => void;
  onCollectMuco?: (id: number, e: React.MouseEvent) => void;
  onSellAnimal: (id: number, e: React.MouseEvent) => void;
  onRetireAnimal: (id: number, e: React.MouseEvent) => void;
  calculateBoiValue: (animal: Animal) => number;
  calculatePorcoValue: (animal: Animal) => number;
  onSellPorco: (id: number, e: React.MouseEvent) => void;
  getAnimalDailyProfit: (type: AnimalType) => DailyProfit;
  getTraitInfo: (trait: AnimalTrait) => TraitInfo;
  getLifePhase: (animal: { age?: number; maxAge?: number; isAdult?: boolean; adulthoodDay?: number }) => LifePhase;
  getBoiEmoji: (weight: number) => string;
  renderGrowthBadge: (weight: number) => React.ReactNode;
  onSetCruzarModal: (val: { animalId: number; type: AnimalType }) => void;
  onSetEditingId: (id: number | null) => void;
  onSetTempName: (name: string) => void;
  onSaveRename: (id: number) => void;
  onStartRename: (id: number, currentName: string) => void;
  addLog: (msg: string, type?: string) => void;
  sendToAbatedouro?: (animalId: number, animalType: 'boi' | 'porco') => void;
  abatedouroUnlocked?: boolean;
  hasCertSanitario?: boolean;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  currentDay,
  inventory,
  editingId,
  tempName,
  showProfitPanel,
  animals,
  licencaCriadouro,
  licencaExotica,
  reproducaoAtiva,
  reproducaoConfig,
  onFeed,
  onCollectMilk,
  onCollectWool,
  onCollectEgg,
  onSellOx,
  onCollectGoatMilk,
  onCollectSheepMilk,
  onCollectLlamaWool,
  onCollectDuckEgg,
  onCollectGooseProduct,
  onCollectBuffaloMilk,
  onCollectAlpacaWool,
  onCollectCoelhoWool,
  onCollectBichoSeda,
  onFeedBichoSeda,
  onCollectRa,
  onCollectAvestruzPena,
  onSellAvestruz,
  onSellJacare,
  onCollectMel,
  onCollectHumus,
  onCollectMuco,
  onSellAnimal,
  onRetireAnimal,
  calculateBoiValue,
  calculatePorcoValue,
  onSellPorco,
  getAnimalDailyProfit,
  getTraitInfo,
  getLifePhase,
  getBoiEmoji,
  renderGrowthBadge,
  onSetCruzarModal,
  onSetEditingId,
  onSetTempName,
  onSaveRename,
  onStartRename,
  addLog,
  sendToAbatedouro,
  abatedouroUnlocked,
  hasCertSanitario,
}) => {
  const [pendingSell, setPendingSell] = useState(false);
  const [pendingSellOx, setPendingSellOx] = useState(false);
  const [pendingSellAvestruz, setPendingSellAvestruz] = useState(false);
  const [pendingSellJacare, setPendingSellJacare] = useState(false);
  const [pendingSellPorco, setPendingSellPorco] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isEditing = editingId === animal.id;
  const valueOfOx = animal.type === 'boi' ? calculateBoiValue(animal) : 0;
  const valueOfPorco = animal.type === 'porco' ? calculatePorcoValue(animal) : 0;

  const noHungerAnimal = ['minhoca', 'caracol', 'colmeia_abelhas'].includes(animal.type);
  const isCritical = animal.happiness < 20 || (!noHungerAnimal && animal.hunger < 25);

  const isReady = (
    (animal.type === 'vaca' && animal.hasProducedToday) ||
    (animal.type === 'bufalo' && animal.hasProducedToday && animal.isLactating !== false) ||
    (animal.type === 'galinha' && animal.hasProducedToday) ||
    (animal.type === 'codorna' && animal.hasProducedToday) ||
    (animal.type === 'pato' && animal.hasProducedToday) ||
    (animal.type === 'cabra' && animal.isLactating && animal.hasProducedToday) ||
    (animal.type === 'ovelha' && animal.woolReady) ||
    (animal.type === 'lhama' && (animal.woolAccumulated ?? 0) > 0) ||
    (animal.type === 'alpaca' && animal.woolReady) ||
    (animal.type === 'coelho_angora' && animal.woolReady)
  );

  return (
    <motion.div
      key={animal.id}
      layout
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -30 }}
      transition={{ duration: 0.3 }}
      className={`rounded-[48px] p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all relative border-4 ${
        isCritical
          ? 'bg-red-50/70 border-red-600 shadow-[0_12px_0_#991b1b]'
          : animal.happiness === 100
          ? 'bg-yellow-50 border-yellow-400 shadow-[0_12px_0_#ca8a04] hover:border-yellow-300'
          : 'bg-[#fffbeb] border-[#fbbf24] shadow-[0_12px_0_#d97706] hover:border-[#f59e0b]'
      } ${isReady ? 'ring-2 ring-[#10b981] ring-offset-1' : ''}`}
    >
      {/* Ready to collect pulsing dot */}
      {isReady && (
        <span className="absolute top-2 right-2 w-3 h-3 bg-[#10b981] rounded-full animate-pulse border-2 border-white shadow z-10" title="Pronto para coletar!" />
      )}

      {/* Critical Danger warning badge */}
      {isCritical && (
        <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-[9px] sm:text-[10px] px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5 animate-pulse border-2 border-white select-none">
          ⚠️ Risco de Morte Amanhã!
        </div>
      )}

      {/* Champion badge */}
      {animal.isCampiao && (
        <div className="absolute -top-3.5 -right-2.5 z-10">
          <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">🏆 Campeão</span>
        </div>
      )}

      {/* Best friend decorative badge */}
      {animal.isBestFriend && (
        <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="animate-heart-pulse">💖</span> Melhor Amigo!
        </div>
      )}

      {/* Veteran badge */}
      {animal.age !== undefined && animal.maxAge !== undefined && animal.age >= animal.maxAge * 0.75 && (
        <span className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-800 cursor-help" title="Este animal está na fase final da vida. Considere aposentá-lo.">
          👴 Veterano
        </span>
      )}

      {/* Badge de galinha super feliz (pode gerar ovo fértil) */}
      {animal.type === 'galinha' && animal.happiness >= 95 && !animal.isBestFriend && (
        <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1 animate-pulse" style={{ animationDuration: '2s' }}>
          ✨ Feliz
        </div>
      )}

      {/* IMPROVEMENT 1: Progressive happiness alert badges */}
      {animal.happiness < 30 && !isCritical && (
        <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse z-10">🔴 CRÍTICO</span>
      )}
      {animal.happiness >= 30 && animal.happiness < 50 && (
        <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">⚠️ TRISTE</span>
      )}

      {/* IMPROVEMENT 7: Stress badge */}
      {(animal.stressedDays ?? 0) > 0 && (
        <span className="absolute top-1 right-1 text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-black z-10">😰 Estressado ({animal.stressedDays}d)</span>
      )}

      {/* IMPROVEMENT 9: Sick badge with day counter */}
      {animal.isSick && (
        <span className={`absolute top-6 left-1 text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse z-10 ${(animal.sickDays ?? 0) >= 5 ? 'bg-red-800 text-yellow-300 border border-yellow-400' : 'bg-red-600 text-white'}`}>
          🤒 Doente {(animal.sickDays ?? 0) > 0 ? `${animal.sickDays}d` : ''}{(animal.sickDays ?? 0) >= 5 ? ' ⚠️' : ''}
        </span>
      )}

      {/* IMPROVEMENT 6: Premium quality badge */}
      {animal.isHighQuality && (
        <span className="absolute top-6 right-1 text-[8px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-black z-10">✨ Premium</span>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute bottom-2 right-3 text-[10px] text-[#fbbf24]/60 hover:text-[#fbbf24] font-black z-10 cursor-pointer select-none"
        title={collapsed ? 'Expandir card' : 'Minimizar card'}
      >
        {collapsed ? '▼' : '▲'}
      </button>

      {/* Animal header with edit rename */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-1.5 max-w-full">
              <input
                type="text"
                value={tempName}
                maxLength={14}
                onChange={(e) => onSetTempName(e.target.value)}
                className="border-2 border-[#fbbf24] rounded-xl px-2 py-1 text-xs text-[#78350f] bg-[#fffbeb] outline-none font-bold w-24 sm:w-28 focus:ring-2 focus:ring-[#10b981]"
              />
              <button
                onClick={() => onSaveRename(animal.id)}
                className="bg-[#10b981] hover:bg-[#059669] text-white text-[10px] px-2.5 py-1 rounded-lg cursor-pointer font-black uppercase tracking-wider border-b-2 border-[#065f46]"
              >
                Salvar
              </button>
              <button
                onClick={() => onSetEditingId(null)}
                className="bg-stone-300 hover:bg-stone-400 text-stone-800 text-[10px] px-2.5 py-1 rounded-lg cursor-pointer font-black uppercase tracking-wider border-b-2 border-stone-500"
              >
                X
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/nametooltip relative">
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#78350f] leading-none uppercase tracking-wide cursor-pointer hover:text-emerald-700 transition-colors">
                {animal.name}
              </h3>
              <button
                onClick={() => onStartRename(animal.id, animal.name)}
                className="opacity-40 hover:opacity-100 hover:text-[#10b981] transition-opacity cursor-pointer p-0.5 rounded"
                title="Renomear Animal: altere o nome deste simpático bichinho"
              >
                <Pencil className="w-3.5 h-3.5 text-[#92400e]" />
              </button>

              {/* Name tooltip code check */}
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/nametooltip:block z-50 pointer-events-none leading-normal normal-case">
                <div className="font-bold text-[#fbbf24] mb-0.5 uppercase">📋 Código #{animal.id}:</div>
                {animal.isBestFriend
                  ? "🌟 Um vínculo supremo se formou! Ele é seu melhor amigo de confiança da Aurora."
                  : "❤️ Trate com carinho. Mantenha a felicidade em 100% por 3 dias para torná-lo Melhor Amigo."}
              </div>
            </div>
          )}

          {/* Animal Badge */}
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#92400e] font-black block mt-1">
            {animal.type === 'vaca' ? '🐄 Vaca Leiteira' : animal.type === 'ovelha' ? '🐑 Ovelha de Lã' : animal.type === 'boi' ? '🐂 Boi de Corte' : animal.type === 'galinha' ? '🐔 Galinha de Quintal' : animal.type === 'cabra' ? '🐐 Cabra Leiteira' : animal.type === 'lhama' ? '🦙 Lhama de Lã' : animal.type === 'pato' ? '🦆 Pato de Quintal' : animal.type === 'ganso' ? '🦢 Ganso Vigia' : animal.type === 'bufalo' ? '🐃 Búfalo Leiteiro' : animal.type === 'pavao' ? '🦚 Pavão de Prestígio' : animal.type === 'codorna' ? '🐦 Codorna' : animal.type === 'alpaca' ? '🦙 Alpaca' : animal.type === 'ovelha_leiteira' ? '🐑 Ovelha Leiteira' : animal.type === 'minhoca' ? '🪱 Minhocário' : animal.type === 'caracol' ? '🐌 Criatório de Caracóis' : animal.type === 'coelho_angora' ? '🐰 Coelho Angorá' : animal.type === 'bicho_seda' ? (() => { const p = animal.age <= 2 ? '🥚 Ovo' : animal.age <= 12 ? '🐛 Lagarta' : animal.age <= 16 ? '🫙 Casulo' : '🦋 Mariposa'; return `${p} · Bicho-da-Seda`; })() : animal.type === 'ra' ? '🐸 Rã' : animal.type === 'avestruz' ? '🦤 Avestruz' : animal.type === 'jacare' ? '🐊 Jacaré' : animal.type === 'porco' ? '🐷 Porco de Engorda' : animal.type === 'colmeia_abelhas' ? '🍯 Colmeia de Abelhas' : '🐾 Animal'}
          </span>
          {/* Trait badge */}
          {animal.trait && !['minhoca', 'caracol', 'colmeia_abelhas', 'bicho_seda'].includes(animal.type) && (() => {
            const t = getTraitInfo(animal.trait);
            return (
              <span
                className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 cursor-help"
                title={t.description}
              >
                {t.emoji} {t.label}
              </span>
            );
          })()}
          {/* Status badges row */}
          <div className="flex flex-wrap gap-1 mt-1">
            {!animal.isAdult && !['minhoca', 'caracol', 'colmeia_abelhas'].includes(animal.type) && (
              <span className="text-[9px] bg-pink-100 border border-pink-300 text-pink-700 font-black px-1.5 py-0.5 rounded-full">😴 Filhote</span>
            )}
            {animal.isSick && (
              <span className="text-[9px] bg-red-100 border border-red-300 text-red-700 font-black px-1.5 py-0.5 rounded-full animate-pulse">🤒 Doente</span>
            )}
            {(animal.stressedDays ?? 0) > 0 && !['minhoca', 'caracol', 'colmeia_abelhas'].includes(animal.type) && (
              <span className="text-[9px] bg-orange-100 border border-orange-300 text-orange-700 font-black px-1.5 py-0.5 rounded-full">⚠️ Estressado</span>
            )}
            {isCritical && !['minhoca','caracol','colmeia_abelhas'].includes(animal.type) && (
              <span className="text-[9px] bg-red-200 border border-red-400 text-red-800 font-black px-1.5 py-0.5 rounded-full animate-pulse">💀 Crítico</span>
            )}
            {isReady && (
              <span className="text-[9px] bg-emerald-100 border border-emerald-300 text-emerald-700 font-black px-1.5 py-0.5 rounded-full">✅ Pronto</span>
            )}
            {animal.type === 'minhoca' && animal.isAdult !== false && (() => {
              const age = animal.age ?? 0;
              const daysLeft = age > 0 ? (3 - (age % 3)) % 3 : 3;
              return daysLeft === 0
                ? <span className="text-[9px] bg-emerald-100 border border-emerald-300 text-emerald-700 font-black px-1.5 py-0.5 rounded-full">🪱 Húmus hoje!</span>
                : <span className="text-[9px] bg-amber-50 border border-amber-300 text-amber-700 font-black px-1.5 py-0.5 rounded-full">🪱 Húmus em {daysLeft}d</span>;
            })()}
            {animal.type === 'caracol' && animal.isAdult !== false && (() => {
              const age = animal.age ?? 0;
              const daysLeft = age > 0 ? (3 - (age % 3)) % 3 : 3;
              return daysLeft === 0
                ? <span className="text-[9px] bg-teal-100 border border-teal-300 text-teal-700 font-black px-1.5 py-0.5 rounded-full">🐌 Muco hoje!</span>
                : <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 font-black px-1.5 py-0.5 rounded-full">🐌 Muco em {daysLeft}d</span>;
            })()}
            {animal.type === 'colmeia_abelhas' && (
              animal.melReady
                ? <span className="text-[9px] bg-amber-100 border border-amber-400 text-amber-800 font-black px-1.5 py-0.5 rounded-full animate-pulse">🍯 Mel pronto!</span>
                : <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 font-black px-1.5 py-0.5 rounded-full">🍯 Mel aguardando</span>
            )}
          </div>
          {/* MECHANIC 3: Cabra — badge de lactação */}
          {animal.type === 'cabra' && (
            animal.isLactating ? (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-green-100 border border-green-400 text-green-800 cursor-help"
                title="Produzindo leite de cabra"
              >
                🍼 Lactando
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-400 text-yellow-800 cursor-help"
                title={`Em período de secagem: ${animal.lactationCycle ?? 0} dias restantes para a próxima lactação`}
              >
                ⏳ Secagem ({animal.lactationCycle ?? 0}d)
              </span>
            )
          )}
          {/* Ovelha Leiteira — badge de lactação */}
          {animal.type === 'ovelha_leiteira' && (
            (animal.isLactating ?? true) ? (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-green-100 border border-green-400 text-green-800 cursor-help"
                title="Produzindo leite de ovelha"
              >
                🍼 Lactando
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-400 text-yellow-800 cursor-help"
                title={`Secagem: ${animal.lactationCycle ?? 0} dias restantes para a próxima lactação`}
              >
                ⏳ Secagem ({animal.lactationCycle ?? 0}d)
              </span>
            )
          )}
          {/* Búfala — badge de lactação */}
          {animal.type === 'bufalo' && (
            (animal.isLactating ?? true) ? (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-green-100 border border-green-400 text-green-800 cursor-help"
                title="Produzindo leite de búfala"
              >
                🍼 Lactando
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-400 text-yellow-800 cursor-help"
                title={`Período seco: ${10 - (animal.lactationCycle ?? 0)} dia(s) para voltar à lactação`}
              >
                🔴 Seco ({10 - (animal.lactationCycle ?? 0)}d)
              </span>
            )
          )}
          {/* MECHANIC 4: Lhama — badge de lã acumulada */}
          {animal.type === 'lhama' && (
            <span
              className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 cursor-help"
              title={`Lã acumulada ao longo das estações. Colheita disponível na Primavera com mínimo 3.`}
            >
              🧶 Lã: {animal.woolAccumulated ?? 0}/3
            </span>
          )}
          {/* Filhote badge */}
          {!animal.isAdult && animal.adulthoodDay !== undefined && !['minhoca', 'caracol', 'colmeia_abelhas', 'bicho_seda'].includes(animal.type) && (
            <span
              className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-pink-100 border border-pink-400 text-pink-800 cursor-help"
              title={`Filhote: adulto no dia ${animal.adulthoodDay}`}
            >
              🍼 Filhote — adulto em {Math.max(0, animal.adulthoodDay - currentDay)}d
            </span>
          )}
          {/* MECHANIC 5: Búfalo — badge de estresse térmico */}
          {animal.type === 'bufalo' && animal.heatStress && (
            <span
              className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-red-100 border border-red-400 text-red-800 cursor-help animate-pulse"
              title="Estresse térmico do verão: -3 felicidade/dia extra e produção de leite reduzida em 40%"
            >
              🌡️ Estresse Térmico
            </span>
          )}
          {/* F1/F2: Idade e badge idoso */}
          {animal.age !== undefined && animal.maxAge !== undefined && !['minhoca', 'caracol', 'colmeia_abelhas'].includes(animal.type) && (() => {
            const phase = getLifePhase(animal);
            const retirable = animal.isAdult !== false && animal.age >= animal.maxAge * 0.75;
            const retireHint = retirable ? ' • Clique para aposentar' : '';
            return (
              <span
                className={`inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border cursor-help ${phase.color}`}
                title={`${phase.emoji} ${phase.label} — Produção: ${Math.round(phase.prodMult * 100)}% • Dia ${animal.age}/${animal.maxAge}${retireHint}${animal.isVeteran ? ' • 🏅 Veterano' : ''}${animal.juvenileBonus ? ` • +${Math.round((animal.juvenileBonus)*100)}% bônus juvenil` : ''}`}
              >
                {phase.emoji} {phase.label} ({animal.age}d)
                {animal.isVeteran && <span className="ml-0.5">🏅</span>}
              </span>
            );
          })()}
        </div>

        {/* Avatar component with product context tooltip */}
        <div className="relative group/avatartooltip">
          <div className={`rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-[inset_0_-4px_0_#d97706] border-4 border-[#f59e0b] shrink-0 relative ${animal.isBestFriend ? 'bg-pink-100 border-pink-400 shadow-pink-500' : 'bg-[#fde68a]'} cursor-help`}>
            {/* Visual Anim decorations on avatar icons */}
            {animal.type === 'vaca' && (
              <>
                <span className="select-none">🐄</span>
                {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-droplet-flow select-none">🥛</span>}
              </>
            )}
            {animal.type === 'ovelha' && (
              <>
                <span className="select-none">🐑</span>
                {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
              </>
            )}
            {animal.type === 'galinha' && (
              <>
                <span className="select-none">🐔</span>
                {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
              </>
            )}
            {animal.type === 'boi' && (
              <span className="select-none">{getBoiEmoji(animal.weightGain || 0.15)}</span>
            )}
            {animal.type === 'porco' && (
              <div className="flex flex-col gap-1 w-full uppercase">
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center gap-1 text-[11px]">
                    📈 Peso: <span className="font-mono font-black ml-1 text-xs">{Math.floor((animal.weightGain || 0) * 100)}%</span>
                  </span>
                  {renderGrowthBadge(animal.weightGain || 0)}
                </div>
                <div className="w-full bg-[#e5e7eb] h-2.5 rounded-full overflow-hidden mt-1 border border-stone-300 relative">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.floor((animal.weightGain || 0) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#78350f]/80 font-mono text-left border-t border-[#fbbf24]/50 pt-1 mt-1.5 leading-none self-start w-full">
                  Valor atual de venda: 💰 ~{valueOfPorco} moedas
                </div>
              </div>
            )}
            {animal.type === 'cabra' && (
              <>
                <span className="select-none">🐐</span>
                {animal.isLactating && animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥛</span>}
              </>
            )}
            {animal.type === 'lhama' && (
              <>
                <span className="select-none">🦙</span>
                {(animal.woolAccumulated ?? 0) >= 3 && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
              </>
            )}
            {animal.type === 'pato' && (
              <>
                <span className="select-none">🦆</span>
                {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
              </>
            )}
            {animal.type === 'ganso' && (
              <>
                <span className="select-none">🦢</span>
              </>
            )}
            {animal.type === 'bufalo' && (
              <>
                <span className="select-none">🐃</span>
                {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-droplet-flow select-none">🥛</span>}
              </>
            )}
            {animal.type === 'pavao' && (
              <span className="select-none">🦚</span>
            )}
            {animal.type === 'codorna' && (
              <>
                <span className="select-none">🐦</span>
                {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
              </>
            )}
            {animal.type === 'alpaca' && (
              <>
                <span className="select-none">🦙</span>
                {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
              </>
            )}
            {animal.type === 'minhoca' && (
              <>
                <span className="select-none">🪱</span>
                {animal.humusReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🌱</span>}
              </>
            )}
            {animal.type === 'caracol' && (
              <>
                <span className="select-none">🐌</span>
                {animal.mucoReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">✨</span>}
              </>
            )}
            {animal.type === 'coelho_angora' && (
              <>
                <span className="select-none">🐰</span>
                {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
              </>
            )}
            {animal.type === 'bicho_seda' && (() => {
              const phase = animal.age <= 2 ? 'ovo' : animal.age <= 12 ? 'lagarta' : animal.age <= 16 ? 'casulo' : 'mariposa';
              const phaseEmoji = phase === 'ovo' ? '🥚' : phase === 'lagarta' ? '🐛' : phase === 'casulo' ? '🫙' : '🦋';
              return <span className="select-none">{phaseEmoji}</span>;
            })()}
            {animal.type === 'ra' && (
              <>
                <span className="select-none">🐸</span>
                {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🍖</span>}
              </>
            )}
            {animal.type === 'avestruz' && (
              <>
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="28" rx="9" ry="8" fill="#d97706"/><rect x="18" y="14" width="5" height="14" rx="2.5" fill="#fbbf24"/><ellipse cx="20" cy="12" rx="5" ry="4" fill="#fbbf24"/><polygon points="24,11 28,12 24,13" fill="#f59e0b"/><circle cx="22" cy="11" r="1.2" fill="#1c1917"/><line x1="17" y1="35" x2="15" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/><line x1="23" y1="35" x2="25" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/><ellipse cx="13" cy="27" rx="5" ry="4" fill="#b45309" transform="rotate(-20 13 27)"/></svg>
                {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🪶</span>}
              </>
            )}
            {animal.type === 'jacare' && <span className="select-none">🐊</span>}
            {animal.type === 'colmeia_abelhas' && (
              <>
                <span className="select-none">🍯</span>
                {animal.melReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🐝</span>}
              </>
            )}
            {animal.type === 'ovelha_leiteira' && (
              <>
                <span className="select-none">🐑</span>
                {animal.isLactating && animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-droplet-flow select-none">🥛</span>}
              </>
            )}
          </div>

          {/* Avatar tooltip */}
          <div className="absolute top-full right-0 mt-1 w-56 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/avatartooltip:block z-50 pointer-events-none leading-relaxed normal-case text-left">
            <div className="font-bold text-[#fbbf24] mb-0.5 uppercase border-b border-white/10 pb-0.5">🌾 RENDIMENTO:</div>
            {/* BUG 2 FIX: descrições corretas para todos os tipos de animal */}
            {animal.type === 'vaca'
              ? "🥛 Ordenhe leite diariamente. Dá mais leite se feliz ou em clima de Sol Forte."
              : animal.type === 'ovelha'
              ? "🧶 Fornece lã crua para fabricar cachecóis premium a cada 3 dias."
              : animal.type === 'boi'
              ? "🐂 Ganha peso corporal contínuo para revenda de alta lucratividade."
              : animal.type === 'cabra'
              ? "🐐 Produz leite de cabra em ciclos de lactação. Cada ciclo dura 20 dias de produção seguidos de 15 dias de secagem. Dá +3 felicidade/dia para todos os animais da fazenda."
              : animal.type === 'lhama'
              ? "🦙 Acumula lã ao longo das estações. Colheita somente na Primavera (mín. 3u). Não perde felicidade no Inverno e reduz custo de manutenção das máquinas."
              : animal.type === 'pato'
              ? "🦆 Bota ovos de pato diariamente (mais na Primavera, menos no Inverno). Reduz chance de pragas em 40%."
              : animal.type === 'ganso'
              ? "🦢 Bota ovos de ganso a cada 3 dias no Outono/Inverno e a cada 5 dias nas demais estações. Funciona como alarme de eventos negativos."
              : animal.type === 'bufalo'
              ? "🐃 Produz leite de búfala (3u/dia, 28–35💰/u). Ciclo: 8 dias lactando + 2 dias secos. No Verão sofre estresse térmico (-1u). Seu leite pode virar Muçarela de Búfala (120💰)."
              : animal.type === 'pavao'
              ? "🦚 Animal de prestígio. Com felicidade ≥80%, concede +10% felicidade para todos os animais e +3-5% nos preços de venda."
              : "🥚 Bota ricos ovos de quintal se manter felicidade > 30% e fome > 25%."}
          </div>
        </div>
      </div>

      {/* Stats - Fome and Felicidade */}
      {!collapsed && <div className="bg-[#fffbeb] rounded-[24px] p-4 mb-4 space-y-3.5 border-2 border-[#fbbf24] shadow-inner">

        {/* Hunger bar — hidden for animals that never need feeding */}
        {!['minhoca', 'caracol', 'colmeia_abelhas'].includes(animal.type) && (
        <div className="relative group/hungertooltip">
          <div className="flex justify-between items-center text-xs font-sans font-extrabold uppercase tracking-wider text-[#92400e]">
            <span className="flex items-center gap-1">🍽️ Fome</span>
            <span>{Math.floor(animal.hunger)}%</span>
          </div>
          <div className="bg-[#e5e7eb] h-4 rounded-full overflow-hidden mt-1 border-2 border-[#d1d5db] shadow-inner relative cursor-help">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                animal.hunger < 25 ? 'bg-red-500 animate-pulse' : animal.hunger < 60 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
              }`}
              style={{ width: `${animal.hunger}%` }}
            />
          </div>

          {/* Floating bubble tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/hungertooltip:block z-50 pointer-events-none leading-relaxed normal-case">
            <div className="font-bold text-[#fbbf24] mb-0.5 border-b border-white/15 pb-1">🍽️ STATUS DE NUTRIÇÃO:</div>
            • <span className="text-red-400 font-bold">Abaixo de 30%</span>: Não produz leite/lã e perde felicidade diária.<br/>
            • <span className="text-green-400 font-bold">Acima de 70%</span>: Ganho extra de peso diário (para o Boi).
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-0.5 h-0.5 border-4 border-transparent border-t-[#fbbf24] bg-transparent" />
          </div>
        </div>
        )}

        {/* Happiness bar */}
        <div className="relative group/happinesstooltip">
          <div className="flex justify-between items-center text-xs font-sans font-extrabold uppercase tracking-wider text-[#92400e]">
            <span className="flex items-center gap-1">😊 Felicidade
              {/* IMPROVEMENT 4: Cabra bonus tooltip */}
              {animal.type !== 'cabra' && animals.some(a => a.type === 'cabra' && a.isAdult !== false) && (
                <span className="text-[8px] text-emerald-400 font-mono" title="Bônus da Cabra: +3 felicidade/dia">🐐+3</span>
              )}
            </span>
            <span>{Math.floor(animal.happiness)}%</span>
          </div>
          <div className="bg-[#e5e7eb] h-4 rounded-full overflow-hidden mt-1 border-2 border-[#d1d5db] shadow-inner relative cursor-help">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                animal.happiness < 30 ? 'bg-red-500 animate-pulse' : animal.happiness < 60 ? 'bg-yellow-400' : animal.happiness === 100 ? 'bg-gradient-to-r from-emerald-400 to-yellow-300' : 'bg-emerald-500'
              }`}
              style={{ width: `${animal.happiness}%` }}
            />
          </div>

          {/* Floating bubble tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/happinesstooltip:block z-50 pointer-events-none leading-relaxed normal-case">
            <div className="font-bold text-[#fbbf24] mb-0.5 border-b border-white/15 pb-1">😊 STATUS DE HUMOR:</div>
            • <span className="text-red-400 font-bold">Abaixo de 30%</span>: Produção reduzida de leite em 50%.<br/>
            • <span className="text-blue-400 font-bold">Acima de 80%</span>: Maior peso/lã e rapidez no crescimento.<br/>
            • <span className="text-green-400 font-bold">100% por 3 dias</span>: Torna-se Melhor Amigo de confiança!
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-0.5 h-0.5 border-4 border-transparent border-t-[#fbbf24] bg-transparent" />
          </div>
        </div>

      </div>}

      {!collapsed && (() => {
        const isReady = (animal.type === 'vaca' && animal.hasProducedToday) || (animal.type === 'ovelha' && animal.woolReady) || (animal.type === 'boi' && (animal.weightGain || 0) >= 0.8) || (animal.type === 'galinha' && animal.hasProducedToday) || (animal.type === 'cabra' && animal.isLactating && animal.hasProducedToday) || (animal.type === 'lhama' && (animal.woolAccumulated ?? 0) >= 3) || (animal.type === 'pato' && animal.hasProducedToday) || (animal.type === 'bufalo' && animal.hasProducedToday);
        return (
          <div className={`border rounded-[18px] p-3 text-center mb-4 text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 uppercase tracking-wide shadow-sm min-h-[58px] ${
            isReady
              ? 'bg-[#dcfce7] border-dashed border-[#166534] text-[#166534]'
              : 'bg-[#fffbeb] border-dashed border-[#fbbf24] text-[#92400e] '
          }`}>
            {animal.type === 'vaca' && (
              <>
                {animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥛 Balde de leite cru pronto! (colete para o Armazém)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Leite ordenhado hoje (Retorna amanhã)
                  </span>
                )}
              </>
            )}

            {animal.type === 'ovelha' && (
              <>
                {animal.woolReady ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🧶 Novelo de lã crescendo de alta qualidade!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Lã cresce em {Math.max(0, (animal.isBestFriend ? 2 : 3) - (animal.daysSinceLastWool || 0))} dias (tosquia)
                  </span>
                )}
              </>
            )}

            {animal.type === 'galinha' && (
              <>
                {animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥚 Ovo de quintal fresquinho pronto para coleta!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Próximo ovo amanhã se saudável e alimentada
                  </span>
                )}
              </>
            )}

            {animal.type === 'boi' && (
              <div className="flex flex-col gap-1 w-full uppercase">
                <div className="flex justify-between items-center w-full">
                  <span className="flex items-center gap-1 text-[11px]">
                    📈 Peso: <span className="font-mono font-black ml-1 text-xs">{Math.floor((animal.weightGain || 0.15) * 100)}%</span>
                  </span>
                  {renderGrowthBadge(animal.weightGain || 0.15)}
                </div>
                <div className="w-full bg-[#e5e7eb] h-2.5 rounded-full overflow-hidden mt-1 border border-stone-300 relative">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.floor((animal.weightGain || 0.15) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#78350f]/80 font-mono text-left border-t border-[#fbbf24]/50 pt-1 mt-1.5 leading-none self-start w-full">
                  Valor atual na Feira: 💰 ~{valueOfOx} moedas
                </div>
              </div>
            )}
            {animal.type === 'cabra' && (
              <>
                {animal.isLactating && animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥛 Leite de cabra pronto! (2 unidades)
                  </span>
                ) : animal.isLactating ? (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Leite coletado hoje (retorna amanhã)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    🔒 Secagem: {animal.lactationCycle ?? 0} dias restantes
                  </span>
                )}
              </>
            )}
            {animal.type === 'ovelha_leiteira' && (
              <>
                {animal.isLactating && animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥛 Leite de ovelha pronto! (1 unidade)
                  </span>
                ) : animal.isLactating ? (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Leite coletado hoje (retorna amanhã)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    🔒 Secagem: {animal.lactationCycle ?? 0} dias restantes
                  </span>
                )}
              </>
            )}
            {animal.type === 'lhama' && (
              <>
                {(animal.woolAccumulated ?? 0) >= 3 && Math.floor(((currentDay - 1) % 120) / 30) === 0 ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🧶 Lã de lhama pronta para colheita! ({animal.woolAccumulated}u)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    🧶 Lã acumulada: {animal.woolAccumulated ?? 0}u {Math.floor(((currentDay - 1) % 120) / 30) !== 0 ? '(colher na Primavera)' : '(mín. 3 para colher)'}
                  </span>
                )}
              </>
            )}
            {animal.type === 'pato' && (
              <>
                {animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥚 Ovo de pato pronto para coleta!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Próximo ovo de pato amanhã
                  </span>
                )}
              </>
            )}
            {animal.type === 'ganso' && (
              <>
                {(() => {
                  const season = Math.floor(((currentDay - 1) % 120) / 30);
                  const isEggSeason = season === 2 || season === 3;
                  const daysSince = animal.daysSinceLastGooseEgg ?? 0;
                  const interval = isEggSeason ? 3 : 5;
                  return daysSince >= interval ? (
                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">🥚 Ovo de ganso disponível!</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">⏳ Próximo ovo em {interval - daysSince} dia(s){!isEggSeason ? ' (fora da época)' : ''}</span>
                  );
                })()}
              </>
            )}
            {animal.type === 'bufalo' && animal.isAdult !== false && (
              <>
                {animal.hasProducedToday ? (
                  <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                    🥛 Leite de búfala pronto! {animal.heatStress ? '(2u — estresse térmico)' : '(3u)'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                    ⏳ Leite coletado hoje {animal.heatStress ? '⚠️ Estresse térmico!' : ''}
                  </span>
                )}
              </>
            )}
            {animal.type === 'pavao' && (
              <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                🦚 Animal de prestígio — bônus passivos ativos {animal.happiness > 80 ? '✅' : '❌ (felicidade < 80)'}
              </span>
            )}
            {animal.type === 'colmeia_abelhas' && (
              animal.melReady ? (
                <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                  🍯 Mel pronto para colheita!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                  ⏳ Aguardando próximo ciclo de mel
                </span>
              )
            )}
          </div>
        );
      })()}

      {!collapsed && <div className="flex gap-2 flex-wrap justify-between mt-auto">

        {/* Alimentar (Dynamic feed count based on animal type) */}
        {(() => {
          // Animais que não comem ração
          const noFeedUI = ['minhoca', 'caracol', 'bicho_seda', 'colmeia_abelhas'];
          if (noFeedUI.includes(animal.type)) {
            return <span className="text-[10px] text-stone-400 font-mono italic flex-1 flex items-center justify-center">Sem ração necessária 🌿</span>;
          }
          // BUG FIX: novos animais usam a ração correta na UI
          const feedType = (animal.type === 'vaca' || animal.type === 'boi' || animal.type === 'bufalo') ? 'racaoBovina' : animal.type === 'porco' ? 'racaoSuina' : (animal.type === 'ovelha' || animal.type === 'ovelha_leiteira' || animal.type === 'cabra' || animal.type === 'lhama' || animal.type === 'alpaca') ? 'racaoOvinos' : (animal.type === 'galinha' || animal.type === 'codorna' || animal.type === 'pavao') ? 'racaoAves' : (animal.type === 'pato' || animal.type === 'ganso') ? 'racaoAquatica' : animal.type === 'coelho_angora' ? 'racaoCoelho' : (animal.type === 'ra' || animal.type === 'avestruz' || animal.type === 'jacare') ? 'racaoCarnivora' : 'racaoBovina';
          const feedQty = inventory[feedType] ?? 0;
          const label = feedType === 'racaoBovina' ? 'Ração Bovina' : feedType === 'racaoSuina' ? 'Ração Suína' : feedType === 'racaoOvinos' ? 'Ração de Ovinos' : feedType === 'racaoAves' ? 'Ração de Aves' : feedType === 'racaoAquatica' ? 'Ração Aquática' : feedType === 'racaoCoelho' ? 'Ração de Coelhos' : 'Ração Carnívora';
          return (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onFeed(animal.id, e);
              }}
              className="bg-[#10b981] hover:bg-[#059669] active:translate-y-0.5 border-b-4 border-[#065f46] shadow-md rounded-[16px] px-4 py-2.5 font-display text-[10px] sm:text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1 flex-1 select-none transition-all hover:scale-[1.02]"
              title={`Alimentar: Consome 1un de ${label}. Estoque atual: ${feedQty}.`}
            >
              <Utensils className="w-3.5 h-3.5" /> Alimentar ({feedQty} unidades)
            </button>
          );
        })()}

        {/* Collect milk (Cows) */}
        {animal.type === 'vaca' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCollectMilk(animal.id, e);
            }}
            disabled={!animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
              animal.hasProducedToday
                ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]'
                : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
            }`}
            title={animal.hasProducedToday ? "Coletar Leite: coleta baldes de Leite Cru prontinhos para o seu Ateliê de Queijo" : "Aguarde o amanhecer para a ordenha"}
          >
            🥛 Coletar
          </button>
        )}

        {/* Chop wool (Sheep) */}
        {animal.type === 'ovelha' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCollectWool(animal.id, e);
            }}
            disabled={!animal.woolReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
              animal.woolReady
                ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]'
                : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
            }`}
            title={animal.woolReady ? "Tosquiar: extrai lã quentinha direto para o seu estoque manufaturado" : "A lã ainda está em fase de crescimento"}
          >
            <Scissors className="w-3.5 h-3.5" /> Tosquiar
          </button>
        )}

        {/* Alpaca: coletar lã */}
        {animal.type === 'alpaca' && (
          <button type="button" onClick={(e) => { e.preventDefault(); onCollectAlpacaWool(animal.id, e); }} disabled={!animal.woolReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.woolReady ? 'Tosquiar alpaca' : `Aguarde ${4 - (animal.daysSinceLastWool ?? 0)} dia(s)`}>
            <Scissors className="w-3.5 h-3.5" /> Tosquiar Alpaca
          </button>
        )}

        {/* Collect Egg (Chickens) */}
        {animal.type === 'galinha' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCollectEgg(animal.id, e);
            }}
            disabled={!animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
              animal.hasProducedToday
                ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]'
                : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
            }`}
            title={animal.hasProducedToday ? "Coletar Ovo: recolhe ovos de quintal saudáveis" : "Aguarde o próximo pôr do sol"}
          >
            🥚 Coletar
          </button>
        )}

        {/* Sell Oxen (Ox) */}
        {animal.type === 'boi' && animal.isAdult !== false && (
          pendingSellOx ? (
            <div className="flex items-center gap-1.5 bg-red-50 border-2 border-red-300 rounded-xl px-2 py-1.5 w-full">
              <span className="text-[9px] font-mono font-black text-red-700 leading-tight flex-1">Vender {animal.name}?<br/><span className="text-red-500">~{valueOfOx}💰</span></span>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellOx(false); onSellOx(animal.id, e); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellOx(false); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setPendingSellOx(true); }}
              className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
              title={`Vender Boi: venda imediata na Feira. Retorna moedas baseadas no peso (%): 💰 ~${valueOfOx}`}
            >
              💰 Vender
            </button>
          )
        )}

        {/* Abatedouro — Boi */}
        {animal.type === 'boi' && animal.isAdult !== false && abatedouroUnlocked && hasCertSanitario && sendToAbatedouro && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); sendToAbatedouro(animal.id, 'boi'); }}
            className="bg-[#7f1d1d] hover:bg-[#991b1b] border-b-4 border-[#450a0a] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
            title="Enviar ao Abatedouro — registra entrega no contrato mensal"
          >
            🏭 Abatedouro
          </button>
        )}

        {/* Sell Porco */}
        {animal.type === 'porco' && animal.isAdult !== false && (
          pendingSellPorco ? (
            <div className="flex items-center gap-1.5 bg-red-50 border-2 border-red-300 rounded-xl px-2 py-1.5 w-full">
              <span className="text-[9px] font-mono font-black text-red-700 leading-tight flex-1">Vender {animal.name}?<br/><span className="text-red-500">~{valueOfPorco}💰</span></span>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellPorco(false); onSellPorco(animal.id, e); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellPorco(false); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setPendingSellPorco(true); }}
              className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
              title={`Vender Porco: retorna moedas baseadas no peso. 💰 ~${valueOfPorco}`}
            >
              💰 Vender
            </button>
          )
        )}

        {/* Abatedouro — Porco */}
        {animal.type === 'porco' && animal.isAdult !== false && abatedouroUnlocked && hasCertSanitario && sendToAbatedouro && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); sendToAbatedouro(animal.id, 'porco'); }}
            className="bg-[#7f1d1d] hover:bg-[#991b1b] border-b-4 border-[#450a0a] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
            title="Enviar ao Abatedouro — registra entrega no contrato mensal"
          >
            🏭 Abatedouro
          </button>
        )}

        {/* Coletar Ovo de Pato */}
        {animal.type === 'pato' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectDuckEgg(animal.id, e); }}
            disabled={!animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.hasProducedToday ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title="Coletar ovo de pato"
          >
            🥚 Coletar
          </button>
        )}

        {/* Vender Animal — qualquer adulto exceto boi, porco, avestruz, jacaré, cabra, lhama e búfalo (têm botões próprios) */}
        {animal.isAdult !== false && animal.type !== 'boi' && animal.type !== 'porco' && animal.type !== 'avestruz' && animal.type !== 'jacare' && animal.type !== 'cabra' && animal.type !== 'ovelha_leiteira' && animal.type !== 'lhama' && animal.type !== 'bufalo' && animal.type !== 'ganso' && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);

          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5 animate-pulse-once">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all"
                >
                  ✅
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all"
                >
                  ❌
                </button>
              </div>
            );
          }

          return (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor. Quanto mais velho, menos vale (mín. 10%).`}
            >
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Aposentar Animal (75%+ vida útil, exceto boi) */}
        {animal.isAdult !== false && animal.age !== undefined && animal.maxAge !== undefined && animal.age >= animal.maxAge * 0.75 && animal.type !== 'boi' && animal.type !== 'porco' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onRetireAnimal(animal.id, e); }}
            className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-all"
            title="Aposentar este animal e receber parte do valor"
          >
            🏡 Aposentar
          </button>
        )}

        {/* Coletar Leite de Ovelha Leiteira — apenas adultas */}
        {animal.type === 'ovelha_leiteira' && animal.isAdult !== false && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectSheepMilk(animal.id, e); }}
            disabled={!animal.isLactating || !animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.isLactating && animal.hasProducedToday ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={!animal.isLactating ? `Em período de secagem — ${animal.lactationCycle ?? 0} dias restantes` : !animal.hasProducedToday ? 'Leite já coletado hoje' : 'Coletar leite de ovelha'}
          >
            🥛 Coletar
          </button>
        )}

        {/* Vender Ovelha Leiteira — aparece após botão de coleta */}
        {animal.type === 'ovelha_leiteira' && animal.isAdult !== false && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5 animate-pulse-once">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            );
          }
          return (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor.`}>
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Coletar Leite de Cabra — apenas adultas */}
        {animal.type === 'cabra' && animal.isAdult !== false && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectGoatMilk(animal.id, e); }}
            disabled={!animal.isLactating || !animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.isLactating && animal.hasProducedToday ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={!animal.isLactating ? `Em período de secagem — ${animal.lactationCycle ?? 0} dias restantes` : !animal.hasProducedToday ? 'Leite já coletado hoje' : 'Coletar leite de cabra'}
          >
            🥛 Coletar
          </button>
        )}

        {/* Vender Cabra — aparece após botão de coleta */}
        {animal.type === 'cabra' && animal.isAdult !== false && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5 animate-pulse-once">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            );
          }
          return (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor.`}>
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Coletar Lã de Lhama */}
        {animal.type === 'lhama' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectLlamaWool(animal.id, e); }}
            disabled={(animal.woolAccumulated ?? 0) < 3 || Math.floor(((currentDay - 1) % 120) / 30) !== 0}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${(animal.woolAccumulated ?? 0) >= 3 && Math.floor(((currentDay - 1) % 120) / 30) === 0 ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={Math.floor(((currentDay - 1) % 120) / 30) !== 0 ? 'A lhama só pode ser tosquiada na primavera 🌸' : (animal.woolAccumulated ?? 0) < 3 ? `Lã acumulada: ${animal.woolAccumulated ?? 0}/3` : 'Coletar lã de lhama'}
          >
            🧶 Lã Lhama ({animal.woolAccumulated ?? 0}u)
          </button>
        )}

        {/* Vender Lhama — após botão de coleta de lã */}
        {animal.type === 'lhama' && animal.isAdult !== false && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            );
          }
          return (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor.`}>
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Coletar Ganso (ovo ou pena) */}
        {animal.type === 'ganso' && (() => {
          const season = Math.floor(((currentDay - 1) % 120) / 30);
          const isEggSeason = season === 2 || season === 3;
          const canCollect = (animal.daysSinceLastGooseEgg ?? 0) >= (isEggSeason ? 3 : 5);
          return (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onCollectGooseProduct(animal.id, e); }}
              disabled={!canCollect}
              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${canCollect ? 'bg-teal-500 hover:bg-teal-400 border-b-4 border-teal-700 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
              title={isEggSeason ? "Coletar ovo de ganso (1 a cada 3 dias)" : "Coletar ovo de ganso (1 a cada 5 dias fora da época)"}
            >
              🥚 Coletar
            </button>
          );
        })()}

        {/* Vender Ganso — após botão de coleta */}
        {animal.type === 'ganso' && animal.isAdult !== false && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            );
          }
          return (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor.`}>
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Coletar Leite de Búfala */}
        {animal.type === 'bufalo' && animal.isAdult !== false && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectBuffaloMilk(animal.id, e); }}
            disabled={!animal.hasProducedToday}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.hasProducedToday ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title="Coletar leite de búfala"
          >
            🥛 Coletar
          </button>
        )}

        {/* Vender Búfalo — após botão de coleta de leite */}
        {animal.type === 'bufalo' && animal.isAdult !== false && (() => {
          const age = animal.age ?? 0;
          const maxAge = animal.maxAge ?? 90;
          const lifeFraction = Math.min(1, age / maxAge);
          const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
          if (pendingSell) {
            return (
              <div className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-300 rounded-xl px-2 py-1.5 animate-pulse-once">
                <span className="text-[9px] font-mono font-black text-orange-700 leading-tight">
                  Vender {animal.name}?<br/>
                  <span className="text-orange-500">~{Math.round(sellPct * 100)}% do valor</span>
                </span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); onSellAnimal(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            );
          }
          return (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSell(true); }}
              className="text-[10px] font-mono font-black px-3 py-1.5 rounded-xl border-2 border-b-4 border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:scale-[1.03] active:translate-y-0.5 cursor-pointer transition-all shadow-sm"
              title={`Vender por ~${Math.round(sellPct * 100)}% do valor.`}>
              💸 Vender ({Math.round(sellPct * 100)}%)
            </button>
          );
        })()}

        {/* Coelho Angorá: coletar lã */}
        {animal.type === 'coelho_angora' && (
          <button type="button" onClick={(e) => { e.preventDefault(); onCollectCoelhoWool(animal.id, e); }} disabled={!animal.woolReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.woolReady ? 'Tosquiar coelho angorá' : 'Aguarde'}>
            <Scissors className="w-3.5 h-3.5" /> Tosquiar Coelho
          </button>
        )}

        {/* Bicho-da-Seda: alimentar (fase Lagarta) */}
        {animal.type === 'bicho_seda' && animal.age >= 3 && animal.age <= 12 && (
          <button type="button" onClick={(e) => { e.preventDefault(); onFeedBichoSeda(animal.id, e); }}
            className="rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none bg-green-600 hover:bg-green-500 border-b-4 border-green-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]"
            title="Alimentar lagarta com folha de amoreira">
            🌿 Alimentar Lagarta
          </button>
        )}

        {/* Bicho-da-Seda: coletar seda (fase Casulo) */}
        {animal.type === 'bicho_seda' && animal.age >= 13 && animal.age <= 16 && (
          <button type="button" onClick={(e) => { e.preventDefault(); onCollectBichoSeda(animal.id, e); }} disabled={!animal.woolReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.woolReady ? 'Coletar seda bruta do casulo' : 'Casulo ainda não está pronto'}>
            🧵 Coletar Seda
          </button>
        )}

        {/* Rã: coletar coxa */}
        {animal.type === 'ra' && (
          <button type="button" onClick={(e) => { e.preventDefault(); onCollectRa(animal.id, e); }} disabled={!animal.woolReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-teal-500 hover:bg-teal-400 border-b-4 border-teal-700 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.woolReady ? 'Coletar coxa de rã' : 'Aguarde 7 dias'}>
            🍖 Coletar Rã
          </button>
        )}

        {/* Avestruz: coletar pena ou vender */}
        {animal.type === 'avestruz' && animal.isAdult !== false && (
          <>
            <button type="button" onClick={(e) => { e.preventDefault(); onCollectAvestruzPena(animal.id, e); }} disabled={!animal.woolReady}
              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
              title={animal.woolReady ? 'Coletar pena grande' : 'Aguarde'}>
              🪶 Pena Grande
            </button>
            {pendingSellAvestruz ? (
              <div className="flex items-center gap-1.5 bg-red-50 border-2 border-red-300 rounded-xl px-2 py-1.5 flex-1">
                <span className="text-[9px] font-mono font-black text-red-700 leading-tight flex-1">Abater {animal.name}?</span>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellAvestruz(false); onSellAvestruz(animal.id, e); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
                <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellAvestruz(false); }}
                  className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
              </div>
            ) : (
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellAvestruz(true); }}
                className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
                title="Abater avestruz (+180💰 + 1 carne)">
                💰 Abater
              </button>
            )}
          </>
        )}

        {/* Jacaré: vender */}
        {animal.type === 'jacare' && animal.isAdult !== false && (
          pendingSellJacare ? (
            <div className="flex items-center gap-1.5 bg-red-50 border-2 border-red-300 rounded-xl px-2 py-1.5 w-full">
              <span className="text-[9px] font-mono font-black text-red-700 leading-tight flex-1">Abater {animal.name}?{!licencaExotica && ' ⚠️'}</span>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellJacare(false); onSellJacare(animal.id, e); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-green-500 bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-all">✅</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellJacare(false); }}
                className="text-[10px] font-mono font-black px-2 py-1 rounded-lg border-2 border-b-4 border-stone-400 bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-all">❌</button>
            </div>
          ) : (
            <button type="button" onClick={(e) => { e.preventDefault(); setPendingSellJacare(true); }}
              className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
              title={`Abater jacaré (+250💰 + 1 carne). ${!licencaExotica ? '⚠️ Sem licença: risco de fiscalização!' : '✅ Licenciado'}`}>
              🐊 Abater {!licencaExotica && '⚠️'}
            </button>
          )
        )}

        {/* Colmeia de Abelhas: coletar mel */}
        {animal.type === 'colmeia_abelhas' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectMel?.(animal.id, e); }}
            disabled={!animal.melReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.melReady ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.melReady ? 'Colher mel da colmeia' : 'Mel ainda não está pronto'}
          >
            🍯 Colher Mel
          </button>
        )}

        {/* Minhocário: coletar húmus */}
        {animal.type === 'minhoca' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectHumus?.(animal.id, e); }}
            disabled={!animal.humusReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.humusReady ? 'bg-green-600 hover:bg-green-500 border-b-4 border-green-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.humusReady ? 'Coletar húmus do Minhocário' : 'Húmus ainda não está pronto'}
          >
            🌱 Coletar Húmus
          </button>
        )}

        {/* Criatório de Caracóis: coletar muco */}
        {animal.type === 'caracol' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onCollectMuco?.(animal.id, e); }}
            disabled={!animal.mucoReady}
            className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.mucoReady ? 'bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
            title={animal.mucoReady ? 'Coletar muco do Criatório de Caracóis' : 'Muco ainda não está pronto'}
          >
            🐌 Coletar Muco
          </button>
        )}

        {/* Cruzar (Layer 2: Reprodução Controlada) */}
        {licencaCriadouro && animal.isAdult !== false && reproducaoConfig[animal.type] && (() => {
          const alreadyInReproducao = reproducaoAtiva.some(r => r.animalId1 === animal.id || r.animalId2 === animal.id);
          return (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                // Fertility check: animals older than 80% of maxAge cannot reproduce
                if (animal.age && animal.maxAge && animal.age > animal.maxAge * 0.8) {
                  addLog(`❌ ${animal.name} é muito idoso para reproduzir (acima de 80% da vida útil).`, 'error');
                  return;
                }
                onSetCruzarModal({ animalId: animal.id, type: animal.type });
              }}
              disabled={alreadyInReproducao}
              className={`rounded-[16px] px-3 py-2 font-display text-[10px] text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1 transition-all select-none ${alreadyInReproducao ? 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60' : 'bg-fuchsia-500 hover:bg-fuchsia-600 border-b-2 border-fuchsia-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]'}`}
              title={alreadyInReproducao ? 'Já em gestação' : 'Iniciar reprodução controlada'}
            >
              🤝 Cruzar
            </button>
          );
        })()}
      </div>}

        {!collapsed && showProfitPanel && (() => {
          const prof = getAnimalDailyProfit(animal.type);
          const badgeColor = prof.profit > 5
            ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
            : prof.profit >= 1
            ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
            : 'bg-red-100 border-red-400 text-red-700';
          const indicator = prof.profit > 5 ? '🟢' : prof.profit >= 1 ? '🟡' : '🔴';
          return (
            <div className={`mt-2 mx-1 p-2 rounded-xl border-2 ${badgeColor} flex items-center justify-between gap-2 text-[10px] font-mono font-black`}>
              <span>{indicator} Receita: <span className="font-black">{prof.revenue}💰/dia</span></span>
              <span>Custo: {prof.cost}💰/dia</span>
              <span className={prof.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}>Lucro: {prof.profit >= 0 ? '+' : ''}{prof.profit}💰</span>
            </div>
          );
        })()}

    </motion.div>
  );
};
