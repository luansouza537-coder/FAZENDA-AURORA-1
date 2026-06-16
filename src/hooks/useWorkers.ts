import { useState } from 'react';
import { FarmWorker } from '../types';
import { WORKER_TYPES } from '../data/workers';

interface UseWorkersParams {
  currentDay: number;
  addLog: (msg: string, type: string) => void;
}

export type WorkerTypeEntry = (typeof WORKER_TYPES)[number];

export function useWorkers({ currentDay, addLog }: UseWorkersParams) {
  const [workers, setWorkers] = useState<FarmWorker[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).workers ?? [];
    } catch (e) {}
    return [];
  });

  function hireWorker(wt: WorkerTypeEntry) {
    const newWorker: FarmWorker = {
      id: Math.random().toString(36).substring(2, 9),
      role: wt.role,
      name: wt.name,
      dailyCost: wt.dailyCost,
      hiredDay: currentDay,
    };
    setWorkers(prev => [...prev, newWorker]);
    addLog(`👷 ${wt.name} foi contratado! Custo: -${wt.dailyCost}💰/dia`, 'success');
  }

  function fireWorker(id: string) {
    setWorkers(prev => prev.filter(x => x.id !== id));
    addLog('👷 Peão dispensado.', 'info');
  }

  function hasWorkerRole(role: FarmWorker['role']) {
    return workers.some(w => w.role === role);
  }

  function getDailyCost() {
    return workers.reduce((sum, w) => sum + w.dailyCost, 0);
  }

  return {
    workers,
    setWorkers,
    hireWorker,
    fireWorker,
    hasWorkerRole,
    getDailyCost,
    workerTypes: WORKER_TYPES,
  };
}
