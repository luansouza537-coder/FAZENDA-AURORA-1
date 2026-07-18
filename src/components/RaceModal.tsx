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
  distance?: string;            // rótulo da prova, ex: '⚡ Prova Curta — 1.000m'
  runners: RaceRunner[];        // já ordenados por desempenho (1º = índice 0)
  playerPosition: number;       // 1-6 (0 = jogador sem cavalo na prova)
  prize: number;                // 💰 creditado (já aplicado antes de abrir o modal)
  xp: number;
}

const TICKS = 80;          // ~8s a 100ms
const TICK_MS = 100;
const SILK_COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#ec4899'];
const BET_VALUES = [50, 100, 250];

export const RaceModal: React.FC<{
  result: RaceResult;
  gold: number;
  skipBetting?: boolean;   // replay (corrida online): pula a bilheteria
  onBet: (amount: number, horseName: string) => void;
  onPayout: (amount: number, horseName: string) => void;
  onClose: () => void;
}> = ({ result, gold, skipBetting, onBet, onPayout, onClose }) => {
  const [phase, setPhase] = useState<'apostas' | 'corrida'>(skipBetting ? 'corrida' : 'apostas');
  const [betIdx, setBetIdx] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [betPlaced, setBetPlaced] = useState<{ idx: number; amount: number; odd: number } | null>(null);
  const [progress, setProgress] = useState<number[]>(result.runners.map(() => 0));
  const [finished, setFinished] = useState(false);
  const [narration, setNarration] = useState('🏁 Preparar… APOSTAS ENCERRADAS… LARGARAM!');
  const tickRef = useRef(0);
  const paidRef = useRef(false);

  // Odds estilo turfe: probabilidade pelo desempenho, casa fica com ~10%
  const total = result.runners.reduce((s, r) => s + r.performance, 0);
  const odds = result.runners.map(r => {
    const prob = r.performance / total;
    return Math.min(8, Math.max(1.2, Math.round((0.9 / prob) * 10) / 10));
  });

  useEffect(() => {
    if (phase !== 'corrida') return;
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
  }, [phase, result]);

  // paga a aposta vencedora (uma única vez)
  useEffect(() => {
    if (!finished || !betPlaced || paidRef.current) return;
    paidRef.current = true;
    if (betPlaced.idx === 0) { // runners[0] é o vencedor pré-calculado
      onPayout(Math.round(betPlaced.amount * betPlaced.odd), result.runners[0].name);
    }
  }, [finished, betPlaced, onPayout, result]);

  const livePos = (i: number) => [...progress].map((p, idx) => ({ p, idx })).sort((a, b) => b.p - a.p).findIndex(x => x.idx === i) + 1;
  const medal = (pos: number) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`;
  const playerWon = result.playerPosition === 1;
  const betWon = betPlaced && betPlaced.idx === 0;

  // exibe os competidores em ordem embaralhada estável na fase de apostas (não entregar o vencedor)
  const displayOrder = React.useMemo(() => result.runners.map((_, i) => i).sort((a, b) => result.runners[a].name.localeCompare(result.runners[b].name)), [result]);

  const confirmarAposta = () => {
    if (betIdx === null || !betAmount || betAmount > gold) return;
    onBet(betAmount, result.runners[betIdx].name);
    setBetPlaced({ idx: betIdx, amount: betAmount, odd: odds[betIdx] });
    setPhase('corrida');
  };

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
        {finished && (playerWon || betWon) && Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="absolute text-lg pointer-events-none" style={{
            left: `${(i * 37) % 100}%`, top: '-10px',
            animation: `confettiFall ${1.6 + (i % 5) * 0.35}s linear ${(i % 7) * 0.18}s infinite`,
          }}>{['🎊', '🎉', '⭐', '🏆'][i % 4]}</span>
        ))}

        <h3 className="text-center font-display font-black text-lg uppercase text-amber-300 mb-0.5">
          🏇 Grande Prêmio Aurora{result.day > 0 ? ` — Dia ${result.day}` : ''}
        </h3>
        {result.distance && (
          <p className="text-center text-[10px] font-mono font-black text-sky-300 uppercase mb-1">{result.distance}</p>
        )}

        {/* ===== FASE DE APOSTAS ===== */}
        {phase === 'apostas' && (
          <div>
            <p className="text-center text-[11px] font-mono font-bold text-amber-100/80 mb-3">
              🎰 A bilheteria está aberta! Escolha um competidor e o valor — ou só assista.
            </p>
            <div className="space-y-1.5 mb-3">
              {displayOrder.map(i => {
                const r = result.runners[i];
                const favorito = odds[i] === Math.min(...odds);
                const azarao = odds[i] === Math.max(...odds);
                return (
                  <button
                    key={i}
                    onClick={() => setBetIdx(i)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer ${betIdx === i ? 'border-amber-400 bg-amber-400/20' : 'border-emerald-800 bg-emerald-900/50 hover:bg-emerald-900'}`}
                  >
                    <span className="text-[11px] font-mono font-black text-amber-100">
                      <span style={{ color: SILK_COLORS[i] }}>●</span> {r.isPlayer ? '⭐ ' : ''}{r.name}
                      <span className="text-amber-100/40 font-normal"> · {r.owner}</span>
                    </span>
                    <span className="text-[10px] font-mono font-black text-amber-300 shrink-0 ml-2">
                      {odds[i].toFixed(1)}× {favorito ? '🔥 favorito' : azarao ? '🐢 azarão' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              {BET_VALUES.map(v => (
                <button
                  key={v}
                  disabled={v > gold}
                  onClick={() => setBetAmount(v)}
                  className={`px-4 py-2 rounded-xl font-mono font-black text-xs border-b-2 transition-all cursor-pointer ${betAmount === v ? 'bg-amber-400 text-amber-950 border-amber-600' : v > gold ? 'bg-stone-700 text-stone-500 border-stone-800 cursor-not-allowed' : 'bg-emerald-800 text-amber-100 border-emerald-950 hover:bg-emerald-700'}`}
                >
                  {v}💰
                </button>
              ))}
              <span className="text-[9px] font-mono text-amber-100/50">(você tem {gold}💰)</span>
            </div>
            {betIdx !== null && betAmount && (
              <p className="text-center text-[10px] font-mono text-emerald-300 mb-2">
                Aposta: {betAmount}💰 em {result.runners[betIdx].name} → retorno de {Math.round(betAmount * odds[betIdx])}💰 se vencer
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={confirmarAposta}
                disabled={betIdx === null || !betAmount || (betAmount ?? 0) > gold}
                className={`flex-1 py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all ${betIdx !== null && betAmount && betAmount <= gold ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-4 border-amber-700 cursor-pointer' : 'bg-stone-600 text-stone-400 cursor-not-allowed'}`}
              >
                🎰 Apostar e correr!
              </button>
              <button
                onClick={() => setPhase('corrida')}
                className="flex-1 py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider bg-emerald-700 hover:bg-emerald-600 text-white border-b-4 border-emerald-900 cursor-pointer"
              >
                🏇 Só assistir
              </button>
            </div>
          </div>
        )}

        {/* ===== FASE DA CORRIDA ===== */}
        {phase === 'corrida' && (
          <>
            <p className="text-center text-[11px] font-mono font-bold text-amber-100/80 mb-3 min-h-[16px]">{narration}</p>

            <div className="rounded-2xl overflow-hidden border-4 border-[#5b3a1a] mb-3" style={{ background: 'repeating-linear-gradient(180deg, #7c5230 0px, #7c5230 44px, #6d4728 44px, #6d4728 88px)' }}>
              {result.runners.map((r, i) => (
                <div key={i} className={`relative h-11 border-b border-[#5b3a1a]/60 last:border-b-0 ${r.isPlayer ? 'bg-amber-400/10' : betPlaced?.idx === i ? 'bg-emerald-400/10' : ''}`}>
                  <div className="absolute inset-y-0 left-2 flex flex-col justify-center z-0 leading-none">
                    <span className={`text-[10px] font-mono font-black ${r.isPlayer ? 'text-amber-300' : 'text-amber-100/70'}`}>
                      <span style={{ color: SILK_COLORS[i] }}>●</span> {r.isPlayer ? '⭐ ' : ''}{betPlaced?.idx === i ? '🎰 ' : ''}{r.name}
                    </span>
                    <span className="text-[8px] font-mono text-amber-100/40">{r.owner}</span>
                  </div>
                  <div className="absolute right-0 inset-y-0 w-3" style={{ background: 'repeating-conic-gradient(#fff 0% 25%, #1a1a1a 0% 50%) 0 0 / 6px 6px' }} />
                  {!finished && progress[i] > 3 && (
                    <span className="absolute top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ left: `calc(${Math.min(progress[i], 93)}% - 14px)`, animation: 'dust .5s linear infinite' }}>💨</span>
                  )}
                  <div className="absolute top-1/2 text-2xl z-10" style={{ left: `calc(${Math.min(progress[i], 93)}%)`, animation: finished ? 'none' : 'gallop .35s ease-in-out infinite', transform: 'translateY(-50%) scaleX(-1)' }}>
                    🐎
                  </div>
                  <div className={`absolute inset-y-0 right-5 flex items-center text-[11px] font-black ${finished ? 'text-amber-300 text-sm' : 'text-amber-100/60'}`}>
                    {finished ? medal(result.runners.findIndex(x => x === r) + 1) : `${livePos(i)}º`}
                  </div>
                </div>
              ))}
            </div>

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
                {result.playerPosition > 0 && (
                  <p className="text-center font-display font-black text-amber-200 text-xs uppercase">
                    {playerWon ? '🏆 VITÓRIA DO SEU CAVALO!' :
                     result.playerPosition <= 3 ? `${medal(result.playerPosition)} Pódio! Seu cavalo chegou em ${result.playerPosition}º!` :
                     `Seu cavalo chegou em ${result.playerPosition}º — treino e carinho até a próxima!`}
                  </p>
                )}
                {result.prize > 0 && (
                  <p className="text-center text-emerald-300 font-mono font-black text-sm mt-1">+{result.prize}💰 {result.xp > 0 ? `· +${result.xp} XP` : ''}</p>
                )}
                {betPlaced && (
                  <p className={`text-center font-mono font-black text-xs mt-1 ${betWon ? 'text-emerald-300' : 'text-red-300'}`}>
                    {betWon
                      ? `🎰 APOSTA VENCEDORA! ${betPlaced.amount}💰 × ${betPlaced.odd.toFixed(1)} = +${Math.round(betPlaced.amount * betPlaced.odd)}💰`
                      : `🎰 Aposta perdida (${betPlaced.amount}💰 em ${result.runners[betPlaced.idx].name}). A banca agradece!`}
                  </p>
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
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RaceModal;
