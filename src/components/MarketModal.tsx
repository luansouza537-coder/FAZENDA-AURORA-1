import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PriceChart from './PriceChart';
import { LandLot } from '../types';

interface MarketEvent { title: string; desc: string; items: string[]; mult: number; daysLeft: number; }
interface WorldEvent { id: string; title: string; desc: string; daysLeft: number; priceMult: number; items: string[]; }
interface WeeklySales { milk: number; wool: number; cheese: number; scarf: number; carne: number; egg: number; mayo: number; [key: string]: number; }
interface SellQuantities { [key: string]: number; }
interface Inventory { milk: number; wool: number; cheese: number; scarf: number; egg: number; mayo?: number; [key: string]: number | undefined; }

type ItemKey = 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | string;

interface MarketFns {
  getDynamicPrice: (key: ItemKey) => number;
  getTrendIconAndColor: (key: string) => { icon: string; color: string; label: string };
  getItemBaseSellPrice: (key: ItemKey) => number;
  getSeasonalityMultiplier: (key: string, day: number) => number;
  getDynamicTransactionPrice: (key: ItemKey) => number;
  getPriceForecast: (key: string) => { day1: number; day2: number; day3: number; trend: number };
  getCarneMultiplier: () => number;
  getActualSellPrice: (key: ItemKey) => number;
  sellProduct: (key: string, qty: number, e: React.MouseEvent) => void;
}

