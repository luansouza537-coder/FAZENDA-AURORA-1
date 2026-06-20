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
  milk: '🥛 Leite Cru', wool: '🧶 Lã Crua', egg: '🥚 Ovos Caipiras', cheese: '🧀 Queijo Simples',
  queijoCoalho: '🧀 Queijo Coalho', queijoMucarela: '🧀 Queijo Muçarela', queijoBrie: '🧀 Queijo Brie',
  butter: '🧈 Manteiga Artesanal', yogurt: '🥛 Iogurte Natural', goat_milk: '🐐 Leite de Cabra',
  buffalo_milk: '🐃 Leite de Búfala', buffalo_mozzarella: '🐃 Mozzarella de Búfala',
  duck_egg: '🦆 Ovo de Pato', quail_egg: '🐦 Ovo de Codorna', goose_egg: '🪿 Ovo de Ganso',
  feather: '🪶 Penas', peacock_feather: '🦚 Penas de Pavão',
  angora_wool: '🐇 Lã Angorá', alpaca_wool: '🦙 Lã de Alpaca', llama_wool: '🦙 Lã de Lhama',
  muco: '🐌 Muco de Caracol', seda_bruta: '🐛 Seda Bruta', mel_envasado: '🍯 Mel Envasado',
  boi: '🐂 Boi (Carne)', porco: '🐷 Porco (Carne)', boi_porco: '🥩 Boi + Porco (Misto)',
  mayo: '🥚 Maionese Artesanal', queijo_cabra: '🐐 Queijo de Cabra', iogurte_cabra: '🐐 Iogurte de Cabra',
  tapete_lhama: '🦙 Tapete de Lhama', leite_condensado: '🥛 Leite Condensado',
  tecido_alpaca: '🦙 Tecido de Alpaca', cachecol_angora: '🐇 Cachecol Angorá',
  coxa_ra: '🐸 Coxa de Rã', pena_grande: '🦤 Pena de Avestruz',
  carne_avestruz: '🦤 Carne de Avestruz', couro_avestruz: '🦤 Couro de Avestruz',
  fio_seda: '🪡 Fio de Seda', carne_jacare: '🐊 Carne de Jacaré', couro_jacare: '🐊 Couro de Jacaré',
};

export const ContractsModal: React.FC<ContractsModalProps> = ({
  contracts, currentDay, farmLevel, gold, longContractCatalog, onSignLongContract, onClose
}) => {
  const longContracts = contracts.filter(c => c.active && c.contractType === 'long');
  const [levelFilter, setLevelFilter] = useState<'all' | '1-5' | '6-10' | '11-15' | '16+'>('all');

  const filteredCatalog = longContractCatalog.filter(cat => {
    if (levelFilter === '1-5') return cat.minLevel >= 1 && cat.minLevel <= 5;
    if (levelFilter === '6-10') return cat.minLevel >= 6 && cat.minLevel <= 10;
    if (levelFilter === '11-15') return cat.minLevel >= 11 && cat.minLevel <= 15;
    if (levelFilter === '16+') return cat.minLevel >= 16;
    return true;
  });

  const getStars = (cat: LongContractCatalogEntry): string => {
    if (!cat.baseMarket || cat.baseMarket === 0) return '⭐';
    const premiumPct = ((cat.pricePerUnit - cat.baseMarket) / cat.baseMarket) * 100;
    if (premiumPct >= 60) return '⭐⭐⭐';
    if (premiumPct >= 30) return '⭐⭐';
    return '⭐';
  };

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

        <div className="bg-violet-700 px-5 py-2 border-b-4 border-violet-200 shrink-0">
          <p className="text-white text-xs font-display font-black uppercase tracking-wider">📜 Fornecedores Fixos {longContracts.length > 0 && <span className="ml-1 bg-white text-violet-700 rounded-full px-1.5">{longContracts.length}</span>}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                <h4 className="font-display font-black text-xs uppercase text-stone-500 mb-2">📋 Catálogo de Fornecedores</h4>
                {/* Level filter chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(['all', '1-5', '6-10', '11-15', '16+'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLevelFilter(f)}
                      className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border cursor-pointer transition-all ${levelFilter === f ? 'bg-violet-600 text-white border-violet-800' : 'bg-white text-violet-700 border-violet-300 hover:bg-violet-50'}`}
                    >
                      {f === 'all' ? 'Todos' : `Nível ${f}`}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredCatalog.map(cat => {
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
                            <div className="text-[11px] mt-0.5" title="Rentabilidade">{getStars(cat)}</div>
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

