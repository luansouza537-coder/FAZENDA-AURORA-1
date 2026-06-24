/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FarmStats, LogMessage, Contract } from '../types';
import { sfx } from '../utils/audio';
import { InventoryState } from './useAnimals';

export type { InventoryState };

export interface UseInventoryProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  farmLevel: number;
  setFarmXp: React.Dispatch<React.SetStateAction<number>>;
  setStats: React.Dispatch<React.SetStateAction<FarmStats>>;
  setWeeklyStats: React.Dispatch<React.SetStateAction<any>>;
  setWeeklySales: React.Dispatch<React.SetStateAction<any>>;
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  setDailyEarning: React.Dispatch<React.SetStateAction<number>>;
  merchantActive: boolean;
  getActualSellPrice: (itemType: any) => number;
  getDynamicTransactionPrice: (itemType: any, d?: number, w?: any, sales?: any) => number;
  soundEnabled: boolean;
  addLog: (msg: string, type?: LogMessage['type'], overrideDay?: number) => void;
  addNotification: (message: string, type?: any, overrideDay?: number) => void;
  spawnFeedback: (emoji: string, text: string, event?: React.MouseEvent) => void;
  triggerAudioResult: (action: () => void) => void;
  worldEvent?: { priceMult: number } | null;
  checkAndUnlockAchievement?: (id: string) => void;
  updateMissionProgress: (key: any, amount?: number, overrideDay?: number) => void;
  getFreightMultiplier?: (cat: string) => number;
  addFinancialEntry?: (entry: { day: number; type: 'income' | 'expense'; amount: number; category: string; description: string }) => void;
  currentDay?: number;
  addCraftCost?: (energy: number, water: number) => void;
  onGoldSpent?: (amount: number) => void;
  onContractDelivered?: () => void;
}

// Custo de energia (💡) e água (💧) por produto craftado
const CRAFT_COSTS: Record<string, { energy: number; water: number }> = {
  mayo:             { energy: 1, water: 0 },
  butter:           { energy: 1, water: 0 },
  yogurt:           { energy: 1, water: 1 },
  buffalo_mozzarella:{ energy: 1, water: 0 },
  queijo_cabra:     { energy: 1, water: 0 },
  iogurte_cabra:    { energy: 1, water: 1 },
  leite_condensado: { energy: 2, water: 0 },
  tapete_lhama:     { energy: 2, water: 0 },
  cachecol_angora:  { energy: 1, water: 0 },
  tecido_alpaca:    { energy: 2, water: 0 },
  fio_seda:         { energy: 1, water: 0 },
  manta_premium:    { energy: 3, water: 0 },
  pate_pato:        { energy: 1, water: 0 },
  ovo_defumado:     { energy: 2, water: 0 },
  conserva_codorna: { energy: 1, water: 1 },
  creme_cosmetico:  { energy: 1, water: 1 },
  sabonete_natural: { energy: 1, water: 1 },
  serum_facial:     { energy: 2, water: 1 },
  mascara_facial:   { energy: 1, water: 1 },
  racao_organica:   { energy: 1, water: 1 },
  fertilizante:     { energy: 1, water: 1 },
  colete_couro:     { energy: 2, water: 0 },
  bolsa_exotica:    { energy: 2, water: 0 },
  cheese:           { energy: 1, water: 0 },
  queijoCoalho:     { energy: 2, water: 0 },
  queijoMucarela:   { energy: 2, water: 0 },
  queijoBrie:       { energy: 2, water: 0 },
  queijo_parmesao:  { energy: 2, water: 0 },
  queijo_serra:     { energy: 2, water: 0 },
  kit_gourmet:      { energy: 2, water: 1 },
  scarf:            { energy: 2, water: 0 },
  hidromel:         { energy: 1, water: 1 },
  risoto_cogumelo:  { energy: 1, water: 2 },
  conserva_peixe:   { energy: 1, water: 1 },
  mel_envasado:     { energy: 1, water: 0 },
  sopa_cogumelo:    { energy: 1, water: 2 },
  fio_lhama:        { energy: 1, water: 0 },
  cachecol_lhama:   { energy: 1, water: 0 },
  gorro_lhama:      { energy: 1, water: 0 },
  luvas_lhama:      { energy: 1, water: 0 },
  poncho_lhama:     { energy: 2, water: 0 },
  manta_lhama:      { energy: 2, water: 0 },
  iogurte_bufala:   { energy: 1, water: 1 },
  manteiga_bufala:  { energy: 1, water: 0 },
  doce_leite_bufala:{ energy: 2, water: 0 },
  burrata:          { energy: 1, water: 0 },
  massa_fresca:     { energy: 1, water: 1 },
  crepe_rustico:    { energy: 1, water: 0 },
  pao_rustico:      { energy: 1, water: 1 },
  waffle_mel:       { energy: 1, water: 1 },
  biofertilizante:  { energy: 1, water: 1 },
  queijo_pecorino:  { energy: 2, water: 1 },
  iogurte_ovelha:   { energy: 1, water: 0 },
  ricota_ovelha:    { energy: 1, water: 1 },
  doce_leite_ovelha:{ energy: 2, water: 0 },
};