interface MarketModalProps {
  farmLevel: number;
  currentDay: number;
  inventory: Inventory;
  animals: { type: string }[];
  activeMarketEvent: MarketEvent | null;
  worldEvent: WorldEvent | null;
  weeklySales: WeeklySales;
  sellQuantities: SellQuantities;
  setSellQuantities: React.Dispatch<React.SetStateAction<SellQuantities>>;
  priceHistory: Record<string, number[]>;
  landBiomes: LandLot[];
  marketFns: MarketFns;
  onClose: () => void;
  onOpenSellAll: () => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const MarketModal: React.FC<MarketModalProps> = ({
  farmLevel, currentDay, inventory, animals,
  activeMarketEvent, worldEvent, weeklySales, sellQuantities, setSellQuantities,
  priceHistory, landBiomes, marketFns: m, onClose, onOpenSellAll,
  triggerAudioResult, sfx,
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-sky-800 rounded-[36px] max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-gradient-to-r from-sky-800 to-indigo-900 p-5 border-b-4 border-sky-950 text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #0c4a6e' }}>
              📊 Painel Financeiro do Mercado
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Fatores dinâmicos, ofertas semanais e flutuações de preços
            </p>
            <button onClick={handleClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-sky-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold" title="Fechar">✕</button>
          </div>

          <div className="bg-[#e0f2fe] border-b border-sky-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-sky-950 font-mono shrink-0">
            <div>⚖️ <strong>Oferta e Procura:</strong> Quanto mais unidades de um item você vende na semana, menor fica seu preço de venda (-0.4% por unidade). O preço reinicia no relatório semanal a cada 7 dias!</div>
            <div>🌸 <strong>Fatores Sazonais:</strong> Estações mudam a demanda de produtos (🧶 lã cresce 30% no Inverno, 🥛 leite cai 20% no Verão). Climas e Mercador também modificam o preço!</div>
          </div>

          {activeMarketEvent && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 mb-2 mx-4 mt-2">
              <div className="font-black text-amber-800 text-sm">{activeMarketEvent.title}</div>
              <div className="text-amber-700 text-xs mt-0.5">{activeMarketEvent.desc}</div>
              <div className="text-amber-500 font-mono text-[10px] mt-1">⏳ {activeMarketEvent.daysLeft} dia(s) restante(s)</div>
            </div>
          )}

          {worldEvent && (
            <div className={`border-2 rounded-2xl p-3 mb-2 mx-4 ${worldEvent.priceMult >= 1 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
              <div className={`font-black text-sm ${worldEvent.priceMult >= 1 ? 'text-green-800' : 'text-red-800'}`}>🌍 {worldEvent.title}</div>
              <div className={`text-xs mt-0.5 ${worldEvent.priceMult >= 1 ? 'text-green-700' : 'text-red-700'}`}>{worldEvent.desc}</div>
              <div className={`font-mono text-[10px] mt-1 ${worldEvent.priceMult >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                {worldEvent.priceMult >= 1 ? `+${Math.round((worldEvent.priceMult-1)*100)}%` : `-${Math.round((1-worldEvent.priceMult)*100)}%`} nos preços afetados — ⏳ {worldEvent.daysLeft} dia(s)
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5" style={{ scrollbarWidth: 'thin' }}>
            {([
              { key: 'milk', label: '🥛 Leite Cru', base: m.getItemBaseSellPrice('milk'), desc: 'Produzido por vacas leiteiras comuns.', formula: 'Sazonalidade: Verão (-20%) | Clima: Chuva (-10%), Sol (+10%)' },
              { key: 'wool', label: '🧶 Lã Crua', base: m.getItemBaseSellPrice('wool'), desc: 'Tosquiada das ovelhas de pelagem densa.', formula: 'Sazonalidade: Inverno (+30%) | Clima: Chuva (Sem lã / -20% valor)' },
              { key: 'cheese', label: '🧀 Queijo Nobre', base: m.getItemBaseSellPrice('cheese'), desc: 'Feito com carinho no Ateliê com 3 leites.', formula: 'Sazonalidade: Outono (+15%) | Clima: Sem impacto' },
              { key: 'scarf', label: '🧣 Cachecol Elegante', base: m.getItemBaseSellPrice('scarf'), desc: 'Tecido com cuidado no Ateliê com 2 lãs.', formula: 'Sazonalidade: Primavera (+10%) | Clima: Sem impacto' },
              { key: 'egg', label: '🥚 Ovo de Quintal', base: m.getItemBaseSellPrice('egg'), desc: 'Produzido por galinhas felizes e bem alimentadas.', formula: 'Sazonalidade: Primavera (+25%), Inverno (-25%) | Clima: Chuva (-10%), Sol (+10%)' },
              { key: 'mayo', label: '🥣 Maionese Cremosa', base: m.getItemBaseSellPrice('mayo'), desc: 'Preparada misturando 2 ovos de quintal no Ateliê.', formula: 'Sazonalidade: Verão (+15%) | Clima: Sem impacto' },
            ] as const).map((item) => {
              const currentP = m.getDynamicPrice(item.key);
              const trend = m.getTrendIconAndColor(item.key);
              const weeklyQty = weeklySales[item.key] || 0;
              const demandPenalty = Math.min(40, Math.round((weeklyQty * 0.4) * 10) / 10);
              const stock = inventory[item.key] || 0;
              const quantityToSell = Math.min(stock, sellQuantities[item.key] || 1);
              const seasonalMult = m.getSeasonalityMultiplier(item.key, currentDay);
              const isHighSeason = seasonalMult > 1.0;

              return (
                <div key={item.key} className={`border-2 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${isHighSeason ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm uppercase text-[#78350f] tracking-wide">{item.label}</span>
                      {isHighSeason && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 animate-pulse">🔥 Alta Temporada! +{Math.round((seasonalMult - 1) * 100)}%</span>}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#e0f1fc] text-sky-800 font-mono">Estoque: {stock}u</span>
                    </div>
                    <p className="text-stone-400 text-[10px] mt-0.5 font-sans leading-relaxed">{item.desc}</p>
                    <div className="text-[9px] text-stone-500 font-mono mt-1 uppercase tracking-wider leading-relaxed">⚙️ {item.formula}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="bg-slate-50 p-2 rounded-xl border border-stone-100 flex items-center justify-between gap-4 shrink-0 text-center font-mono text-[11px] min-w-[140px]">
                      <div>
                        <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Venda Semanal</div>
                        <div className="text-stone-700 font-extrabold mt-0.5">{weeklyQty} u</div>
                        <div className="text-[8px] text-red-500 font-extrabold font-mono mt-0.5">{weeklyQty > 0 ? `-${demandPenalty}%` : 'Alta Procura!'}</div>
                      </div>
                      <div className="border-l border-stone-200 h-8" />
                      <div>
                        <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Tendência</div>
                        <div className={`text-xs mt-0.5 flex items-center justify-center gap-0.5 leading-none ${trend.color}`}>
                          <span>{trend.icon}</span> <span>{trend.label}</span>
                        </div>
                      </div>
                    </div>
                    <PriceChart history={priceHistory[item.key] || [item.base, item.base, item.base, item.base, item.base, item.base, item.base]} basePrice={item.base} />
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 min-w-[210px] w-full lg:w-auto">
                    <div className="text-right w-full flex lg:flex-col justify-between items-center lg:items-end">
                      <span className="block text-[9px] text-stone-400 font-mono uppercase font-black tracking-wider">Preço por un.</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-indigo-900 font-black font-mono text-lg">{currentP} moedas</span>
                        <span className="text-[9px] font-mono text-stone-400">Base: {item.base}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 w-full justify-between mt-0.5">
                      <div className="flex items-center bg-stone-100 border-2 border-stone-200 rounded-xl p-0.5 overflow-hidden">
                        <button type="button" onClick={(e) => { e.preventDefault(); setSellQuantities(prev => ({ ...prev, [item.key]: Math.max(1, (prev[item.key] || 1) - 1) })); triggerAudioResult(() => sfx.playSound('click')); }} disabled={stock < 1} className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-lg active:scale-95 disabled:opacity-30 cursor-pointer">-</button>
                        <span className="w-8 text-center font-mono font-black text-xs text-sky-950">{quantityToSell}</span>
                        <button type="button" onClick={(e) => { e.preventDefault(); setSellQuantities(prev => ({ ...prev, [item.key]: Math.min(stock, (prev[item.key] || 1) + 1) })); triggerAudioResult(() => sfx.playSound('click')); }} disabled={stock <= (sellQuantities[item.key] || 1)} className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-lg active:scale-95 disabled:opacity-30 cursor-pointer">+</button>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); setSellQuantities(prev => ({ ...prev, [item.key]: stock })); triggerAudioResult(() => sfx.playSound('click')); }} disabled={stock < 1} className="bg-sky-100 hover:bg-sky-200 text-sky-800 font-mono font-bold text-[9px] uppercase px-2 py-1.5 rounded-lg active:scale-95 disabled:opacity-50 cursor-pointer">MÁX</button>
                    </div>

                    {(() => {
                      const forecast = m.getPriceForecast(item.key);
                      if (!forecast.day1) return null;
                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[9px] font-mono w-full">
                          <div className="text-stone-400 font-bold uppercase tracking-wider mb-1">📅 Previsão:</div>
                          <div className="flex gap-2">
                            <span>Amanhã: ~{forecast.day1}💰 {forecast.trend > 0 ? '▲' : forecast.trend < 0 ? '▼' : '→'}</span>
                            <span>|</span><span>+2d: ~{forecast.day2}💰</span>
                            <span>|</span><span>+3d: ~{forecast.day3}💰</span>
                          </div>
                        </div>
                      );
                    })()}

                    <button type="button" onClick={(e) => { if (quantityToSell < 1) return; m.sellProduct(item.key, quantityToSell, e); setSellQuantities(prev => ({ ...prev, [item.key]: 1 })); }} disabled={stock < 1}
                      className={`w-full font-mono font-black text-[11px] uppercase py-2.5 px-3 border-b-2 rounded-xl text-center leading-none tracking-wide transition-all active:translate-y-0.5 ${stock > 0 ? 'bg-amber-400 hover:bg-amber-300 text-[#451a03] border-amber-600 cursor-pointer' : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-50'}`}>
                      Vender {quantityToSell} {quantityToSell === 1 ? 'unidade' : 'unidades'} (+{(currentP * quantityToSell).toFixed(0)} 💰)
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Carne de Boi */}
            {(() => {
              const currentP = Math.max(50, Math.round(150 * m.getCarneMultiplier()));
              const trend = m.getTrendIconAndColor('carne');
              const weeklyQty = weeklySales.carne || 0;
              const demandPenalty = Math.min(40, Math.round((weeklyQty * 0.4) * 10) / 10);
              const boiCount = animals.filter(a => a.type === 'boi').length;
              return (
                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm uppercase text-[#78350f] tracking-wide">🥩 Carne de Boi</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-100 text-orange-800 font-mono">Plantel: {boiCount} bois</span>
                    </div>
                    <p className="text-stone-400 text-[10px] mt-0.5 font-sans leading-relaxed">Influencia diretamente os lucros das vendas de Bois Gordos na feira.</p>
                    <div className="text-[9px] text-stone-500 font-mono mt-1 uppercase tracking-wider leading-relaxed">⚙️ Sazonalidade: Primavera (+10%) | Clima: Sem impacto</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between gap-6 shrink-0 text-center font-mono text-xs">
                      <div>
                        <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Vendas de Boi</div>
                        <div className="text-stone-700 font-extrabold mt-0.5">{weeklyQty} animais</div>
                        <div className="text-[8px] text-red-500 font-extrabold font-mono mt-0.5">{weeklyQty > 0 ? `-${demandPenalty}% queda` : 'Alta Procura! 📈'}</div>
                      </div>
                      <div className="border-l border-stone-200 h-8" />
                      <div>
                        <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Tendência do Boi</div>
                        <div className={`text-sm mt-0.5 flex items-center justify-center gap-1 leading-none ${trend.color}`}>
                          <span>{trend.icon}</span> <span>{trend.label}</span>
                        </div>
                      </div>
                    </div>
                    <PriceChart history={priceHistory.carne || [150, 150, 150, 150, 150, 150, 150]} basePrice={150} />
                  </div>
                  <div className="shrink-0 text-right min-w-[120px] md:border-l border-stone-100 md:pl-4">
                    <span className="block text-[9px] text-stone-400 font-mono uppercase font-black tracking-wider">Fator Multiplicativo</span>
                    <div className="text-orange-950 font-black font-mono text-xl">x{Math.round(m.getCarneMultiplier() * 100) / 100}</div>
                    <span className="block text-[8px] font-mono text-stone-400">Preço Nominal: {currentP} moedas</span>
                  </div>
                </div>
              );
            })()}

            {/* Produtos exóticos */}
            {farmLevel >= 3 && (
              <div className="border-t-2 border-stone-100 pt-3 mt-1">
                <div className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-widest mb-3">🌿 Produtos Exóticos e Novos Animais</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: 'quail_egg', label: '🐦 Ovo de Codorna', base: 8 },
                    { key: 'alpaca_wool', label: '🦙 Lã de Alpaca', base: 65 },
                    { key: 'humus', label: '🪱 Húmus', base: 22 },
                    { key: 'minhoca_viva', label: '🪱 Minhoca Viva', base: 18 },
                    { key: 'biofertilizante', label: '🧴 Biofertilizante', base: 55 },
                    { key: 'muco', label: '🐌 Muco de Caracol', base: 48 },
                    { key: 'serum_facial', label: '💧 Sérum Facial', base: 95 },
                    { key: 'mascara_facial', label: '🧖 Máscara Facial', base: 75 },
                    { key: 'angora_wool', label: '🐇 Lã Angorá', base: 90 },
                    { key: 'seda_bruta', label: '🪲 Seda Bruta', base: 80 },
                    { key: 'coxa_ra', label: '🐸 Coxa de Rã', base: 70 },
                    { key: 'carne_avestruz', label: '🦤 Carne de Avestruz', base: 200 },
                    { key: 'couro_avestruz', label: '🦤 Couro de Avestruz', base: 300 },
                    { key: 'carne_jacare', label: '🐊 Carne de Jacaré', base: 250 },
                    { key: 'couro_jacare', label: '🐊 Couro de Jacaré', base: 400 },
                  ] as const).map(item => (
                    <div key={item.key} className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-display font-black text-xs uppercase text-[#78350f]">{item.label}</div>
                        <div className="text-stone-400 text-[9px] font-mono">Base: {item.base}💰 | Atual: {m.getDynamicTransactionPrice(item.key)}💰</div>
                        <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory[item.key] ?? 0}u</div>
                      </div>
                      <PriceChart history={priceHistory[item.key] || [item.base, item.base, item.base, item.base, item.base, item.base, item.base]} basePrice={item.base} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produtos de bioma */}
            {((inventory.peixe ?? 0) > 0 || (inventory.mel ?? 0) > 0 || (inventory.cogumelo ?? 0) > 0 || landBiomes.some(b => b.biome === 'lago' || b.biome === 'floresta')) && (
              <div className="bg-[#064e3b]/10 border-2 border-[#fbbf24]/40 rounded-2xl p-4">
                <h4 className="font-display font-black text-xs uppercase text-[#78350f] mb-3">🌿 Produtos Exclusivos de Bioma</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {landBiomes.some(b => b.biome === 'lago') && (
                    <div className="bg-white border border-blue-200 rounded-xl p-3">
                      <div className="font-display font-black text-xs uppercase text-[#78350f]">🐟 Peixe (Lago)</div>
                      <div className="text-stone-400 text-[9px] font-mono">Base: 45💰 | Atual: {m.getActualSellPrice('peixe' as any)}💰</div>
                      <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.peixe ?? 0}u · Produz a cada 3 dias</div>
                    </div>
                  )}
                  {landBiomes.some(b => b.biome === 'floresta') && (
                    <>
                      <div className="bg-white border border-amber-200 rounded-xl p-3">
                        <div className="font-display font-black text-xs uppercase text-[#78350f]">🍯 Mel (Floresta)</div>
                        <div className="text-stone-400 text-[9px] font-mono">Base: 80💰 | Atual: {m.getActualSellPrice('mel' as any)}💰</div>
                        <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.mel ?? 0}u · Produz a cada 5 dias</div>
                      </div>
                      <div className="bg-white border border-emerald-200 rounded-xl p-3">
                        <div className="font-display font-black text-xs uppercase text-[#78350f]">🍄 Cogumelo (Floresta)</div>
                        <div className="text-stone-400 text-[9px] font-mono">Base: 35💰 | Atual: {m.getActualSellPrice('cogumelo' as any)}💰</div>
                        <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.cogumelo ?? 0}u · Produz a cada 4 dias</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-sky-50 p-4 border-t-2 border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="text-center sm:text-left">
              <div className="text-xs text-sky-900 font-bold uppercase tracking-wider font-mono">Bens Totais Armazenados</div>
              <div className="text-stone-700 font-semibold text-[11px] mt-0.5">
                🥛 {inventory.milk}L, 🧶 {inventory.wool} Lã, 🧀 {inventory.cheese} Queijo, 🧣 {inventory.scarf} Cachecol, 🥚 {inventory.egg || 0} Ovo, 🥣 {inventory.mayo || 0} Maionese
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => { onOpenSellAll(); triggerAudioResult(() => sfx.playSound('click')); }}
                className="bg-amber-500 hover:bg-amber-400 text-[#451a03] border-b-4 border-amber-700 shadow-md px-5 py-2.5 rounded-2xl font-mono font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer leading-none">
                💰 Vender Todo o Estoque!
              </button>
              <button onClick={handleClose}
                className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-5 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer leading-none">
                Voltar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketModal;
