import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORKER_TYPES } from '../data/workers';
import { Animal, FarmWorker } from '../types';

interface WorkersModalProps {
  workers: FarmWorker[];
  farmLevel: number;
  animals: Animal[];
  currentDay: number;
  onClose: () => void;
  onFireWorker: (id: string) => void;
  onHireWorker: (wt: typeof WORKER_TYPES[number]) => void;
}

const WorkersModal: React.FC<WorkersModalProps> = ({
  workers, farmLevel, animals, currentDay, onClose, onFireWorker, onHireWorker,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#064e3b] border-8 border-[#fbbf24] rounded-[36px] max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-[#065f46] p-5 border-b-4 border-[#fbbf24] text-center shrink-0">
            <h3 className="text-[#fef3c7] text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
              👷 Funcionários da Fazenda
            </h3>
            <p className="text-[#fbbf24] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Vagas: {workers.length}/{farmLevel} • 1 vaga por nível
            </p>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#fef3c7] bg-[#022c22] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {workers.length > 0 && (
              <div className="bg-[#065f46] border-2 border-[#fbbf24]/40 rounded-2xl p-4">
                <h4 className="text-[#fbbf24] font-black text-xs uppercase mb-3">Funcionários Contratados</h4>
                <div className="space-y-2">
                  {workers.map(w => {
                    const wt = WORKER_TYPES.find(t => t.role === w.role);
                    return (
                      <div key={w.id} className="bg-[#022c22] rounded-xl px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#fef3c7] font-mono text-sm">{wt?.emoji} {w.name}</span>
                          <span className="text-[#fbbf24] font-mono text-xs">-{w.dailyCost}💰/dia</span>
                          <button onClick={() => onFireWorker(w.id)} className="text-red-400 text-xs font-black px-2 py-1 rounded-lg border border-red-400/40 hover:bg-red-400/20 cursor-pointer">
                            Dispensar
                          </button>
                        </div>
                        {w.lastAction && (
                          <p className="text-[#6ee7b7] font-mono text-[10px] mt-1 truncate opacity-80">↳ {w.lastAction}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[#fbbf24] font-mono text-xs mt-3 text-right">
                  Custo total: -{workers.reduce((s, w) => s + w.dailyCost, 0)}💰/dia
                </div>
              </div>
            )}
            {/* Alerta de Debuff de Especialização */}
            {(() => {
              const catDef2: Record<string, string[]> = {
                'Bovinos 🐄': ['vaca', 'boi', 'bufalo'],
                'Fibras/Caprinos 🐑': ['ovelha', 'lhama', 'alpaca', 'coelho_angora', 'cabra'],
                'Aves 🐔': ['galinha', 'codorna', 'pato', 'ganso', 'pavao'],
                'Exóticos 🦎': ['ra', 'avestruz', 'jacare', 'bicho_seda', 'caracol', 'minhoca'],
              };
              const catWorkersUI: Record<string, string[]> = {
                'Bovinos 🐄': ['ordenhador', 'tratador', 'veterinario'],
                'Fibras/Caprinos 🐑': ['tosquiador', 'tratador', 'veterinario'],
                'Aves 🐔': ['avicultor', 'tratador', 'veterinario'],
                'Exóticos 🦎': ['tratador_exotico', 'veterinario'],
              };
              const workerRolesUI = new Set(workers.map(w => w.role));
              const activeCats = Object.entries(catDef2).filter(([, types]) =>
                animals.some(a => types.includes(a.type) && a.isAdult !== false)
              );
              if (activeCats.length < 3) return null;
              const missingCats = activeCats.filter(([cat]) =>
                !catWorkersUI[cat].some(r => workerRolesUI.has(r))
              );
              if (missingCats.length === 0) return (
                <div className="bg-[#10b981]/10 border border-[#10b981]/40 rounded-2xl p-3 text-[#10b981] text-[11px] font-mono">
                  ✅ Todas as {activeCats.length} categorias têm especialistas. Sem debuff!
                </div>
              );
              return (
                <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-4 space-y-2">
                  <div className="text-red-300 font-black text-xs uppercase">⚠️ Debuff de Diversidade Ativo</div>
                  <div className="text-red-200/80 text-[11px] font-mono leading-relaxed">
                    Sua fazenda tem <span className="text-red-300 font-bold">{activeCats.length} categorias</span> sem especialistas para:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missingCats.map(([cat]) => (
                      <span key={cat} className="bg-red-500/20 border border-red-400/40 text-red-200 text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {cat} -4😊/dia
                      </span>
                    ))}
                  </div>
                  <div className="text-[#fbbf24] text-[10px] font-mono">Contrate os funcionários abaixo para remover o debuff.</div>
                </div>
              );
            })()}

            <div className="space-y-3">
              <h4 className="text-[#fbbf24] font-black text-xs uppercase">Disponíveis para Contratar</h4>
              {WORKER_TYPES.map(wt => {
                const SCALABLE_ROLES = ['queijeiro', 'artesao', 'cozinheiro'];
                const maxPerRole = SCALABLE_ROLES.includes(wt.role) ? 3 : 1;
                const hiredCount = workers.filter(w => w.role === wt.role).length;
                const alreadyHired = hiredCount > 0;
                const atRoleMax = hiredCount >= maxPerRole;
                const maxSlots = farmLevel;
                const atMax = workers.length >= maxSlots;
                const levelOk = farmLevel >= wt.minLevel;
                const canHire = !atRoleMax && !atMax && levelOk;
                return (
                  <div key={wt.role} className={`bg-[#065f46] border-2 rounded-2xl p-4 transition-all ${alreadyHired ? 'border-[#10b981]' : levelOk ? 'border-[#fbbf24]/50' : 'border-[#fbbf24]/15 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#fef3c7] font-black text-sm">{wt.emoji} {wt.name}</span>
                          {alreadyHired && <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 rounded-full px-2 py-0.5 font-mono uppercase">{hiredCount > 1 ? `${hiredCount}x Ativo` : 'Contratado'}</span>}
                          {SCALABLE_ROLES.includes(wt.role) && <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-400/30 rounded-full px-1.5 py-0.5">Até {maxPerRole}x</span>}
                          {!levelOk && <span className="text-[9px] bg-red-900/40 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 font-mono uppercase">🔒 Nível {wt.minLevel}</span>}
                        </div>
                        <div className="text-[#fef3c7]/70 text-[11px] font-mono mt-1 leading-relaxed">{wt.desc}</div>
                        <div className="text-[#fbbf24] text-[10px] font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                          <span>-{wt.dailyCost}💰/dia{hiredCount > 1 ? ` × ${hiredCount} = -${wt.dailyCost * hiredCount}💰/dia` : ''}</span>
                          {(wt.role === 'tratador') && <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 rounded-full px-1.5 py-0.5">Remove debuff geral</span>}
                          {(wt.role === 'ordenhador') && <span className="text-[9px] bg-blue-500/15 text-blue-300 border border-blue-400/30 rounded-full px-1.5 py-0.5">Bovinos sem debuff</span>}
                          {(wt.role === 'tosquiador') && <span className="text-[9px] bg-blue-500/15 text-blue-300 border border-blue-400/30 rounded-full px-1.5 py-0.5">Fibras/Caprinos sem debuff</span>}
                          {(wt.role === 'avicultor') && <span className="text-[9px] bg-blue-500/15 text-blue-300 border border-blue-400/30 rounded-full px-1.5 py-0.5">Aves sem debuff</span>}
                          {(wt.role === 'tratador_exotico') && <span className="text-[9px] bg-purple-500/15 text-purple-300 border border-purple-400/30 rounded-full px-1.5 py-0.5">Exóticos sem debuff</span>}
                          {(wt.role === 'queijeiro') && alreadyHired && <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-400/30 rounded-full px-1.5 py-0.5">{hiredCount} queijo(s)/dia</span>}
                          {(wt.role === 'artesao') && alreadyHired && <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-400/30 rounded-full px-1.5 py-0.5">{hiredCount} têxtil(is)/dia</span>}
                          {(wt.role === 'cozinheiro') && alreadyHired && <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-400/30 rounded-full px-1.5 py-0.5">{hiredCount} prato(s)/dia</span>}
                        </div>
                      </div>
                      <button
                        disabled={!canHire}
                        onClick={() => { if (canHire) onHireWorker(wt); }}
                        className={`shrink-0 text-xs font-black uppercase px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                          atRoleMax ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] cursor-not-allowed' :
                          !levelOk ? 'bg-[#022c22] border-[#fbbf24]/10 text-[#fef3c7]/20 cursor-not-allowed' :
                          atMax ? 'bg-[#022c22] border-[#fbbf24]/20 text-[#fef3c7]/30 cursor-not-allowed' :
                          'bg-[#fbbf24] border-[#fbbf24] text-[#78350f] hover:bg-[#f59e0b] hover:scale-105 active:translate-y-0.5'
                        }`}
                      >
                        {atRoleMax ? `✅ Máx (${maxPerRole})` : !levelOk ? `🔒 Nível ${wt.minLevel}` : atMax ? `🚫 Máx ${maxSlots}` : alreadyHired ? `+1 Contratar` : 'Contratar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkersModal;
