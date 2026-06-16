import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
  level: number;
  getFarmTitle: (level: number) => string;
  getLevelUpDetails: (level: number) => { perks: string[] };
  onClose: () => void;
  setGold: (fn: (prev: number) => number) => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level, getFarmTitle, getLevelUpDetails, onClose, setGold, triggerAudioResult, sfx,
}) => {
  const handleClose = () => {
    onClose();
    setGold(prev => prev + 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, rotate: -2 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, y: 30, rotate: 2 }}
          transition={{ type: 'spring', damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-8 border-yellow-500 rounded-[40px] max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col p-6 sm:p-8 text-center"
        >
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />

          <div className="relative mx-auto -mt-12 sm:-mt-16 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 border-4 border-white w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-xl animate-bounce">
            <span className="text-4xl sm:text-5xl">🏆</span>
            <span className="absolute -top-1 -right-1 text-base">✨</span>
            <span className="absolute -bottom-1 -left-1 text-base">✨</span>
          </div>

          <h3 className="text-yellow-600 text-sm font-mono tracking-widest font-black uppercase mt-4">LEVEL UP COMPLETED!</h3>
          <h2 className="text-[#78350f] text-2xl sm:text-3xl font-display font-black leading-tight uppercase mt-1">Fazenda Subiu de Nível!</h2>

          <div className="bg-[#78350f]/15 border-2 border-[#78350f]/20 rounded-2xl px-4 py-2 mt-3 select-none flex items-center justify-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-[#78350f] font-mono font-black text-xs sm:text-sm uppercase tracking-wide">Nível {level} · {getFarmTitle(level)}</span>
            <span className="text-xl">⭐</span>
          </div>

          <div className="mt-5 text-left border-t border-[#78350f]/10 pt-4 flex-1">
            <p className="text-stone-700 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">✨ Benefícios & Desbloqueios ✨</p>
            <div className="space-y-2.5">
              {getLevelUpDetails(level).perks.map((perk, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-2 bg-white/70 border border-yellow-300 rounded-xl p-3 shadow-xs">
                  <span className="text-emerald-500 text-base shrink-0">✅</span>
                  <p className="text-xs sm:text-sm font-bold text-stone-700 font-sans leading-snug">{perk}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-emerald-500/15 border-2 border-emerald-400 rounded-2xl px-4 py-3 mt-4 text-center">
            <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-emerald-700 block leading-none">🎁 Bônus de Celebração Real 🎁</span>
            <span className="text-[#78350f] font-mono font-black text-sm block mt-1">+100 moedas de ouro creditadas!</span>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                setGold(prev => prev + 100);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-[#10b981] hover:bg-[#059669] text-white border-b-6 border-[#065f46] shadow-lg hover:shadow-xl px-10 py-3 rounded-2xl font-display font-black uppercase text-sm tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer max-w-xs w-full text-center"
            >
              Continuar Fazenda!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
