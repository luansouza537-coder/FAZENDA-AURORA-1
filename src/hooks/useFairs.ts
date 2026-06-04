/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { FairResult } from '../types';

export interface UseFairsProps {
  addNotification: (message: string, type?: string, overrideDay?: number) => void;
}

export function useFairs({ addNotification }: UseFairsProps) {
  const [nextFairDay, setNextFairDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextFairDay ?? 30;
    } catch (e) {}
    return 30;
  });

  const [fairResults, setFairResults] = useState<FairResult[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).fairResults ?? [];
    } catch (e) {}
    return [];
  });

  const [prestigePoints, setPrestigePoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).prestigePoints ?? 0;
    } catch (e) {}
    return 0;
  });

  const [nextExposicaoDay, setNextExposicaoDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextExposicaoDay ?? 45;
    } catch (e) {}
    return 45;
  });

  const [nextFeiraProdutosDay, setNextFeiraProdutosDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextFeiraProdutosDay ?? 33;
    } catch (e) {}
    return 33;
  });

  const [nextFeiraExoticaDay, setNextFeiraExoticaDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextFeiraExoticaDay ?? 60;
    } catch (e) {}
    return 60;
  });

  const [nextFestivalDay, setNextFestivalDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextFestivalDay ?? 120;
    } catch (e) {}
    return 120;
  });

  const prestigeNotifiedRef = useRef<number[]>([]);

  // Prestige milestone notifications
  useEffect(() => {
    const thresholds = [50, 150, 300, 500];
    thresholds.forEach(t => {
      if (prestigePoints >= t && !prestigeNotifiedRef.current.includes(t)) {
        prestigeNotifiedRef.current.push(t);
        const msgs: Record<number, string> = {
          50: '⭐ Marco 50 pts: Turismo recebe bônus de +10%!',
          150: '⭐ Marco 150 pts: Comerciante aparece com mais frequência!',
          300: '⭐ Marco 300 pts: Todos os preços +5% permanente!',
          500: '🌌 Marco 500 pts: Você é uma LENDA DO AGRO!'
        };
        addNotification(msgs[t], 'success');
      }
    });
  }, [prestigePoints]);

  return {
    nextFairDay,
    setNextFairDay,
    fairResults,
    setFairResults,
    prestigePoints,
    setPrestigePoints,
    nextExposicaoDay,
    setNextExposicaoDay,
    nextFeiraProdutosDay,
    setNextFeiraProdutosDay,
    nextFeiraExoticaDay,
    setNextFeiraExoticaDay,
    nextFestivalDay,
    setNextFestivalDay,
    prestigeNotifiedRef,
  };
}
