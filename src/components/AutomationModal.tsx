import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MachineState } from '../types';

interface AutomationModalProps {
  gold: number;
  farmLevel: number;
  machines: MachineState;
  onClose: () => void;
  buyMachine: (key: 'milker' | 'shearer' | 'feeder') => void;
  toggleMachine: (key: 'milker' | 'shearer' | 'feeder') => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const AutomationModal: React.FC<AutomationModalProps> = ({
  gold, farmLevel, machines, onClose, buyMachine, toggleMachine, triggerAudioResult, sfx,
}) => {
  const handleClose = () => {
    onClose();
    triggerAudioResult(() => sfx.playSound('click'));
  };

  const MachineCard = ({
    machineKey, emoji, name, desc, cost, minLevel, energyPerDay, purchased, active,
  }: {
    machineKey: 'milker' | 'shearer' | 'feeder';
    emoji: string; name: string; desc: string;
    cost: number; minLevel: number; energyPerDay: number;
    purchased: boolean; active: boolean;
  }) => (
    <div className={`border-4 rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${purchased ? 'bg-emerald-50/50 border-emerald-400 shadow-xs' : 'bg-white border-stone-200'}`}>
      <div className="rounded-2xl w-14 h-14 bg-blue-50 flex items-center justify-center text-3xl shrink-0 border-2 border-blue-100 select-none">
        {emoji}
      </div>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-[#78350f]">
            {emoji} {name}
          </h4>
          {purchased ? (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">Adquirido</span>
          ) : (
            <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível {minLevel}+</span>
          )}
        </div>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{desc}</p>
        <div className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
          ⚡ Compra: {cost.toLocaleString()}💰 • Nível mín: {minLevel} • Operacional: <span className="text-orange-500 font-black">{energyPerDay}⚡/dia</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center w-full sm:w-auto">
        {!purchased ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); buyMachine(machineKey); }}
            disabled={gold < cost || farmLevel < minLevel}
            className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
              gold >= cost && farmLevel >= minLevel
                ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
            }`}
          >
            Comprar ({cost.toLocaleString()}💰)
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1.5 bg-emerald-100/60 p-2.5 rounded-2xl border border-emerald-200">
            <span className="text-[9px] uppercase font-mono font-black text-emerald-800">Estado</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); toggleMachine(machineKey); }}
              className={`font-mono font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all uppercase ${
                active ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-inner' : 'bg-stone-400 hover:bg-stone-300 text-white'
              }`}
            >
              {active ? '🟢 LIGADO' : '🔴 DESLIGADO'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-[#1e3a8a] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 border-b-4 border-indigo-950 text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #1e1b4b' }}>
              🏭 Oficina de Automação Tecnológica
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Melhore as instalações da Fazenda Aurora com maquinários permanentes
            </p>
            <button onClick={handleClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#1e3a8a] hover:bg-[#1e40af] border-2 border-[#1e1b4b] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold" title="Fechar">✕</button>
          </div>

          <div className="bg-[#fef3c7] px-6 py-4 border-b-2 border-yellow-200 shrink-0">
            <p className="text-xs text-[#78350f] font-mono leading-relaxed">
              💡 <strong>Como funcionam:</strong> Após compradas, as máquinas passam a operar de forma permanente no final de cada dia de trabalho (ao avançar o dia ou dormir), desde que o interruptor esteja <strong>LIGADO</strong>.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            <MachineCard
              machineKey="milker" emoji="🥛" name="Ordenhadeira Automática"
              desc="Coleta automaticamente o leite cru de TODAS as vacas produtoras ao final de cada dia. A produção é enviada diretamente para o Armazém."
              cost={2500} minLevel={6} energyPerDay={8}
              purchased={machines.milkerPurchased} active={machines.milkerActive}
            />
            <MachineCard
              machineKey="shearer" emoji="✂️" name="Tosquiadeira Elétrica"
              desc="Coleta automaticamente a lã de TODAS as ovelhas com lã madura no fim do dia. Envia fardos ao Armazém sem perda de bônus por qualidade."
              cost={2000} minLevel={5} energyPerDay={6}
              purchased={machines.shearerPurchased} active={machines.shearerActive}
            />
            <MachineCard
              machineKey="feeder" emoji="🌾" name="Alimentador Automático"
              desc="Alimenta TODOS os animais do seu rebanho no final do dia. Consome ração do Armazém (não deduz ouro diretamente — mas você precisa ter ração comprada). Cada animal consome 1 unidade do tipo adequado."
              cost={1500} minLevel={4} energyPerDay={5}
              purchased={machines.feederPurchased} active={machines.feederActive}
            />
          </div>

          <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end shrink-0">
            <button
              type="button" onClick={handleClose}
              className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
            >
              Fechar Oficina
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutomationModal;
