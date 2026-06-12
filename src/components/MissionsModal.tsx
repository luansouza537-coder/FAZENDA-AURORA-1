import React from 'react';
import { motion } from 'motion/react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'epic';
  goal: number;
  current: number;
  reward: number;
  expiresOnDay: number;
  completed: boolean;
  claimed: boolean;
  missionKey: 'sell_milk' | 'sell_any' | 'happy_animals' | 'earn_gold' | 'feed_animals' | 'collect_items' | 'collect_silk' | 'sell_exotic' | 'organic_day' | 'sell_cheese' | 'have_animals' | 'sell_wool';
}

interface MissionsModalProps {
  missions: Mission[];
  onClose: () => void;
  onClaimMission: (mission: Mission) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ missions, onClose, onClaimMission }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-purple-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-5 border-b-4 border-purple-950 text-center shrink-0">
          <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
            🎯 Missões &amp; Objetivos
          </h3>
          <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
            Complete tarefas para ganhar recompensas extras!
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-purple-950 hover:bg-purple-800 border-2 border-purple-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-purple-800 mb-2 flex items-center gap-1.5">📅 Missões Diárias</h4>
            <div className="space-y-3">
              {missions.filter(m => m.type === 'daily').length === 0 && (
                <p className="text-stone-500 text-xs italic text-center py-4">Nenhuma missão diária ativa. Avance o dia para gerar novas missões!</p>
              )}
              {missions.filter(m => m.type === 'daily').map(m => (
                <div key={m.id} className={`border-4 rounded-3xl p-4 flex flex-col gap-2 ${m.claimed ? 'bg-stone-100 border-stone-200 opacity-60' : m.completed ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-purple-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="font-display font-black text-sm uppercase text-[#78350f]">{m.title}</h5>
                      <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                      🏆 {m.reward} moedas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
                      <div
                        className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-stone-600 shrink-0">{m.current}/{m.goal}</span>
                    {m.completed && !m.claimed && (
                      <button
                        onClick={() => onClaimMission(m)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        Resgatar!
                      </button>
                    )}
                    {m.claimed && <span className="text-[10px] font-mono text-stone-400 shrink-0">✓ Resgatado</span>}
                  </div>
                  <div className="text-[9px] text-stone-400 font-mono">Expira no Dia {m.expiresOnDay}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5 mt-2">📆 Missões Semanais</h4>
            <div className="space-y-3">
              {missions.filter(m => m.type === 'weekly').length === 0 && (
                <p className="text-stone-500 text-xs italic text-center py-4">Nenhuma missão semanal ativa. Avance o dia para gerar novas missões!</p>
              )}
              {missions.filter(m => m.type === 'weekly').map(m => (
                <div key={m.id} className={`border-4 rounded-3xl p-4 flex flex-col gap-2 ${m.claimed ? 'bg-stone-100 border-stone-200 opacity-60' : m.completed ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-indigo-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="font-display font-black text-sm uppercase text-[#78350f]">{m.title}</h5>
                      <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                      🏆 {m.reward} moedas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
                      <div
                        className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-stone-600 shrink-0">{m.current}/{m.goal}</span>
                    {m.completed && !m.claimed && (
                      <button
                        onClick={() => onClaimMission(m)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        Resgatar!
                      </button>
                    )}
                    {m.claimed && <span className="text-[10px] font-mono text-stone-400 shrink-0">✓ Resgatado</span>}
                  </div>
                  <div className="text-[9px] text-stone-400 font-mono">Expira no Dia {m.expiresOnDay}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 border-t-2 border-purple-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
          >
            Voltar à Fazenda
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
