import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FestivalResult, FESTIVAL_ROUND_INFO, RIVAL_FARM } from '../lib/fairJudging';

const TICKS = 40;
const TICK_MS = 100;

export const FestivalJudgingModal: React.FC<{
  result: FestivalResult;
  goldAwarded: number;
  prestigeAwarded: number;
  onClose: () => void;
}> = ({ result, goldAwarded, prestigeAwarded, onClose }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [playerBar, setPlayerBar] = useState(0);
  const [rivalBar, setRivalBar] = useState(0);
  const [roundDone, setRoundDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [comment, setComment] = useState('🎭 O júri do Festival se prepara...');
  const tickRef = useRef(0);

  const round = result.rounds[roundIdx];

  useEffect(() => {
    if (!round) return;
    tickRef.current = 0;
    setPlayerBar(0); setRivalBar(0); setRoundDone(false);
    const info = FESTIVAL_ROUND_INFO[round.round];
    setComment(`🎭 Avaliando ${info.label}: Fazenda Aurora vs ${RIVAL_FARM.name}...`);
    const maxScore = Math.max(round.playerScore, round.rivalScore, 10);
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const frac = Math.min(1, t / TICKS);
      setPlayerBar((round.playerScore / maxScore) * 100 * frac);
      setRivalBar((round.rivalScore / maxScore) * 100 * frac);
      if (t >= TICKS) {
        clearInterval(id);
        setRoundDone(true);
        setComment(round.won
          ? `🏆 Fazenda Aurora venceu ${info.label}!`
          : `😔 ${RIVAL_FARM.name} venceu ${info.label}.`);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [roundIdx, round]);

  const proximo = () => {
    if (roundIdx + 1 < result.rounds.length) {
      setRoundIdx(roundIdx + 1);
    } else {
      setAllDone(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-3">
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#fff7ed] border-8 border-purple-700 rounded-[32px] max-w-lg w-full p-5 shadow-2xl"
      >
        <h3 className="text-center font-display font-black text-lg uppercase text-purple-800 mb-1">
          🎭 Festival Cultural da Aurora — Dia {result.day}
        </h3>
        <p className="text-center text-[10px] font-mono text-stone-500 mb-3">
          Fazenda Aurora vs {RIVAL_FARM.name} ({RIVAL_FARM.owner})
        </p>

        {!allDone && round ? (
          <>
            <p className="text-center text-[11px] font-mono font-bold text-purple-700 uppercase mb-3">
              {FESTIVAL_ROUND_INFO[round.round].emoji} {FESTIVAL_ROUND_INFO[round.round].label} — rodada {roundIdx + 1}/3
            </p>

            <div className="space-y-3 mb-3">
              <div>
                <div className="flex justify-between text-[10px] font-mono font-black text-stone-700 mb-1">
                  <span>⭐ Fazenda Aurora (você)</span>
                  {roundDone && <span>{round.playerScore} pts</span>}
                </div>
                <div className="w-full h-5 bg-stone-200 rounded-full overflow-hidden border-2 border-stone-300">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-100" style={{ width: `${playerBar}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono font-black text-stone-700 mb-1">
                  <span>🎗️ {RIVAL_FARM.name}</span>
                  {roundDone && <span>{round.rivalScore} pts</span>}
                </div>
                <div className="w-full h-5 bg-stone-200 rounded-full overflow-hidden border-2 border-stone-300">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-100" style={{ width: `${rivalBar}%` }} />
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] font-mono text-stone-600 mb-3 min-h-[16px]">{comment}</p>

            <button
              onClick={proximo}
              disabled={!roundDone}
              className={`w-full py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all ${roundDone ? 'bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800 cursor-pointer' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
            >
              {!roundDone ? '🧐 Julgando…' : roundIdx + 1 < result.rounds.length ? 'Próxima rodada →' : 'Ver resultado final'}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="font-display font-black text-purple-800 text-sm uppercase mb-2">
              {result.overallWon
                ? `🏆 VITÓRIA NO FESTIVAL! Venceu ${result.roundsWon}/3 rodadas!`
                : `😔 Festival perdido — venceu apenas ${result.roundsWon}/3 rodadas.`}
            </p>
            {goldAwarded > 0 && (
              <p className="text-emerald-700 font-mono font-black text-sm mb-1">+{goldAwarded}💰</p>
            )}
            {prestigeAwarded > 0 && (
              <p className="text-purple-600 font-mono font-black text-xs mb-1">+{prestigeAwarded} Prestígio</p>
            )}
            <p className="text-stone-500 font-mono text-[10px] mb-3">Taxa de inscrição de {result.fee}💰 não é reembolsável.</p>
            <button onClick={onClose} className="mt-1 bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800 rounded-2xl px-8 py-3 font-display font-black uppercase text-xs cursor-pointer">
              Fechar 🎉
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FestivalJudgingModal;
