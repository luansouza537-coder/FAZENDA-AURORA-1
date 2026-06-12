import React from 'react';
import { motion } from 'motion/react';
import { Contract } from '../types';

interface ContractsModalProps {
  contracts: Contract[];
  currentDay: number;
  onClose: () => void;
}

export const ContractsModal: React.FC<ContractsModalProps> = ({ contracts, currentDay, onClose }) => {
  return (
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
        className="bg-[#fffbeb] border-8 border-violet-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-violet-800 to-purple-900 p-5 border-b-4 border-violet-950 text-center shrink-0">
          <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
            📋 Contratos de Fornecimento
          </h3>
          <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
            Acordos com o comerciante viajante — preços garantidos!
          </p>
          <button onClick={onClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-violet-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {contracts.filter(c => c.active).length === 0 ? (
            <div className="text-center text-stone-500 py-8 font-mono text-sm">
              📋 Nenhum contrato ativo. O comerciante viajante oferece contratos quando visita a fazenda!
            </div>
          ) : (
            contracts.filter(c => c.active).map(c => {
              const pct = Math.round((c.delivered / c.quantity) * 100);
              const daysLeft = c.deadline - currentDay;
              return (
                <div key={c.id} className={`border-4 rounded-3xl p-5 ${daysLeft <= 2 ? 'border-red-400 bg-red-50' : 'border-violet-300 bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-display font-black text-sm uppercase text-[#78350f]">
                        {c.product === 'milk' ? '🥛 Leite Cru' : c.product === 'wool' ? '🧶 Lã Crua' : c.product === 'egg' ? '🥚 Ovos' : '🧀 Queijo'}
                      </h4>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">{c.pricePerUnit} moedas/un (garantido)</p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-500 text-white' : 'bg-violet-100 text-violet-800'}`}>
                      {daysLeft > 0 ? `${daysLeft}d restante(s)` : 'VENCIDO!'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-stone-600 mb-2">
                    Entregue: {c.delivered}/{c.quantity} un • Multa se falhar: {c.penalty} moedas
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                    <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-center mt-1 text-stone-500">{pct}% entregue</div>
                </div>
              );
            })
          )}
          {contracts.filter(c => !c.active).length > 0 && (
            <div>
              <h4 className="font-display font-black text-xs uppercase text-stone-400 mb-2">Histórico (concluídos/expirados)</h4>
              {contracts.filter(c => !c.active).slice(-3).map(c => (
                <div key={c.id} className="text-xs text-stone-400 font-mono border border-stone-200 rounded-xl p-2 mb-1">
                  {c.product} • {c.delivered}/{c.quantity} entregues
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-violet-50 p-4 border-t border-violet-100 flex justify-end shrink-0">
          <button onClick={onClose} className="bg-violet-600 hover:bg-violet-500 text-white border-b-4 border-violet-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider cursor-pointer">
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface PendingContractModalProps {
  offer: Contract;
  onAccept: () => void;
  onReject: () => void;
}

export const PendingContractModal: React.FC<PendingContractModalProps> = ({ offer, onAccept, onReject }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
        className="bg-[#fef3c7] border-4 border-violet-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-black text-xl text-[#78350f] uppercase mb-2 flex items-center gap-2">📋 Proposta de Contrato</h2>
        <p className="text-[11px] text-stone-600 font-mono mb-4">O Comerciante Viajante quer fazer um negócio com você! Quer aceitar?</p>
        <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-4 mb-4 space-y-1">
          <div className="text-sm font-black text-violet-900">
            {offer.product === 'milk' ? '🥛 Leite Cru' : offer.product === 'wool' ? '🧶 Lã Crua' : offer.product === 'egg' ? '🥚 Ovos' : '🧀 Queijo'}
          </div>
          <div className="text-xs font-mono text-stone-700">Quantidade: <strong>{offer.quantity} unidades</strong></div>
          <div className="text-xs font-mono text-stone-700">Preço garantido: <strong>{offer.pricePerUnit}💰/un</strong></div>
          <div className="text-xs font-mono text-stone-700">Prazo: <strong>Dia {offer.deadline}</strong></div>
          <div className="text-xs font-mono text-red-600">Multa por atraso: <strong>{offer.penalty}💰</strong></div>
        </div>
        <div className="flex gap-2">
          <button type="button"
            onClick={onAccept}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm uppercase px-4 py-2 rounded-xl border-b-2 border-violet-800 transition-all cursor-pointer">
            ✅ Aceitar
          </button>
          <button type="button"
            onClick={onReject}
            className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-black text-sm uppercase px-4 py-2 rounded-xl border-b-2 border-stone-500 transition-all cursor-pointer">
            ❌ Recusar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
