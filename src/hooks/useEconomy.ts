/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

export interface UseEconomyProps {
  // No external dependencies needed — all state is initialized from localStorage
}

export function useEconomy(_props: UseEconomyProps = {}) {

  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).gold ?? 60;
    } catch (e) {}
    return 60;
  });

  const [debt, setDebt] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).debt ?? 0;
    } catch (e) {}
    return 0;
  });

  const [dailyEarning, setDailyEarning] = useState<number>(0);

  const [earningsHistory, setEarningsHistory] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.earningsHistory)) return parsed.earningsHistory;
      }
    } catch (e) {}
    return [];
  });

  const [weeklySales, setWeeklySales] = useState<{ milk: number; wool: number; cheese: number; scarf: number; carne: number; egg: number; mayo: number; queijoCoalho: number; queijoMucarela: number; queijoBrie: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weeklySales) {
          return {
            milk: parsed.weeklySales.milk ?? 0,
            wool: parsed.weeklySales.wool ?? 0,
            cheese: parsed.weeklySales.cheese ?? 0,
            scarf: parsed.weeklySales.scarf ?? 0,
            carne: parsed.weeklySales.carne ?? 0,
            egg: parsed.weeklySales.egg ?? 0,
            mayo: parsed.weeklySales.mayo ?? 0,
            queijoCoalho: parsed.weeklySales.queijoCoalho ?? 0,
            queijoMucarela: parsed.weeklySales.queijoMucarela ?? 0,
            queijoBrie: parsed.weeklySales.queijoBrie ?? 0
          };
        }
      }
    } catch (e) {}
    return { milk: 0, wool: 0, cheese: 0, scarf: 0, carne: 0, egg: 0, mayo: 0, queijoCoalho: 0, queijoMucarela: 0, queijoBrie: 0 };
  });

  const [weeklyStats, setWeeklyStats] = useState<{
    earnings: number;
    spending: number;
    milk: number;
    wool: number;
    oxSold: number;
    cheese: number;
    scarf: number;
    egg: number;
    mayo: number;
    waterCost: number;
    energyCost: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weeklyStats) {
          return {
            earnings: parsed.weeklyStats.earnings ?? 0,
            spending: parsed.weeklyStats.spending ?? 0,
            milk: parsed.weeklyStats.milk ?? 0,
            wool: parsed.weeklyStats.wool ?? 0,
            oxSold: parsed.weeklyStats.oxSold ?? 0,
            cheese: parsed.weeklyStats.cheese ?? 0,
            scarf: parsed.weeklyStats.scarf ?? 0,
            egg: parsed.weeklyStats.egg ?? 0,
            mayo: parsed.weeklyStats.mayo ?? 0,
            waterCost: parsed.weeklyStats.waterCost ?? 0,
            energyCost: parsed.weeklyStats.energyCost ?? 0,
          };
        }
      }
    } catch (e) {}
    return { earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0, waterCost: 0, energyCost: 0 };
  });

  const [previousPrices, setPreviousPrices] = useState<{ milk: number; wool: number; cheese: number; scarf: number; carne: number; egg: number; mayo: number; queijoCoalho: number; queijoMucarela: number; queijoBrie: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.previousPrices) {
          return {
            milk: parsed.previousPrices.milk ?? 5,
            wool: parsed.previousPrices.wool ?? 12,
            cheese: parsed.previousPrices.cheese ?? 20,
            scarf: parsed.previousPrices.scarf ?? 30,
            carne: parsed.previousPrices.carne ?? 150,
            egg: parsed.previousPrices.egg ?? 4,
            mayo: parsed.previousPrices.mayo ?? 16,
            queijoCoalho: parsed.previousPrices.queijoCoalho ?? 14,
            queijoMucarela: parsed.previousPrices.queijoMucarela ?? 28,
            queijoBrie: parsed.previousPrices.queijoBrie ?? 65
          };
        }
      }
    } catch (e) {}
    return { milk: 5, wool: 12, cheese: 20, scarf: 30, carne: 150, egg: 4, mayo: 16, queijoCoalho: 14, queijoMucarela: 28, queijoBrie: 65 };
  });

  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.priceHistory) return parsed.priceHistory;
      }
    } catch (e) {}
    return {
      milk: [5, 5, 5, 5, 5, 5, 5],
      wool: [12, 12, 12, 12, 12, 12, 12],
      cheese: [20, 20, 20, 20, 20, 20, 20],
      scarf: [30, 30, 30, 30, 30, 30, 30],
      egg: [4, 4, 4, 4, 4, 4, 4],
      mayo: [16, 16, 16, 16, 16, 16, 16],
      queijoCoalho: [14, 14, 14, 14, 14, 14, 14],
      queijoMucarela: [28, 28, 28, 28, 28, 28, 28],
      queijoBrie: [65, 65, 65, 65, 65, 65, 65],
      // BUG 14 FIX: removida chave duplicada 'meat'; 'carne' é o padrão usado no restante do código
      carne: [150, 150, 150, 150, 150, 150, 150],
      // BUG FIX: novos produtos incluídos no histórico para que getPriceTrend funcione
      goat_milk: [38, 38, 38, 38, 38, 38, 38],
      llama_wool: [45, 45, 45, 45, 45, 45, 45],
      duck_egg: [18, 18, 18, 18, 18, 18, 18],
      goose_egg: [50, 50, 50, 50, 50, 50, 50],
      buffalo_milk: [55, 55, 55, 55, 55, 55, 55],
      buffalo_mozzarella: [120, 120, 120, 120, 120, 120, 120],
      feather: [15, 15, 15, 15, 15, 15, 15],
      peacock_feather: [80, 80, 80, 80, 80, 80, 80],
      butter: [45, 45, 45, 45, 45, 45, 45],
      yogurt: [35, 35, 35, 35, 35, 35, 35],
      fertile_egg: [36, 36, 36, 36, 36, 36, 36],
      quail_egg: [8, 8, 8, 8, 8, 8, 8],
      alpaca_wool: [65, 65, 65, 65, 65, 65, 65],
      humus: [20, 20, 20, 20, 20, 20, 20],
      muco: [120, 120, 120, 120, 120, 120, 120],
      angora_wool: [90, 90, 90, 90, 90, 90, 90],
      seda_bruta: [80, 80, 80, 80, 80, 80, 80],
      coxa_ra: [70, 70, 70, 70, 70, 70, 70],
      carne_avestruz: [200, 200, 200, 200, 200, 200, 200],
      pena_grande: [60, 60, 60, 60, 60, 60, 60],
      couro_avestruz: [300, 300, 300, 300, 300, 300, 300],
      carne_jacare: [250, 250, 250, 250, 250, 250, 250],
      couro_jacare: [400, 400, 400, 400, 400, 400, 400],
      queijo_cabra: [90, 90, 90, 90, 90, 90, 90],
      iogurte_cabra: [55, 55, 55, 55, 55, 55, 55],
      leite_condensado: [100, 100, 100, 100, 100, 100, 100],
      tapete_lhama: [110, 110, 110, 110, 110, 110, 110],
      cachecol_angora: [160, 160, 160, 160, 160, 160, 160],
      tecido_alpaca: [180, 180, 180, 180, 180, 180, 180],
      fio_seda: [200, 200, 200, 200, 200, 200, 200],
      manta_premium: [420, 420, 420, 420, 420, 420, 420],
      pate_pato: [95, 95, 95, 95, 95, 95, 95],
      ovo_defumado: [120, 120, 120, 120, 120, 120, 120],
      conserva_codorna: [80, 80, 80, 80, 80, 80, 80],
      creme_cosmetico: [220, 220, 220, 220, 220, 220, 220],
      sabonete_natural: [140, 140, 140, 140, 140, 140, 140],
      almofada_penas: [170, 170, 170, 170, 170, 170, 170],
      colete_couro: [550, 550, 550, 550, 550, 550, 550],
      bolsa_exotica: [800, 800, 800, 800, 800, 800, 800],
      enfeite_pavao: [200, 200, 200, 200, 200, 200, 200],
    };
  });

  const [merchantActive, setMerchantActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).merchantActive ?? false;
    } catch (e) {}
    return false;
  });

  const [daysSinceMerchant, setDaysSinceMerchant] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).daysSinceMerchant ?? 0;
    } catch (e) {}
    return 0;
  });

  const [nextMerchantDay, setNextMerchantDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextMerchantDay ?? Math.floor(Math.random() * 5) + 3;
    } catch (e) {}
    return Math.floor(Math.random() * 5) + 3;
  });

  const [insurance, setInsurance] = useState<{ active: boolean; premium: number; daysLeft: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.insurance) return parsed.insurance;
      }
    } catch (e) {}
    return { active: false, premium: 50, daysLeft: 0 };
  });

  return {
    gold,
    setGold,
    debt,
    setDebt,
    dailyEarning,
    setDailyEarning,
    earningsHistory,
    setEarningsHistory,
    weeklySales,
    setWeeklySales,
    weeklyStats,
    setWeeklyStats,
    previousPrices,
    setPreviousPrices,
    priceHistory,
    setPriceHistory,
    merchantActive,
    setMerchantActive,
    daysSinceMerchant,
    setDaysSinceMerchant,
    nextMerchantDay,
    setNextMerchantDay,
    insurance,
    setInsurance,
  };
}
