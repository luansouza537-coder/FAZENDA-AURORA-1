import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Contract } from '../types';

interface LongContractCatalogEntry {
  catalogId: string;
  client: string;
  product: string;
  description: string;
  baseMarket: number;
  pricePerUnit: number;
  weeklyGoal: number;
  durationDays: number;
  minLevel: number;
  completionBonus: number;
  completionXP: number;
}

interface ContractsModalProps {
  contracts: Contract[];
  currentDay: number;
  farmLevel: number;
  gold: number;
  longContractCatalog: LongContractCatalogEntry[];
  onSignLongContract: (catalogId: string) => void;
  onClose: () => void;
}

const PRODUCT_LABELS: Record<string, string> = {
  milk: '🥛 Leite Cru', wool: '🧶 Lã Crua', egg: '🥚 Ovos', cheese: '🧀 Queijo Simples',
  queijoCoalho: '🧀 Queijo Coalho', queijoMucarela: '🧀 Queijo Muçarela', queijoBrie: '🧀 Queijo Brie',
  butter: '🧈 Manteiga', yogurt: '🥛 Iogurte', goat_milk: '🐐 Leite de Cabra',
  buffalo_milk: '🐃 Leite de Búfala', duck_egg: '🦆 Ovo de Pato', quail_egg: '🐦 Ovo de Codorna',
  feather: '🪶 Penas', angora_wool: '🐇 Lã Angorá', alpaca_wool: '🦙 Lã de Alpaca',
  muco: '🐌 Muco de Caracol', seda_bruta: '🐛 Seda Bruta', mel_envasado: '🍯 Mel Envasado',
};