export function useInventory({
  gold,
  setGold,
  farmLevel,
  setFarmXp,
  setStats,
  setWeeklyStats,
  setWeeklySales,
  setContracts,
  setDailyEarning,
  merchantActive,
  getActualSellPrice,
  getDynamicTransactionPrice,
  soundEnabled,
  addLog,
  addNotification,
  spawnFeedback,
  triggerAudioResult,
  updateMissionProgress,
  worldEvent,
  checkAndUnlockAchievement,
  getFreightMultiplier,
  addFinancialEntry,
  currentDay,
  addCraftCost,
  onGoldSpent,
  onContractDelivered,
}: UseInventoryProps) {

  const applyCraftCost = (product: string) => {
    const c = CRAFT_COSTS[product];
    if (c && addCraftCost) addCraftCost(c.energy, c.water);
  };

  const PRODUCT_FREIGHT_CAT: Record<string, string> = {
    milk: 'laticinios', goat_milk: 'laticinios', sheep_milk: 'laticinios', buffalo_milk: 'laticinios',
    butter: 'laticinios', yogurt: 'laticinios', iogurte_cabra: 'laticinios',
    leite_condensado: 'laticinios', cheese: 'laticinios', queijoCoalho: 'laticinios',
    queijoMucarela: 'laticinios', queijoBrie: 'laticinios', buffalo_mozzarella: 'laticinios',
    queijo_cabra: 'laticinios', queijo_parmesao: 'laticinios', queijo_serra: 'laticinios',
    egg: 'ovos', duck_egg: 'ovos', goose_egg: 'ovos', quail_egg: 'ovos',
    fertile_egg: 'ovos', mayo: 'ovos', pate_pato: 'ovos', ovo_defumado: 'ovos', conserva_codorna: 'ovos',
    wool: 'texteis', llama_wool: 'texteis', alpaca_wool: 'texteis', angora_wool: 'texteis',
    scarf: 'texteis', tapete_lhama: 'texteis', cachecol_angora: 'texteis',
    tecido_alpaca: 'texteis', fio_seda: 'texteis', manta_premium: 'texteis',
    coxa_ra: 'carnes', carne_avestruz: 'carnes', carne_jacare: 'carnes', peixe: 'carnes',
    humus: 'organicos', muco: 'organicos', mel: 'organicos', mel_envasado: 'organicos',
    cogumelo: 'organicos', seda_bruta: 'organicos',
    couro_avestruz: 'luxo',
    couro_jacare: 'luxo', creme_cosmetico: 'luxo', sabonete_natural: 'luxo', serum_facial: 'luxo', mascara_facial: 'luxo',
    colete_couro: 'luxo', bolsa_exotica: 'luxo',
    hidromel: 'luxo', risoto_cogumelo: 'luxo', conserva_peixe: 'luxo',
    sopa_cogumelo: 'luxo', kit_gourmet: 'luxo',
    fio_lhama: 'texteis', cachecol_lhama: 'texteis', gorro_lhama: 'texteis',
    luvas_lhama: 'texteis', poncho_lhama: 'texteis', manta_lhama: 'texteis',
    iogurte_bufala: 'laticinios', manteiga_bufala: 'laticinios',
    doce_leite_bufala: 'laticinios', burrata: 'laticinios',
    queijo_pecorino: 'laticinios', iogurte_ovelha: 'laticinios',
    ricota_ovelha: 'laticinios', doce_leite_ovelha: 'laticinios',
    massa_fresca: 'ovos',
    crepe_rustico: 'ovos', pao_rustico: 'ovos', waffle_mel: 'organicos',
    minhoca_viva: 'organicos', biofertilizante: 'organicos',
  };

  // --- INVENTORY STATE ---
  const [inventory, setInventory] = useState<InventoryState>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        const inv = parsed.inventory || {};
        return {
          milk: inv.milk ?? 0,
          wool: inv.wool ?? 0,
          cheese: inv.cheese ?? 0,
          scarf: inv.scarf ?? 0,
          egg: inv.egg ?? 0,
          mayo: inv.mayo ?? 0,
          racaoBovina: inv.racaoBovina ?? (inv.racaoLeite ?? 0) + (inv.racaoBoi ?? 0) + (inv.racaoOvelha ? 0 : 5),
          racaoOvinos: inv.racaoOvinos ?? inv.racaoOvelha ?? 0,
          racaoAves: inv.racaoAves ?? inv.racaoGalinha ?? 0,
          racaoAquatica: inv.racaoAquatica ?? 0,
          racaoCoelho: inv.racaoCoelho ?? 0,
          racaoCarnivora: inv.racaoCarnivora ?? 0,
          queijoCoalho: inv.queijoCoalho ?? 0,
          queijoMucarela: inv.queijoMucarela ?? 0,
          queijoBrie: inv.queijoBrie ?? 0,
          goat_milk: inv.goat_milk ?? 0,
          llama_wool: inv.llama_wool ?? 0,
          duck_egg: inv.duck_egg ?? 0,
          goose_egg: inv.goose_egg ?? 0,
          buffalo_milk: inv.buffalo_milk ?? 0,
          buffalo_mozzarella: inv.buffalo_mozzarella ?? 0,
          butter: inv.butter ?? 0,
          yogurt: inv.yogurt ?? 0,
          fertile_egg: inv.fertile_egg ?? 0,
          quail_egg: inv.quail_egg ?? 0,
          alpaca_wool: inv.alpaca_wool ?? 0,
          humus: inv.humus ?? 0,
          muco: inv.muco ?? 0,
          angora_wool: inv.angora_wool ?? 0,
          seda_bruta: inv.seda_bruta ?? 0,
          coxa_ra: inv.coxa_ra ?? 0,
          carne_avestruz: inv.carne_avestruz ?? 0,
          couro_avestruz: inv.couro_avestruz ?? 0,
          carne_jacare: inv.carne_jacare ?? 0,
          couro_jacare: inv.couro_jacare ?? 0,
          folha_amoreira: inv.folha_amoreira ?? 0,
          sal: inv.sal ?? 0,
          queijo_cabra: inv.queijo_cabra ?? 0,
          iogurte_cabra: inv.iogurte_cabra ?? 0,
          leite_condensado: inv.leite_condensado ?? 0,
          tapete_lhama: inv.tapete_lhama ?? 0,
          cachecol_angora: inv.cachecol_angora ?? 0,
          tecido_alpaca: inv.tecido_alpaca ?? 0,
          fio_seda: inv.fio_seda ?? 0,
          manta_premium: inv.manta_premium ?? 0,
          pate_pato: inv.pate_pato ?? 0,
          ovo_defumado: inv.ovo_defumado ?? 0,
          conserva_codorna: inv.conserva_codorna ?? 0,
          creme_cosmetico: inv.creme_cosmetico ?? 0,
          sabonete_natural: inv.sabonete_natural ?? 0,
          serum_facial: inv.serum_facial ?? 0,
          mascara_facial: inv.mascara_facial ?? 0,
          colete_couro: inv.colete_couro ?? 0,
          bolsa_exotica: inv.bolsa_exotica ?? 0,
          peixe: inv.peixe ?? 0,
          mel: inv.mel ?? 0,
          cogumelo: inv.cogumelo ?? 0,
          hidromel: inv.hidromel ?? 0,
          risoto_cogumelo: inv.risoto_cogumelo ?? 0,
          conserva_peixe: inv.conserva_peixe ?? 0,
          mel_envasado: inv.mel_envasado ?? 0,
          sopa_cogumelo: inv.sopa_cogumelo ?? 0,
          queijo_parmesao: inv.queijo_parmesao ?? 0,
          queijo_serra: inv.queijo_serra ?? 0,
          kit_gourmet: inv.kit_gourmet ?? 0,
          racaoSuina: inv.racaoSuina ?? 0,
          farinha: inv.farinha ?? 0,
          fio_lhama: inv.fio_lhama ?? 0,
          cachecol_lhama: inv.cachecol_lhama ?? 0,
          gorro_lhama: inv.gorro_lhama ?? 0,
          luvas_lhama: inv.luvas_lhama ?? 0,
          poncho_lhama: inv.poncho_lhama ?? 0,
          manta_lhama: inv.manta_lhama ?? 0,
          iogurte_bufala: inv.iogurte_bufala ?? 0,
          manteiga_bufala: inv.manteiga_bufala ?? 0,
          doce_leite_bufala: inv.doce_leite_bufala ?? 0,
          burrata: inv.burrata ?? 0,
          massa_fresca: inv.massa_fresca ?? 0,
          crepe_rustico: inv.crepe_rustico ?? 0,
          pao_rustico: inv.pao_rustico ?? 0,
          waffle_mel: inv.waffle_mel ?? 0,
          minhoca_viva: inv.minhoca_viva ?? 0,
          biofertilizante: inv.biofertilizante ?? 0,
          sheep_milk: inv.sheep_milk ?? 0,
          queijo_pecorino: inv.queijo_pecorino ?? 0,
          iogurte_ovelha: inv.iogurte_ovelha ?? 0,
          ricota_ovelha: inv.ricota_ovelha ?? 0,
          doce_leite_ovelha: inv.doce_leite_ovelha ?? 0,
        };
      }
    } catch (e) {}
    return {
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      racaoBovina: 5,
      racaoOvinos: 5,
      racaoAves: 5,
      racaoAquatica: 0,
      racaoCoelho: 0,
      racaoCarnivora: 0,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0,
      goat_milk: 0,
      llama_wool: 0,
      duck_egg: 0,
      goose_egg: 0,
      buffalo_milk: 0,
      buffalo_mozzarella: 0,
      butter: 0,
      yogurt: 0,
      fertile_egg: 0,
      quail_egg: 0,
      alpaca_wool: 0,
      humus: 0,
      muco: 0,
      angora_wool: 0,
      seda_bruta: 0,
      coxa_ra: 0,
      carne_avestruz: 0,
      couro_avestruz: 0,
      carne_jacare: 0,
      couro_jacare: 0,
      folha_amoreira: 0,
      sal: 0,
      queijo_cabra: 0,
      iogurte_cabra: 0,
      leite_condensado: 0,
      tapete_lhama: 0,
      cachecol_angora: 0,
      tecido_alpaca: 0,
      fio_seda: 0,
      manta_premium: 0,
      pate_pato: 0,
      ovo_defumado: 0,
      conserva_codorna: 0,
      creme_cosmetico: 0,
      sabonete_natural: 0,
      serum_facial: 0,
      mascara_facial: 0,
      colete_couro: 0,
      bolsa_exotica: 0,
      peixe: 0,
      mel: 0,
      cogumelo: 0,
      hidromel: 0,
      risoto_cogumelo: 0,
      conserva_peixe: 0,
      mel_envasado: 0,
      sopa_cogumelo: 0,
      queijo_parmesao: 0,
      queijo_serra: 0,
      kit_gourmet: 0,
      racaoSuina: 0,
      farinha: 0,
      fio_lhama: 0,
      cachecol_lhama: 0,
      gorro_lhama: 0,
      luvas_lhama: 0,
      poncho_lhama: 0,
      manta_lhama: 0,
      iogurte_bufala: 0,
      manteiga_bufala: 0,
      doce_leite_bufala: 0,
      burrata: 0,
      massa_fresca: 0,
      crepe_rustico: 0,
      pao_rustico: 0,
      waffle_mel: 0,
      minhoca_viva: 0,
      biofertilizante: 0,
      sheep_milk: 0,
      queijo_pecorino: 0,
      iogurte_ovelha: 0,
      ricota_ovelha: 0,
      doce_leite_ovelha: 0,
    };
  });

  // --- PRODUCT FRESHNESS STATE ---
  const [productFreshness, setProductFreshness] = useState<{
    milk: number; egg: number; goat_milk: number; duck_egg: number;
    goose_egg: number; buffalo_milk: number; fertile_egg: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const pf = JSON.parse(saved).productFreshness;
        if (pf) return {
          milk: pf.milk ?? 3, egg: pf.egg ?? 3, goat_milk: pf.goat_milk ?? 3,
          duck_egg: pf.duck_egg ?? 3, goose_egg: pf.goose_egg ?? 3,
          buffalo_milk: pf.buffalo_milk ?? 3, fertile_egg: pf.fertile_egg ?? 3,
          sheep_milk: pf.sheep_milk ?? 3,
        };
      }
    } catch (e) {}
    return { milk: 3, egg: 3, goat_milk: 3, duck_egg: 3, goose_egg: 3, buffalo_milk: 3, fertile_egg: 3, sheep_milk: 3 };
  });

  // --- QUEIJARIA STATES ---
  const [queijosEmMaturacao, setQueijosEmMaturacao] = useState<{ tipo: 'coalho' | 'mucarela' | 'brie' | 'buffalo_mozzarella' | 'yogurt' | 'parmesao' | 'serra' | 'butter' | 'queijo_cabra' | 'iogurte_cabra' | 'iogurte_bufala' | 'manteiga_bufala' | 'doce_leite_bufala' | 'burrata'; diasRestantes: number }[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijosEmMaturacao) return parsed.queijosEmMaturacao;
      }
    } catch (e) {}
    return [];
  });

  const [maxPrateleiras, setMaxPrateleiras] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxPrateleiras !== undefined) return parsed.maxPrateleiras;
      }
    } catch (e) {}
    return 2;
  });

  const [totalQueijosFabricados, setTotalQueijosFabricados] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.totalQueijosFabricados !== undefined) return parsed.totalQueijosFabricados;
      }
    } catch (e) {}
    return 0;
  });

  const [queijosFabricadosTipos, setQueijosFabricadosTipos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijosFabricadosTipos) return parsed.queijosFabricadosTipos;
      }
    } catch (e) {}
    return [];
  });

  const [queijariaNivel, setQueijariaNivel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijariaNivel !== undefined) return parsed.queijariaNivel;
      }
    } catch (e) {}
    return 1;
  });

  // --- BUFF STATES ---
  const [racaoOrganicaDays, setRacaoOrganicaDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) { const parsed = JSON.parse(saved); return parsed.racaoOrganicaDays ?? 0; }
    } catch (e) {}
    return 0;
  });

  const [fertilizanteDays, setFertilizanteDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) { const parsed = JSON.parse(saved); return parsed.fertilizanteDays ?? 0; }
    } catch (e) {}
    return 0;
  });

  // --- ATELIE TAB STATE (UI-only, no persistence) ---
  const [atelieTab, setAtelieTab] = useState<'queijaria' | 'tecelagem' | 'cozinha' | 'cosmeticos' | 'luxo'>('queijaria');

  // --- FILA DE FABRICAÇÃO DE CACHECOL ---
  const [scarfQueue, setScarfQueue] = useState<{ diasRestantes: number }[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) { const parsed = JSON.parse(saved); if (parsed.scarfQueue) return parsed.scarfQueue; }
    } catch (e) {}
    return [];
  });

  // --- CRAFT FUNCTIONS ---

  const craftBuffaloMozzarella = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 4) {
      addLog('A muçarela de búfala requer Nível 4!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if ((inventory.buffalo_milk ?? 0) < 3) {
      addLog('Precisa de pelo menos 3 leites de búfala para fazer muçarela!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Leite!', event);
      return;
    }
    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog('Prateleiras cheias! Aguarde outros queijos ficarem prontos.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event);
      return;
    }
    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) - 3 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'buffalo_mozzarella', diasRestantes: 10 }]);
    setTotalQueijosFabricados(prev => prev + 1);
    applyCraftCost('buffalo_mozzarella');
    addLog('🧀 Iniciou a maturação de Muçarela de Búfala (10 dias).', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧀', 'Muçarela Búfala', event);
  };

  const craftMayonese = (event: React.MouseEvent) => {
    if (event) event.preventDefault();
    if ((inventory.egg ?? 0) < 2) {
      addLog(`🥚 Ovos insuficientes! Você precisa de pelo menos 2 Ovos para fazer Maionese.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Ovos!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      egg: prev.egg - 2,
      mayo: (prev.mayo ?? 0) + 1
    }));
    setStats(prev => ({
      ...prev,
      totalMayo: (prev.totalMayo || 0) + 1
    }));
    setWeeklyStats(prev => ({
      ...prev,
      mayo: (prev.mayo ?? 0) + 1
    }));
    applyCraftCost('mayo');
    addLog(`🥣 Sucesso! Você misturou vitoriosamente 2 Ovos em 1 pote de Maionese cremosa!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥣', '+1 Maionese', event);
  };

  const craftButter = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 2) {
      addLog('🧈 A manteiga requer Nível 2!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if ((inventory.milk ?? 0) < 2) {
      addLog('🥛 Leite insuficiente! Você precisa de 2 leites para fazer manteiga.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Leite!', event);
      return;
    }
    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event);
      return;
    }
    setInventory(prev => ({ ...prev, milk: prev.milk - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'butter', diasRestantes: 1 }]);
    applyCraftCost('butter');
    addLog('🧈 Manteiga em preparo! Ficará pronta em 1 dia.', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧈', 'Preparando... 1d', event);
  };

  const craftYogurt = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 2) {
      addLog('🥛 O iogurte requer Nível 2!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if ((inventory.milk ?? 0) < 1) {
      addLog('🥛 Leite insuficiente! Você precisa de 1 leite para fazer iogurte.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Leite!', event);
      return;
    }
    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog('Prateleiras cheias! Aguarde outros produtos fermentarem.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event);
      return;
    }
    setInventory(prev => ({ ...prev, milk: prev.milk - 1 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'yogurt', diasRestantes: 2 }]);
    applyCraftCost('yogurt');
    addLog('🥛 Iogurte em fermentação! Ficará pronto em 2 dias.', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🥛', 'Fermentando...', event);
  };

  // Laticínios
  const craftQueijoCabra = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 3) { addLog('🧀 Queijo de Cabra requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.goat_milk ?? 0) < 3) { addLog('🐐 Falta Leite de Cabra! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Cabra!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, goat_milk: (prev.goat_milk ?? 0) - 3 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'queijo_cabra', diasRestantes: 5 }]);
    applyCraftCost('queijo_cabra');
    addLog('🧀 Queijo de Cabra em maturação! Pronto em 5 dias.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧀', 'Maturando... 2d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftIogurteCabra = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🥛 Iogurte de Cabra requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.goat_milk ?? 0) < 2) { addLog('🐐 Falta Leite de Cabra! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Cabra!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, goat_milk: (prev.goat_milk ?? 0) - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'iogurte_cabra', diasRestantes: 1 }]);
    applyCraftCost('iogurte_cabra');
    addLog('🥛 Iogurte de Cabra em fermentação! Pronto em 1 dia.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', 'Fermentando... 1d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftQueijoPecorino = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🧀 Queijo Pecorino requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.sheep_milk ?? 0) < 5) { addLog('🐑 Falta Leite de Ovelha! Precisa de 5.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Ovelha!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, sheep_milk: (prev.sheep_milk ?? 0) - 5 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'queijo_pecorino', diasRestantes: 10 }]);
    applyCraftCost('queijo_pecorino');
    addLog('🧀 Queijo Pecorino em maturação! Pronto em 10 dias.', 'success');
    setFarmXp(prev => prev + 5);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧀', 'Maturando... 10d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftIoguteOvelha = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 3) { addLog('🥛 Iogurte de Ovelha requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.sheep_milk ?? 0) < 2) { addLog('🐑 Falta Leite de Ovelha! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Ovelha!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, sheep_milk: (prev.sheep_milk ?? 0) - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'iogurte_ovelha', diasRestantes: 2 }]);
    applyCraftCost('iogurte_ovelha');
    addLog('🥛 Iogurte de Ovelha em fermentação! Pronto em 2 dias.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', 'Fermentando... 2d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftRicotaOvelha = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🥛 Ricota de Ovelha requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.sheep_milk ?? 0) < 3) { addLog('🐑 Falta Leite de Ovelha! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Ovelha!', event); return; }
    setInventory(prev => ({ ...prev, sheep_milk: (prev.sheep_milk ?? 0) - 3, ricota_ovelha: (prev.ricota_ovelha ?? 0) + 1 }));
    applyCraftCost('ricota_ovelha');
    addLog('🥛 Você fabricou 1 Ricota de Ovelha com 3 leites!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', '+1 Ricota Ovelha', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftDoceLeiteOvelha = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🍮 Doce de Leite de Ovelha requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.sheep_milk ?? 0) < 4) { addLog('🐑 Falta Leite de Ovelha! Precisa de 4.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Ovelha!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, sheep_milk: (prev.sheep_milk ?? 0) - 4 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'doce_leite_ovelha', diasRestantes: 3 }]);
    applyCraftCost('doce_leite_ovelha');
    addLog('🍮 Doce de Leite de Ovelha em preparo! Pronto em 3 dias.', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🍮', 'Cozinhando... 3d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftLeiteCondensado = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🥛 Leite Condensado requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.milk ?? 0) < 4) { addLog('🥛 Falta Leite! Precisa de 4.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Leite!', event); return; }
    if ((inventory.butter ?? 0) < 1) { addLog('🧈 Falta Manteiga! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Manteiga!', event); return; }
    setInventory(prev => ({ ...prev, milk: prev.milk - 4, butter: (prev.butter ?? 0) - 1, leite_condensado: (prev.leite_condensado ?? 0) + 1 }));
    applyCraftCost('leite_condensado');
    addLog('🥛 Você fabricou 1 Leite Condensado com 4 leites e 1 manteiga!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', '+1 L.Condensado', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // Têxteis
  const craftTapeteLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🧶 Tapete de Lhama requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.llama_wool ?? 0) < 3) { addLog('🦙 Falta Lã de Lhama! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Lhama!', event); return; }
    setInventory(prev => ({ ...prev, llama_wool: (prev.llama_wool ?? 0) - 3, tapete_lhama: (prev.tapete_lhama ?? 0) + 1 }));
    applyCraftCost('tapete_lhama');
    addLog('🪢 Você teceu 1 Tapete de Lhama com 3 lãs de lhama!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🪢', '+1 Tapete Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftCachecolAngora = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 8) { addLog('🧣 Cachecol Angorá requer Nível 8!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.angora_wool ?? 0) < 2) { addLog('🐇 Falta Lã Angorá! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Angorá!', event); return; }
    setInventory(prev => ({ ...prev, angora_wool: (prev.angora_wool ?? 0) - 2, cachecol_angora: (prev.cachecol_angora ?? 0) + 1 }));
    applyCraftCost('cachecol_angora');
    addLog('🧣 Você confeccionou 1 Cachecol Angorá com 2 lãs angorá!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧣', '+1 Cachecol Angorá', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftTecidoAlpaca = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🧶 Tecido de Alpaca requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.alpaca_wool ?? 0) < 3) { addLog('🦙 Falta Lã de Alpaca! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Alpaca!', event); return; }
    setInventory(prev => ({ ...prev, alpaca_wool: (prev.alpaca_wool ?? 0) - 3, tecido_alpaca: (prev.tecido_alpaca ?? 0) + 1 }));
    applyCraftCost('tecido_alpaca');
    addLog('🧶 Você teceu 1 Tecido de Alpaca com 3 lãs de alpaca!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', '+1 Tecido Alpaca', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftFioSeda = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 10) { addLog('🪡 Fio de Seda requer Nível 10!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.seda_bruta ?? 0) < 2) { addLog('🪲 Falta Seda Bruta! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Seda Bruta!', event); return; }
    setInventory(prev => ({ ...prev, seda_bruta: (prev.seda_bruta ?? 0) - 2, fio_seda: (prev.fio_seda ?? 0) + 1 }));
    applyCraftCost('fio_seda');
    addLog('🪡 Você fiou 1 Fio de Seda com 2 sedas brutas!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🪡', '+1 Fio de Seda', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftMantaPremium = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 13) { addLog('🧣 Manta Premium requer Nível 13!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.fio_seda ?? 0) < 1) { addLog('🪡 Falta Fio de Seda! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Fio Seda!', event); return; }
    if ((inventory.cachecol_angora ?? 0) < 1) { addLog('🧣 Falta Cachecol Angorá! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Cachecol!', event); return; }
    if ((inventory.tecido_alpaca ?? 0) < 1) { addLog('🧶 Falta Tecido de Alpaca! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Tecido!', event); return; }
    setInventory(prev => ({ ...prev, fio_seda: (prev.fio_seda ?? 0) - 1, cachecol_angora: (prev.cachecol_angora ?? 0) - 1, tecido_alpaca: (prev.tecido_alpaca ?? 0) - 1, manta_premium: (prev.manta_premium ?? 0) + 1 }));
    applyCraftCost('manta_premium');
    addLog('✨ Você criou 1 Manta Premium! Uma obra-prima têxtil!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('✨', '+1 Manta Premium', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // Cozinha
  const craftPatePato = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🥞 Panquecinhas Douradas requerem Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.duck_egg ?? 0) < 2) { addLog('🦆 Falta Ovo de Pato! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ovo Pato!', event); return; }
    if ((inventory.butter ?? 0) < 1) { addLog('🧈 Falta Manteiga! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Manteiga!', event); return; }
    setInventory(prev => ({ ...prev, duck_egg: (prev.duck_egg ?? 0) - 2, butter: (prev.butter ?? 0) - 1, pate_pato: (prev.pate_pato ?? 0) + 1 }));
    applyCraftCost('pate_pato');
    addLog('🥞 Você preparou Panquecinhas Douradas de Ovos de Pato!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥞', '+1 Panquecinha', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftOvoDefumado = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🥚 Ovo Defumado requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.goose_egg ?? 0) < 1) { addLog('🪿 Falta Ovo de Ganso! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ov.Ganso!', event); return; }
    setInventory(prev => ({ ...prev, goose_egg: (prev.goose_egg ?? 0) - 1, ovo_defumado: (prev.ovo_defumado ?? 0) + 1 }));
    applyCraftCost('ovo_defumado');
    addLog('🥚 Você defumou 1 Ovo de Ganso com maestria!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥚', '+1 Ovo Defumado', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftConservaCodorna = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🥚 Conserva de Codorna requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.quail_egg ?? 0) < 6) { addLog('🐦 Falta Ovo de Codorna! Precisa de 6.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ov.Codorna!', event); return; }
    setInventory(prev => ({ ...prev, quail_egg: (prev.quail_egg ?? 0) - 6, conserva_codorna: (prev.conserva_codorna ?? 0) + 1 }));
    applyCraftCost('conserva_codorna');
    addLog('🥚 Você preparou 1 Conserva de Codorna com 6 ovos!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥚', '+1 Conserva Codorna', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // Cosméticos
  const craftCremeCosmetico = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 7) { addLog('🧴 Creme Cosmético requer Nível 7!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.muco ?? 0) < 2) { addLog('🐌 Falta Muco de Caracol! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Muco!', event); return; }
    if ((inventory.mel ?? 0) < 1) { addLog('🍯 Falta Mel! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Mel!', event); return; }
    setInventory(prev => ({ ...prev, muco: (prev.muco ?? 0) - 2, mel: (prev.mel ?? 0) - 1, creme_cosmetico: (prev.creme_cosmetico ?? 0) + 1 }));
    applyCraftCost('creme_cosmetico');
    addLog('🧴 Você formulou 1 Creme Cosmético de luxo!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧴', '+1 Creme Cosmético', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftSaboneteNatural = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 9) { addLog('🧼 Sabonete Natural requer Nível 9!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.muco ?? 0) < 1) { addLog('🐌 Falta Muco de Caracol! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Muco!', event); return; }
    if ((inventory.mel ?? 0) < 1) { addLog('🍯 Falta Mel! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Mel!', event); return; }
    if ((inventory.goat_milk ?? 0) < 1) { addLog('🐐 Falta Leite de Cabra! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Cabra!', event); return; }
    setInventory(prev => ({ ...prev, muco: (prev.muco ?? 0) - 1, mel: (prev.mel ?? 0) - 1, goat_milk: (prev.goat_milk ?? 0) - 1, sabonete_natural: (prev.sabonete_natural ?? 0) + 1 }));
    applyCraftCost('sabonete_natural');
    addLog('🧼 Você produziu 1 Sabonete Natural artesanal!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧼', '+1 Sabonete Natural', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftSerumFacial = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 7) { addLog('💧 Sérum Facial requer Nível 7!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.muco ?? 0) < 2) { addLog('🐌 Falta Muco de Caracol! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Muco!', event); return; }
    if ((inventory.mel ?? 0) < 1) { addLog('🍯 Falta Mel! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Mel!', event); return; }
    setInventory(prev => ({ ...prev, muco: (prev.muco ?? 0) - 2, mel: (prev.mel ?? 0) - 1, serum_facial: (prev.serum_facial ?? 0) + 1 }));
    applyCraftCost('serum_facial');
    addLog('💧 Você formulou 1 Sérum Facial de mucina!', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('💧', '+1 Sérum Facial', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftMascaraFacial = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 8) { addLog('🧖 Máscara Facial requer Nível 8!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.muco ?? 0) < 3) { addLog('🐌 Falta Muco de Caracol! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Muco!', event); return; }
    setInventory(prev => ({ ...prev, muco: (prev.muco ?? 0) - 3, mascara_facial: (prev.mascara_facial ?? 0) + 1 }));
    applyCraftCost('mascara_facial');
    addLog('🧖 Você formulou 1 Máscara Facial de mucina!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧖', '+1 Máscara Facial', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftRacaoOrganica = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🌿 Ração Orgânica requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.humus ?? 0) < 2) { addLog('🪱 Falta Húmus! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Húmus!', event); return; }
    setInventory(prev => ({ ...prev, humus: (prev.humus ?? 0) - 2 }));
    setRacaoOrganicaDays(prev => prev + 3);
    applyCraftCost('racao_organica');
    addLog('🌿 Ração Orgânica ativa por 3 dias! Animais consomem 50% menos ração.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🌿', 'Ração Orgânica +3d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftFertilizante = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 8) { addLog('🌱 Fertilizante requer Nível 8!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.humus ?? 0) < 3) { addLog('🪱 Falta Húmus! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Húmus!', event); return; }
    setInventory(prev => ({ ...prev, humus: (prev.humus ?? 0) - 3 }));
    setFertilizanteDays(prev => prev + 5);
    applyCraftCost('fertilizante');
    addLog('🌱 Fertilizante aplicado! +15% produção por 5 dias.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🌱', 'Fertilizante +5d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftColeteCouro = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 15) { addLog('🦺 Colete de Couro requer Nível 15!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.couro_avestruz ?? 0) < 1) { addLog('🦤 Falta Couro de Avestruz! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Couro Avestruz!', event); return; }
    setInventory(prev => ({ ...prev, couro_avestruz: (prev.couro_avestruz ?? 0) - 1, colete_couro: (prev.colete_couro ?? 0) + 1 }));
    applyCraftCost('colete_couro');
    addLog('🦺 Você confeccionou 1 Colete de Couro de alta costura!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🦺', '+1 Colete Couro', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftBolsaExotica = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 18) { addLog('👜 Bolsa Exótica requer Nível 18!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.couro_jacare ?? 0) < 1) { addLog('🐊 Falta Couro de Jacaré! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Couro Jacaré!', event); return; }
    setInventory(prev => ({ ...prev, couro_jacare: (prev.couro_jacare ?? 0) - 1, bolsa_exotica: (prev.bolsa_exotica ?? 0) + 1 }));
    applyCraftCost('bolsa_exotica');
    addLog('👜 Você criou 1 Bolsa Exótica de couro de jacaré!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('👜', '+1 Bolsa Exótica', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // Main crafting functions
  const craftCheese = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (inventory.milk < 3) {
      addLog(`🥛 Leite insuficiente! Você precisa de pelo menos 3 Baldes de Leite Cru.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Leite!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      milk: prev.milk - 3,
      cheese: prev.cheese + 1
    }));
    setStats(prev => ({
      ...prev,
      totalCheese: (prev.totalCheese || 0) + 1
    }));
    setWeeklyStats(prev => ({
      ...prev,
      cheese: prev.cheese + 1
    }));
    applyCraftCost('cheese');
    addLog(`🧀 Sucesso! Você transformou 3 Leites Crus em 1 Queijo de alta qualidade!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧀', '+1 Queijo', event);
  };

  const craftQueijo = (tipo: 'coalho' | 'mucarela' | 'brie', event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();

    // Queijo Coalho desde nível 1, Muçarela nível 3, Brie nível 5
    const minLevel = tipo === 'coalho' ? 1 : tipo === 'mucarela' ? 3 : 5;
    if (farmLevel < minLevel) {
      addLog(`🧀 ${tipo === 'mucarela' ? 'Queijo Muçarela requer Nível 3' : 'Queijo Brie requer Nível 5'}!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }

    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog(`🧀 Suas prateleiras estão cheias! Amplie sua queijaria ou aguarde a maturação de outros queijos.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event);
      return;
    }

    const requiredMilk = tipo === 'coalho' ? 3 : tipo === 'mucarela' ? 5 : 8;
    const diasMaturation = tipo === 'coalho' ? 3 : tipo === 'mucarela' ? 6 : 12;
    const label = tipo === 'coalho' ? 'Queijo Coalho' : tipo === 'mucarela' ? 'Queijo Muçarela' : 'Queijo Brie';

    if (inventory.milk < requiredMilk) {
      addLog(`🥛 Leite insuficiente! Você precisa de pelo menos ${requiredMilk} Baldes de Leite Cru para fabricar ${label}.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', `Falta Leite! (${requiredMilk})`, event);
      return;
    }

    // Spend milk
    setInventory(prev => ({
      ...prev,
      milk: prev.milk - requiredMilk
    }));

    // Add to maturing array
    setQueijosEmMaturacao(prev => [...prev, { tipo, diasRestantes: diasMaturation }]);

    // Award statistics & achievements
    setTotalQueijosFabricados(prev => prev + 1);
    setQueijosFabricadosTipos(prev => prev.includes(tipo) ? prev : [...prev, tipo]);

    setStats(prev => ({
      ...prev,
      totalCheese: (prev.totalCheese || 0) + 1
    }));

    setWeeklyStats(prev => ({
      ...prev,
      cheese: (prev.cheese ?? 0) + 1
    }));

    applyCraftCost(tipo === 'coalho' ? 'queijoCoalho' : tipo === 'mucarela' ? 'queijoMucarela' : 'queijoBrie');
    addLog(`🧀 Você iniciou a maturação de ${label}. Ficará pronto em ${diasMaturation} dia(s).`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧀', `Iniciou ${label}`, event);
  };

  const craftQueijoParmesao = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 10) {
      addLog('🧀 Queijo Parmesão requer Fazenda Nível 10!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog('🧀 Prateleiras cheias! Aguarde outros queijos maturarem.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if (inventory.milk < 10) {
      addLog('🥛 Leite insuficiente! Parmesão requer 10 leites.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Leite! (10)', event);
      return;
    }
    if ((inventory.queijoCoalho ?? 0) < 2) {
      addLog('🧀 Queijo Coalho insuficiente! Parmesão requer 2 Queijo Coalho.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Queijo Coalho! (2)', event);
      return;
    }
    setInventory(prev => ({ ...prev, milk: prev.milk - 10, queijoCoalho: (prev.queijoCoalho ?? 0) - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'parmesao', diasRestantes: 15 }]);
    setStats(prev => ({ ...prev, totalCheese: (prev.totalCheese || 0) + 1 }));
    applyCraftCost('queijo_parmesao');
    addLog('🧀 Iniciou maturação do Queijo Parmesão. Ficará pronto em 15 dias.', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧀', 'Iniciou Parmesão', event);
  };

  const craftQueijoSerra = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 14) {
      addLog('🧀 Queijo da Serra requer Fazenda Nível 14!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog('🧀 Prateleiras cheias! Aguarde outros queijos maturarem.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if ((inventory.goat_milk ?? 0) < 6) {
      addLog('🐐 Leite de Cabra insuficiente! Serra requer 6 Leites de Cabra.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta L.Cabra! (6)', event);
      return;
    }
    if (inventory.milk < 4) {
      addLog('🥛 Leite insuficiente! Serra requer 4 leites.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Leite! (4)', event);
      return;
    }
    setInventory(prev => ({ ...prev, goat_milk: (prev.goat_milk ?? 0) - 6, milk: prev.milk - 4 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'serra', diasRestantes: 20 }]);
    setStats(prev => ({ ...prev, totalCheese: (prev.totalCheese || 0) + 1 }));
    applyCraftCost('queijo_serra');
    addLog('🧀 Iniciou maturação do Queijo da Serra. Ficará pronto em 20 dias.', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧀', 'Iniciou Q. Serra', event);
  };

  const craftKitGourmet = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (farmLevel < 16) {
      addLog('🎁 Kit Gourmet Premiado requer Fazenda Nível 16!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if ((inventory.queijoBrie ?? 0) < 2) {
      addLog('🧀 Queijo Brie insuficiente! Kit Gourmet requer 2 Queijo Brie.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Q.Brie! (2)', event);
      return;
    }
    if ((inventory.manta_premium ?? 0) < 1) {
      addLog('✨ Manta Premium insuficiente! Kit Gourmet requer 1 Manta Premium.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Manta Premium! (1)', event);
      return;
    }
    if ((inventory.mel ?? 0) < 2) {
      addLog('🍯 Mel insuficiente! Kit Gourmet requer 2 Mel.', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Falta Mel! (2)', event);
      return;
    }
    setInventory(prev => ({
      ...prev,
      queijoBrie: (prev.queijoBrie ?? 0) - 2,
      manta_premium: (prev.manta_premium ?? 0) - 1,
      mel: (prev.mel ?? 0) - 2,
      kit_gourmet: (prev.kit_gourmet ?? 0) + 1,
    }));
    applyCraftCost('kit_gourmet');
    addLog('🎁 Kit Gourmet Premiado montado! Vale 900 moedas.', 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🎁', '+1 Kit Gourmet', event);
  };

  const craftScarf = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (inventory.wool < 2) {
      addLog(`🧶 Lã insuficiente! Você precisa de pelo menos 2 Novelos de Lã Crua.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Lã!', event);
      return;
    }
    setInventory(prev => ({ ...prev, wool: prev.wool - 2 }));
    setScarfQueue(prev => [...prev, { diasRestantes: 2 }]);
    applyCraftCost('scarf');
    addLog(`🧶 Cachecol em produção! Pronto em 2 dias.`, 'info');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', 'Tecendo... 2d', event);
  };

  // --- SELL FUNCTIONS ---

  const sellProduct = (itemType: keyof InventoryState, qty: number, event: React.MouseEvent) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if ((inventory[itemType] ?? 0) < qty) {
      addLog(`📦 Estoque insuficiente deste produto no Armazém!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Sem estoque!', event);
      return;
    }

    const pricePerUnit = getActualSellPrice(itemType);
    const freightMult = getFreightMultiplier ? getFreightMultiplier(PRODUCT_FREIGHT_CAT[itemType as string] ?? 'luxo') : 1;
    const profit = Math.floor(pricePerUnit * qty * freightMult);

    setInventory(prev => ({
      ...prev,
      [itemType]: (prev[itemType] ?? 0) - qty
    }));

    setGold(prev => prev + profit);
    setDailyEarning(prev => prev + profit);
    addLog(`💰 Vendido: ${qty}x ${String(itemType)} por ${profit} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('coin'));
    spawnFeedback('💰', `+${profit}`, event);
    const freightCost = Math.floor(pricePerUnit * qty) - profit;
    addFinancialEntry?.({ day: currentDay ?? 0, type: 'income', amount: profit, category: 'venda', description: `Venda: ${qty}x ${String(itemType)}` });
    if (freightCost > 0) addFinancialEntry?.({ day: currentDay ?? 0, type: 'expense', amount: freightCost, category: 'outro', description: `Frete: ${String(itemType)}` });
    setStats(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + profit,
      totalMerchantTrades: merchantActive ? (prev.totalMerchantTrades || 0) + qty : (prev.totalMerchantTrades || 0)
    }));
    // BUG 15 FIX: atualiza weeklyStats para todos os tipos de produto, não apenas egg e mayo
    setWeeklyStats(prev => ({
      ...prev,
      earnings: prev.earnings + profit,
      milk: itemType === 'milk' ? (prev.milk || 0) + qty : (prev.milk || 0),
      wool: itemType === 'wool' ? (prev.wool || 0) + qty : (prev.wool || 0),
      cheese: itemType === 'cheese' ? (prev.cheese || 0) + qty : (prev.cheese || 0),
      scarf: itemType === 'scarf' ? (prev.scarf || 0) + qty : (prev.scarf || 0),
      egg: itemType === 'egg' ? (prev.egg || 0) + qty : (prev.egg || 0),
      mayo: itemType === 'mayo' ? (prev.mayo || 0) + qty : (prev.mayo || 0),
    }));

    // Update weeklySales count
    setWeeklySales(prev => ({
      ...prev,
      [itemType]: (prev[itemType] || 0) + qty
    }));

    // F4: deduzir da entrega de contratos ativos
    const contractProductMap: Record<string, Contract['product']> = {
      milk: 'milk', wool: 'wool', egg: 'egg',
      cheese: 'cheese', queijoCoalho: 'queijoCoalho', queijoMucarela: 'queijoMucarela', queijoBrie: 'queijoBrie',
      butter: 'butter', yogurt: 'yogurt',
      goat_milk: 'goat_milk', buffalo_milk: 'buffalo_milk', buffalo_mozzarella: 'buffalo_mozzarella',
      duck_egg: 'duck_egg', quail_egg: 'quail_egg', goose_egg: 'goose_egg',
      alpaca_wool: 'alpaca_wool', angora_wool: 'angora_wool', llama_wool: 'llama_wool',
      muco: 'muco', mel_envasado: 'mel_envasado', seda_bruta: 'seda_bruta',
      mayo: 'mayo', queijo_cabra: 'queijo_cabra', iogurte_cabra: 'iogurte_cabra',
      tapete_lhama: 'tapete_lhama', leite_condensado: 'leite_condensado', tecido_alpaca: 'tecido_alpaca',
      cachecol_angora: 'cachecol_angora', coxa_ra: 'coxa_ra',
      carne_avestruz: 'carne_avestruz', couro_avestruz: 'couro_avestruz',
      fio_seda: 'fio_seda', carne_jacare: 'carne_jacare', couro_jacare: 'couro_jacare',
    };
    const contractProduct = contractProductMap[itemType as string];
    if (contractProduct) {
      setContracts(prev => prev.map(c => {
        if (!c.active || c.product !== contractProduct) return c;
        const remaining = c.quantity - c.delivered;
        if (remaining <= 0) return c;
        const toDeliver = Math.min(qty, remaining);
        const newDelivered = c.delivered + toDeliver;
        if (newDelivered >= c.quantity) {
          setTimeout(() => addNotification(`📋 Contrato concluído! Entregou ${c.quantity} un de ${c.product}!`, 'success'), 0);
          setTimeout(() => onContractDelivered?.(), 0);
          addLog(`📋 Contrato cumprido! Entregou ${c.quantity} un de ${c.product} pelo preço garantido.`, 'success');
          setFarmXp(prev => prev + 20);
          return { ...c, delivered: newDelivered, active: false };
        }
        return { ...c, delivered: newDelivered };
      }));
    }

    let label = '';
    if (itemType === 'milk') label = 'Leite Cru';
    else if (itemType === 'wool') label = 'Lã Crua';
    else if (itemType === 'cheese') label = 'Queijo Simples';
    else if (itemType === 'queijoCoalho') label = 'Queijo Coalho';
    else if (itemType === 'queijoMucarela') label = 'Queijo Muçarela';
    else if (itemType === 'queijoBrie') label = 'Queijo Brie';
    else if (itemType === 'scarf') label = 'Cachecol';
    else if (itemType === 'egg') label = 'Ovo';
    else if (itemType === 'mayo') label = 'Maionese';
    else if (itemType === 'goat_milk') label = 'Leite de Cabra';
    else if (itemType === 'llama_wool') label = 'Lã de Lhama';
    else if (itemType === 'duck_egg') label = 'Ovo de Pato';
    else if (itemType === 'goose_egg') label = 'Ovo de Ganso';
    else if (itemType === 'buffalo_milk') label = 'Leite de Búfala';
    else if (itemType === 'buffalo_mozzarella') label = 'Muçarela de Búfala';
    else if (itemType === 'butter') label = 'Manteiga';
    else if (itemType === 'yogurt') label = 'Iogurte';
    else if (itemType === 'fertile_egg') label = 'Ovo Fértil';
    else if (itemType === 'quail_egg') label = 'Ovo de Codorna';
    else if (itemType === 'alpaca_wool') label = 'Lã de Alpaca';
    else if (itemType === 'humus') label = 'Húmus';
    else if (itemType === 'muco') label = 'Muco de Caracol';
    else if (itemType === 'angora_wool') label = 'Lã Angorá';
    else if (itemType === 'seda_bruta') label = 'Seda Bruta';
    else if (itemType === 'coxa_ra') label = 'Coxa de Rã';
    else if (itemType === 'carne_avestruz') label = 'Carne de Avestruz';
    else if (itemType === 'couro_avestruz') label = 'Couro de Avestruz';
    else if (itemType === 'carne_jacare') label = 'Carne de Jacaré';
    else if (itemType === 'couro_jacare') label = 'Couro de Jacaré';
    else if (itemType === 'queijo_cabra') label = 'Queijo de Cabra';
    else if (itemType === 'iogurte_cabra') label = 'Iogurte de Cabra';
    else if (itemType === 'leite_condensado') label = 'Leite Condensado';
    else if (itemType === 'tapete_lhama') label = 'Tapete de Lhama';
    else if (itemType === 'cachecol_angora') label = 'Cachecol Angorá';
    else if (itemType === 'tecido_alpaca') label = 'Tecido de Alpaca';
    else if (itemType === 'fio_seda') label = 'Fio de Seda';
    else if (itemType === 'manta_premium') label = 'Manta Premium';
    else if (itemType === 'pate_pato') label = 'Panquecinhas Douradas de Ovos de Pato';
    else if (itemType === 'ovo_defumado') label = 'Ovo Defumado';
    else if (itemType === 'conserva_codorna') label = 'Conserva de Codorna';
    else if (itemType === 'creme_cosmetico') label = 'Creme Cosmético';
    else if (itemType === 'sabonete_natural') label = 'Sabonete Natural';
    else if (itemType === 'colete_couro') label = 'Colete de Couro';
    else if (itemType === 'bolsa_exotica') label = 'Bolsa Exótica';
    else if (itemType === 'fio_lhama') label = 'Fio de Lhama';
    else if (itemType === 'cachecol_lhama') label = 'Cachecol de Lhama';
    else if (itemType === 'gorro_lhama') label = 'Gorro de Lhama';
    else if (itemType === 'luvas_lhama') label = 'Luvas de Lhama';
    else if (itemType === 'poncho_lhama') label = 'Poncho de Lhama';
    else if (itemType === 'manta_lhama') label = 'Manta de Lhama';
    else if (itemType === 'iogurte_bufala') label = 'Iogurte de Búfala';
    else if (itemType === 'manteiga_bufala') label = 'Manteiga de Búfala';
    else if (itemType === 'doce_leite_bufala') label = 'Doce de Leite de Búfala';
    else if (itemType === 'burrata') label = 'Burrata';
    else if (itemType === 'massa_fresca') label = 'Massa Fresca de Ovo de Ganso';
    else if (itemType === 'crepe_rustico') label = 'Crepe Rústico';
    else if (itemType === 'pao_rustico') label = 'Pão Rústico';
    else if (itemType === 'waffle_mel') label = 'Waffle de Mel';

    addLog(`💰 Venda realizada: ${qty} unidades de ${label} por +${profit} moedas!`, 'success');

    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('💰', `+${profit} 💰`, event);
    // Missões: vender leite, vender qualquer coisa, ganhar ouro
    if (itemType === 'milk') updateMissionProgress('sell_milk', qty);
    updateMissionProgress('sell_any', qty);
    updateMissionProgress('earn_gold', profit);
    // Missão de produto exótico
    if (['muco', 'seda_bruta', 'couro_avestruz', 'couro_jacare', 'carne_jacare', 'carne_avestruz'].includes(itemType as string)) {
      updateMissionProgress('sell_exotic', qty);
    }
  };

  const sellAllItemsNoConfirm = (quietValue = false) => {
    const milkQty = inventory.milk;
    const woolQty = inventory.wool;
    const cheeseQty = inventory.cheese;
    const scarfQty = inventory.scarf;
    const eggQty = inventory.egg || 0;
    const mayoQty = inventory.mayo || 0;
    const coalhoQty = inventory.queijoCoalho || 0;
    const mucarelaQty = inventory.queijoMucarela || 0;
    const brieQty = inventory.queijoBrie || 0;
    const goatMilkQty = inventory.goat_milk || 0;
    const llamaWoolQty = inventory.llama_wool || 0;
    const duckEggQty = inventory.duck_egg || 0;
    const gooseEggQty = inventory.goose_egg || 0;
    const buffaloMilkQty = inventory.buffalo_milk || 0;
    const buffaloMozzQty = inventory.buffalo_mozzarella || 0;
    const butterQty = inventory.butter || 0;
    const yogurtQty = inventory.yogurt || 0;
    const fertileEggQty = inventory.fertile_egg || 0;
    // Biome & exotic items
    const peixeQty = inventory.peixe || 0;
    const melQty = inventory.mel || 0;
    const cogumeloQty = inventory.cogumelo || 0;
    const hidromelQty = inventory.hidromel || 0;
    const risotoQty = inventory.risoto_cogumelo || 0;
    const conservaPeixeQty = inventory.conserva_peixe || 0;
    const melEnvasadoQty = inventory.mel_envasado || 0;
    const sopaCogumeloQty = inventory.sopa_cogumelo || 0;
    // Special / exotic products
    const quailEggQty = inventory.quail_egg || 0;
    const alpacaWoolQty = inventory.alpaca_wool || 0;
    const humusQty = inventory.humus || 0;
    const mucoQty = inventory.muco || 0;
    const angoraWoolQty = inventory.angora_wool || 0;
    const sedaBrutaQty = inventory.seda_bruta || 0;
    const coxaRaQty = inventory.coxa_ra || 0;
    const carneAvestruzQty = inventory.carne_avestruz || 0;
    const couroAvestruzQty = inventory.couro_avestruz || 0;
    const carneJacareQty = inventory.carne_jacare || 0;
    const couroJacareQty = inventory.couro_jacare || 0;
    const queijoCabraQty = inventory.queijo_cabra || 0;
    const iogurteCabraQty = inventory.iogurte_cabra || 0;
    const leiteCondensadoQty = inventory.leite_condensado || 0;
    const tapeteLhamaQty = inventory.tapete_lhama || 0;
    const cachecolAngoraQty = inventory.cachecol_angora || 0;
    const tecidoAlpacaQty = inventory.tecido_alpaca || 0;
    const fioSedaQty = inventory.fio_seda || 0;
    const mantaPremiumQty = inventory.manta_premium || 0;
    const patePatoQty = inventory.pate_pato || 0;
    const ovoDefumadoQty = inventory.ovo_defumado || 0;
    const conservaCodornaQty = inventory.conserva_codorna || 0;
    const cremeCosmeticoQty = inventory.creme_cosmetico || 0;
    const saboneteNaturalQty = inventory.sabonete_natural || 0;
    const coleteCouroQty = inventory.colete_couro || 0;
    const bolsaExoticaQty = inventory.bolsa_exotica || 0;
    const queijoParmesaoQty = inventory.queijo_parmesao || 0;
    const queijoSerraQty = inventory.queijo_serra || 0;
    const kitGourmetQty = inventory.kit_gourmet || 0;
    const fioLhamaQty = (inventory as any).fio_lhama || 0;
    const cachecolLhamaQty = (inventory as any).cachecol_lhama || 0;
    const gorroLhamaQty = (inventory as any).gorro_lhama || 0;
    const luvasLhamaQty = (inventory as any).luvas_lhama || 0;
    const ponchoLhamaQty = (inventory as any).poncho_lhama || 0;
    const mantaLhamaQty = (inventory as any).manta_lhama || 0;
    const iogurteBufalaQty = (inventory as any).iogurte_bufala || 0;
    const mantegaBufalaQty = (inventory as any).manteiga_bufala || 0;
    const doceLeiteQty = (inventory as any).doce_leite_bufala || 0;
    const burrataQty = (inventory as any).burrata || 0;
    const massaFrescaQty = (inventory as any).massa_fresca || 0;
    const crepeRusticoQty = (inventory as any).crepe_rustico || 0;
    const paoRusticoQty = (inventory as any).pao_rustico || 0;
    const waffelMelQty = (inventory as any).waffle_mel || 0;
    const minhocaVivaQty = (inventory as any).minhoca_viva || 0;
    const biofertilizanteQty = (inventory as any).biofertilizante || 0;
    const serumFacialQty = (inventory as any).serum_facial || 0;
    const mascaraFacialQty = (inventory as any).mascara_facial || 0;

    const allExtras = peixeQty + melQty + cogumeloQty + hidromelQty + risotoQty + conservaPeixeQty + melEnvasadoQty + sopaCogumeloQty + quailEggQty + alpacaWoolQty + humusQty + mucoQty + angoraWoolQty + sedaBrutaQty + coxaRaQty + carneAvestruzQty + couroAvestruzQty + carneJacareQty + couroJacareQty + queijoCabraQty + iogurteCabraQty + leiteCondensadoQty + tapeteLhamaQty + cachecolAngoraQty + tecidoAlpacaQty + fioSedaQty + mantaPremiumQty + patePatoQty + ovoDefumadoQty + conservaCodornaQty + cremeCosmeticoQty + saboneteNaturalQty + coleteCouroQty + bolsaExoticaQty + fioLhamaQty + cachecolLhamaQty + gorroLhamaQty + luvasLhamaQty + ponchoLhamaQty + mantaLhamaQty + iogurteBufalaQty + mantegaBufalaQty + doceLeiteQty + burrataQty + massaFrescaQty + crepeRusticoQty + paoRusticoQty + waffelMelQty + minhocaVivaQty + biofertilizanteQty + serumFacialQty + mascaraFacialQty;

    if (milkQty === 0 && woolQty === 0 && cheeseQty === 0 && scarfQty === 0 && eggQty === 0 && mayoQty === 0 && coalhoQty === 0 && mucarelaQty === 0 && brieQty === 0 && goatMilkQty === 0 && llamaWoolQty === 0 && duckEggQty === 0 && gooseEggQty === 0 && buffaloMilkQty === 0 && buffaloMozzQty === 0 && butterQty === 0 && yogurtQty === 0 && fertileEggQty === 0 && allExtras === 0) {
      if (!quietValue) {
        addLog(`📦 Seu Armazém está completamente vazio de mercadorias para vender!`, 'error');
        triggerAudioResult(() => sfx.playSound('error'));
      }
      return;
    }

    const milkPrice = getDynamicTransactionPrice('milk');
    const woolPrice = getDynamicTransactionPrice('wool');
    const cheesePrice = getDynamicTransactionPrice('cheese');
    const scarfPrice = getDynamicTransactionPrice('scarf');
    const eggPrice = getDynamicTransactionPrice('egg');
    const mayoPrice = getDynamicTransactionPrice('mayo');
    const coalhoPrice = getDynamicTransactionPrice('queijoCoalho');
    const mucarelaPrice = getDynamicTransactionPrice('queijoMucarela');
    const briePrice = getDynamicTransactionPrice('queijoBrie');
    const goatMilkPrice = getDynamicTransactionPrice('goat_milk');
    const llamaWoolPrice = getDynamicTransactionPrice('llama_wool');
    const duckEggPrice = getDynamicTransactionPrice('duck_egg');
    const gooseEggPrice = getDynamicTransactionPrice('goose_egg');
    const buffaloMilkPrice = getDynamicTransactionPrice('buffalo_milk');
    const buffaloMozzPrice = getDynamicTransactionPrice('buffalo_mozzarella');
    const butterPrice = getDynamicTransactionPrice('butter');
    const yogurtPrice = getDynamicTransactionPrice('yogurt');
    const fertileEggPrice = getDynamicTransactionPrice('fertile_egg');
    // Extra item prices
    const peixePrice = getDynamicTransactionPrice('peixe' as any);
    const melPrice = getDynamicTransactionPrice('mel' as any);
    const cogumeloPrice = getDynamicTransactionPrice('cogumelo' as any);
    const hidromelPrice = getDynamicTransactionPrice('hidromel' as any);
    const risotoPrice = getDynamicTransactionPrice('risoto_cogumelo' as any);
    const conservaPeixePrice = getDynamicTransactionPrice('conserva_peixe' as any);
    const melEnvasadoPrice = getDynamicTransactionPrice('mel_envasado' as any);
    const sopaCogumeloPrice = getDynamicTransactionPrice('sopa_cogumelo' as any);
    const quailEggPrice = getDynamicTransactionPrice('quail_egg');
    const alpacaWoolPrice = getDynamicTransactionPrice('alpaca_wool');
    const humusPrice = getDynamicTransactionPrice('humus');
    const mucoPrice = getDynamicTransactionPrice('muco');
    const angoraWoolPrice = getDynamicTransactionPrice('angora_wool');
    const sedaBrutaPrice = getDynamicTransactionPrice('seda_bruta');
    const coxaRaPrice = getDynamicTransactionPrice('coxa_ra');
    const carneAvestruzPrice = getDynamicTransactionPrice('carne_avestruz');
    const couroAvestruzPrice = getDynamicTransactionPrice('couro_avestruz');
    const carneJacarePrice = getDynamicTransactionPrice('carne_jacare');
    const couroJacarePrice = getDynamicTransactionPrice('couro_jacare');
    const queijoCabraPrice = getDynamicTransactionPrice('queijo_cabra');
    const iogurteCabraPrice = getDynamicTransactionPrice('iogurte_cabra');
    const leiteCondensadoPrice = getDynamicTransactionPrice('leite_condensado');
    const tapeteLhamaPrice = getDynamicTransactionPrice('tapete_lhama');
    const cachecolAngoraPrice = getDynamicTransactionPrice('cachecol_angora');
    const tecidoAlpacaPrice = getDynamicTransactionPrice('tecido_alpaca');
    const fioSedaPrice = getDynamicTransactionPrice('fio_seda');
    const mantaPremiumPrice = getDynamicTransactionPrice('manta_premium');
    const patePatoPrice = getDynamicTransactionPrice('pate_pato');
    const ovoDefumadoPrice = getDynamicTransactionPrice('ovo_defumado');
    const conservaCodornaPrice = getDynamicTransactionPrice('conserva_codorna');
    const cremeCosmeticoPrice = getDynamicTransactionPrice('creme_cosmetico');
    const saboneteNaturalPrice = getDynamicTransactionPrice('sabonete_natural');
    const serumFacialPrice = getDynamicTransactionPrice('serum_facial' as any);
    const mascaraFacialPrice = getDynamicTransactionPrice('mascara_facial' as any);
    const coleteCouroPrice = getDynamicTransactionPrice('colete_couro');
    const bolsaExoticaPrice = getDynamicTransactionPrice('bolsa_exotica');
    const fioLhamaPrice = getDynamicTransactionPrice('fio_lhama' as any);
    const cachecolLhamaPrice = getDynamicTransactionPrice('cachecol_lhama' as any);
    const gorroLhamaPrice = getDynamicTransactionPrice('gorro_lhama' as any);
    const luvasLhamaPrice = getDynamicTransactionPrice('luvas_lhama' as any);
    const ponchoLhamaPrice = getDynamicTransactionPrice('poncho_lhama' as any);
    const mantaLhamaPrice = getDynamicTransactionPrice('manta_lhama' as any);
    const iogurteBufalaPrice = getDynamicTransactionPrice('iogurte_bufala' as any);
    const mantegaBufalaPrice = getDynamicTransactionPrice('manteiga_bufala' as any);
    const doceLeitePrice = getDynamicTransactionPrice('doce_leite_bufala' as any);
    const burrataPrice = getDynamicTransactionPrice('burrata' as any);
    const massaFrescaPrice = getDynamicTransactionPrice('massa_fresca' as any);
    const crepeRusticoPrice = getDynamicTransactionPrice('crepe_rustico' as any);
    const paoRusticoPrice = getDynamicTransactionPrice('pao_rustico' as any);
    const waffelMelPrice = getDynamicTransactionPrice('waffle_mel' as any);
    const minhocaVivaPrice = getDynamicTransactionPrice('minhoca_viva' as any);
    const biofertilizantePrice = getDynamicTransactionPrice('biofertilizante' as any);

    const _lm = getFreightMultiplier ? getFreightMultiplier('laticinios') : 1;
    const _em = getFreightMultiplier ? getFreightMultiplier('ovos') : 1;
    const _tm = getFreightMultiplier ? getFreightMultiplier('texteis') : 1;
    const _cm = getFreightMultiplier ? getFreightMultiplier('carnes') : 1;
    const _om = getFreightMultiplier ? getFreightMultiplier('organicos') : 1;
    const _xm = getFreightMultiplier ? getFreightMultiplier('luxo') : 1;

    const totalEarningCalculated = Math.floor(
      (milkQty * milkPrice + goatMilkQty * goatMilkPrice + buffaloMilkQty * buffaloMilkPrice +
       butterQty * butterPrice + yogurtQty * yogurtPrice +
       cheeseQty * cheesePrice + coalhoQty * coalhoPrice + mucarelaQty * mucarelaPrice +
       brieQty * briePrice + buffaloMozzQty * buffaloMozzPrice + queijoCabraQty * queijoCabraPrice +
       iogurteCabraQty * iogurteCabraPrice + leiteCondensadoQty * leiteCondensadoPrice +
       queijoParmesaoQty * getDynamicTransactionPrice('queijo_parmesao' as any) +
       queijoSerraQty * getDynamicTransactionPrice('queijo_serra' as any)) * _lm +
      (eggQty * eggPrice + duckEggQty * duckEggPrice + gooseEggQty * gooseEggPrice +
       quailEggQty * quailEggPrice + fertileEggQty * fertileEggPrice +
       mayoQty * mayoPrice + patePatoQty * patePatoPrice +
       ovoDefumadoQty * ovoDefumadoPrice + conservaCodornaQty * conservaCodornaPrice) * _em +
      (woolQty * woolPrice + llamaWoolQty * llamaWoolPrice + alpacaWoolQty * alpacaWoolPrice +
       angoraWoolQty * angoraWoolPrice + scarfQty * scarfPrice + tapeteLhamaQty * tapeteLhamaPrice +
       cachecolAngoraQty * cachecolAngoraPrice + tecidoAlpacaQty * tecidoAlpacaPrice +
       fioSedaQty * fioSedaPrice + mantaPremiumQty * mantaPremiumPrice +
       fioLhamaQty * fioLhamaPrice + cachecolLhamaQty * cachecolLhamaPrice +
       gorroLhamaQty * gorroLhamaPrice + luvasLhamaQty * luvasLhamaPrice +
       ponchoLhamaQty * ponchoLhamaPrice + mantaLhamaQty * mantaLhamaPrice) * _tm +
      (coxaRaQty * coxaRaPrice + carneAvestruzQty * carneAvestruzPrice +
       carneJacareQty * carneJacarePrice + peixeQty * peixePrice) * _cm +
      (humusQty * humusPrice + mucoQty * mucoPrice + melQty * melPrice +
       melEnvasadoQty * melEnvasadoPrice + cogumeloQty * cogumeloPrice + sedaBrutaQty * sedaBrutaPrice) * _om +
      (couroAvestruzQty * couroAvestruzPrice +
       couroJacareQty * couroJacarePrice + cremeCosmeticoQty * cremeCosmeticoPrice +
       saboneteNaturalQty * saboneteNaturalPrice +
       serumFacialQty * serumFacialPrice + mascaraFacialQty * mascaraFacialPrice +
       coleteCouroQty * coleteCouroPrice + bolsaExoticaQty * bolsaExoticaPrice +
       hidromelQty * hidromelPrice +
       risotoQty * risotoPrice + conservaPeixeQty * conservaPeixePrice +
       sopaCogumeloQty * sopaCogumeloPrice +
       kitGourmetQty * getDynamicTransactionPrice('kit_gourmet' as any)) * _xm +
      (iogurteBufalaQty * iogurteBufalaPrice + mantegaBufalaQty * mantegaBufalaPrice +
       doceLeiteQty * doceLeitePrice + burrataQty * burrataPrice) * _lm +
      massaFrescaQty * massaFrescaPrice * _em +
      (crepeRusticoQty * crepeRusticoPrice + paoRusticoQty * paoRusticoPrice) * _em +
      waffelMelQty * waffelMelPrice * _om +
      (minhocaVivaQty * minhocaVivaPrice + biofertilizanteQty * biofertilizantePrice) * _om
    );

    if (totalEarningCalculated <= 0) return;

    setGold(prev => prev + totalEarningCalculated);
    setDailyEarning(prev => prev + totalEarningCalculated);

    setInventory(prev => ({
      ...prev,
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0,
      goat_milk: 0,
      llama_wool: 0,
      duck_egg: 0,
      goose_egg: 0,
      buffalo_milk: 0,
      buffalo_mozzarella: 0,
      butter: 0,
      yogurt: 0,
      fertile_egg: 0,
      quail_egg: 0, alpaca_wool: 0, humus: 0, muco: 0, angora_wool: 0, seda_bruta: 0,
      coxa_ra: 0, carne_avestruz: 0, couro_avestruz: 0,
      carne_jacare: 0, couro_jacare: 0, queijo_cabra: 0, iogurte_cabra: 0,
      leite_condensado: 0, tapete_lhama: 0, cachecol_angora: 0, tecido_alpaca: 0,
      fio_seda: 0, manta_premium: 0, pate_pato: 0, ovo_defumado: 0, conserva_codorna: 0,
      creme_cosmetico: 0, sabonete_natural: 0, serum_facial: 0, mascara_facial: 0, colete_couro: 0,
      bolsa_exotica: 0,
      peixe: 0, mel: 0, cogumelo: 0, hidromel: 0, risoto_cogumelo: 0,
      conserva_peixe: 0, mel_envasado: 0, sopa_cogumelo: 0,
      fio_lhama: 0, cachecol_lhama: 0, gorro_lhama: 0, luvas_lhama: 0,
      poncho_lhama: 0, manta_lhama: 0,
      iogurte_bufala: 0, manteiga_bufala: 0, doce_leite_bufala: 0, burrata: 0,
      massa_fresca: 0,
      crepe_rustico: 0, pao_rustico: 0, waffle_mel: 0,
      minhoca_viva: 0, biofertilizante: 0,
    }));

    // Update weekly sales statistics — include ALL sold item types so supply/demand pricing works
    setWeeklySales(prev => {
      const updated: any = { ...prev };
      updated.milk = (prev.milk || 0) + milkQty;
      updated.wool = (prev.wool || 0) + woolQty;
      updated.cheese = (prev.cheese || 0) + cheeseQty;
      updated.scarf = (prev.scarf || 0) + scarfQty;
      updated.egg = (prev.egg || 0) + eggQty;
      updated.mayo = (prev.mayo || 0) + mayoQty;
      updated.queijoCoalho = (prev.queijoCoalho || 0) + coalhoQty;
      updated.queijoMucarela = (prev.queijoMucarela || 0) + mucarelaQty;
      updated.queijoBrie = (prev.queijoBrie || 0) + brieQty;
      // Extended items — stored as dynamic keys via spread so pricing works
      if (goatMilkQty > 0) updated.goat_milk = (prev.goat_milk || 0) + goatMilkQty;
      if (llamaWoolQty > 0) updated.llama_wool = (prev.llama_wool || 0) + llamaWoolQty;
      if (duckEggQty > 0) updated.duck_egg = (prev.duck_egg || 0) + duckEggQty;
      if (gooseEggQty > 0) updated.goose_egg = (prev.goose_egg || 0) + gooseEggQty;
      if (buffaloMilkQty > 0) updated.buffalo_milk = (prev.buffalo_milk || 0) + buffaloMilkQty;
      if (buffaloMozzQty > 0) updated.buffalo_mozzarella = (prev.buffalo_mozzarella || 0) + buffaloMozzQty;
      if (butterQty > 0) updated.butter = (prev.butter || 0) + butterQty;
      if (yogurtQty > 0) updated.yogurt = (prev.yogurt || 0) + yogurtQty;
      if (fertileEggQty > 0) updated.fertile_egg = (prev.fertile_egg || 0) + fertileEggQty;
      if (quailEggQty > 0) updated.quail_egg = (prev.quail_egg || 0) + quailEggQty;
      if (alpacaWoolQty > 0) updated.alpaca_wool = (prev.alpaca_wool || 0) + alpacaWoolQty;
      if (humusQty > 0) updated.humus = (prev.humus || 0) + humusQty;
      if (mucoQty > 0) updated.muco = (prev.muco || 0) + mucoQty;
      if (angoraWoolQty > 0) updated.angora_wool = (prev.angora_wool || 0) + angoraWoolQty;
      if (sedaBrutaQty > 0) updated.seda_bruta = (prev.seda_bruta || 0) + sedaBrutaQty;
      if (coxaRaQty > 0) updated.coxa_ra = (prev.coxa_ra || 0) + coxaRaQty;
      if (carneAvestruzQty > 0) updated.carne_avestruz = (prev.carne_avestruz || 0) + carneAvestruzQty;
      if (couroAvestruzQty > 0) updated.couro_avestruz = (prev.couro_avestruz || 0) + couroAvestruzQty;
      if (carneJacareQty > 0) updated.carne_jacare = (prev.carne_jacare || 0) + carneJacareQty;
      if (couroJacareQty > 0) updated.couro_jacare = (prev.couro_jacare || 0) + couroJacareQty;
      if (queijoCabraQty > 0) updated.queijo_cabra = (prev.queijo_cabra || 0) + queijoCabraQty;
      if (iogurteCabraQty > 0) updated.iogurte_cabra = (prev.iogurte_cabra || 0) + iogurteCabraQty;
      if (leiteCondensadoQty > 0) updated.leite_condensado = (prev.leite_condensado || 0) + leiteCondensadoQty;
      if (peixeQty > 0) updated.peixe = (prev.peixe || 0) + peixeQty;
      if (melQty > 0) updated.mel = (prev.mel || 0) + melQty;
      if (cogumeloQty > 0) updated.cogumelo = (prev.cogumelo || 0) + cogumeloQty;
      if (hidromelQty > 0) updated.hidromel = (prev.hidromel || 0) + hidromelQty;
      if (risotoQty > 0) updated.risoto_cogumelo = (prev.risoto_cogumelo || 0) + risotoQty;
      if (conservaPeixeQty > 0) updated.conserva_peixe = (prev.conserva_peixe || 0) + conservaPeixeQty;
      if (melEnvasadoQty > 0) updated.mel_envasado = (prev.mel_envasado || 0) + melEnvasadoQty;
      if (sopaCogumeloQty > 0) updated.sopa_cogumelo = (prev.sopa_cogumelo || 0) + sopaCogumeloQty;
      if (fioLhamaQty > 0) updated.fio_lhama = (prev.fio_lhama || 0) + fioLhamaQty;
      if (cachecolLhamaQty > 0) updated.cachecol_lhama = (prev.cachecol_lhama || 0) + cachecolLhamaQty;
      if (gorroLhamaQty > 0) updated.gorro_lhama = (prev.gorro_lhama || 0) + gorroLhamaQty;
      if (luvasLhamaQty > 0) updated.luvas_lhama = (prev.luvas_lhama || 0) + luvasLhamaQty;
      if (ponchoLhamaQty > 0) updated.poncho_lhama = (prev.poncho_lhama || 0) + ponchoLhamaQty;
      if (mantaLhamaQty > 0) updated.manta_lhama = (prev.manta_lhama || 0) + mantaLhamaQty;
      if (iogurteBufalaQty > 0) updated.iogurte_bufala = (prev.iogurte_bufala || 0) + iogurteBufalaQty;
      if (mantegaBufalaQty > 0) updated.manteiga_bufala = (prev.manteiga_bufala || 0) + mantegaBufalaQty;
      if (doceLeiteQty > 0) updated.doce_leite_bufala = (prev.doce_leite_bufala || 0) + doceLeiteQty;
      if (burrataQty > 0) updated.burrata = (prev.burrata || 0) + burrataQty;
      if (massaFrescaQty > 0) updated.massa_fresca = (prev.massa_fresca || 0) + massaFrescaQty;
      if (crepeRusticoQty > 0) updated.crepe_rustico = (prev.crepe_rustico || 0) + crepeRusticoQty;
      if (paoRusticoQty > 0) updated.pao_rustico = (prev.pao_rustico || 0) + paoRusticoQty;
      if (waffelMelQty > 0) updated.waffle_mel = (prev.waffle_mel || 0) + waffelMelQty;
      if (minhocaVivaQty > 0) updated.minhoca_viva = (prev.minhoca_viva || 0) + minhocaVivaQty;
      if (biofertilizanteQty > 0) updated.biofertilizante = (prev.biofertilizante || 0) + biofertilizanteQty;
      if (serumFacialQty > 0) updated.serum_facial = (prev.serum_facial || 0) + serumFacialQty;
      if (mascaraFacialQty > 0) updated.mascara_facial = (prev.mascara_facial || 0) + mascaraFacialQty;
      return updated;
    });

    const totalAllQty = milkQty + woolQty + cheeseQty + scarfQty + eggQty + mayoQty + coalhoQty + mucarelaQty + brieQty + goatMilkQty + llamaWoolQty + duckEggQty + gooseEggQty + buffaloMilkQty + buffaloMozzQty + butterQty + yogurtQty + fertileEggQty + allExtras;
    setStats(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + totalEarningCalculated,
      totalSold: prev.totalSold + totalAllQty,
      totalMerchantTrades: merchantActive
        ? (prev.totalMerchantTrades || 0) + totalAllQty
        : (prev.totalMerchantTrades || 0)
    }));

    // BUG 7 FIX: weeklyStats agora atualiza todos os produtos vendidos, não só egg/mayo
    setWeeklyStats(prev => ({
      ...prev,
      earnings: prev.earnings + totalEarningCalculated,
      milk: (prev.milk || 0) + milkQty,
      wool: (prev.wool || 0) + woolQty,
      cheese: (prev.cheese || 0) + cheeseQty,
      scarf: (prev.scarf || 0) + scarfQty,
      egg: prev.egg + eggQty,
      mayo: prev.mayo + mayoQty
    }));

    let messageParts = [];
    if (milkQty > 0) messageParts.push(`${milkQty} leites`);
    if (woolQty > 0) messageParts.push(`${woolQty} lãs`);
    if (cheeseQty > 0) messageParts.push(`${cheeseQty} queijos simples`);
    if (coalhoQty > 0) messageParts.push(`${coalhoQty} queijos coalho`);
    if (mucarelaQty > 0) messageParts.push(`${mucarelaQty} muçarelas`);
    if (brieQty > 0) messageParts.push(`${brieQty} queijos brie`);
    if (scarfQty > 0) messageParts.push(`${scarfQty} cachecóis`);
    if (eggQty > 0) messageParts.push(`${eggQty} ovos`);
    if (mayoQty > 0) messageParts.push(`${mayoQty} maioneses`);
    if (goatMilkQty > 0) messageParts.push(`${goatMilkQty} leite de cabra`);
    if (llamaWoolQty > 0) messageParts.push(`${llamaWoolQty} lã de lhama`);
    if (duckEggQty > 0) messageParts.push(`${duckEggQty} ovos de pato`);
    if (gooseEggQty > 0) messageParts.push(`${gooseEggQty} ovos de ganso`);
    if (buffaloMilkQty > 0) messageParts.push(`${buffaloMilkQty} leite de búfala`);
    if (buffaloMozzQty > 0) messageParts.push(`${buffaloMozzQty} muç. de búfala`);
    if (butterQty > 0) messageParts.push(`${butterQty} manteigas`);
    if (yogurtQty > 0) messageParts.push(`${yogurtQty} iogurtes`);
    if (fertileEggQty > 0) messageParts.push(`${fertileEggQty} ovos férteis`);
    if (quailEggQty > 0) messageParts.push(`${quailEggQty} ovos de codorna`);
    if (alpacaWoolQty > 0) messageParts.push(`${alpacaWoolQty} lã de alpaca`);
    if (humusQty > 0) messageParts.push(`${humusQty} húmus`);
    if (mucoQty > 0) messageParts.push(`${mucoQty} muco`);
    if (angoraWoolQty > 0) messageParts.push(`${angoraWoolQty} lã angorá`);
    if (sedaBrutaQty > 0) messageParts.push(`${sedaBrutaQty} seda bruta`);
    if (coxaRaQty > 0) messageParts.push(`${coxaRaQty} coxas de rã`);
    if (carneAvestruzQty > 0) messageParts.push(`${carneAvestruzQty} carne de avestruz`);
    if (couroAvestruzQty > 0) messageParts.push(`${couroAvestruzQty} couro de avestruz`);
    if (carneJacareQty > 0) messageParts.push(`${carneJacareQty} carne de jacaré`);
    if (couroJacareQty > 0) messageParts.push(`${couroJacareQty} couro de jacaré`);
    if (peixeQty > 0) messageParts.push(`${peixeQty} peixes`);
    if (melQty > 0) messageParts.push(`${melQty} mel`);
    if (cogumeloQty > 0) messageParts.push(`${cogumeloQty} cogumelos`);
    if (hidromelQty > 0) messageParts.push(`${hidromelQty} hidromeis`);
    if (risotoQty > 0) messageParts.push(`${risotoQty} risotos`);
    if (conservaPeixeQty > 0) messageParts.push(`${conservaPeixeQty} conservas de peixe`);
    if (melEnvasadoQty > 0) messageParts.push(`${melEnvasadoQty} mel envasado`);
    if (sopaCogumeloQty > 0) messageParts.push(`${sopaCogumeloQty} sopas de cogumelo`);
    if (fioSedaQty > 0) messageParts.push(`${fioSedaQty} fios de seda`);
    if (mantaPremiumQty > 0) messageParts.push(`${mantaPremiumQty} mantas premium`);
    if (coleteCouroQty > 0) messageParts.push(`${coleteCouroQty} coletes de couro`);
    if (bolsaExoticaQty > 0) messageParts.push(`${bolsaExoticaQty} bolsas exóticas`);
    if (fioLhamaQty > 0) messageParts.push(`${fioLhamaQty} fios de lhama`);
    if (cachecolLhamaQty > 0) messageParts.push(`${cachecolLhamaQty} cachecóis de lhama`);
    if (gorroLhamaQty > 0) messageParts.push(`${gorroLhamaQty} gorros de lhama`);
    if (luvasLhamaQty > 0) messageParts.push(`${luvasLhamaQty} luvas de lhama`);
    if (ponchoLhamaQty > 0) messageParts.push(`${ponchoLhamaQty} ponchos de lhama`);
    if (mantaLhamaQty > 0) messageParts.push(`${mantaLhamaQty} mantas de lhama`);
    if (iogurteBufalaQty > 0) messageParts.push(`${iogurteBufalaQty} iogurtes de búfala`);
    if (mantegaBufalaQty > 0) messageParts.push(`${mantegaBufalaQty} manteiga de búfala`);
    if (doceLeiteQty > 0) messageParts.push(`${doceLeiteQty} doce de leite búfala`);
    if (burrataQty > 0) messageParts.push(`${burrataQty} burratas`);
    if (massaFrescaQty > 0) messageParts.push(`${massaFrescaQty} massas frescas de ovo de ganso`);
    if (crepeRusticoQty > 0) messageParts.push(`${crepeRusticoQty} crepes rústicos`);
    if (paoRusticoQty > 0) messageParts.push(`${paoRusticoQty} pães rústicos`);
    if (waffelMelQty > 0) messageParts.push(`${waffelMelQty} waffles de mel`);
    if (minhocaVivaQty > 0) messageParts.push(`${minhocaVivaQty} minhocas vivas`);
    if (biofertilizanteQty > 0) messageParts.push(`${biofertilizanteQty} biofertilizantes`);

    addLog(`💰 Você vendeu tudo: ${messageParts.join(', ')} por ${totalEarningCalculated} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('sell'));
    if (worldEvent && worldEvent.priceMult > 1 && totalEarningCalculated >= 500) {
      setTimeout(() => checkAndUnlockAchievement?.('world_event_profited'), 0);
    }

    // XP por venda: 1 XP por item vendido, bônus por processados
    const xpEarned = totalAllQty + (coalhoQty + mucarelaQty + brieQty + scarfQty + butterQty + yogurtQty + buffaloMozzQty) * 2;
    if (xpEarned > 0) setFarmXp(prev => prev + xpEarned);

    // Custom feedback
    spawnFeedback('💰', `+${totalEarningCalculated} 💰`, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as any);
  };

  // --- BIOME CRAFT FUNCTIONS ---

  const craftHidromel = (event?: React.MouseEvent) => {
    if (farmLevel < 8) { addLog('🍺 Hidromel requer Nível 8!', 'error'); return; }
    if ((inventory.mel ?? 0) < 2 || (inventory.milk ?? 0) < 3) { addLog('🍺 Precisa: 2 Mel + 3 Leite', 'error'); return; }
    setInventory(prev => ({ ...prev, mel: (prev.mel ?? 0) - 2, milk: prev.milk - 3, hidromel: (prev.hidromel ?? 0) + 1 }));
    applyCraftCost('hidromel');
    addLog('🍺 Hidromel artesanal produzido! (+180💰)', 'success');
    setFarmXp(prev => prev + 5);
    spawnFeedback('🍺', 'Hidromel!', event);
  };

  const craftRisotoCogumelo = (event?: React.MouseEvent) => {
    if (farmLevel < 5) { addLog('🍄 Risoto requer Nível 5!', 'error'); return; }
    if ((inventory.cogumelo ?? 0) < 3) { addLog('🍄 Precisa: 3 Cogumelos', 'error'); return; }
    setInventory(prev => ({ ...prev, cogumelo: (prev.cogumelo ?? 0) - 3, risoto_cogumelo: (prev.risoto_cogumelo ?? 0) + 1 }));
    applyCraftCost('risoto_cogumelo');
    addLog('🍄 Risoto de Cogumelo preparado! (+120💰)', 'success');
    setFarmXp(prev => prev + 3);
    spawnFeedback('🍄', 'Risoto!', event);
  };

  const craftConservaPeixe = (event?: React.MouseEvent) => {
    if (farmLevel < 4) { addLog('🐟 Conserva requer Nível 4!', 'error'); return; }
    if ((inventory.peixe ?? 0) < 2) { addLog('🐟 Precisa: 2 Peixe', 'error'); return; }
    setInventory(prev => ({ ...prev, peixe: (prev.peixe ?? 0) - 2, conserva_peixe: (prev.conserva_peixe ?? 0) + 1 }));
    applyCraftCost('conserva_peixe');
    addLog('🐟 Conserva de Peixe envasada! (+95💰)', 'success');
    setFarmXp(prev => prev + 3);
    spawnFeedback('🐟', 'Conserva!', event);
  };

  const craftMelEnvasado = (event?: React.MouseEvent) => {
    if (farmLevel < 3) { addLog('🍯 Mel Envasado requer Nível 3!', 'error'); return; }
    if ((inventory.mel ?? 0) < 3) { addLog('🍯 Precisa: 3 Mel', 'error'); return; }
    setInventory(prev => ({ ...prev, mel: (prev.mel ?? 0) - 3, mel_envasado: (prev.mel_envasado ?? 0) + 1 }));
    applyCraftCost('mel_envasado');
    addLog('🍯 Mel Envasado produzido! (+200💰)', 'success');
    setFarmXp(prev => prev + 4);
    spawnFeedback('🍯', 'Mel!', event);
  };

  const craftSopaCogumelo = (event?: React.MouseEvent) => {
    if (farmLevel < 3) { addLog('🍲 Sopa requer Nível 3!', 'error'); return; }
    if ((inventory.cogumelo ?? 0) < 2) { addLog('🍲 Precisa: 2 Cogumelos', 'error'); return; }
    setInventory(prev => ({ ...prev, cogumelo: (prev.cogumelo ?? 0) - 2, sopa_cogumelo: (prev.sopa_cogumelo ?? 0) + 1 }));
    applyCraftCost('sopa_cogumelo');
    addLog('🍲 Sopa de Cogumelo preparada! (+80💰)', 'success');
    setFarmXp(prev => prev + 2);
    spawnFeedback('🍲', 'Sopa!', event);
  };

  // --- LHAMA CHAIN CRAFT FUNCTIONS ---

  const craftFioLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 3) { addLog('🧶 Fio de Lhama requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.llama_wool ?? 0) < 1) { addLog('🦙 Falta Lã de Lhama! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Lhama!', event); return; }
    setInventory(prev => ({ ...prev, llama_wool: (prev.llama_wool ?? 0) - 1, fio_lhama: (prev.fio_lhama ?? 0) + 1 }));
    applyCraftCost('fio_lhama');
    addLog('🧶 Você fiou 1 Fio de Lhama!', 'success');
    setFarmXp(prev => prev + 2);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', '+1 Fio Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftCachecolLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🧣 Cachecol de Lhama requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.fio_lhama ?? 0) < 1) { addLog('🧶 Falta Fio de Lhama! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Fio Lhama!', event); return; }
    if ((inventory.llama_wool ?? 0) < 1) { addLog('🦙 Falta Lã de Lhama! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Lhama!', event); return; }
    setInventory(prev => ({ ...prev, fio_lhama: (prev.fio_lhama ?? 0) - 1, llama_wool: (prev.llama_wool ?? 0) - 1, cachecol_lhama: (prev.cachecol_lhama ?? 0) + 1 }));
    applyCraftCost('cachecol_lhama');
    addLog('🧣 Você confeccionou 1 Cachecol de Lhama!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧣', '+1 Cachecol Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftGorroLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🧢 Gorro de Lhama requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.llama_wool ?? 0) < 2) { addLog('🦙 Falta Lã de Lhama! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Lhama!', event); return; }
    setInventory(prev => ({ ...prev, llama_wool: (prev.llama_wool ?? 0) - 2, gorro_lhama: (prev.gorro_lhama ?? 0) + 1 }));
    applyCraftCost('gorro_lhama');
    addLog('🧢 Você confeccionou 1 Gorro de Lhama!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧢', '+1 Gorro Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftLuvasLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🧤 Luvas de Lhama requerem Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.llama_wool ?? 0) < 2) { addLog('🦙 Falta Lã de Lhama! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Lã Lhama!', event); return; }
    setInventory(prev => ({ ...prev, llama_wool: (prev.llama_wool ?? 0) - 2, luvas_lhama: (prev.luvas_lhama ?? 0) + 1 }));
    applyCraftCost('luvas_lhama');
    addLog('🧤 Você confeccionou 1 par de Luvas de Lhama!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧤', '+1 Luvas Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftPonchoLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🦙 Poncho de Lhama requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.fio_lhama ?? 0) < 2) { addLog('🧶 Falta Fio de Lhama! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Fio Lhama!', event); return; }
    setInventory(prev => ({ ...prev, fio_lhama: (prev.fio_lhama ?? 0) - 2, poncho_lhama: (prev.poncho_lhama ?? 0) + 1 }));
    applyCraftCost('poncho_lhama');
    addLog('🦙 Você confeccionou 1 Poncho de Lhama!', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🦙', '+1 Poncho Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftMantaLhama = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🛏️ Manta de Lhama requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.poncho_lhama ?? 0) < 1) { addLog('🦙 Falta Poncho de Lhama! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Poncho!', event); return; }
    if ((inventory.fio_lhama ?? 0) < 1) { addLog('🧶 Falta Fio de Lhama! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Fio Lhama!', event); return; }
    setInventory(prev => ({ ...prev, poncho_lhama: (prev.poncho_lhama ?? 0) - 1, fio_lhama: (prev.fio_lhama ?? 0) - 1, manta_lhama: (prev.manta_lhama ?? 0) + 1 }));
    applyCraftCost('manta_lhama');
    addLog('🛏️ Você criou 1 Manta de Lhama artesanal!', 'success');
    setFarmXp(prev => prev + 5);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🛏️', '+1 Manta Lhama', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- BÚFALA DERIVATIVES (maturação) ---

  const craftIogurteBufala = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🥛 Iogurte de Búfala requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.buffalo_milk ?? 0) < 2) { addLog('🐃 Falta Leite de Búfala! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Búfala!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'iogurte_bufala', diasRestantes: 2 }]);
    applyCraftCost('iogurte_bufala');
    addLog('🥛 Iogurte de Búfala em fermentação! Pronto em 2 dias.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', 'Fermentando... 2d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftManteiganBufala = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 4) { addLog('🧈 Manteiga de Búfala requer Nível 4!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.buffalo_milk ?? 0) < 2) { addLog('🐃 Falta Leite de Búfala! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Búfala!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) - 2 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'manteiga_bufala', diasRestantes: 1 }]);
    applyCraftCost('manteiga_bufala');
    addLog('🧈 Manteiga de Búfala em preparo! Pronta em 1 dia.', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧈', 'Preparando... 1d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftDoceLeitelBufala = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🍮 Doce de Leite de Búfala requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.buffalo_milk ?? 0) < 3) { addLog('🐃 Falta Leite de Búfala! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Búfala!', event); return; }
    if ((inventory.manteiga_bufala ?? 0) < 1) { addLog('🧈 Falta Manteiga de Búfala! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Mant.Búfala!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) - 3, manteiga_bufala: (prev.manteiga_bufala ?? 0) - 1 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'doce_leite_bufala', diasRestantes: 3 }]);
    applyCraftCost('doce_leite_bufala');
    addLog('🍮 Doce de Leite de Búfala em preparo! Pronto em 3 dias.', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🍮', 'Cozinhando... 3d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  const craftBurrata = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 7) { addLog('🧀 Burrata requer Nível 7!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.buffalo_milk ?? 0) < 3) { addLog('🐃 Falta Leite de Búfala! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta L.Búfala!', event); return; }
    if ((inventory.buffalo_mozzarella ?? 0) < 1) { addLog('🧀 Falta Muçarela de Búfala! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Muçarela!', event); return; }
    if (queijosEmMaturacao.length >= maxPrateleiras) { addLog('Prateleiras cheias! Aguarde outros produtos terminarem.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event); return; }
    setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) - 3, buffalo_mozzarella: (prev.buffalo_mozzarella ?? 0) - 1 }));
    setQueijosEmMaturacao(prev => [...prev, { tipo: 'burrata', diasRestantes: 4 }]);
    applyCraftCost('burrata');
    addLog('🧀 Burrata em maturação! Pronta em 4 dias.', 'success');
    setFarmXp(prev => prev + 5);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧀', 'Maturando... 4d', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- MASSA FRESCA ---

  const craftMassaFresca = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 5) { addLog('🍝 Massa Fresca requer Nível 5!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.goose_egg ?? 0) < 1) { addLog('🪿 Falta Ovo de Ganso! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ov.Ganso!', event); return; }
    if ((inventory.farinha ?? 0) < 1) { addLog('🌾 Falta Farinha! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Farinha!', event); return; }
    setInventory(prev => ({ ...prev, goose_egg: (prev.goose_egg ?? 0) - 1, farinha: (prev.farinha ?? 0) - 1, massa_fresca: (prev.massa_fresca ?? 0) + 1 }));
    applyCraftCost('massa_fresca');
    addLog('🍝 Você preparou 1 Massa Fresca de Ovo de Ganso!', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🍝', '+1 M.Fresca Ganso', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- CREPE RÚSTICO ---
  const craftCrepeRustico = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 3) { addLog('🥞 Crepe Rústico requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.egg ?? 0) < 1) { addLog('🥚 Falta Ovo! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ovo!', event); return; }
    if ((inventory.farinha ?? 0) < 1) { addLog('🌾 Falta Farinha! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Farinha!', event); return; }
    setInventory(prev => ({ ...prev, egg: (prev.egg ?? 0) - 1, farinha: (prev.farinha ?? 0) - 1, crepe_rustico: (prev.crepe_rustico ?? 0) + 1 }));
    applyCraftCost('crepe_rustico');
    addLog('🥞 Você preparou 1 Crepe Rústico!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥞', '+1 Crepe Rústico', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- PÃO RÚSTICO ---
  const craftPaoRustico = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 3) { addLog('🥐 Pão Rústico requer Nível 3!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.farinha ?? 0) < 2) { addLog('🌾 Falta Farinha! Precisa de 2.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Farinha!', event); return; }
    if ((inventory.milk ?? 0) < 1) { addLog('🥛 Falta Leite! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Leite!', event); return; }
    setInventory(prev => ({ ...prev, farinha: (prev.farinha ?? 0) - 2, milk: (prev.milk ?? 0) - 1, pao_rustico: (prev.pao_rustico ?? 0) + 1 }));
    applyCraftCost('pao_rustico');
    addLog('🥐 Você preparou 1 Pão Rústico!', 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥐', '+1 Pão Rústico', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- WAFFLE DE MEL ---
  const craftWaffelMel = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🧇 Waffle de Mel requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.farinha ?? 0) < 1) { addLog('🌾 Falta Farinha! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Farinha!', event); return; }
    if ((inventory.egg ?? 0) < 1) { addLog('🥚 Falta Ovo! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ovo!', event); return; }
    if ((inventory as any).mel < 1) { addLog('🍯 Falta Mel! Precisa de 1.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Mel!', event); return; }
    setInventory(prev => ({ ...prev, farinha: (prev.farinha ?? 0) - 1, egg: (prev.egg ?? 0) - 1, mel: (prev as any).mel - 1, waffle_mel: (prev as any).waffle_mel + 1 }));
    applyCraftCost('waffle_mel');
    addLog('🧇 Você preparou 1 Waffle de Mel!', 'success');
    setFarmXp(prev => prev + 5);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧇', '+1 Waffle de Mel', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- BIOFERTILIZANTE LÍQUIDO ---
  const craftBiofertilizante = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 6) { addLog('🧴 Biofertilizante requer Nível 6!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.humus ?? 0) < 3) { addLog('🪱 Falta Húmus! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Húmus!', event); return; }
    setInventory(prev => ({ ...prev, humus: (prev.humus ?? 0) - 3, biofertilizante: (prev as any).biofertilizante + 1 }));
    applyCraftCost('biofertilizante');
    addLog('🧴 Você produziu 1 Biofertilizante Líquido!', 'success');
    setFarmXp(prev => prev + 4);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧴', '+1 Biofertilizante', event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // --- BUY FUNCTIONS ---

  const buyFarinha = (qty: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const pricePerUnit = 6;
    const totalCost = pricePerUnit * qty;
    if (gold < totalCost) {
      addLog(`💰 Moedas insuficientes! Requer ${totalCost} moedas.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }
    setGold(prev => prev - totalCost);
    onGoldSpent?.(totalCost);
    setInventory(prev => ({ ...prev, farinha: (prev.farinha ?? 0) + qty }));
    setWeeklyStats(prev => ({ ...prev, spending: prev.spending + totalCost }));
    addLog(`🌾 Compra realizada: +${qty} Farinha de Trigo por ${totalCost} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🌾', `-${totalCost}💰`, event);
  };

  const buyFolhaAmoreira = (qty: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const pricePerUnit = 5;
    const totalCost = pricePerUnit * qty;
    if (gold < totalCost) {
      addLog(`💰 Moedas insuficientes! Requer ${totalCost} moedas.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }
    setGold(prev => prev - totalCost);
    onGoldSpent?.(totalCost);
    setInventory(prev => ({ ...prev, folha_amoreira: (prev.folha_amoreira ?? 0) + qty }));
    setWeeklyStats(prev => ({ ...prev, spending: prev.spending + totalCost }));
    addLog(`🌿 Compra realizada: +${qty} Folha de Amoreira por ${totalCost} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🌿', `-${totalCost}💰`, event);
  };

  return {
    // States
    inventory,
    setInventory,
    productFreshness,
    setProductFreshness,
    queijosEmMaturacao,
    setQueijosEmMaturacao,
    maxPrateleiras,
    setMaxPrateleiras,
    totalQueijosFabricados,
    setTotalQueijosFabricados,
    queijosFabricadosTipos,
    setQueijosFabricadosTipos,
    queijariaNivel,
    setQueijariaNivel,
    atelieTab,
    setAtelieTab,
    racaoOrganicaDays,
    setRacaoOrganicaDays,
    fertilizanteDays,
    setFertilizanteDays,
    scarfQueue,
    setScarfQueue,
    // Craft functions
    craftBuffaloMozzarella,
    craftMayonese,
    craftButter,
    craftYogurt,
    craftQueijoCabra,
    craftIogurteCabra,
    craftQueijoPecorino,
    craftIoguteOvelha,
    craftRicotaOvelha,
    craftDoceLeiteOvelha,
    craftLeiteCondensado,
    craftTapeteLhama,
    craftCachecolAngora,
    craftTecidoAlpaca,
    craftFioSeda,
    craftMantaPremium,
    craftPatePato,
    craftOvoDefumado,
    craftConservaCodorna,
    craftCremeCosmetico,
    craftSaboneteNatural,
    craftSerumFacial,
    craftMascaraFacial,
    craftRacaoOrganica,
    craftFertilizante,
    craftColeteCouro,
    craftBolsaExotica,
    craftCheese,
    craftQueijo,
    craftQueijoParmesao,
    craftQueijoSerra,
    craftKitGourmet,
    craftScarf,
    craftHidromel,
    craftRisotoCogumelo,
    craftConservaPeixe,
    craftMelEnvasado,
    craftSopaCogumelo,
    craftFioLhama,
    craftCachecolLhama,
    craftGorroLhama,
    craftLuvasLhama,
    craftPonchoLhama,
    craftMantaLhama,
    craftIogurteBufala,
    craftManteiganBufala,
    craftDoceLeitelBufala,
    craftBurrata,
    craftMassaFresca,
    craftCrepeRustico,
    craftPaoRustico,
    craftWaffelMel,
    craftBiofertilizante,
    // Sell functions
    sellProduct,
    sellAllItemsNoConfirm,
    // Buy functions
    buyFarinha,
    buyFolhaAmoreira,
  };
}
