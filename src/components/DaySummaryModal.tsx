import React from 'react';
import { motion } from 'motion/react';

export interface DaySummary {
  day: number;
  goldEarned: number;
  goldSpent: number;
  animalsFedfed: number;
  itemsCollected: number;
  contractDeliveries: number;
}

interface DaySummaryModalProps {
  summary: DaySummary;
  onClose: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({ summary, onClose }) => {
  const net = summary.goldEarned - summary.goldSpent;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[90] flex items-end justify-center p-4 sm:items-center"
    >
      <motion.div
        initial={{ y: 80, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-amber-400 rounded-[32px] w-full max-w-sm shadow-2xl p-6"
      >
        <h3 className="text-center font-display font-black text-lg uppercase text-amber-900 mb-1">📅 Dia {summary.day} encerrado</h3>
        <p className="text-center text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-5">Resumo do dia</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-3 text-center">
            <div className="text-lg font-black text-green-700">+{summary.goldEarned}💰</div>
            <div className="text-[10px] font-mono text-green-600 uppercase">Ganhos</div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-center">
            <div className="text-lg font-black text-red-600">-{summary.goldSpent}💰</div>
            <div className="text-[10px] font-mono text-red-500 uppercase">Gastos</div>
          </div>
          <div className={`border-2 rounded-2xl p-3 text-center col-span-2 ${net >= 0 ? 'bg-amber-50 border-amber-300' : 'bg-orange-50 border-orange-300'}`}>
            <div className={`text-xl font-black ${net >= 0 ? 'text-amber-700' : 'text-orange-700'}`}>{net >= 0 ? '+' : ''}{net}💰</div>
            <div className="text-[10px] font-mono text-stone-500 uppercase">Saldo do dia</div>
          </div>
        </div>
        <div className="flex justify-around text-center mb-5">
          <div><div className="text-base font-black text-stone-700">{summary.animalsFedfed}</div><div className="text-[9px] font-mono text-stone-400">🍽️ Alimentados</div></div>
          <div><div className="text-base font-black text-stone-700">{summary.itemsCollected}</div><div className="text-[9px] font-mono text-stone-400">📦 Coletados</div></div>
          <div><div className="text-base font-black text-stone-700">{summary.contractDeliveries}</div><div className="text-[9px] font-mono text-stone-400">📜 Entregas</div></div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 rounded-2xl py-3 font-display font-black uppercase text-sm tracking-wider cursor-pointer transition-all"
        >
          Avançar para o Dia {summary.day + 1} →
        </button>
      </motion.div>
    </motion.div>
  );
};
