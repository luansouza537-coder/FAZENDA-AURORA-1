import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface GenericDuel {
  categoryLabel: string;
  categoryEmoji: string;
  playerLabel: string;
  playerScore: number;
  rivalLabel: string;
  rivalSub: string;
  rivalScore: number;
  won: boolean;
}

export interface GenericJudgingResult {
  title: string;
  day: number;
  duels: GenericDuel[];
  skipped: { category: string; reason: string }[];
  totalPrize: number;
  totalXp?: number;
  extraNote?: string; // e.g. amostras consignadas perdidas
}

const TICKS = 40; // ~4s por duelo a 100ms
const TICK_MS = 100;

/** Modal de julgamento genérico — reaproveita a animação de duelo em barras da Feira
 * Agropecuária para qualquer feira baseada em "duelos 1x1 por categoria". */
export const GenericJudgingModal: React.FC<{ result: GenericJudgingResult; onClose: () => void }> = ({ result, onClose }) => {
  const [duelIdx, setDuelIdx] = useState(0);
  const [playerBar, setPlayerBar] = useState(0);
  const [rivalBar, setRivalBar] = useState(0);
  const [duelDone, setDuelDone] = useState(false);
  const [allDone, setAllDone] = useState(result.duels.length === 0);
  const [comment, setComment] = useState('🧐 O jurado se aproxima...');
  const tickRef = useRef(0);

  const duel = result.duels[duelIdx];

  useEffect(() => {
    if (!duel) return;
    tickRef.current = 0;
    setPlayerBar(0); setRivalBar(0); setDuelDone(false);
    setComment(`🧐 Avaliando ${duel.playerLabel} vs ${duel.rivalLabel}...`);
    const maxScore = Math.max(duel.playerScore, duel.rivalScore, 10);
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const frac = Math.min(1, t / TICKS);
      setPlayerBar((duel.playerScore / maxScore) * 100 * frac);
      setRivalBar((duel.rivalScore / maxScore) * 100 * frac);
      if (frac > 0.5 && frac < 0.85) setComment('📋 Conferindo os critérios de julgamento...');
      if (t >= TICKS) {
        clearInterval(id);
        setDuelDone(true);
        setComment(duel.won
          ? `🏆 ${duel.playerLabel} venceu ${duel.rivalLabel}!`
          : `😔 ${duel.rivalLabel} (${duel.rivalSub}) levou a melhor desta vez.`);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [duelIdx, duel]);

  const proximo = () => {
    if (duelIdx + 1 < result.duels.length) {
      setDuelIdx(duelIdx + 1);
    } else {
      setAllDone(true);
    }
  };

  const vitorias = result.duels.filter(d => d.won).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-3">
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#fffbeb] border-8 border-amber-600 rounded-[32px] max-w-lg w-full p-5 shadow-2xl"
      >
        <h3 className="text-center font-display font-black text-lg uppercase text-amber-800 mb-1">
          {result.title} — Dia {result.day}
        </h3>

        {result.duels.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-stone-600 font-mono mb-4">Nenhuma categoria disputada desta vez.</p>
            {result.skipped.length > 0 && (
              <div className="text-left bg-stone-100 rounded-2xl p-3 mb-4 space-y-1">
                {result.skipped.map((s, i) => (
                  <p key={i} className="text-[10px] font-mono text-stone-500">🚫 {s.category}: {s.reason}</p>
                ))}
              </div>
            )}
            <button onClick={onClose} className="bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 rounded-2xl px-6 py-3 font-display font-black uppercase text-xs cursor-pointer">
              Fechar
            </button>
          </div>
        ) : !allDone && duel ? (
          <>
            <p className="text-center text-[11px] font-mono font-bold text-amber-700 uppercase mb-3">
              {duel.categoryEmoji} {duel.categoryLabel} — duelo {duelIdx + 1}/{result.duels.length}
            </p>

            <div className="space-y-3 mb-3">
              <div>
                <div className="flex justify-between text-[10px] font-mono font-black text-stone-700 mb-1">
                  <span>⭐ {duel.playerLabel} (você)</span>
                  {duelDone && <span>{duel.playerScore} pts</span>}
                </div>
                <div className="w-full h-5 bg-stone-200 rounded-full overflow-hidden border-2 border-stone-300">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-100" style={{ width: `${playerBar}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono font-black text-stone-700 mb-1">
                  <span>🎗️ {duel.rivalLabel} ({duel.rivalSub})</span>
                  {duelDone && <span>{duel.rivalScore} pts</span>}
                </div>
                <div className="w-full h-5 bg-stone-200 rounded-full overflow-hidden border-2 border-stone-300">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-100" style={{ width: `${rivalBar}%` }} />
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] font-mono text-stone-600 mb-3 min-h-[16px]">{comment}</p>

            <button
              onClick={proximo}
              disabled={!duelDone}
              className={`w-full py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all ${duelDone ? 'bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 cursor-pointer' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
            >
              {!duelDone ? '🧐 Julgando…' : duelIdx + 1 < result.duels.length ? 'Próxima categoria →' : 'Ver resultado final'}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="font-display font-black text-amber-800 text-sm uppercase mb-2">
              {vitorias === result.duels.length ? '🏆 VARREU! Todas as categorias vencidas!' :
               vitorias > 0 ? `🎗️ ${vitorias}/${result.duels.length} categorias vencidas` :
               '😔 Nenhuma categoria vencida desta vez'}
            </p>
            {result.totalPrize > 0 && (
              <p className="text-emerald-700 font-mono font-black text-sm mb-1">+{result.totalPrize}💰 {result.totalXp ? `· +${result.totalXp} XP` : ''}</p>
            )}
            {result.extraNote && (
              <p className="text-stone-500 font-mono text-[10px] mb-1">{result.extraNote}</p>
            )}
            {result.skipped.length > 0 && (
              <div className="text-left bg-stone-100 rounded-2xl p-3 my-3 space-y-1">
                {result.skipped.map((s, i) => (
                  <p key={i} className="text-[10px] font-mono text-stone-500">🚫 {s.category}: {s.reason}</p>
                ))}
              </div>
            )}
            <button onClick={onClose} className="mt-2 bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 rounded-2xl px-8 py-3 font-display font-black uppercase text-xs cursor-pointer">
              Fechar 🎉
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GenericJudgingModal;
