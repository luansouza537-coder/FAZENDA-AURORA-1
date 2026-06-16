import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmStats } from '../types';

interface AllTimeStats { totalSpentFeed: number; bestDay: number; worstDay: number; }

interface StatsModalProps {
  stats: FarmStats;
  allTimeStats: AllTimeStats;
  earningsHistory: number[];
  currentDay: number;
  prestigePoints: number;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({
  stats, allTimeStats, earningsHistory, currentDay, prestigePoints, onClose,
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-teal-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 p-5 border-b-4 border-teal-950 text-center shrink-0">
          <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">📊 Painel de Estatísticas</h3>
          <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Histórico de ganhos, produção e desempenho da fazenda</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-teal-950 hover:bg-teal-800 border-2 border-teal-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">📋 Resumo Geral</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-mono text-emerald-700 uppercase font-black">Total Faturado</div>
                <div className="text-base font-black font-mono text-[#78350f] mt-1">💰 {stats.totalEarned}</div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-mono text-amber-700 uppercase font-black">Melhor Dia</div>
                <div className="text-base font-black font-mono text-[#78350f] mt-1">💰 {allTimeStats.bestDay}</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-mono text-blue-700 uppercase font-black">Total Coletado</div>
                <div className="text-base font-black font-mono text-[#78350f] mt-1">📦 {stats.totalCollected}</div>
              </div>
              <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-3 text-center">
                <div className="text-[9px] font-mono text-purple-700 uppercase font-black">Total Alimentados</div>
                <div className="text-base font-black font-mono text-[#78350f] mt-1">🌽 {stats.totalFed}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">📈 Ganhos Diários (últimos {earningsHistory.length} dias)</h4>
            {earningsHistory.length === 0 ? (
              <div className="text-xs text-stone-500 italic text-center py-4">Avance dias para ver o histórico de ganhos.</div>
            ) : (
              <div className="bg-white border-2 border-teal-200 rounded-2xl p-4">
                <div className="flex items-end gap-1.5 h-24 w-full">
                  {earningsHistory.map((val, i) => {
                    const maxVal = Math.max(...earningsHistory, 1);
                    const heightPct = Math.max(5, (val / maxVal) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar" title={`Dia ${currentDay - earningsHistory.length + i}: ${val} moedas`}>
                        <div className="w-full bg-teal-500 rounded-t-md transition-all group-hover/bar:bg-teal-400" style={{ height: `${heightPct}%` }} />
                        <span className="text-[7px] font-mono text-stone-400 leading-none">{val > 0 ? val : '-'}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] text-stone-400 font-mono mt-1">
                  <span>-{earningsHistory.length}d</span><span>hoje</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">🥧 Produção por Tipo</h4>
            <div className="space-y-2">
              {[
                { label: '🥛 Leite Coletado', val: stats.totalMilk || 0, color: 'bg-blue-400' },
                { label: '🧶 Lã Coletada', val: stats.totalWool || 0, color: 'bg-purple-400' },
                { label: '🥚 Ovos Coletados', val: stats.totalEggs || 0, color: 'bg-amber-400' },
                { label: '🧀 Queijos Fabricados', val: stats.totalCheese || 0, color: 'bg-yellow-500' },
                { label: '🧣 Cachecóis Tecidos', val: stats.totalScarf || 0, color: 'bg-indigo-400' },
                { label: '🥣 Maioneses Feitas', val: stats.totalMayo || 0, color: 'bg-green-400' },
                { label: '🐂 Bois Vendidos', val: stats.totalOxSold || 0, color: 'bg-orange-400' },
              ].map(item => {
                const maxVal = Math.max(stats.totalMilk || 0, stats.totalWool || 0, stats.totalEggs || 0, stats.totalCheese || 0, stats.totalScarf || 0, stats.totalMayo || 0, stats.totalOxSold || 0, 1);
                const widthPct = Math.max(2, (item.val / maxVal) * 100);
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-600 w-36 shrink-0">{item.label}</span>
                    <div className="flex-1 bg-stone-200 h-4 rounded-full overflow-hidden border border-stone-300 flex items-center">
                      <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${widthPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-stone-700 w-8 text-right shrink-0">{item.val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {prestigePoints > 0 && (
          <div className="px-6 pb-4">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-yellow-700 mb-3 flex items-center gap-1.5">⭐ Pontos de Prestígio</h4>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black font-mono text-yellow-800">⭐ {prestigePoints} pts</span>
                <span className="text-[10px] font-mono text-yellow-600">
                  {prestigePoints >= 500 ? '🌌 LENDA DO AGRO' : prestigePoints >= 300 ? '👑 Mestre' : prestigePoints >= 150 ? '🥇 Experiente' : prestigePoints >= 50 ? '🥈 Reconhecido' : '🌱 Iniciante'}
                </span>
              </div>
              {[
                { pts: 50, label: 'Turismo +10%', achieved: prestigePoints >= 50 },
                { pts: 150, label: 'Comerciante mais frequente', achieved: prestigePoints >= 150 },
                { pts: 300, label: 'Preços +5% permanente', achieved: prestigePoints >= 300 },
                { pts: 500, label: 'LENDA DO AGRO', achieved: prestigePoints >= 500 },
              ].map(m => (
                <div key={m.pts} className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono ${m.achieved ? 'text-yellow-700 font-bold' : 'text-stone-400'}`}>
                    {m.achieved ? '✅' : '⬜'} {m.pts} pts: {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-teal-50 p-4 border-t-2 border-teal-200 flex justify-end shrink-0">
          <button onClick={onClose} className="bg-teal-600 hover:bg-teal-500 text-white border-b-4 border-teal-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer">
            Fechar Stats
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export default StatsModal;
