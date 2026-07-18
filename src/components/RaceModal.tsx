import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface RaceRunner {
  name: string;
  owner: string;        // 'Você' ou nome do NPC
  isPlayer: boolean;
  performance: number;  // desempenho pré-calculado — a animação só reproduz
}

export interface RaceResult {
  day: number;
  runners: RaceRunner[];        // já ordenados por desempenho (1º = índice 0)
  playerPosition: number;       // 1-6
  prize: number;                // 💰 creditado (já aplicado antes de abrir o modal)
  xp: number;
}

const TICKS = 80;          // ~8s a 100ms
const TICK_MS = 100;

export const RaceModal: React.FC<{ result: RaceResult; onClose: () => void }> = ({ result, onClose }) => {
  const [progress, setProgress] = useState<number[]>(result.runners.map(() => 0));
  const [finished, setFinished] = useState(false);
  const tickRef = useRef(0);

  useEffect(() => {
    // Velocidade média por tick proporcional ao desempenho, com ruído visual;
    // nos ticks finais converge para a ordem pré-calculada.
    const maxPerf = Math.max(...result.runners.map(r => r.performance));
    const base = result.runners.map(r => (r.performance / maxPerf) * (100 / TICKS));
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      setProgress(prev => prev.map((p, i) => {
        if (p >= 100) return 100;
        const noise = t < TICKS * 0.8 ? (Math.random() - 0.5) * base[i] * 1.2 : 0;
        const catchup = t >= TICKS * 0.8 ? (100 - p) / (TICKS - t + 1) : base[i] + noise;
        return Math.min(100, p + Math.max(0.2, catchup));
      }));
      if (t >= TICKS) { clearInterval(id); setFinished(true); }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [result]);

  const medal = (pos: number) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a3a1a] border-8 border-amber-600 rounded-[32px] max-w-2xl w-full p-5 shadow-2xl"
      >
        <h3 className="text-center font-display font-black text-lg uppercase text-amber-300 mb-1">
          🏇 Grande Prêmio Aurora — Dia {result.day}
        </h3>
        <p className="text-center text-[10px] font-mono text-amber-100/60 mb-4">
          {finished ? 'Corrida encerrada!' : 'E lá vêm eles…!'}
        </p>

        {/* Pistas */}
        <div className="space-y-2 mb-4">
          {result.runners.map((r, i) => (
            <div key={i} className={`relative h-9 rounded-xl border-2 overflow-hidden ${r.isPlayer ? 'border-amber-400 bg-emerald-950' : 'border-emerald-800 bg-emerald-900/60'}`}>
              <div className="absolute inset-y-0 left-2 flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-200/70 z-0">
                {r.isPlayer ? '⭐' : ''} {r.name}
              </div>
              <div className="absolute right-1 inset-y-0 w-1 bg-amber-400/60" />
              <div
                className="absolute top-1/2 -translate-y-1/2 text-2xl transition-none z-10"
                style={{ left: `calc(${Math.min(progress[i], 96)}% - 0px)`, transform: 'translateY(-50%) scaleX(-1)' }}
              >
                🐴
              </div>
              {finished && (
                <div className="absolute inset-y-0 right-8 flex items-center text-sm font-black text-amber-300">
                  {medal(result.runners.findIndex(x => x === r) + 1)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resultado */}
        {finished && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-3">
            <p className="font-display font-black text-amber-200 text-sm uppercase">
              {result.playerPosition === 1 ? '🏆 VITÓRIA! Seu cavalo venceu o Grande Prêmio!' :
               result.playerPosition <= 3 ? `${medal(result.playerPosition)} Pódio! Seu cavalo chegou em ${result.playerPosition}º!` :
               `Seu cavalo chegou em ${result.playerPosition}º. Treine mais para a próxima!`}
            </p>
            {result.prize > 0 && (
              <p className="text-emerald-300 font-mono font-black text-sm mt-1">+{result.prize}💰 {result.xp > 0 ? `· +${result.xp} XP` : ''}</p>
            )}
          </motion.div>
        )}

        <button
          onClick={onClose}
          disabled={!finished}
          className={`w-full py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all ${finished ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-4 border-amber-700 cursor-pointer' : 'bg-stone-600 text-stone-400 cursor-not-allowed'}`}
        >
          {finished ? 'Fechar' : '🏇 Corrida em andamento…'}
        </button>
      </motion.div>
    </div>
  );
};

export default RaceModal;