export const ContractsModal: React.FC<ContractsModalProps> = ({
  contracts, currentDay, farmLevel, gold, longContractCatalog, onSignLongContract, onClose
}) => {
  const [tab, setTab] = useState<'short' | 'long'>('long');

  const shortContracts = contracts.filter(c => c.active && c.contractType !== 'long');
  const longContracts = contracts.filter(c => c.active && c.contractType === 'long');
  const expiredContracts = contracts.filter(c => !c.active);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fffbeb] border-8 border-violet-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="bg-gradient-to-r from-violet-800 to-purple-900 p-5 border-b-4 border-violet-950 text-center shrink-0">
          <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">📋 Contratos</h3>
          <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Acordos de fornecimento — preços acima do mercado garantidos</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-[#fcd57e] bg-violet-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-4 border-violet-200 shrink-0 bg-violet-50">
          <button
            onClick={() => setTab('long')}
            className={`flex-1 py-2.5 text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer ${tab === 'long' ? 'bg-violet-700 text-white' : 'text-violet-700 hover:bg-violet-100'}`}
          >
            📜 Fornecedores Fixos {longContracts.length > 0 && <span className="ml-1 bg-white text-violet-700 rounded-full px-1.5">{longContracts.length}</span>}
          </button>
          <button
            onClick={() => setTab('short')}
            className={`flex-1 py-2.5 text-xs font-display font-black uppercase tracking-wider transition-colors cursor-pointer ${tab === 'short' ? 'bg-violet-700 text-white' : 'text-violet-700 hover:bg-violet-100'}`}
          >
            🤝 Contratos do Comerciante {shortContracts.length > 0 && <span className="ml-1 bg-white text-violet-700 rounded-full px-1.5">{shortContracts.length}</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ---- LONG CONTRACTS TAB ---- */}
          {tab === 'long' && (
            <>
              {/* Active long contracts */}
              {longContracts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display font-black text-xs uppercase text-violet-700">✅ Contratos Ativos</h4>
                  {longContracts.map(c => {
                    const weeks = Math.round((c.deadline - currentDay) / 7);
                    const thisWeek = c.delivered - (c.weekStartDelivered ?? 0);
                    const goal = c.weeklyGoal ?? 0;
                    const overallPct = c.quantity > 0 ? Math.round((c.delivered / c.quantity) * 100) : 0;
                    const weekPct = goal > 0 ? Math.min(100, Math.round((thisWeek / goal) * 100)) : 0;
                    return (
                      <div key={c.id} className="bg-white border-4 border-violet-300 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-display font-black text-sm text-violet-900">{c.client}</div>
                          <span className="text-[10px] font-mono font-black bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{weeks}sem restantes</span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono mb-2">{PRODUCT_LABELS[c.product] ?? c.product} • {c.pricePerUnit}💰/un garantido</div>
                        <div className="space-y-1.5">
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-0.5"><span>Esta semana</span><span>{thisWeek}/{goal} un</span></div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${weekPct >= 100 ? 'bg-green-400' : weekPct >= 50 ? 'bg-yellow-400' : 'bg-red-300'}`} style={{ width: `${weekPct}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-0.5"><span>Total do contrato</span><span>{c.delivered}/{c.quantity} un ({overallPct}%)</span></div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-violet-400 h-full rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-amber-700">🏆 Bônus conclusão: {c.completionBonus}💰 + {c.completionXP} XP</div>
                        {(c.missedWeeks ?? 0) > 0 && (
                          <div className="mt-1 text-[10px] font-mono text-red-600">⚠️ {c.missedWeeks}/2 semanas sem entrega mínima!</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Catalog */}
              <div>
                <h4 className="font-display font-black text-xs uppercase text-stone-500 mb-3">📋 Catálogo de Fornecedores</h4>
                <div className="space-y-3">
                  {longContractCatalog.map(cat => {
                    const isActive = contracts.some(c => c.contractType === 'long' && c.active && c.catalogId === cat.catalogId);
                    const locked = farmLevel < cat.minLevel;
                    const weeks = Math.round(cat.durationDays / 7);
                    const totalQty = cat.weeklyGoal * weeks;
                    const premiumPct = Math.round(((cat.pricePerUnit - cat.baseMarket) / cat.baseMarket) * 100);
                    return (
                      <div key={cat.catalogId} className={`border-4 rounded-2xl p-4 ${isActive ? 'border-green-300 bg-green-50' : locked ? 'border-stone-200 bg-stone-50 opacity-70' : 'border-violet-200 bg-white'}`}>
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <div className="font-display font-black text-sm text-stone-800">{cat.client}</div>
                            <div className="text-[10px] font-mono text-violet-700 font-black">{PRODUCT_LABELS[cat.product] ?? cat.product}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-green-700">{cat.pricePerUnit}💰/un</div>
                            <div className="text-[10px] font-mono text-green-600">+{premiumPct}% acima do mercado</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-600 font-mono mb-2.5 leading-relaxed">{cat.description}</p>
                        <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] font-mono text-stone-600">
                          <div className="bg-stone-50 rounded-lg px-2 py-1 text-center"><span className="block font-black text-stone-800">{cat.weeklyGoal} un/sem</span>Meta semanal</div>
                          <div className="bg-stone-50 rounded-lg px-2 py-1 text-center"><span className="block font-black text-stone-800">{cat.durationDays} dias</span>Duração</div>
                          <div className="bg-amber-50 rounded-lg px-2 py-1 text-center"><span className="block font-black text-amber-700">{cat.completionBonus}💰</span>Bônus final</div>
                        </div>
                        <button
                          disabled={isActive || locked}
                          onClick={() => onSignLongContract(cat.catalogId)}
                          className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${
                            isActive ? 'bg-green-100 border-green-300 text-green-700 cursor-default' :
                            locked ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' :
                            'bg-violet-600 hover:bg-violet-500 text-white border-violet-800'
                          }`}
                        >
                          {isActive ? '✅ Contrato ativo' : locked ? `🔒 Requer Nível ${cat.minLevel}` : `📝 Assinar contrato (${cat.weeklyGoal} un/sem por ${cat.durationDays}d)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ---- SHORT CONTRACTS TAB ---- */}
          {tab === 'short' && (
            <>
              {shortContracts.length === 0 ? (
                <div className="text-center text-stone-500 py-8 font-mono text-sm">
                  📋 Nenhum contrato ativo. O comerciante viajante oferece contratos quando visita a fazenda!
                </div>
              ) : (
                shortContracts.map(c => {
                  const pct = Math.round((c.delivered / c.quantity) * 100);
                  const daysLeft = c.deadline - currentDay;
                  return (
                    <div key={c.id} className={`border-4 rounded-3xl p-5 ${daysLeft <= 2 ? 'border-red-400 bg-red-50' : 'border-violet-300 bg-white'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-display font-black text-sm uppercase text-[#78350f]">{PRODUCT_LABELS[c.product] ?? c.product}</h4>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">{c.client} • {c.pricePerUnit}💰/un</p>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-500 text-white' : 'bg-violet-100 text-violet-800'}`}>
                          {daysLeft > 0 ? `${daysLeft}d restante(s)` : 'VENCIDO!'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-stone-600 mb-2">Entregue: {c.delivered}/{c.quantity} un • Multa: {c.penalty}💰</div>
                      <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                        <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] font-mono text-center mt-1 text-stone-500">{pct}% entregue</div>
                    </div>
                  );
                })
              )}
              {expiredContracts.filter(c => c.contractType !== 'long').length > 0 && (
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-stone-400 mb-2">Histórico</h4>
                  {expiredContracts.filter(c => c.contractType !== 'long').slice(-3).map(c => (
                    <div key={c.id} className="text-xs text-stone-400 font-mono border border-stone-200 rounded-xl p-2 mb-1">
                      {PRODUCT_LABELS[c.product] ?? c.product} • {c.delivered}/{c.quantity} entregues
                    </div>
                  ))}
                </div>
              )}
            </>
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
  const PRODUCT_LABELS: Record<string, string> = {
    milk: '🥛 Leite Cru', wool: '🧶 Lã Crua', egg: '🥚 Ovos', cheese: '🧀 Queijo Simples',
    queijoCoalho: '🧀 Queijo Coalho', queijoMucarela: '🧀 Queijo Muçarela', queijoBrie: '🧀 Queijo Brie',
    butter: '🧈 Manteiga', alpaca_wool: '🦙 Lã de Alpaca', muco: '🐌 Muco de Caracol',
    mel_envasado: '🍯 Mel Envasado', seda_bruta: '🐛 Seda Bruta',
  };
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
          <div className="text-sm font-black text-violet-900">{PRODUCT_LABELS[offer.product] ?? offer.product}</div>
          <div className="text-xs font-mono text-stone-700">Quantidade: <strong>{offer.quantity} unidades</strong></div>
          <div className="text-xs font-mono text-stone-700">Preço garantido: <strong>{offer.pricePerUnit}💰/un</strong></div>
          <div className="text-xs font-mono text-stone-700">Prazo: <strong>Dia {offer.deadline}</strong></div>
          <div className="text-xs font-mono text-red-600">Multa por atraso: <strong>{offer.penalty}💰</strong></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onAccept} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm uppercase px-4 py-2 rounded-xl border-b-2 border-violet-800 transition-all cursor-pointer">✅ Aceitar</button>
          <button type="button" onClick={onReject} className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-black text-sm uppercase px-4 py-2 rounded-xl border-b-2 border-stone-500 transition-all cursor-pointer">❌ Recusar</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
