/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChefHat, History, Trash2 } from 'lucide-react';
import { Animal, LogMessage } from '../types';
import { InventoryState } from '../hooks/useAnimals';

export interface GameSidebarProps {
  // State
  inventory: InventoryState;
  animals: Animal[];
  farmLevel: number;
  gold: number;
  currentDay: number;
  logs: LogMessage[];
  showEmptyItems: boolean;

  // Setters
  setShowEmptyItems: React.Dispatch<React.SetStateAction<boolean>>;
  setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>;

  // Refs
  logsContainerRef: React.RefObject<HTMLDivElement>;
  logsEndRef: React.RefObject<HTMLDivElement>;

  // Active world event (for price highlight)
  worldEvent: { id: string; title: string; desc: string; daysLeft: number; priceMult: number; items: string[] } | null;

  // Functions
  getPriceTrend: (itemType: string) => { symbol: string; color: string; pct: number };
  getActualSellPrice: (itemType: string) => number;
  getFreshnessIndicator: (key: 'milk' | 'egg' | 'goat_milk' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'fertile_egg') => React.ReactNode;
  getEstacaoKey: (day: number) => 'primavera' | 'verao' | 'outono' | 'inverno';
  getFeedPriceWithModifiers: (type: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora', day?: number) => number;
  buyFeed: (type: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora', qty: number, e: React.MouseEvent) => void;
  buyFolhaAmoreira: (qty: number, e: React.MouseEvent) => void;
  sellProduct: (itemType: any, qty: number, e: React.MouseEvent) => void;
  craftCheese: (e?: any) => void;
  craftScarf: (e?: any) => void;
  craftMayonese: (e?: any) => void;
  craftButter: (e?: any) => void;
  craftYogurt: (e?: any) => void;
  triggerAudioResult: (action: () => void) => void;
  sfx: { playSound: (sound: string) => void };
}

export default function GameSidebar({
  inventory,
  animals,
  farmLevel,
  gold,
  currentDay,
  logs,
  showEmptyItems,
  setShowEmptyItems,
  setLogs,
  logsContainerRef,
  logsEndRef,
  worldEvent,
  getPriceTrend,
  getActualSellPrice,
  getFreshnessIndicator,
  getEstacaoKey,
  getFeedPriceWithModifiers,
  buyFeed,
  buyFolhaAmoreira,
  sellProduct,
  craftCheese,
  craftScarf,
  craftMayonese,
  craftButter,
  craftYogurt,
  triggerAudioResult,
  sfx,
}: GameSidebarProps) {
  return (
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* --- ATELIÊ & ARMAZÉM DE PROCESSAMENTO --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col">
              <div className="flex items-center gap-2 border-b-2 border-[#fbbf24] pb-2 mb-4">
                <ChefHat className="w-5 h-5 text-[#78350f]" />
                <h3 className="text-base sm:text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                  Ateliê & Armazém
                </h3>
              </div>

              {/* Toggle mostrar vazios */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#92400e] font-mono font-bold uppercase tracking-wider">Estoque</span>
                <button
                  onClick={() => setShowEmptyItems(prev => !prev)}
                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border transition-all ${showEmptyItems ? 'bg-amber-200 border-amber-400 text-amber-900' : 'bg-stone-100 border-stone-300 text-stone-600'}`}
                >
                  {showEmptyItems ? '👁 Ocultar vazios' : '👁 Mostrar vazios'}
                </button>
              </div>

              {/* Resource grid totals — grouped by category */}
              {(() => {
                type InvItem = {
                  key: string;
                  label: string;
                  qty: number;
                  priceKey?: 'milk'|'wool'|'cheese'|'scarf'|'egg'|'mayo'|'queijoCoalho'|'queijoMucarela'|'queijoBrie'|'goat_milk'|'llama_wool'|'duck_egg'|'goose_egg'|'buffalo_milk'|'buffalo_mozzarella'|'feather'|'peacock_feather'|'butter'|'yogurt'|'fertile_egg';
                  freshKey?: 'milk'|'egg'|'goat_milk'|'duck_egg'|'goose_egg'|'buffalo_milk'|'fertile_egg';
                  colSpan?: boolean;
                };
                const groups: { title: string; bg: string; items: InvItem[] }[] = [
                  {
                    title: '🐄 Produção Animal',
                    bg: 'bg-blue-50/60 border-blue-200',
                    items: [
                      { key: 'milk', label: '🥛 Leite', qty: inventory.milk, priceKey: 'milk', freshKey: 'milk' },
                      { key: 'goat_milk', label: '🥛 L. Cabra', qty: inventory.goat_milk ?? 0, priceKey: 'goat_milk', freshKey: 'goat_milk' },
                      { key: 'buffalo_milk', label: '🥛 L. Búfala', qty: inventory.buffalo_milk ?? 0, priceKey: 'buffalo_milk', freshKey: 'buffalo_milk' },
                      { key: 'wool', label: '🧶 Lã', qty: inventory.wool, priceKey: 'wool' },
                      { key: 'llama_wool', label: '🧶 Lã Lhama', qty: inventory.llama_wool ?? 0, priceKey: 'llama_wool' },
                      { key: 'egg', label: '🥚 Ovo', qty: inventory.egg ?? 0, priceKey: 'egg', freshKey: 'egg' },
                      { key: 'duck_egg', label: '🥚 Ov. Pato', qty: inventory.duck_egg ?? 0, priceKey: 'duck_egg', freshKey: 'duck_egg' },
                      { key: 'goose_egg', label: '🥚 Ov. Ganso', qty: inventory.goose_egg ?? 0, priceKey: 'goose_egg', freshKey: 'goose_egg' },
                      { key: 'fertile_egg', label: '✨ Ovo Fértil', qty: inventory.fertile_egg ?? 0, priceKey: 'fertile_egg', freshKey: 'fertile_egg' },
                      { key: 'feather', label: '🪶 Penas', qty: inventory.feather ?? 0, priceKey: 'feather' },
                      { key: 'peacock_feather', label: '🪶 P. Pavão', qty: inventory.peacock_feather ?? 0, priceKey: 'peacock_feather' },
                    ]
                  },
                  {
                    title: '🏭 Produção & Processados',
                    bg: 'bg-amber-50/60 border-amber-200',
                    items: [
                      { key: 'cheese', label: '🧀 Queijo Básico', qty: inventory.cheese, priceKey: 'cheese' },
                      { key: 'queijoCoalho', label: '🧀 Q. Coalho', qty: inventory.queijoCoalho ?? 0, priceKey: 'queijoCoalho' },
                      { key: 'queijoMucarela', label: '🧀 Muçarela', qty: inventory.queijoMucarela ?? 0, priceKey: 'queijoMucarela' },
                      { key: 'queijoBrie', label: '🧀 Queijo Brie', qty: inventory.queijoBrie ?? 0, priceKey: 'queijoBrie' },
                      { key: 'buffalo_mozzarella', label: '🧀 Muç. Búfala', qty: inventory.buffalo_mozzarella ?? 0, priceKey: 'buffalo_mozzarella' },
                      { key: 'queijo_cabra', label: '🧀 Q. Cabra', qty: (inventory as any).queijo_cabra ?? 0, priceKey: 'queijo_cabra' as any },
                      { key: 'butter', label: '🧈 Manteiga', qty: inventory.butter ?? 0, priceKey: 'butter' },
                      { key: 'yogurt', label: '🥛 Iogurte', qty: inventory.yogurt ?? 0, priceKey: 'yogurt' },
                      { key: 'iogurte_cabra', label: '🥛 Iog. Cabra', qty: (inventory as any).iogurte_cabra ?? 0, priceKey: 'iogurte_cabra' as any },
                      { key: 'leite_condensado', label: '🥛 L. Condensado', qty: (inventory as any).leite_condensado ?? 0, priceKey: 'leite_condensado' as any },
                    ]
                  },
                  {
                    title: '🧵 Artesanato',
                    bg: 'bg-purple-50/60 border-purple-200',
                    items: [
                      { key: 'scarf', label: '🧣 Cachecol', qty: inventory.scarf, priceKey: 'scarf' },
                      { key: 'mayo', label: '🥣 Maionese', qty: inventory.mayo ?? 0, priceKey: 'mayo' },
                      { key: 'tapete_lhama', label: '🪢 Tapete Lhama', qty: (inventory as any).tapete_lhama ?? 0, priceKey: 'tapete_lhama' as any },
                      { key: 'cachecol_angora', label: '🧣 Cachecol Angorá', qty: (inventory as any).cachecol_angora ?? 0, priceKey: 'cachecol_angora' as any },
                      { key: 'tecido_alpaca', label: '🧶 Tecido Alpaca', qty: (inventory as any).tecido_alpaca ?? 0, priceKey: 'tecido_alpaca' as any },
                      { key: 'fio_seda', label: '🪡 Fio de Seda', qty: (inventory as any).fio_seda ?? 0, priceKey: 'fio_seda' as any },
                      { key: 'manta_premium', label: '✨ Manta Premium', qty: (inventory as any).manta_premium ?? 0, priceKey: 'manta_premium' as any },
                      { key: 'pate_pato', label: '🍖 Patê de Pato', qty: (inventory as any).pate_pato ?? 0, priceKey: 'pate_pato' as any },
                      { key: 'ovo_defumado', label: '🥚 Ovo Defumado', qty: (inventory as any).ovo_defumado ?? 0, priceKey: 'ovo_defumado' as any },
                      { key: 'conserva_codorna', label: '🥚 Conserva Codorna', qty: (inventory as any).conserva_codorna ?? 0, priceKey: 'conserva_codorna' as any },
                    ]
                  },
                  {
                    title: '🌿 Novos Animais',
                    bg: 'bg-green-50/60 border-green-200',
                    items: [
                      { key: 'quail_egg', label: '🐦 Ov. Codorna', qty: inventory.quail_egg ?? 0, priceKey: 'quail_egg' as any },
                      { key: 'alpaca_wool', label: '🦙 Lã Alpaca', qty: inventory.alpaca_wool ?? 0, priceKey: 'alpaca_wool' as any },
                      { key: 'angora_wool', label: '🐰 Lã Angorá', qty: inventory.angora_wool ?? 0, priceKey: 'angora_wool' as any },
                      { key: 'humus', label: '🪱 Húmus', qty: inventory.humus ?? 0, priceKey: 'humus' as any },
                      { key: 'muco', label: '🐌 Muco', qty: inventory.muco ?? 0, priceKey: 'muco' as any },
                      { key: 'seda_bruta', label: '🐛 Seda Bruta', qty: inventory.seda_bruta ?? 0, priceKey: 'seda_bruta' as any },
                      { key: 'coxa_ra', label: '🐸 Coxa Rã', qty: inventory.coxa_ra ?? 0, priceKey: 'coxa_ra' as any },
                      { key: 'pena_grande', label: '🦤 Pena Grande', qty: inventory.pena_grande ?? 0, priceKey: 'pena_grande' as any },
                      { key: 'carne_avestruz', label: '🦤 Carne Avestruz', qty: inventory.carne_avestruz ?? 0, priceKey: 'carne_avestruz' as any },
                      { key: 'couro_avestruz', label: '🦤 Couro Avestruz', qty: inventory.couro_avestruz ?? 0, priceKey: 'couro_avestruz' as any },
                      { key: 'carne_jacare', label: '🐊 Carne Jacaré', qty: inventory.carne_jacare ?? 0, priceKey: 'carne_jacare' as any },
                      { key: 'couro_jacare', label: '🐊 Couro Jacaré', qty: inventory.couro_jacare ?? 0, priceKey: 'couro_jacare' as any },
                      ...(farmLevel >= 10 ? [{ key: 'folha_amoreira', label: '🌿 Folha Amoreira', qty: inventory.folha_amoreira ?? 0 }] : []),
                    ]
                  }
                ];

                return (
                  <div className="space-y-3 mb-4">
                    {groups.map(group => {
                      // cheese, scarf e mayo têm craft rápido em "Refinar" — sempre visíveis para fechar o loop visual
                      const ALWAYS_SHOW = new Set(['cheese', 'scarf', 'mayo']);
                      const visibleItems = group.items.filter(item => showEmptyItems || item.qty > 0 || ALWAYS_SHOW.has(item.key));
                      if (visibleItems.length === 0) return null;
                      return (
                        <div key={group.title}>
                          <div className={`text-[10px] font-black uppercase tracking-wider text-[#78350f] mb-1.5 border-b border-[#fbbf24]/40 pb-0.5`}>{group.title}</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {visibleItems.map(item => {
                              const trend = item.priceKey ? getPriceTrend(item.priceKey) : null;
                              const price = item.priceKey ? getActualSellPrice(item.priceKey) : null;
                              const isEmpty = item.qty === 0;
                              const isCraftable = ALWAYS_SHOW.has(item.key) && isEmpty;
                              return (
                                <div key={item.key} title={price !== null ? `${item.label}: ${price}💰/unidade${trend && trend.pct !== 0 ? ` (${trend.pct > 0 ? '+' : ''}${trend.pct}% vs ontem)` : ''}` : undefined} className={`bg-white/80 p-2 rounded-xl border flex flex-col gap-0.5 shadow-inner transition-all ${isCraftable ? 'border-emerald-300 bg-emerald-50/40' : isEmpty ? 'border-[#fbbf24] opacity-40' : 'border-[#fbbf24]'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#78350f] uppercase tracking-tight leading-none flex items-center">
                                      {item.label}
                                      {item.freshKey && item.qty > 0 && getFreshnessIndicator(item.freshKey)}
                                    </span>
                                    {isCraftable
                                      ? <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded leading-none">✦ Fabricar ↓</span>
                                      : <span className="font-mono font-black text-blue-700 text-xs bg-blue-50/60 px-1.5 py-0.5 rounded border border-blue-100">{item.qty}u</span>
                                    }
                                  </div>
                                  {price !== null && (
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      <span className="text-[9px] text-stone-500 font-mono">{price}💰</span>
                                      {trend && (
                                        <span className={`text-[9px] font-black ${trend.color}`}>
                                          {trend.symbol}{Math.abs(trend.pct) > 0 ? ` ${trend.pct > 0 ? '+' : ''}${trend.pct}%` : ''}
                                        </span>
                                      )}
                                      {trend && trend.pct >= 15 && (
                                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-amber-400 text-amber-900 animate-pulse" title="Preço subindo! Pode valer a pena esperar para vender">
                                          📈 Alta!
                                        </span>
                                      )}
                                      {trend && trend.pct <= -15 && (
                                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-400 text-white" title="Preço caindo! Melhor vender agora">
                                          📉 Vender já!
                                        </span>
                                      )}
                                      {worldEvent && item.priceKey && worldEvent.items.includes(item.priceKey) && (
                                        <span
                                          className={`text-[8px] font-black px-1 py-0.5 rounded animate-pulse ${worldEvent.priceMult >= 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                          title={`${worldEvent.title}: ${worldEvent.priceMult >= 1 ? '+' : ''}${Math.round((worldEvent.priceMult - 1) * 100)}% por mais ${worldEvent.daysLeft}d`}
                                        >
                                          🌍 {worldEvent.priceMult >= 1 ? '+' : ''}{Math.round((worldEvent.priceMult - 1) * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Advanced Refining/Manufaturing recipes */}
              <div className="space-y-3 border-t border-dashed border-[#fbbf24]/50 pt-3">
                <h4 className="text-[11px] font-sans font-black uppercase text-[#92400e] tracking-wider mb-2">Refinar Matérias-Primas:</h4>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftCheese(e);
                    }}
                    className="bg-[#10b981] hover:bg-[#059669] text-white border-b-2 border-[#065f46] py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Leites Crus. Fabrica 1 Queijo Básico. Queijaria produz variedades mais valiosas. [Atalho rápido: Tecla 1]"
                  >
                    🧀 Queijo Básico (🥛x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 1]</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftScarf(e);
                    }}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-b-2 border-[#5b21b6] py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Novelos de Lã Crua. Tece 1 Cachecol elegante. [Atalho rápido: Tecla 2]"
                  >
                    🧣 Tecer Cachecol (🧶x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 2]</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftMayonese(e);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-white border-b-2 border-amber-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Ovos caipiras. Prepara 1 Maionese cremosa. [Atalho rápido: Tecla 3]"
                  >
                    🥣 Maionese Cremosa (🥚x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 3]</span>
                  </button>

                  {farmLevel >= 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); craftButter(e); }}
                      className="bg-yellow-500 hover:bg-yellow-400 text-white border-b-2 border-yellow-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                      title="Requer 2 Leites. Fabrica 1 Manteiga artesanal (45💰)."
                    >
                      🧈 Manteiga (🥛x2)
                    </button>
                  )}

                  {farmLevel >= 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); craftYogurt(e); }}
                      className="bg-pink-500 hover:bg-pink-400 text-white border-b-2 border-pink-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                      title="Requer 1 Leite. Fermenta em 1 dia para 1 Iogurte (35💰)."
                    >
                      🥛 Iogurte (🥛x1, 1 dia)
                    </button>
                  )}
                </div>

                <h4 className="text-[11px] font-sans font-black uppercase text-[#92400e] tracking-wider pt-2 mb-2 border-t border-[#fbbf24]/30">Vendas Diretas p/ a Feira:</h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => sellProduct('milk', 1, e)}
                    disabled={inventory.milk < 1}
                    className="bg-stone-100 hover:bg-stone-200 border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-stone-300"
                    title="Vender leite cru. Preço de venda: 5 moedas base."
                  >
                    Vender Leite ({getActualSellPrice('milk')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('wool', 1, e)}
                    disabled={inventory.wool < 1}
                    className="bg-stone-100 hover:bg-stone-200 border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-stone-300"
                    title="Vender lã crua. Preço de venda: 12 moedas base."
                  >
                    Vender Lã ({getActualSellPrice('wool')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('egg', 1, e)}
                    disabled={(inventory.egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300"
                    title="Vender Ovo de Quintal. Preço de venda: 4 moedas base."
                  >
                    Vender Ovo ({getActualSellPrice('egg')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('mayo', 1, e)}
                    disabled={(inventory.mayo ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-yellow-300"
                    title="Vender Maionese Cremosa. Preço de venda: 10 moedas base."
                  >
                    Vender Maionese ({getActualSellPrice('mayo')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('cheese', 1, e)}
                    disabled={inventory.cheese < 1}
                    className="bg-amber-50 hover:bg-amber-200 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Queijo Básico (feito com 2 leites). Para queijos premium use a Queijaria."
                  >
                    Vender Queijo Básico ({getActualSellPrice('cheese')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoCoalho', 1, e)}
                    disabled={(inventory.queijoCoalho ?? 0) < 1}
                    className="bg-amber-100/60 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-stone-300"
                    title="Vende 1 Queijo Coalho."
                  >
                    Vender Q. Coalho ({getActualSellPrice('queijoCoalho')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoMucarela', 1, e)}
                    disabled={(inventory.queijoMucarela ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-200 border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-yellow-300"
                    title="Vende 1 Queijo Muçarela."
                  >
                    Vender Muçarela ({getActualSellPrice('queijoMucarela')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoBrie', 1, e)}
                    disabled={(inventory.queijoBrie ?? 0) < 1}
                    className="bg-orange-50 hover:bg-orange-100 border border-orange-300 disabled:opacity-40 text-orange-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Queijo Brie."
                  >
                    Vender Q. Brie ({getActualSellPrice('queijoBrie')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('scarf', 1, e)}
                    disabled={inventory.scarf < 1}
                    className="bg-indigo-100 hover:bg-indigo-100 border border-indigo-300 disabled:opacity-40 text-indigo-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Cachecol elegante."
                  >
                    Vender Cachecol ({getActualSellPrice('scarf')}💰)
                  </button>

                  {/* BUG 5 FIX: itens especiais só aparecem se o jogador tem o animal produtor OU quantidade > 0 */}
                  {(animals.some(a => a.type === 'cabra') || (inventory.goat_milk ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('goat_milk', 1, e)}
                    disabled={(inventory.goat_milk ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-blue-300"
                    title="Vende 1 Leite de Cabra. Preço base: 38 moedas."
                  >
                    L. Cabra ({getActualSellPrice('goat_milk')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'lhama') || (inventory.llama_wool ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('llama_wool', 1, e)}
                    disabled={(inventory.llama_wool ?? 0) < 1}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-purple-300"
                    title="Vende 1 Lã de Lhama. Preço base: 45 moedas."
                  >
                    L. Lhama ({getActualSellPrice('llama_wool')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pato') || (inventory.duck_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('duck_egg', 1, e)}
                    disabled={(inventory.duck_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300"
                    title="Vende 1 Ovo de Pato. Preço base: 18 moedas."
                  >
                    Ov. Pato ({getActualSellPrice('duck_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'ganso') || (inventory.goose_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('goose_egg', 1, e)}
                    disabled={(inventory.goose_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300"
                    title="Vende 1 Ovo de Ganso. Preço base: 50 moedas."
                  >
                    Ov. Ganso ({getActualSellPrice('goose_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'bufalo') || (inventory.buffalo_milk ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('buffalo_milk', 1, e)}
                    disabled={(inventory.buffalo_milk ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-blue-300"
                    title="Vende 1 Leite de Búfala. Preço base: 55 moedas."
                  >
                    L. Búfala ({getActualSellPrice('buffalo_milk')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'bufalo') || (inventory.buffalo_mozzarella ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('buffalo_mozzarella', 1, e)}
                    disabled={(inventory.buffalo_mozzarella ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Muçarela de Búfala. Preço base: 120 moedas."
                  >
                    Muç. Búfala ({getActualSellPrice('buffalo_mozzarella')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pato' || a.type === 'ganso') || (inventory.feather ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('feather', 1, e)}
                    disabled={(inventory.feather ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-teal-300"
                    title="Vende 1 Pena de Pato/Ganso. Preço base: 15 moedas."
                  >
                    Penas ({getActualSellPrice('feather')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pavao') || (inventory.peacock_feather ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('peacock_feather', 1, e)}
                    disabled={(inventory.peacock_feather ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-emerald-300"
                    title="Vende 1 Pena de Pavão. Preço base: 80 moedas."
                  >
                    P. Pavão ({getActualSellPrice('peacock_feather')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'vaca') || (inventory.butter ?? 0) > 0 || inventory.milk > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('butter', 1, e)}
                    disabled={(inventory.butter ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-yellow-300"
                    title="Vende 1 Manteiga. Preço base: 45 moedas."
                  >
                    Manteiga ({getActualSellPrice('butter')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'vaca') || (inventory.yogurt ?? 0) > 0 || inventory.milk > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('yogurt', 1, e)}
                    disabled={(inventory.yogurt ?? 0) < 1}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-300 disabled:opacity-40 disabled:cursor-not-allowed text-pink-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-pink-300"
                    title="Vende 1 Iogurte. Preço base: 35 moedas."
                  >
                    Iogurte ({getActualSellPrice('yogurt')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'galinha') || (inventory.fertile_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('fertile_egg', 1, e)}
                    disabled={(inventory.fertile_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300"
                    title="Vende 1 Ovo Fértil. Preço base: 36 moedas."
                  >
                    ✨ Ov. Fértil ({getActualSellPrice('fertile_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'avestruz') || (inventory.couro_avestruz ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('couro_avestruz', 1, e)}
                    disabled={(inventory.couro_avestruz ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Couro de Avestruz. Preço base: 300 moedas."
                  >
                    🦤 Couro Avestruz ({getActualSellPrice('couro_avestruz')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'jacare') || (inventory.couro_jacare ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('couro_jacare', 1, e)}
                    disabled={(inventory.couro_jacare ?? 0) < 1}
                    className="bg-green-50 hover:bg-green-100 border border-green-300 disabled:opacity-40 text-green-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Couro de Jacaré. Preço base: 400 moedas."
                  >
                    🐊 Couro Jacaré ({getActualSellPrice('couro_jacare')}💰)
                  </button>
                  )}

                  {(inventory.queijo_cabra ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('queijo_cabra', 1, e)} disabled={(inventory.queijo_cabra ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300">
                    🧀 Q.Cabra ({getActualSellPrice('queijo_cabra')}💰)
                  </button>
                  )}
                  {(inventory.iogurte_cabra ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('iogurte_cabra', 1, e)} disabled={(inventory.iogurte_cabra ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300">
                    🥛 Iog.Cabra ({getActualSellPrice('iogurte_cabra')}💰)
                  </button>
                  )}
                  {(inventory.leite_condensado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('leite_condensado', 1, e)} disabled={(inventory.leite_condensado ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-yellow-300">
                    🥛 L.Condensado ({getActualSellPrice('leite_condensado')}💰)
                  </button>
                  )}
                  {(inventory.tapete_lhama ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('tapete_lhama', 1, e)} disabled={(inventory.tapete_lhama ?? 0) < 1}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-purple-300">
                    🪢 Tapete Lhama ({getActualSellPrice('tapete_lhama')}💰)
                  </button>
                  )}
                  {(inventory.cachecol_angora ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('cachecol_angora', 1, e)} disabled={(inventory.cachecol_angora ?? 0) < 1}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed text-indigo-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-indigo-300">
                    🧣 Cachecol Angorá ({getActualSellPrice('cachecol_angora')}💰)
                  </button>
                  )}
                  {(inventory.tecido_alpaca ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('tecido_alpaca', 1, e)} disabled={(inventory.tecido_alpaca ?? 0) < 1}
                    className="bg-violet-50 hover:bg-violet-100 border border-violet-300 disabled:opacity-40 text-violet-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm">
                    🧶 Tecido Alpaca ({getActualSellPrice('tecido_alpaca')}💰)
                  </button>
                  )}
                  {(inventory.fio_seda ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('fio_seda', 1, e)} disabled={(inventory.fio_seda ?? 0) < 1}
                    className="bg-sky-50 hover:bg-sky-100 border border-sky-300 disabled:opacity-40 text-sky-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm">
                    🪡 Fio de Seda ({getActualSellPrice('fio_seda')}💰)
                  </button>
                  )}
                  {(inventory.manta_premium ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('manta_premium', 1, e)} disabled={(inventory.manta_premium ?? 0) < 1}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-300 disabled:opacity-40 text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2">
                    ✨ Manta Premium ({getActualSellPrice('manta_premium')}💰)
                  </button>
                  )}
                  {(inventory.pate_pato ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('pate_pato', 1, e)} disabled={(inventory.pate_pato ?? 0) < 1}
                    className="bg-orange-50 hover:bg-orange-100 border border-orange-300 disabled:opacity-40 text-orange-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm">
                    🍖 Patê Pato ({getActualSellPrice('pate_pato')}💰)
                  </button>
                  )}
                  {(inventory.ovo_defumado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('ovo_defumado', 1, e)} disabled={(inventory.ovo_defumado ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300">
                    🥚 Ov.Defumado ({getActualSellPrice('ovo_defumado')}💰)
                  </button>
                  )}
                  {(inventory.conserva_codorna ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('conserva_codorna', 1, e)} disabled={(inventory.conserva_codorna ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300">
                    🥚 Conserva Codorna ({getActualSellPrice('conserva_codorna')}💰)
                  </button>
                  )}
                  {(inventory.creme_cosmetico ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('creme_cosmetico', 1, e)} disabled={(inventory.creme_cosmetico ?? 0) < 1}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-300 disabled:opacity-40 disabled:cursor-not-allowed text-pink-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-pink-300">
                    🧴 Creme Cosm. ({getActualSellPrice('creme_cosmetico')}💰)
                  </button>
                  )}
                  {(inventory.sabonete_natural ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('sabonete_natural', 1, e)} disabled={(inventory.sabonete_natural ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-teal-300">
                    🧼 Sabonete Nat. ({getActualSellPrice('sabonete_natural')}💰)
                  </button>
                  )}
                  {(inventory.almofada_penas ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('almofada_penas', 1, e)} disabled={(inventory.almofada_penas ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-blue-300">
                    🛋️ Almofada Penas ({getActualSellPrice('almofada_penas')}💰)
                  </button>
                  )}
                  {(inventory.colete_couro ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('colete_couro', 1, e)} disabled={(inventory.colete_couro ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm">
                    🦺 Colete Couro ({getActualSellPrice('colete_couro')}💰)
                  </button>
                  )}
                  {(inventory.bolsa_exotica ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('bolsa_exotica', 1, e)} disabled={(inventory.bolsa_exotica ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm col-span-2">
                    👜 Bolsa Exótica ({getActualSellPrice('bolsa_exotica')}💰)
                  </button>
                  )}
                  {(inventory.enfeite_pavao ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('enfeite_pavao', 1, e)} disabled={(inventory.enfeite_pavao ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-teal-300">
                    🦚 Enfeite Pavão ({getActualSellPrice('enfeite_pavao')}💰)
                  </button>
                  )}

                  {/* Biome exclusive products */}
                  {(inventory.peixe ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('peixe' as any, 1, e)} disabled={(inventory.peixe ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-blue-300"
                    title="Vende 1 Peixe do Lago. Preço base: 45 moedas.">
                    🐟 Peixe ({getActualSellPrice('peixe' as any)}💰)
                  </button>
                  )}

                  {(inventory.mel ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('mel' as any, 1, e)} disabled={(inventory.mel ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300"
                    title="Vende 1 Mel da Floresta. Preço base: 80 moedas.">
                    🍯 Mel ({getActualSellPrice('mel' as any)}💰)
                  </button>
                  )}

                  {(inventory.cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('cogumelo' as any, 1, e)} disabled={(inventory.cogumelo ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-emerald-300"
                    title="Vende 1 Cogumelo da Floresta. Preço base: 35 moedas.">
                    🍄 Cogumelo ({getActualSellPrice('cogumelo' as any)}💰)
                  </button>
                  )}

                  {/* Biome craft products */}
                  {(inventory.hidromel ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('hidromel' as any, 1, e)} disabled={(inventory.hidromel ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-yellow-300">
                    🍺 Hidromel ({getActualSellPrice('hidromel' as any)}💰)
                  </button>
                  )}
                  {(inventory.risoto_cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('risoto_cogumelo' as any, 1, e)} disabled={(inventory.risoto_cogumelo ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-emerald-300">
                    🍄 Risoto ({getActualSellPrice('risoto_cogumelo' as any)}💰)
                  </button>
                  )}
                  {(inventory.conserva_peixe ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('conserva_peixe' as any, 1, e)} disabled={(inventory.conserva_peixe ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-blue-300">
                    🐟 Conserva ({getActualSellPrice('conserva_peixe' as any)}💰)
                  </button>
                  )}
                  {(inventory.mel_envasado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('mel_envasado' as any, 1, e)} disabled={(inventory.mel_envasado ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-sm border-b-2 border-amber-300">
                    🍯 Mel Envasado ({getActualSellPrice('mel_envasado' as any)}💰)
                  </button>
                  )}
                  {(inventory.sopa_cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('sopa_cogumelo' as any, 1, e)} disabled={(inventory.sopa_cogumelo ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-95 transition-all cursor-pointer shadow-sm">
                    🍲 Sopa ({getActualSellPrice('sopa_cogumelo' as any)}💰)
                  </button>
                  )}
                </div>

              </div>

            </div>

            {/* --- SILO DE RAÇÕES SEGMENTADAS --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col">
              <div className="flex items-center gap-2 border-b-2 border-[#fbbf24] pb-2 mb-4">
                <span className="text-xl">🌾</span>
                <h3 className="text-base sm:text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                  Silo de Rações
                </h3>
              </div>

              <p className="text-[10px] text-[#92400e] font-sans font-extrabold uppercase tracking-wide mb-3 leading-tight">
                Adquira pacotes com descontos progressivos (10% no Nível 4+). {getEstacaoKey(currentDay) === 'inverno' ? '❄️ PREÇOS DO INVERNO: +50% ENCARECIDOS!' : '☀️ Preços normais de entressafra.'}
              </p>

              <div className="space-y-4">
                {([
                  { key: 'racaoBovina', label: '🌾 Ração Bovina', desc: 'Para Vaca, Boi e Búfalo. 4💰/dia.' },
                  { key: 'racaoOvinos', label: '🐐 Ração de Ovinos', desc: 'Para Ovelha, Cabra, Lhama e Alpaca. 3💰/dia.' },
                  { key: 'racaoAves', label: '🐔 Ração de Aves', desc: 'Para Galinha, Codorna e Pavão. 3💰/dia.' },
                  { key: 'racaoAquatica', label: '🦆 Ração Aquática', desc: 'Para Pato e Ganso. 4💰/dia.' },
                  { key: 'racaoCoelho', label: '🐰 Ração de Coelhos', desc: 'Para Coelho Angorá. 2💰/dia.' },
                  { key: 'racaoCarnivora', label: '🍖 Ração Carnívora', desc: 'Para Rã, Avestruz e Jacaré. 6💰/dia.' }
                ] as const).map((feed) => {
                  const currentStock = inventory[feed.key] ?? 0;
                  const unitPrice = getFeedPriceWithModifiers(feed.key);
                  return (
                    <div key={feed.key} className="bg-white/80 p-3 rounded-2xl border-2 border-[#fbbf24]/50 hover:border-[#fbbf24] transition-all flex flex-col gap-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-sans font-black text-[#78350f] text-xs uppercase leading-tight">{feed.label}</h4>
                          <p className="text-[9px] text-[#92400e]/70 font-mono mt-0.5">{feed.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-[#92400e] font-mono uppercase font-black tracking-wider leading-none">Estoque</span>
                          <span className="font-mono text-sm font-black text-rose-800">{currentStock}u</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#fbbf25]/25">
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 1, e)}
                          disabled={gold < unitPrice}
                          className="bg-stone-100 hover:bg-stone-200 text-[#78350f] text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-stone-300 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                        >
                          +1u ({unitPrice}💰)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 10, e)}
                          disabled={gold < Math.floor(unitPrice * 10 * 0.95)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-indigo-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                          title="Desconto de 5% em pacotes de 10 unidades!"
                        >
                          +10u ({Math.floor(unitPrice * 10 * 0.95)}💰)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 50, e)}
                          disabled={gold < Math.floor(unitPrice * 50 * 0.88)}
                          className="bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-[#10b981]/30 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                          title="Desconto de 12% em pacotes de 50 unidades!"
                        >
                          +50u ({Math.floor(unitPrice * 50 * 0.88)}💰)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- LOJA DE INSUMOS: Folha de Amoreira --- */}
              {farmLevel >= 10 && (
                <div className="mt-4 bg-white/80 p-3 rounded-2xl border-2 border-emerald-300 hover:border-emerald-400 transition-all flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-black text-emerald-900 text-xs uppercase leading-tight">🌿 Folha de Amoreira</h4>
                      <p className="text-[9px] text-emerald-700/70 font-mono mt-0.5">Alimento do Bicho-da-seda (1/dia por bicho)</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-emerald-700 font-mono uppercase font-black tracking-wider leading-none">Estoque</span>
                      <span className="font-mono text-sm font-black text-emerald-800">{inventory.folha_amoreira ?? 0}u</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-emerald-200/50">
                    <button
                      type="button"
                      onClick={(e) => buyFolhaAmoreira(1, e)}
                      disabled={gold < 5}
                      className="bg-stone-100 hover:bg-stone-200 text-emerald-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-emerald-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                    >
                      +1u (5💰)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyFolhaAmoreira(10, e)}
                      disabled={gold < 50}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-emerald-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                    >
                      +10u (50💰)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- DIÁRIO DA FAZENDA (ACTION LOGS) --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col flex-1 h-[280px] lg:h-[350px]">

              <div className="flex items-center justify-between border-b-2 border-[#fbbf24] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#78350f]" />
                  <h3 className="text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                    Diário da Fazenda
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setLogs([]);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="text-[10px] font-mono font-black text-red-700 cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded-lg border-2 border-b-4 border-red-300 transition-all hover:scale-105 active:translate-y-0.5 shadow-sm uppercase"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Limpar
                </button>
              </div>

              <div ref={logsContainerRef} className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 font-mono divide-y divide-[#fbbf24]/30" style={{ scrollbarWidth: 'thin' }}>
                {logs.length === 0 ? (
                  <div className="text-center text-[#92400e]/50 italic pt-16 font-bold uppercase tracking-wider">
                    Nenhum registro ainda hoje.
                  </div>
                ) : (() => {
                  let lastDay: number | null = null;
                  return logs.map((log) => {
                    let textClass = 'text-[#78350f] font-bold';
                    let bgClass = '';
                    if (log.type === 'error') {
                      textClass = 'text-[#991b1b] font-black uppercase';
                      bgClass = 'bg-[#fee2e2] p-2 rounded-xl border-2 border-[#fecaca]';
                    } else if (log.type === 'success') {
                      textClass = 'text-[#166534] font-black uppercase';
                      bgClass = 'bg-[#dcfce7] p-2 rounded-xl border-2 border-[#bbf7d0]';
                    } else if (log.type === 'system') {
                      textClass = 'text-[#1e3a8a] font-black italic uppercase';
                      bgClass = 'bg-[#dbeafe] p-2 rounded-xl border-2 border-[#bfdbfe]';
                    } else if (log.type === 'event') {
                      textClass = 'text-[#854d0e] font-black uppercase';
                      bgClass = 'bg-[#fef9c3] p-2 rounded-xl border-2 border-[#fef08a]';
                    }
                    const showDaySep = log.day !== lastDay;
                    lastDay = log.day;
                    return (
                      <div key={log.id}>
                        {showDaySep && (
                          <div className="flex items-center gap-2 my-1.5">
                            <div className="flex-1 border-t border-[#fbbf24]/50" />
                            <span className="text-[9px] font-black text-[#92400e] bg-[#fef3c7] border border-[#fbbf24] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              — Dia {log.day} —
                            </span>
                            <div className="flex-1 border-t border-[#fbbf24]/50" />
                          </div>
                        )}
                        <div className={`${bgClass} transition-all flex items-start gap-1 pb-1.5 pt-1`}>
                          <span className={`${textClass} leading-tight`}>{log.message}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
                <div ref={logsEndRef} />
              </div>

            </div>

          </div>
  );
}
