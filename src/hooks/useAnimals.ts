/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Animal, AnimalType, AnimalTrait, FarmSpecialization, FarmStats, LogMessage } from '../types';
import { getRandomName, getUniqueOxName } from '../names';
import { sfx } from '../utils/audio';

// ---- Inventory type (mirrors the shape in App.tsx) ----
export type InventoryState = {
  milk: number;
  wool: number;
  cheese: number;
  scarf: number;
  egg: number;
  mayo: number;
  racaoBovina: number;
  racaoOvinos: number;
  racaoAves: number;
  racaoAquatica: number;
  racaoCoelho: number;
  racaoCarnivora: number;
  queijoCoalho: number;
  queijoMucarela: number;
  queijoBrie: number;
  goat_milk: number;
  llama_wool: number;
  duck_egg: number;
  goose_egg: number;
  buffalo_milk: number;
  buffalo_mozzarella: number;
  feather: number;
  peacock_feather: number;
  butter: number;
  yogurt: number;
  fertile_egg: number;
  quail_egg: number;
  alpaca_wool: number;
  humus: number;
  muco: number;
  angora_wool: number;
  seda_bruta: number;
  coxa_ra: number;
  carne_avestruz: number;
  pena_grande: number;
  couro_avestruz: number;
  carne_jacare: number;
  couro_jacare: number;
  folha_amoreira: number;
  sal: number;
  queijo_cabra: number;
  iogurte_cabra: number;
  leite_condensado: number;
  tapete_lhama: number;
  cachecol_angora: number;
  tecido_alpaca: number;
  fio_seda: number;
  manta_premium: number;
  pate_pato: number;
  ovo_defumado: number;
  conserva_codorna: number;
  creme_cosmetico: number;
  sabonete_natural: number;
  almofada_penas: number;
  colete_couro: number;
  bolsa_exotica: number;
  enfeite_pavao: number;
  peixe: number;
  mel: number;
  cogumelo: number;
  hidromel: number;
  risoto_cogumelo: number;
  conserva_peixe: number;
  mel_envasado: number;
  sopa_cogumelo: number;
  queijo_parmesao: number;
  queijo_serra: number;
  kit_gourmet: number;
};

export interface UseAnimalsProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  farmLevel: number;
  setFarmXp: React.Dispatch<React.SetStateAction<number>>;
  inventory: InventoryState;
  setInventory: React.Dispatch<React.SetStateAction<InventoryState>>;
  setStats: React.Dispatch<React.SetStateAction<FarmStats>>;
  setWeeklyStats: React.Dispatch<React.SetStateAction<any>>;
  setWeeklySales: React.Dispatch<React.SetStateAction<any>>;
  setProductFreshness: React.Dispatch<React.SetStateAction<any>>;
  setDailyEarning: React.Dispatch<React.SetStateAction<number>>;
  setMissions: React.Dispatch<React.SetStateAction<any[]>>;
  debt: number;
  landLots: number;
  specialization: FarmSpecialization;
  farmWisdomBonus: { vaca: number; ovelha: number; boi: number; galinha: number };
  weather: 'chuva' | 'sol' | 'nublado';
  currentDay: number;
  merchantActive: boolean;
  weeklySales: any;
  soundEnabled: boolean;
  addLog: (msg: string, type?: LogMessage['type'], overrideDay?: number) => void;
  addNotification: (message: string, type?: string, overrideDay?: number) => void;
  spawnFeedback: (emoji: string, text: string, event?: React.MouseEvent) => void;
  triggerAudioResult: (action: () => void) => void;
  updateMissionProgress: (key: string, amount?: number, overrideDay?: number) => void;
  checkAndUnlockAchievement: (id: string) => void;
  triggerConfetti: (event?: React.MouseEvent) => void;
  onFilhoteBought?: (type: AnimalType, name: string) => void;
  onFilhoteAdded?: () => void;
}

