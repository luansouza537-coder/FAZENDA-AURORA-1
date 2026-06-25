import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Animal, AnimalType, FarmStats } from '../types';

// ─── ReproducoesModal ────────────────────────────────────────────────────────

interface ReproEntry { name: string; animalType: string; method: string; day: number; }

interface ReproducoesModalProps {
  reproHistory: ReproEntry[];
  onClose: () => void;
}

export const ReproducoesModal: React.FC<ReproducoesModalProps> = ({ reproHistory, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-pink-700 rounded-[36px] max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-pink-700 to-pink-900 p-5 border-b-4 border-pink-950 text-center shrink-0">
          <h3 className="text-white text-xl font-display font-black uppercase tracking-wider">🐣 Histórico de Reproduções</h3>
          <p className="text-pink-200 text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Últimos 50 nascimentos registrados</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-pink-200 hover:text-white bg-pink-950 hover:bg-pink-800 border-2 border-pink-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all text-lg font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin' }}>
          {reproHistory.length === 0 ? (
            <div className="text-center text-stone-500 text-xs italic py-8">Nenhuma reprodução registrada ainda.</div>
          ) : reproHistory.map((r, i) => (
            <div key={i} className="bg-white border-2 border-pink-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.method === 'natural' ? '🐣' : r.method === 'gestacao' ? '👶' : '🍼'}</span>
                <div>
                  <div className="font-black text-xs text-pink-900">{r.name}</div>
                  <div className="text-[9px] font-mono text-stone-500">{r.animalType} • {r.method === 'natural' ? 'Natural' : r.method === 'gestacao' ? 'Gestação' : 'Filhote comprado'}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 shrink-0">Dia {r.day}</span>
            </div>
          ))}
        </div>
        <div className="bg-pink-50 p-4 border-t-2 border-pink-200 flex justify-end shrink-0">
          <button onClick={onClose} className="bg-pink-600 hover:bg-pink-500 text-white border-b-4 border-pink-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer">Fechar</button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── RankingModal ─────────────────────────────────────────────────────────────

const ANIMAL_EMOJI: Record<string, string> = {
  vaca: '🐄', ovelha: '🐑', boi: '🐂', galinha: '🐔', cabra: '🐐',
  lhama: '🦙', pato: '🦆', ganso: '🦢', bufalo: '🐃', pavao: '🦚',
  codorna: '🐦', alpaca: '🦙', minhoca: '🪱', caracol: '🐌',
  coelho_angora: '🐰', bicho_seda: '🐛', ra: '🐸', avestruz: '🦤', jacare: '🐊',
};

interface RankingModalProps {
  animals: Animal[];
  onClose: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({ animals, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-[#fbbf24] rounded-[36px] max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-[#78350f] to-[#92400e] p-5 text-center shrink-0">
          <div className="text-4xl mb-1">🏆</div>
          <h3 className="text-[#fef3c7] text-xl font-display font-black uppercase tracking-wider">Ranking de Animais</h3>
          <p className="text-[#fcd57e] text-[11px] font-mono mt-0.5">Por produção semanal</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#78350f] hover:bg-[#92400e] border-2 border-[#fbbf24] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2" style={{ scrollbarWidth: 'thin' }}>
          {animals.length === 0 ? (
            <p className="text-center text-stone-500 font-mono text-sm py-8">Nenhum animal na fazenda ainda.</p>
          ) : [...animals].sort((a, b) => (b.weeklyProduction ?? 0) - (a.weeklyProduction ?? 0)).map((animal, idx) => {
            const medals = ['🏆', '🥈', '🥉'];
            return (
              <div key={animal.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${idx === 0 ? 'bg-amber-50 border-amber-400' : idx === 1 ? 'bg-slate-50 border-slate-300' : idx === 2 ? 'bg-orange-50 border-orange-300' : 'bg-white border-stone-200'}`}>
                <span className="text-lg font-black w-8 text-center shrink-0">{idx < 3 ? medals[idx] : `${idx + 1}º`}</span>
                <span className="text-2xl shrink-0">{ANIMAL_EMOJI[animal.type] ?? '🐾'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-[#78350f] text-sm truncate">{animal.name}</div>
                  <div className="text-[10px] font-mono text-stone-500 capitalize">{animal.type}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-emerald-700 text-sm">{animal.weeklyProduction ?? 0} prod.</div>
                  {animal.isCampiao && <div className="text-[9px] font-black text-amber-600">⭐ Campeão</div>}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── FairResultModal ──────────────────────────────────────────────────────────

interface FairResult { day: number; earned: number; category: string; winner: string; }

interface FairResultModalProps {
  result: FairResult;
  onClose: () => void;
}

export const FairResultModal: React.FC<FairResultModalProps> = ({ result, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[199] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-amber-600 rounded-[36px] max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-600 to-yellow-700 p-5 text-center">
          <div className="text-5xl mb-2">🎪</div>
          <h3 className="text-white text-xl font-display font-black uppercase">Resultado da Feira!</h3>
          <p className="text-amber-200 text-xs font-mono mt-1">Dia {result.day}</p>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl font-black text-amber-700 mb-2">+{result.earned} 💰</div>
          <div className="text-stone-600 font-mono text-sm mb-1">Categoria: {result.category}</div>
          <div className="text-stone-500 font-mono text-xs mb-4">{result.winner}</div>
          <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 px-8 py-3 rounded-2xl font-display font-black uppercase text-sm cursor-pointer transition-all hover:scale-105">
            Fechar 🎉
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── AllTimeStatsModal ────────────────────────────────────────────────────────

interface AllTimeStats { bestDay: number; worstDay: number; totalSpentFeed: number; }

interface AllTimeStatsModalProps {
  stats: FarmStats;
  allTimeStats: AllTimeStats;
  currentDay: number;
  onClose: () => void;
}

export const AllTimeStatsModal: React.FC<AllTimeStatsModalProps> = ({ stats, allTimeStats, currentDay, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[#064e3b] border-4 border-[#fbbf24] rounded-[32px] p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
      <h2 className="font-display font-black text-[#fef3c7] text-xl uppercase text-center mb-4">📊 Recordes da Fazenda Aurora</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '💰 Total Faturado', val: stats.totalEarned },
          { label: '🌟 Melhor Dia', val: allTimeStats.bestDay },
          { label: '📦 Itens Coletados', val: stats.totalCollected },
          { label: '🌽 Animais Alimentados', val: stats.totalFed },
          { label: '🥛 Leite Produzido', val: stats.totalMilk ?? 0 },
          { label: '🧶 Lã Coletada', val: stats.totalWool ?? 0 },
          { label: '🥚 Ovos Coletados', val: stats.totalEggs ?? 0 },
          { label: '🧀 Queijos Fabricados', val: stats.totalCheese ?? 0 },
          { label: '🐂 Bois Vendidos', val: stats.totalOxSold ?? 0 },
          { label: '📅 Dias Jogados', val: currentDay },
          { label: '🧣 Cachecóis Tecidos', val: stats.totalScarf ?? 0 },
          { label: '🥣 Maioneses Feitas', val: stats.totalMayo ?? 0 },
        ].map(item => (
          <div key={item.label} className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">{item.label}</div>
            <div className="text-lg font-black font-mono text-[#fef3c7]">{item.val}</div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 w-full bg-[#78350f] text-[#fef3c7] font-black uppercase py-2 rounded-xl border-2 border-[#fbbf24] hover:bg-[#92400e] transition-colors cursor-pointer">Fechar</button>
    </div>
  </div>
);

// ─── CruzamentoModal ─────────────────────────────────────────────────────────

interface ReproducaoAtiva { animalId1: string; animalId2: string; type: string; gestacaoEnd: number; }
interface CruzarModalState { animalId: string; type: AnimalType; id: string; }
type ReproducaoConfig = Partial<Record<AnimalType, { gestacao: number; minAge: number }>>;

interface CruzamentoModalProps {
  cruzarModal: CruzarModalState;
  animals: Animal[];
  reproducaoAtiva: ReproducaoAtiva[];
  reproducaoConfig: ReproducaoConfig;
  currentDay: number;
  onClose: () => void;
  onConfirm: (partner: Animal) => void;
  addLog: (msg: string, type: string) => void;
}

export const CruzamentoModal: React.FC<CruzamentoModalProps> = ({
  cruzarModal, animals, reproducaoAtiva, reproducaoConfig, currentDay,
  onClose, onConfirm, addLog,
}) => {
  const cfg = reproducaoConfig[cruzarModal.type];
  const candidates = animals.filter(a =>
    a.type === cruzarModal.type &&
    a.id !== cruzarModal.id &&
    a.isAdult !== false &&
    !reproducaoAtiva.some(r => r.animalId1 === a.id || r.animalId2 === a.id)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
          className="bg-[#fef3c7] border-4 border-[#fbbf24] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-display font-black text-xl text-[#78350f] uppercase mb-2 flex items-center gap-2">🤝 Reprodução Controlada</h2>
          <p className="text-[11px] text-stone-600 font-mono mb-3">Gestação: {cfg?.gestacao ?? '?'} dias. Selecione o parceiro para cruzar.</p>
          {candidates.length === 0 ? (
            <p className="text-[11px] text-red-600 font-mono">Nenhum parceiro disponível! Compre outro {cruzarModal.type} adulto.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {candidates.map(partner => (
                <button key={partner.id} type="button"
                  onClick={() => onConfirm(partner)}
                  className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black text-xs uppercase px-4 py-2 rounded-xl border-b-2 border-fuchsia-800 transition-all cursor-pointer"
                >
                  {partner.name} (😊 {Math.floor(partner.happiness)}%)
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={onClose} className="mt-3 w-full bg-stone-300 hover:bg-stone-400 text-stone-800 font-black text-xs uppercase px-4 py-2 rounded-xl border-b-2 border-stone-500 transition-all cursor-pointer">Cancelar</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
