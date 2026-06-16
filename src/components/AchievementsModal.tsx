import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface AchievementsModalProps {
  unlockedAchievements: string[];
  achievementsList: Achievement[];
  onClose: () => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedAchievements, achievementsList, onClose, triggerAudioResult, sfx,
}) => {
  const handleClose = () => {
    onClose();
    triggerAudioResult(() => sfx.playSound('click'));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-[#78350f] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative animate-fade-in"
        >
          <div className="bg-[#78350f] p-5 border-b-4 border-[#92400e] text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse" style={{ textShadow: '1.5px 1.5px 0px #451a03', animationDuration: '4s' }}>
              🏆 Galeria de Medalhas & Conquistas
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Seus marcos heroicos na Fazenda Aurora
            </p>
            <button onClick={handleClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] border-2 border-[#78350f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold" title="Fechar">✕</button>
          </div>

          <div className="bg-[#fef3c7] px-6 py-4 border-b-2 border-[#fbbf24] flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1">
              <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-[#78350f] mb-1">
                <span>Progresso de Desbloqueio:</span>
                <span>{unlockedAchievements.length} de {achievementsList.length} ({Math.round((unlockedAchievements.length / achievementsList.length) * 100)}%)</span>
              </div>
              <div className="bg-stone-200 h-3 rounded-full overflow-hidden border border-[#d1d5db] shadow-inner">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" style={{ width: `${(unlockedAchievements.length / achievementsList.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ scrollbarWidth: 'thin' }}>
            {achievementsList.map((ach) => {
              const isUnlocked = unlockedAchievements.includes(ach.id);
              return (
                <div key={ach.id} className={`border-4 rounded-3xl p-4 flex items-start gap-3 transition-all ${isUnlocked ? 'bg-amber-50/70 border-amber-400 shadow-md translate-y-[-1px]' : 'bg-stone-100/50 border-stone-200/80 grayscale opacity-60'}`}>
                  <div className={`rounded-xl w-11 h-11 flex items-center justify-center text-2xl shrink-0 ${isUnlocked ? 'bg-[#fbbf24] text-white shadow-md' : 'bg-stone-300 text-stone-500'}`}>
                    {isUnlocked ? ach.emoji : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`font-display font-black text-xs sm:text-sm uppercase tracking-wider ${isUnlocked ? 'text-[#78350f]' : 'text-stone-500'}`}>{ach.title}</h4>
                      {isUnlocked && <span className="text-[10px] text-amber-600">🏆</span>}
                    </div>
                    <p className={`text-xs mt-1 leading-normal ${isUnlocked ? 'text-stone-600' : 'text-stone-400'}`}>{ach.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#78350f]/10 p-4 border-t-2 border-[#78350f]/20 flex justify-end shrink-0">
            <button onClick={handleClose} className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer">
              Voltar à Fazenda
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementsModal;