export function useAnimals({
  gold,
  setGold,
  farmLevel,
  setFarmXp,
  inventory,
  setInventory,
  setStats,
  setWeeklyStats,
  setWeeklySales,
  setProductFreshness,
  setDailyEarning,
  setMissions,
  debt,
  landLots,
  specialization,
  farmWisdomBonus,
  weather,
  currentDay,
  merchantActive,
  weeklySales,
  soundEnabled,
  addLog,
  addNotification,
  spawnFeedback,
  triggerAudioResult,
  updateMissionProgress,
  checkAndUnlockAchievement,
  triggerConfetti,
  onFilhoteBought,
  onFilhoteAdded,
}: UseAnimalsProps) {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.animals && parsed.animals.length > 0) {
          // BUG FIX: inicializa age/maxAge para animais de saves antigos que não tinham esses campos
          const baseMaxAge: Record<string, number> = { vaca: 120, ovelha: 90, boi: 150, galinha: 60 };
          return parsed.animals.map((a: Animal) => ({
            ...a,
            age: a.age ?? 0,
            maxAge: a.maxAge ?? Math.round((baseMaxAge[a.type] ?? 90) * (1 + (Math.random() * 0.4 - 0.2))),
            isAdult: a.isAdult ?? true,  // existing animals are adults by default
          }));
        }
      }
    } catch (e) {}
    return [];
  });

  const [licencaExotica, setLicencaExotica] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) { const parsed = JSON.parse(saved); return parsed.licencaExotica ?? false; }
    } catch (e) {}
    return false;
  });

  const [coelhoReproCount, setCoelhoReproCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) { const parsed = JSON.parse(saved); return parsed.coelhoReproCount ?? 0; }
    } catch (e) {}
    return 0;
  });

  // --- FUNCIONALIDADE 2: Traits dos animais ---
  const TRAITS_LIST: AnimalTrait[] = ['gulosa', 'preguicosa', 'feliz', 'estressada', 'saudavel', 'trabalhadora'];
  const getRandomTrait = (): AnimalTrait => TRAITS_LIST[Math.floor(Math.random() * TRAITS_LIST.length)];

  const getTraitInfo = (trait: AnimalTrait): { emoji: string; label: string; description: string } => {
    switch (trait) {
      case 'gulosa': return { emoji: '🍽️', label: 'Gulosa', description: 'Consome +20% de ração por dia (fome cai mais rápido)' };
      case 'preguicosa': return { emoji: '😴', label: 'Preguiçosa', description: 'Produz -15% (menos leite/lã/ovos)' };
      case 'feliz': return { emoji: '😊', label: 'Feliz', description: '+5 de felicidade por dia sem custo extra' };
      case 'estressada': return { emoji: '😰', label: 'Estressada', description: 'Perde -5 de felicidade por dia mesmo alimentada' };
      case 'saudavel': return { emoji: '💪', label: 'Saudável', description: 'Imune a eventos negativos de saúde' };
      case 'trabalhadora': return { emoji: '⚡', label: 'Trabalhadora', description: 'Produz +15%' };
    }
  };

  // Helper: get feed type and label for an animal type
  const getAnimalFeedType = (type: AnimalType): { feedType: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora'; feedLabel: string } => {
    if (type === 'vaca' || type === 'boi' || type === 'bufalo') return { feedType: 'racaoBovina', feedLabel: 'Ração Bovina' };
    if (type === 'ovelha' || type === 'cabra' || type === 'lhama' || type === 'alpaca') return { feedType: 'racaoOvinos', feedLabel: 'Ração de Ovinos' };
    if (type === 'galinha' || type === 'codorna' || type === 'pavao') return { feedType: 'racaoAves', feedLabel: 'Ração de Aves' };
    if (type === 'pato' || type === 'ganso') return { feedType: 'racaoAquatica', feedLabel: 'Ração Aquática' };
    if (type === 'coelho_angora') return { feedType: 'racaoCoelho', feedLabel: 'Ração de Coelhos' };
    if (type === 'ra' || type === 'avestruz' || type === 'jacare') return { feedType: 'racaoCarnivora', feedLabel: 'Ração Carnívora' };
    // minhoca, caracol, bicho_seda: eat nothing — but buyAnimal still checks feedType; we use racaoBovina as dummy and override qty check below
    if (type === 'minhoca' || type === 'caracol' || type === 'bicho_seda') return { feedType: 'racaoBovina', feedLabel: 'Nenhuma ração necessária' };
    // fallback
    return { feedType: 'racaoBovina', feedLabel: 'Ração Bovina' };
  };

  const getAnimalPurchasePrice = (type: AnimalType, specOverride?: FarmSpecialization): number => {
    const spec = specOverride !== undefined ? specOverride : specialization;
    let basePrice = 120; // vaca
    if (type === 'ovelha') basePrice = 80;
    if (type === 'boi') basePrice = 150;
    if (type === 'galinha') basePrice = 35;
    if (type === 'cabra') basePrice = 110;
    if (type === 'lhama') basePrice = 160;
    if (type === 'pato') basePrice = 50;
    if (type === 'ganso') basePrice = 75;
    if (type === 'bufalo') basePrice = 220;
    if (type === 'pavao') basePrice = 350;
    if (type === 'codorna') basePrice = 40;
    if (type === 'alpaca') basePrice = 200;
    if (type === 'minhoca') basePrice = 25;
    if (type === 'caracol') basePrice = 40;
    if (type === 'coelho_angora') basePrice = 130;
    if (type === 'bicho_seda') basePrice = 80;
    if (type === 'ra') basePrice = 130;
    if (type === 'avestruz') basePrice = 600;
    if (type === 'jacare') basePrice = 900;

    // Specialization purchase penalty
    const purchasePenalty =
      (spec === 'leiteira' && ['galinha','pato','ganso','ovelha','lhama'].includes(type)) ? 1.1 :
      (spec === 'fibras' && !['ovelha','lhama'].includes(type)) ? 1.1 :
      (spec === 'avicultura' && !['galinha','pato','ganso','pavao'].includes(type)) ? 1.1 : 1.0;
    basePrice = Math.round(basePrice * purchasePenalty);

    if (farmLevel >= 4) {
      return Math.round(basePrice * 0.9);
    }
    return basePrice;
  };

  const getCarneMultiplier = (d = currentDay): number => {
    const offerMult = Math.max(0.6, Math.min(1.2, 1 - ((weeklySales.carne || 0) / 100)));
    const idx = Math.floor(((d - 1) % 120) / 30);
    const estacao = idx === 0 ? 'primavera' : idx === 1 ? 'verao' : idx === 2 ? 'outono' : 'inverno';
    let seasonMult = 1.0;
    if (estacao === 'primavera') seasonMult = 1.1;
    else if (estacao === 'outono') seasonMult = 0.95;
    let mult = offerMult * seasonMult;
    if (merchantActive) {
      mult *= 1.5;
    }
    return mult;
  };

  const calculateBoiValue = (boi: Animal): number => {
    const growthFactor = boi.weightGain || 0.0;
    let base = 60 + (growthFactor * 240); // Max 300 base
    let happinessBonus = (boi.happiness / 100) * 40; // Max 40 bonus
    let finalValueBase = Math.floor(base + happinessBonus);

    if (farmLevel >= 5) {
      finalValueBase += 5; // Level 5 ox bonus
    }
    if (farmLevel > 5) {
      finalValueBase *= (1.0 + (farmLevel - 5) * 0.05);
    }

    return Math.max(20, Math.round(finalValueBase * getCarneMultiplier()));
  };

  const calcFairScore = (animal: Animal): number => {
    const traitBonus: Record<string, number> = {
      trabalhadora: 30, saudavel: 25, feliz: 20,
      estressada: -15, gulosa: -10, preguicosa: -20
    };
    const trait = animal.trait ?? 'feliz';
    const base = animal.happiness + (animal.weeklyProduction ?? 0) * 2;
    const bonus = traitBonus[trait] ?? 0;
    const campiao = animal.isCampiao ? 15 : 0;
    return Math.round(base + bonus + campiao);
  };

  // 2. Feed Animal (Consumes 1 corresponding feed item from inventory)
  const feedAnimal = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal) return;

    let feedType: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora' = 'racaoBovina';
    let feedLabel = 'Ração Bovina';
    if (animal.type === 'vaca' || animal.type === 'boi' || animal.type === 'bufalo') { feedType = 'racaoBovina'; feedLabel = 'Ração Bovina'; }
    else if (animal.type === 'ovelha' || animal.type === 'cabra' || animal.type === 'lhama' || animal.type === 'alpaca') { feedType = 'racaoOvinos'; feedLabel = 'Ração de Ovinos'; }
    else if (animal.type === 'galinha' || animal.type === 'codorna' || animal.type === 'pavao') { feedType = 'racaoAves'; feedLabel = 'Ração de Aves'; }
    else if (animal.type === 'pato' || animal.type === 'ganso') { feedType = 'racaoAquatica'; feedLabel = 'Ração Aquática'; }
    else if (animal.type === 'coelho_angora') { feedType = 'racaoCoelho'; feedLabel = 'Ração de Coelhos'; }
    else if (animal.type === 'ra' || animal.type === 'avestruz' || animal.type === 'jacare') { feedType = 'racaoCarnivora'; feedLabel = 'Ração Carnívora'; }

    if ((inventory[feedType] ?? 0) < 1) {
      addLog(`🌽 Ração insuficiente para alimentar ${animal.name}! Compre mais ${feedLabel} no Silo de Rações.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Sem Ração!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      [feedType]: prev[feedType] - 1
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          hunger: Math.min(100, a.hunger + 35),
          happiness: Math.min(100, a.happiness + 12),
          // BUG FIX: reseta contador de dias sem comida ao alimentar manualmente
          daysWithoutFood: 0
        };
      }
      return a;
    }));

    setStats(prev => ({ ...prev, totalFed: prev.totalFed + 1 }));
    addLog(`🌽 Você alimentou ${animal.name} com ${feedLabel}! +Fome +Felicidade.`, 'success');
    triggerAudioResult(() => sfx.playSound('feed'));
    if (soundEnabled) sfx.playAnimalSound(animal.type);
    spawnFeedback('❤️', '+Feliz!', event); // IMPROVEMENT 8: heart animation on feed
    // Missão: alimentar animais
    updateMissionProgress('feed_animals', 1);
  };

  // Collect Egg (Galinha)
  const collectEgg = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'galinha') return;

    if (!animal.hasProducedToday) {
      addLog(`🥚 ${animal.name} já teve seu ovo coletado ou não produziu hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    const filhoteMultiplier = animal.isAdult === false ? 0.5 : 1.0;

    let efficiency = (animal.happiness / 100) * (1 - (Math.max(0, 100 - animal.hunger) / 200));
    efficiency = Math.max(0.3, Math.min(1.2, efficiency));

    let baseOvo = 1;
    let bonus = (efficiency > 0.8) ? 1 : 0;
    let totalOvos = Math.ceil((baseOvo + (Math.random() < 0.4 ? bonus : 0)) * filhoteMultiplier);

    if (animal.isBestFriend) {
      totalOvos += 1;
    }
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      totalOvos = Math.max(1, Math.round(totalOvos * 1.15));
    } else if (animal.trait === 'preguicosa') {
      totalOvos = Math.max(1, Math.round(totalOvos * 0.85));
    }

    // Bônus de bando: cada 2 galinhas adicionais na fazenda além da primeira concede +1 ovo extra
    const totalGalinhas = animals.filter(a => a.type === 'galinha').length;
    let bandoBonus = 0;
    if (totalGalinhas > 1) {
      const flockBonusTotal = Math.floor((totalGalinhas - 1) / 2);
      if (flockBonusTotal > 0 && Math.random() < (flockBonusTotal / totalGalinhas)) {
        bandoBonus = 1;
        totalOvos += 1;
      }
    }

    if (weather === 'chuva') {
      totalOvos = Math.max(1, Math.round(totalOvos * 0.8));
    }
    // Bônus de especialização avicultura
    const specBonusEgg = specialization === 'avicultura' ? 1.2 : 1.0;
    totalOvos = Math.round(totalOvos * specBonusEgg);
    // Apply champion bonus
    if (animal.isCampiao) totalOvos = Math.round(totalOvos * 1.1);

    setInventory(prev => ({
      ...prev,
      egg: (prev.egg ?? 0) + totalOvos
    }));
    // BUG FIX: reseta frescor ao coletar ovos frescos
    setProductFreshness((prev: any) => ({ ...prev, egg: 3 }));

    setStats(prev => ({
      ...prev,
      totalCollected: prev.totalCollected + totalOvos,
      totalEggs: ((prev as any).totalEggs || 0) + totalOvos
    }));

    setWeeklyStats((prev: any) => ({
      ...prev,
      egg: (prev.egg ?? 0) + totalOvos
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, hasProducedToday: false, weeklyProduction: (a.weeklyProduction ?? 0) + totalOvos };
      }
      return a;
    }));

    const bandoTxt = bandoBonus > 0 ? ` (com +${bandoBonus} ovos extras de bônus do efeito de bando!)` : '';
    const filhotePrefixEgg = animal.isAdult === false ? '🍼 ' : '';
    addLog(`${filhotePrefixEgg}🥚 ${animal.name} produziu ${totalOvos} ovo(s) de quintal enviado(s) ao Armazém!${bandoTxt}`, 'success');
    triggerAudioResult(() => sfx.playSound('egg'));
    // F12: som de animal
    if (soundEnabled) sfx.playAnimalSound('galinha');
    spawnFeedback('🥚', `+${totalOvos} Ovo`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', totalOvos);
  };

  // Collect Goat Milk (Cabra)
  const collectGoatMilk = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'cabra') return;

    if (!animal.isLactating) {
      addLog(`🐐 ${animal.name} não está em lactação agora! Aguarde ${animal.lactationCycle ?? 0} dia(s).`, 'error');
      spawnFeedback('⏳', 'Secagem', event);
      return;
    }
    if (!animal.hasProducedToday) {
      addLog(`🐐 ${animal.name} já teve o leite coletado hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    const filhoteMultiplier = animal.isAdult === false ? 0.5 : 1.0;
    let qty = Math.ceil(2 * filhoteMultiplier);
    if (animal.trait === 'trabalhadora') qty = Math.max(1, qty + 1);
    if (animal.trait === 'preguicosa') qty = Math.max(1, qty - 1);
    qty = Math.round(qty * (specialization === 'leiteira' ? 1.2 : 1.0));

    setInventory(prev => ({ ...prev, goat_milk: (prev.goat_milk ?? 0) + qty }));
    // BUG FIX: reseta frescor ao coletar leite de cabra fresco
    setProductFreshness((prev: any) => ({ ...prev, goat_milk: 3 }));
    setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, hasProducedToday: false } : a));
    const filhotePrefixGoat = animal.isAdult === false ? '🍼 ' : '';
    addLog(`${filhotePrefixGoat}🐐 ${animal.name} produziu ${qty} leite(s) de cabra!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (soundEnabled) sfx.playAnimalSound('cabra');
    spawnFeedback('🥛', `+${qty} Leite Cabra`, event);
    updateMissionProgress('collect_items', qty);
  };

  // Collect Llama Wool (Lhama) — only in spring (season 0)
  const collectLlamaWool = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'lhama') return;

    const currentSeason = Math.floor(((currentDay - 1) % 120) / 30);
    if (currentSeason !== 0) {
      addLog(`🦙 ${animal.name}: a lã de lhama só pode ser colhida na Primavera!`, 'error');
      spawnFeedback('⏳', 'Fora de época', event);
      return;
    }
    if ((animal.woolAccumulated ?? 0) < 3) {
      addLog(`🦙 ${animal.name} acumulou apenas ${animal.woolAccumulated ?? 0} lã(s). Precisa de pelo menos 3.`, 'error');
      spawnFeedback('⏳', `${animal.woolAccumulated ?? 0}/3 lã`, event);
      return;
    }

    const llamaSpecBonus = specialization === 'fibras' ? 1.2 : 1.0;
    const qty = Math.round((animal.woolAccumulated ?? 0) * llamaSpecBonus);
    setInventory(prev => ({ ...prev, llama_wool: (prev.llama_wool ?? 0) + qty }));
    setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, woolAccumulated: 0 } : a));
    addLog(`🦙 ${animal.name} foi tosquiada! +${qty} lã de lhama no Armazém.`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (soundEnabled) sfx.playAnimalSound('lhama');
    spawnFeedback('🧶', `+${qty} Lã Lhama`, event);
    updateMissionProgress('collect_items', qty);
  };

  // Collect Duck Egg (Pato)
  const collectDuckEgg = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'pato') return;

    if (animal.isAdult === false) {
      addLog(`🍼 ${animal.name} ainda é um filhote e não produz ovos!`, 'error');
      spawnFeedback('🍼', 'Filhote!', event);
      return;
    }

    if (!animal.hasProducedToday) {
      addLog(`🦆 ${animal.name} não botou ovo hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    const currentSeason = Math.floor(((currentDay - 1) % 120) / 30);
    let qty = 1;
    if (currentSeason === 0) { // Spring: 50% chance of 2
      if (Math.random() < 0.5) qty = 2;
    } else if (currentSeason === 2) { // Autumn: -25% chance
      if (Math.random() < 0.25) qty = 0;
    } else if (currentSeason === 3) { // Winter: 70% chance nothing
      if (Math.random() < 0.7) qty = 0;
    }
    qty = Math.max(0, qty);

    if (animal.trait === 'trabalhadora') qty = Math.max(1, qty + 1);
    if (animal.trait === 'preguicosa') qty = Math.max(0, qty - 1);

    // Feather chance
    const featherChance = currentSeason === 0 ? 0.5 : 0.3;
    const gotFeather = Math.random() < featherChance;

    setInventory(prev => ({
      ...prev,
      duck_egg: (prev.duck_egg ?? 0) + qty,
      feather: (prev.feather ?? 0) + (gotFeather ? 1 : 0)
    }));
    // BUG FIX: reseta frescor ao coletar ovos de pato frescos
    if (qty > 0) setProductFreshness((prev: any) => ({ ...prev, duck_egg: 3 }));
    setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + qty + (gotFeather ? 1 : 0) }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, hasProducedToday: false, feathersReady: false } : a));

    const featherTxt = gotFeather ? ' + 🪶 1 pena!' : '';
    addLog(`🦆 ${animal.name} botou ${qty} ovo(s) de pato!${featherTxt}`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (soundEnabled) sfx.playAnimalSound('pato');
    spawnFeedback('🥚', `+${qty} Ovo Pato`, event);
    if (qty > 0) updateMissionProgress('collect_items', qty);
  };

  // Collect Goose Egg / Feather (Ganso)
  const collectGooseProduct = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'ganso') return;

    const currentSeason = Math.floor(((currentDay - 1) % 120) / 30);
    const isLayingSeason = currentSeason === 2 || currentSeason === 3; // outono or inverno

    if (isLayingSeason) {
      // Egg every 3 days
      const daysSince = animal.daysSinceLastGooseEgg ?? 0;
      if (daysSince < 3) {
        addLog(`🦢 ${animal.name}: ovo de ganso disponível em ${3 - daysSince} dia(s).`, 'error');
        spawnFeedback('⏳', `${3 - daysSince}d`, event);
        return;
      }
      setInventory(prev => ({ ...prev, goose_egg: (prev.goose_egg ?? 0) + 1 }));
      // BUG FIX: reseta frescor ao coletar ovo de ganso fresco
      setProductFreshness((prev: any) => ({ ...prev, goose_egg: 3 }));
      setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + 1 }));
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, daysSinceLastGooseEgg: 0 } : a));
      addLog(`🦢 ${animal.name} botou 1 ovo de ganso! (Vale 50 moedas!)`, 'success');
      triggerAudioResult(() => sfx.playSound('collect'));
      if (soundEnabled) sfx.playAnimalSound('ganso');
      spawnFeedback('🥚', '+1 Ovo Ganso', event);
      updateMissionProgress('collect_items', 1);
    } else {
      // Feather every 7 days
      const daysSinceFeather = animal.daysSinceLastGooseFeather ?? 0;
      if (daysSinceFeather < 7) {
        addLog(`🦢 ${animal.name}: pena disponível em ${7 - daysSinceFeather} dia(s). (Fora da época de postura)`, 'error');
        spawnFeedback('⏳', `${7 - daysSinceFeather}d`, event);
        return;
      }
      setInventory(prev => ({ ...prev, feather: (prev.feather ?? 0) + 1 }));
      setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + 1 }));
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, daysSinceLastGooseFeather: 0 } : a));
      addLog(`🦢 ${animal.name} soltou 1 pena fora da época de postura.`, 'success');
      triggerAudioResult(() => sfx.playSound('collect'));
      spawnFeedback('🪶', '+1 Pena', event);
    }
  };

  // Collect Buffalo Milk (Búfalo)
  const collectBuffaloMilk = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'bufalo') return;

    if (!animal.hasProducedToday) {
      addLog(`🐃 ${animal.name} já foi ordenhada hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    const filhoteMultiplier = animal.isAdult === false ? 0.5 : 1.0;
    const currentSeason = Math.floor(((currentDay - 1) % 120) / 30);
    let qty = 3;
    if (currentSeason === 1 || animal.heatStress) qty = 2; // Summer heat stress

    if (animal.trait === 'trabalhadora') qty = Math.max(1, qty + 1);
    if (animal.trait === 'preguicosa') qty = Math.max(1, qty - 1);
    qty = Math.max(1, Math.round(qty * (specialization === 'leiteira' ? 1.2 : 1.0) * filhoteMultiplier));

    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) + qty }));
    // BUG FIX: reseta frescor ao coletar leite de búfala fresco
    setProductFreshness((prev: any) => ({ ...prev, buffalo_milk: 3 }));
    setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, hasProducedToday: false } : a));
    addLog(`🐃 ${animal.name} produziu ${qty} leite(s) de búfala${animal.heatStress ? ' (reduzido pelo calor!)' : ''}!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (soundEnabled) sfx.playAnimalSound('bufalo');
    spawnFeedback('🥛', `+${qty} Leite Búfala`, event);
    updateMissionProgress('collect_items', qty);
  };

  // 3. Collect Milk (Vaca)
  const collectMilk = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'vaca') return;

    if (!animal.hasProducedToday) {
      addLog(`🥛 ${animal.name} já foi ordenhada ou não produziu leite hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }
    // F12: som de animal
    if (soundEnabled) sfx.playAnimalSound('vaca');

    const filhoteMultiplier = animal.isAdult === false ? 0.5 : 1.0;
    let efficiency = (animal.happiness / 100) * (1 - (Math.max(0, 100 - animal.hunger) / 200));
    efficiency = Math.max(0.3, Math.min(1.2, efficiency));

    let baseLeite = 1;
    let bonus = (efficiency > 0.8) ? 1 : 0;
    let totalLeite = baseLeite + (Math.random() < 0.3 ? bonus : 0);

    // Apply Best Friend, Sol Forte, and Chuva factors
    if (animal.isBestFriend) {
      totalLeite += 1;
    }
    if (weather === 'sol') {
      totalLeite += 1;
    }
    if (weather === 'chuva') {
      totalLeite = Math.max(1, Math.round(totalLeite * 0.8));
    }
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      totalLeite = Math.max(1, Math.round(totalLeite * 1.15));
    } else if (animal.trait === 'preguicosa') {
      totalLeite = Math.max(1, Math.round(totalLeite * 0.85));
    }
    // F1: idoso produz 30% menos + F2: bônus de sabedoria permanente de animais falecidos
    if (animal.age !== undefined && animal.maxAge !== undefined && animal.age >= animal.maxAge * 0.75) {
      totalLeite = Math.max(1, Math.round(totalLeite * 0.7));
    }
    // F2: bônus de sabedoria de rebanho (de animais idosos vivos desta espécie)
    const elderVacas = animals.filter(a => a.type === 'vaca' && a.id !== animal.id && a.age !== undefined && a.maxAge !== undefined && a.age >= a.maxAge * 0.75).length;
    const elderBonus = Math.min(0.1, elderVacas * 0.02) + farmWisdomBonus.vaca;
    if (elderBonus > 0) totalLeite = Math.max(1, Math.round(totalLeite * (1 + elderBonus)));
    // Bônus de especialização leiteira
    const specBonusMilk = specialization === 'leiteira' ? 1.2 : 1.0;
    totalLeite = Math.round(totalLeite * specBonusMilk * filhoteMultiplier);
    totalLeite = Math.max(1, totalLeite);
    // Bônus de campeão de raça (+10% produção)
    if (animal.isCampiao) totalLeite = Math.round(totalLeite * 1.1);

    setInventory(prev => ({ ...prev, milk: prev.milk + totalLeite }));
    setProductFreshness((prev: any) => ({ ...prev, milk: 3 }));
    setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + totalLeite, totalMilk: ((prev as any).totalMilk || 0) + totalLeite }));
    setWeeklyStats((prev: any) => ({ ...prev, milk: prev.milk + totalLeite }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, hasProducedToday: false, weeklyProduction: (a.weeklyProduction ?? 0) + totalLeite } : a));

    addLog(`🥛 ${animal.name} produziu ${totalLeite} balde(s) de leite cru enviados ao Armazém!`, 'success');
    setFarmXp(prev => prev + totalLeite);
    triggerAudioResult(() => sfx.playSound('milk'));
    spawnFeedback('🥛', `+${totalLeite} Leite`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', totalLeite);
  };

  // 4. Collect Wool (Ovelha)
  const collectWool = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'ovelha') return;

    if (!animal.woolReady) {
      addLog(`🐑 ${animal.name} ainda está crescendo a lã!`, 'error');
      spawnFeedback('⏳', 'Sem lã', event);
      return;
    }

    const filhoteMultiplierWool = animal.isAdult === false ? 0.5 : 1.0;
    let quality = (animal.happiness / 100) * (animal.hunger / 100);
    let woolBonus = quality > 0.7 ? 2 : 1;
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      woolBonus = Math.max(1, Math.round(woolBonus * 1.15));
    } else if (animal.trait === 'preguicosa') {
      woolBonus = Math.max(1, Math.round(woolBonus * 0.85));
    }
    // F1: idoso produz 30% menos
    if (animal.age !== undefined && animal.maxAge !== undefined && animal.age >= animal.maxAge * 0.75) {
      woolBonus = Math.max(1, Math.round(woolBonus * 0.7));
    }
    // F2: bônus de sabedoria de ovelhas idosas
    const elderOvelhas = animals.filter(a => a.type === 'ovelha' && a.id !== animal.id && a.age !== undefined && a.maxAge !== undefined && a.age >= a.maxAge * 0.75).length;
    const elderOvelhaBonus = Math.min(0.1, elderOvelhas * 0.02) + farmWisdomBonus.ovelha;
    if (elderOvelhaBonus > 0) woolBonus = Math.max(1, Math.round(woolBonus * (1 + elderOvelhaBonus)));
    // Bônus de especialização fibras
    const specBonusWool = specialization === 'fibras' ? 1.2 : 1.0;
    woolBonus = Math.max(1, Math.round(woolBonus * specBonusWool * filhoteMultiplierWool));
    // Apply champion bonus
    if (animal.isCampiao) woolBonus = Math.round(woolBonus * 1.1);

    setInventory(prev => ({
      ...prev,
      wool: prev.wool + woolBonus
    }));

    setStats(prev => ({
      ...prev,
      totalCollected: prev.totalCollected + 1,
      totalWool: ((prev as any).totalWool || 0) + woolBonus
    }));

    setWeeklyStats((prev: any) => ({
      ...prev,
      wool: prev.wool + woolBonus
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          woolReady: false,
          daysSinceLastWool: 0,
          weeklyProduction: (a.weeklyProduction ?? 0) + woolBonus
        };
      }
      return a;
    }));

    addLog(`🧶 ${animal.name} foi tosquiada! Adicionado +${woolBonus} lã(s) crua(s) no Armazém.`, 'success');
    setFarmXp(prev => prev + woolBonus);
    triggerAudioResult(() => sfx.playSound('shear'));
    // F12: som de animal
    if (soundEnabled) sfx.playAnimalSound('ovelha');
    spawnFeedback('🧶', `+${woolBonus} Lã`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', woolBonus);
  };

  // Collect Alpaca Wool
  const collectAlpacaWool = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'alpaca') return;
    if (!animal.woolReady) { addLog(`🦙 ${animal.name} ainda não está pronta para tosquia!`, 'error'); spawnFeedback('⏳', 'Aguarde', event); return; }
    const qty = specialization === 'fibras' ? 2 : 1;
    setInventory(prev => ({ ...prev, alpaca_wool: (prev.alpaca_wool ?? 0) + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, woolReady: false, daysSinceLastWool: 0 } : a));
    addLog(`🦙 ${animal.name} (alpaca) foi tosquiada! +${qty} lã de alpaca.`, 'success');
    setFarmXp(prev => prev + qty);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', `+${qty} Lã Alpaca`, event);
  };

  // Collect Coelho Angorá Wool
  const collectCoelhoWool = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'coelho_angora') return;
    if (!animal.woolReady) { addLog(`🐰 ${animal.name} ainda não está pronto para tosquia!`, 'error'); spawnFeedback('⏳', 'Aguarde', event); return; }
    const qty = specialization === 'fibras' ? 2 : 1;
    setInventory(prev => ({ ...prev, angora_wool: (prev.angora_wool ?? 0) + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, woolReady: false, daysSinceLastWool: 0 } : a));
    addLog(`🐰 ${animal.name} (coelho angorá) tosquiado! +${qty} lã angorá.`, 'success');
    setFarmXp(prev => prev + qty);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', `+${qty} Lã Angorá`, event);
  };

  // Collect Rã coxa
  const collectRa = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'ra') return;
    if (!animal.woolReady) { addLog(`🐸 ${animal.name} ainda não está pronta para coleta!`, 'error'); spawnFeedback('⏳', 'Aguarde', event); return; }
    const qty = weather === 'chuva' ? 2 : 1;
    setInventory(prev => ({ ...prev, coxa_ra: (prev.coxa_ra ?? 0) + qty }));
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, woolReady: false, daysSinceLastWool: 0 } : a));
    addLog(`🐸 ${animal.name} (rã) coletada! +${qty} coxa de rã.`, 'success');
    setFarmXp(prev => prev + qty);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🍖', `+${qty} Coxa Rã`, event);
  };

  // Collect Avestruz pena_grande
  const collectAvestruzPena = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'avestruz') return;
    if (!animal.woolReady) { addLog(`🦤 ${animal.name} ainda não tem penas prontas!`, 'error'); spawnFeedback('⏳', 'Aguarde', event); return; }
    const qty = specialization === 'exotica' ? 2 : 1;
    setInventory(prev => {
      const newTotal = (prev.pena_grande ?? 0) + qty;
      if (newTotal >= 5) checkAndUnlockAchievement('rare_feathers');
      return { ...prev, pena_grande: newTotal };
    });
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, woolReady: false, daysSinceLastWool: 0 } : a));
    addLog(`🦤 ${animal.name} (avestruz) soltou penas! +${qty} pena grande.`, 'success');
    setFarmXp(prev => prev + qty);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🪶', `+${qty} Pena Grande`, event);
  };

  // Sell Avestruz (carne)
  const sellAvestruz = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'avestruz') return;
    const basePrice = 180;
    const price = specialization === 'exotica' ? Math.round(basePrice * 1.25) : basePrice;
    setGold(prev => prev + price);
    setDailyEarning(prev => prev + price);
    setInventory(prev => ({ ...prev, carne_avestruz: (prev.carne_avestruz ?? 0) + 1 }));
    setAnimals(prev => prev.filter(a => a.id !== id));
    addLog(`🦤 ${animal.name} (avestruz) foi abatida! +${price} moedas e +1 carne de avestruz no estoque.`, 'success');
    setFarmXp(prev => prev + 10);
    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('💰', `+${price} 💰`, event);
  };

  // Sell Jacaré (carne)
  const sellJacare = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'jacare') return;
    const basePrice = 250;
    const price = specialization === 'exotica' ? Math.round(basePrice * 1.25) : basePrice;
    setGold(prev => prev + price);
    setDailyEarning(prev => prev + price);
    setInventory(prev => ({ ...prev, carne_jacare: (prev.carne_jacare ?? 0) + 1 }));
    setAnimals(prev => prev.filter(a => a.id !== id));
    addLog(`🐊 ${animal.name} (jacaré) foi abatido! +${price} moedas e +1 carne de jacaré no estoque.`, 'success');
    setFarmXp(prev => prev + 10);
    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('💰', `+${price} 💰`, event);
  };

  // 5. Sell Ox (Boi)
  const sellOx = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'boi') return;
    if (animal.isAdult === false) {
      addLog('🐂 O filhote precisa crescer antes de ser vendido!', 'error');
      return;
    }

    const value = calculateBoiValue(animal);

    setGold(prev => prev + value);
    setDailyEarning(prev => prev + value);
    setStats(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + value,
      totalSold: prev.totalSold + 1,
      totalOxSold: ((prev as any).totalOxSold || 0) + 1,
      totalMerchantTrades: merchantActive ? ((prev as any).totalMerchantTrades || 0) + 1 : ((prev as any).totalMerchantTrades || 0)
    }));

    setWeeklyStats((prev: any) => ({
      ...prev,
      earnings: prev.earnings + value,
      oxSold: prev.oxSold + 1
    }));

    // Update weeklySales count for carne
    setWeeklySales((prev: any) => ({
      ...prev,
      carne: (prev.carne || 0) + 1
    }));

    // Remove ox
    setAnimals(prev => prev.filter(a => a.id !== id));
    addLog(`💰 ${animal.name} (Boi) foi vendido na feira por ${value} moedas!`, 'success');

    triggerAudioResult(() => sfx.playSound('sell_animal'));
    triggerConfetti(event);
    spawnFeedback('💰', `+${value} 💰`, event);
  };

  // Sell Animal — any adult at depreciated value (filhotes blocked)
  const sellAnimal = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal) return;
    if (animal.isAdult === false) {
      addLog(`❌ Filhotes não podem ser vendidos — aguarde crescerem!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    const purchasePrice = getAnimalPurchasePrice(animal.type);
    const age = animal.age ?? 0;
    const maxAge = animal.maxAge ?? 90;
    // Value depreciates linearly from 80% (young) to 10% (near end of life)
    const lifeFraction = Math.min(1, age / maxAge);
    const sellPct = Math.max(0.10, 0.80 - lifeFraction * 0.70);
    const value = Math.max(5, Math.round(purchasePrice * sellPct));
    setAnimals(prev => prev.filter(a => a.id !== id));
    setGold(prev => prev + value);
    addLog(`💰 ${animal.name} foi vendido por ${value}💰 (${Math.round(sellPct * 100)}% do valor original).`, 'success');
    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('💰', `+${value}💰`, event);
  };

  // Retire Animal (elderly animals 75%+ of maxAge)
  const retireAnimal = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal) return;
    if (!animal.age || !animal.maxAge || animal.age < animal.maxAge * 0.75) {
      addLog(`❌ ${animal.name} ainda não está em idade de aposentadoria (precisa ter 75%+ da vida).`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    const purchasePrice = getAnimalPurchasePrice(animal.type);
    const ratio = animal.age / animal.maxAge;
    const retirePct = animal.isVeteran ? 0.5 : ratio >= 0.9 ? 0.2 : 0.3;
    const value = Math.max(5, Math.round(purchasePrice * retirePct));
    setAnimals(prev => prev.filter(a => a.id !== id));
    setGold(prev => prev + value);
    addLog(`🏡 ${animal.name} foi aposentado com carinho! Você recebeu ${value}💰 de gratidão.`, 'success');
    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('🏡', `+${value}💰`, event);
  };

  // 6. Buy Animal (Feira / Mercado)
  const buyAnimal = (type: AnimalType, event: React.MouseEvent) => {
    if (event) event.preventDefault();

    // Verificar dívida (não pode comprar animais com dívida > 200)
    if (debt > 200) {
      addLog(`💳 Você tem uma dívida de ${debt} moedas! Quite a dívida antes de comprar animais.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Dívida Alta!', event);
      return;
    }

    // F7: limite baseado em lotes de terreno
    const maxAnimals = landLots * 5;
    if (animals.length >= maxAnimals) {
      addLog(`❌ Limite de animais alcançado! Seu terreno (${landLots} lote(s)) suporta no máximo ${maxAnimals} animais. Expanda o terreno nas Melhorias!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Expanda o terreno!', event);
      return;
    }

    const price = getAnimalPurchasePrice(type);
    if (gold < price) {
      addLog(`💰 Moedas insuficientes para fechar negócio! Compre quando tiver ${price} moedas.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }

    // Level unlock checks for new animals
    if (type === 'pato' && farmLevel < 3) { addLog('🔒 Pato de Quintal requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'codorna' && farmLevel < 3) { addLog('🔒 Codorna requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'alpaca' && farmLevel < 5) { addLog('🔒 Alpaca requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'minhoca' && farmLevel < 6) { addLog('🔒 Minhoca requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'caracol' && farmLevel < 7) { addLog('🔒 Caracol requer Nível 7!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'coelho_angora' && farmLevel < 8) { addLog('🔒 Coelho Angorá requer Nível 8!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'bicho_seda' && farmLevel < 10) { addLog('🔒 Bicho-da-Seda requer Nível 10!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'ra' && farmLevel < 12) { addLog('🔒 Rã requer Nível 12!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'avestruz' && farmLevel < 15) { addLog('🔒 Avestruz requer Nível 15!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if (type === 'jacare' && farmLevel < 18) { addLog('🔒 Jacaré requer Nível 18!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }

    // Verificar ração disponível
    const { feedType, feedLabel } = getAnimalFeedType(type);
    const noFeedAnimals = ['minhoca', 'caracol', 'bicho_seda'];
    if (!noFeedAnimals.includes(type) && (inventory[feedType] ?? 0) < 1) {
      addLog(`🌾 Você precisa de 1 saco de ${feedLabel} para trazer o animal. Compre na loja!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', `Falta ${feedLabel}!`, event);
      return;
    }

    const name = type === 'boi' ? getUniqueOxName(animals) : getRandomName(type);
    const newId = animals.length > 0 ? Math.max(...animals.map(a => a.id)) + 1 : 1;

    // Custom initial stats
    const happiness = Math.floor(Math.random() * 21) + 60; // between 60 and 80

    // F1: maxAge por tipo com variação ±20%
    const baseMaxAgeMap: Record<string, number> = { vaca: 120, ovelha: 90, boi: 150, galinha: 60, cabra: 200, lhama: 180, pato: 80, ganso: 150, bufalo: 220, pavao: 160, codorna: 60, alpaca: 180, minhoca: 365, caracol: 200, coelho_angora: 100, bicho_seda: 60, ra: 120, avestruz: 365, jacare: 400 };
    const baseMaxAge = baseMaxAgeMap[type] ?? 90;
    const variation = 1 + (Math.random() * 0.4 - 0.2);
    const maxAge = Math.round(baseMaxAge * variation);

    const newAnimal: Animal = {
      id: newId,
      type,
      name,
      hunger: noFeedAnimals.includes(type) ? 100 : 60, // minhoca/caracol/bicho_seda always full
      happiness: noFeedAnimals.includes(type) ? 100 : happiness,
      consecutiveHappyDays: 0,
      daysBelow80: 0,
      isBestFriend: false,
      trait: getRandomTrait(),
      age: 0,
      maxAge,
      isAdult: true,
      ...(type === 'vaca' && { hasProducedToday: false }),
      ...(type === 'ovelha' && { daysUntilWool: 3, daysSinceLastWool: 2, woolReady: false }),
      ...(type === 'galinha' && { hasProducedToday: false }),
      ...(type === 'boi' && { weightGain: 0.10 }),
      ...(type === 'cabra' && { isLactating: true, lactationCycle: 0, hasProducedToday: false }),
      ...(type === 'lhama' && { woolAccumulated: 0 }),
      ...(type === 'pato' && { hasProducedToday: false, feathersReady: false }),
      ...(type === 'ganso' && { inLayingSeason: false, daysSinceLastGooseEgg: 0, daysSinceLastGooseFeather: 0, hasProducedToday: false }),
      ...(type === 'bufalo' && { hasProducedToday: false, heatStress: false }),
      ...(type === 'pavao' && { hasProducedToday: false }),
      ...(type === 'codorna' && { hasProducedToday: false }),
      ...(type === 'alpaca' && { daysUntilWool: 4, daysSinceLastWool: 0, woolReady: false, heatStress: false }),
      ...(type === 'coelho_angora' && { daysUntilWool: 5, daysSinceLastWool: 0, woolReady: false }),
      ...(type === 'avestruz' && { daysUntilWool: 7, daysSinceLastWool: 0, woolReady: false }), // woolReady = pena_grande ready
    };

    // Deduzir ração do inventário (minhoca, caracol, bicho_seda não consomem)
    if (!noFeedAnimals.includes(type)) {
      setInventory(prev => ({ ...prev, [feedType]: (prev[feedType] ?? 0) - 1 }));
    }

    setGold(prev => prev - price);
    setAnimals(prev => [...prev, newAnimal]);
    setWeeklyStats((prev: any) => ({ ...prev, spending: prev.spending + price }));

    let typeLabel = '🐄 Vaca';
    if (type === 'ovelha') typeLabel = '🐑 Ovelha';
    else if (type === 'boi') typeLabel = '🐂 Boi';
    else if (type === 'galinha') typeLabel = '🐔 Galinha';
    else if (type === 'cabra') typeLabel = '🐐 Cabra';
    else if (type === 'lhama') typeLabel = '🦙 Lhama';
    else if (type === 'pato') typeLabel = '🦆 Pato';
    else if (type === 'ganso') typeLabel = '🦢 Ganso';
    else if (type === 'bufalo') typeLabel = '🐃 Búfalo';
    else if (type === 'pavao') typeLabel = '🦚 Pavão';
    else if (type === 'codorna') typeLabel = '🐦 Codorna';
    else if (type === 'alpaca') typeLabel = '🦙 Alpaca';
    else if (type === 'minhoca') typeLabel = '🪱 Minhoca';
    else if (type === 'caracol') typeLabel = '🐌 Caracol';
    else if (type === 'coelho_angora') typeLabel = '🐰 Coelho Angorá';
    else if (type === 'bicho_seda') typeLabel = '🐛 Bicho-da-Seda';
    else if (type === 'ra') typeLabel = '🐸 Rã';
    else if (type === 'avestruz') typeLabel = '🦤 Avestruz';
    else if (type === 'jacare') typeLabel = '🐊 Jacaré';

    const feedMsg = noFeedAnimals.includes(type) ? 'chegou à fazenda!' : 'chegou à fazenda e foi alimentado com 1 saco de ração!';
    addLog(`🐄 ${newAnimal.name} ${feedMsg}`, 'success');
    addLog(`✨ Parabéns! Você comprou ${newAnimal.name} (${typeLabel}) por ${price} moedas!`, 'success');
    setFarmXp(prev => prev + 5);
    triggerAudioResult(() => sfx.playSound('purchase'));
    spawnFeedback('🎁', `-${price} 💰`, event);
    if (type === 'jacare') setTimeout(() => checkAndUnlockAchievement('exotic_farmer'), 0);
  };

  // Filhote prices and days to adult
  const FILHOTE_CONFIG: Partial<Record<AnimalType, { price: number; daysToAdult: number }>> = {
    vaca: { price: 60, daysToAdult: 10 },
    boi: { price: 75, daysToAdult: 15 },
    bufalo: { price: 110, daysToAdult: 12 },
    cabra: { price: 55, daysToAdult: 8 },
    pavao: { price: 175, daysToAdult: 20 },
    ovelha: { price: 40, daysToAdult: 8 },
    pato: { price: 25, daysToAdult: 6 },
  };

  const buyAnimalFilhote = (type: AnimalType, event: React.MouseEvent) => {
    if (event) event.preventDefault();

    const config = FILHOTE_CONFIG[type];
    if (!config) {
      addLog(`❌ Este animal não tem opção de filhote.`, 'error');
      return;
    }

    if (debt > 200) {
      addLog(`💳 Você tem uma dívida de ${debt} moedas! Quite a dívida antes de comprar animais.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Dívida Alta!', event);
      return;
    }

    const maxAnimals = landLots * 5;
    if (animals.length >= maxAnimals) {
      addLog(`❌ Limite de animais alcançado! Expanda o terreno nas Melhorias!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Expanda o terreno!', event);
      return;
    }

    if (gold < config.price) {
      addLog(`💰 Moedas insuficientes! Precisa de ${config.price} moedas para comprar o filhote.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }

    const { feedType, feedLabel } = getAnimalFeedType(type);
    const noFeedAnimals = ['minhoca', 'caracol', 'bicho_seda'];
    if (!noFeedAnimals.includes(type) && (inventory[feedType] ?? 0) < 1) {
      addLog(`🌾 Você precisa de 1 saco de ${feedLabel} para trazer o filhote. Compre na loja!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', `Falta ${feedLabel}!`, event);
      return;
    }

    const name = type === 'boi' ? getUniqueOxName(animals) : getRandomName(type);
    const newId = animals.length > 0 ? Math.max(...animals.map(a => a.id)) + 1 : 1;
    const happiness = Math.floor(Math.random() * 21) + 60;
    const baseMaxAgeMap: Record<string, number> = { vaca: 120, ovelha: 90, boi: 150, galinha: 60, cabra: 200, lhama: 180, pato: 80, ganso: 150, bufalo: 220, pavao: 160, codorna: 60, alpaca: 180, minhoca: 365, caracol: 200, coelho_angora: 100, bicho_seda: 60, ra: 120, avestruz: 365, jacare: 400 };
    const baseMaxAge = baseMaxAgeMap[type] ?? 90;
    const variation = 1 + (Math.random() * 0.4 - 0.2);
    const maxAge = Math.round(baseMaxAge * variation);

    const newFilhote: Animal = {
      id: newId,
      type,
      name,
      hunger: 60,
      happiness,
      consecutiveHappyDays: 0,
      daysBelow80: 0,
      isBestFriend: false,
      trait: getRandomTrait(),
      age: 0,
      maxAge,
      isAdult: false,
      adulthoodDay: currentDay + config.daysToAdult,
      hasProducedToday: false,
      ...(type === 'ovelha' && { daysUntilWool: 3, daysSinceLastWool: 0, woolReady: false }),
      ...(type === 'boi' && { weightGain: 0.05 }),
      ...(type === 'cabra' && { isLactating: false, lactationCycle: 0 }),
      ...(type === 'lhama' && { woolAccumulated: 0 }),
      ...(type === 'bufalo' && { heatStress: false }),
      ...(type === 'pavao' && {}),
    };

    if (!noFeedAnimals.includes(type)) {
      setInventory(prev => ({ ...prev, [feedType]: (prev[feedType] ?? 0) - 1 }));
    }

    setGold(prev => prev - config.price);
    setAnimals(prev => [...prev, newFilhote]);
    setWeeklyStats((prev: any) => ({ ...prev, spending: prev.spending + config.price }));

    const typeLabel = type === 'vaca' ? '🐄 Vaca' : type === 'boi' ? '🐂 Boi' : type === 'bufalo' ? '🐃 Búfalo' : type === 'cabra' ? '🐐 Cabra' : type === 'ovelha' ? '🐑 Ovelha' : type === 'pato' ? '🦆 Pato' : '🦚 Pavão';
    addLog(`🍼 ${newFilhote.name} (filhote de ${typeLabel}) chegou à fazenda! Vai crescer em ${config.daysToAdult} dias.`, 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🍼', `-${config.price} 💰`, event);
    if (onFilhoteBought) onFilhoteBought(type, newFilhote.name);
    if (onFilhoteAdded) onFilhoteAdded();
  };

  return {
    animals,
    setAnimals,
    licencaExotica,
    setLicencaExotica,
    coelhoReproCount,
    setCoelhoReproCount,
    // Functions
    getRandomTrait,
    getTraitInfo,
    getAnimalFeedType,
    getAnimalPurchasePrice,
    getCarneMultiplier,
    calculateBoiValue,
    calcFairScore,
    feedAnimal,
    collectEgg,
    collectGoatMilk,
    collectLlamaWool,
    collectDuckEgg,
    collectGooseProduct,
    collectBuffaloMilk,
    collectMilk,
    collectWool,
    collectAlpacaWool,
    collectCoelhoWool,
    collectRa,
    collectAvestruzPena,
    sellAvestruz,
    sellJacare,
    sellOx,
    sellAnimal,
    retireAnimal,
    buyAnimal,
    buyAnimalFilhote,
    FILHOTE_CONFIG,
  };
}
