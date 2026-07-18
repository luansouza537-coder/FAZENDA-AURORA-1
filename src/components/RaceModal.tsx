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
const SILK_COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#ec4899'];

export const RaceModal: React.FC<{ result: RaceResult; onClose: () => void }> = ({ result, onClose }) => {
  const [progress, setProgress] = useState<number[]>(result.runners.map(() => 0));
  const [finished, setFinished] = useState(false);
  const [narration, setNarration] = useState('🏁 Preparar… APOSTAS ENCERRADAS… LARGARAM!');
  const tickRef = useRef(0);

  useEffect(() => {
    const maxPerf = Math.max(...result.runners.map(r => r.performance));
    const base = result.runners.map(r => (r.performance / maxPerf) * (100 / TICKS));
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      setProgress(prev => {
        const next = prev.map((p, i) => {
          if (p >= 100) return 100;
          const noise = t < TICKS * 0.8 ? (Math.random() - 0.5) * base[i] * 1.2 : 0;
          const catchup = t >= TICKS * 0.8 ? (100 - p) / (TICKS - t + 1) : base[i] + noise;
          return Math.min(100, p + Math.max(0.2, catchup));
        });
        // narração dinâmica baseada no líder ATUAL da animação
        if (t === Math.floor(TICKS * 0.25) || t === Math.floor(TICKS * 0.55)) {
          const lider = result.runners[next.indexOf(Math.max(...next))];
          setNarration(`🎙️ ${lider.name}${lider.isPlayer ? ' (SEU CAVALO!)' : ''} assume a ponta!`);
        } else if (t === Math.floor(TICKS * 0.78)) {
          setNarration('🔥 RETA FINAL! A torcida vai à loucura!!');
        }
        return next;
      });
      if (t >= TICKS) {
        clearInterval(id);
        setFinished(true);
        const win = result.runners[0];
        setNarration(result.playerPosition === 1 ? `🏆 INACREDITÁVEL! ${win.name} VENCE O GRANDE PRÊMIO!` : `🏁 ${win.name} (${win.owner}) cruza em primeiro!`);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [result]);

  // posição ao vivo de cada raia (1º-6º pela distância percorrida)
  const livePos = (i: number) => [...progress].map((p, idx) => ({ p, idx })).sort((a, b) => b.p - a.p).findIndex(x => x.idx === i) + 1;
  const medal = (pos: number) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;
  const playerWon = result.playerPosition === 1;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-3">
      <style>{`
        @keyframes gallop { 0%,100% { transform: translateY(-50%) scaleX(-1) rotate(-2deg); } 50% { transform: translateY(-62%) scaleX(-1) rotate(2deg); } }
        @keyframes dust { 0% { opacity: .7; transform: translateX(0) scale(.8);} 100% { opacity: 0; transform: translateX(-14px) scale(1.3);} }
        @keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(340px) rotate(540deg); opacity: 0; } }
      `}</style>
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1a3a1a] border-8 border-amber-600 rounded-[32px] max-w-2xl w-full p-4 shadow-2xl relative overflow-hidden"
      >
        {/* confete na vitória */}
        {finished && playerWon && Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="absolute text-lg pointer-events-none" style={{
            left: `${(i * 37) % 100}%`, top: '-10px',
            animation: `confettiFall ${1.6 + (i % 5) * 0.35}s linear ${(i % 7) * 0.18}s infinite`,
          }}>{['🎊', '🎉', '⭐', '🏆'][i % 4]}</span>
        ))}

        <h3 className="text-center font-display font-black text-lg uppercase text-amber-300 mb-0.5">
          🏇 Grande Prêmio Aurora — Dia {result.day}
        </h3>
        <p className="text-center text-[11px] font-mono font-bold text-amber-100/80 mb-3 min-h-[16px]">{narration}</p>

        {/* Pista: terra + raias + chegada quadriculada */}
        <div className="rounded-2xl overflow-hidden border-4 border-[#5b3a1a] mb-3" style={{ background: 'repeating-linear-gradient(180deg, #7c5230 0px, #7c5230 44px, #6d4728 44px, #6d4728 88px)' }}>
          {result.runners.map((r, i) => (
            <div key={i} className={`relative h-11 border-b border-[#5b3a1a]/60 last:border-b-0 ${r.isPlayer ? 'bg-amber-400/10' : ''}`}>
              {/* nome + dono */}
              <div className="absolute inset-y-0 left-2 flex flex-col justify-center z-0 leading-none">
                <span className={`text-[10px] font-mono font-black ${r.isPlayer ? 'text-amber-300' : 'text-amber-100/70'}`}>
                  <span style={{ color: SILK_COLORS[i] }}>●</span> {r.isPlayer ? '⭐ ' : ''}{r.name}
                </span>
                <span className="text-[8px] font-mono text-amber-100/40">{r.owner}</span>
              </div>
              {/* linha de chegada quadriculada */}
              <div className="absolute right-0 inset-y-0 w-3" style={{ background: 'repeating-conic-gradient(#fff 0% 25%, #1a1a1a 0% 50%) 0 0 / 6px 6px' }} />
              {/* poeira */}
              {!finished && progress[i] > 3 && (
                <span className="absolute top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ left: `calc(${Math.min(progress[i], 93)}% - 14px)`, animation: 'dust .5s linear infinite' }}>💨</span>
              )}
              {/* cavalo galopando */}
              <div className="absolute top-1/2 text-2xl z-10" style={{ left: `calc(${Math.min(progress[i], 93)}%)`, animation: finished ? 'none' : 'gallop .35s ease-in-out infinite', transform: 'translateY(-50%) scaleX(-1)' }}>
                🐎
              </div>
              {/* posição ao vivo / medalha final */}
              <div className={`absolute inset-y-0 right-5 flex items-center text-[11px] font-black ${finished ? 'text-amber-300 text-sm' : 'text-amber-100/60'}`}>
                {finished ? medal(result.runners.findIndex(x => x === r) + 1) : `${livePos(i)}º`}
              </div>
            </div>
          ))}
        </div>

        {/* Pódio cerimonial */}
        {finished && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <div className="flex items-end justify-center gap-2 mb-2">
              {[1, 0, 2].map(idx => {
                const r = result.runners[idx];
                const alturas = ['h-12', 'h-16', 'h-9'];
                const ordem = [1, 0, 2].indexOf(idx);
                return (
                  <div key={idx} className="flex flex-col items-center w-24">
                    <span className="text-lg" style={{ transform: 'scaleX(-1)' }}>🐎</span>
                    <span className={`text-[9px] font-mono font-black truncate w-full text-center ${r.isPlayer ? 'text-amber-300' : 'text-amber-100/80'}`}>{r.name}</span>
                    <div className={`${alturas[ordem]} w-full bg-gradient-to-t ${idx === 0 ? 'from-amber-600 to-amber-400' : idx === 1 ? 'from-stone-500 to-stone-300' : 'from-orange-800 to-orange-600'} rounded-t-lg flex items-start justify-center pt-1 text-base`}>
                      {medal(idx + 1)}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-display font-black text-amber-200 text-xs uppercase">
              {playerWon ? '🏆 VITÓRIA DO SEU CAVALO!' :
               result.playerPosition <= 3 ? `${medal(result.playerPosition)} Pódio! Seu cavalo chegou em ${result.playerPosition}º!` :
               `Seu cavalo chegou em ${result.playerPosition}º — treino e carinho até a próxima!`}
            </p>
            {result.prize > 0 && (
              <p className="text-center text-emerald-300 font-mono font-black text-sm mt-1">+{result.prize}💰 {result.xp > 0 ? `· +${result.xp} XP` : ''}</p>
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
