import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueijosEmMaturacao {
  tipo: string;
  diasRestantes: number;
}

interface Inventory {
  milk: number;
  wool: number;
  egg: number;
  buffalo_milk?: number;
  butter?: number;
  goat_milk?: number;
  llama_wool?: number;
  angora_wool?: number;
  alpaca_wool?: number;
  seda_bruta?: number;
  fio_seda?: number;
  cachecol_angora?: number;
  tecido_alpaca?: number;
  manta_premium?: number;
  duck_egg?: number;
  goose_egg?: number;
  quail_egg?: number;
  fertile_egg?: number;
  mel?: number;
  cogumelo?: number;
  peixe?: number;
  humus?: number;
  muco?: number;
  couro_avestruz?: number;
  couro_jacare?: number;
  queijoBrie?: number;
  queijoCoalho?: number;
  [key: string]: number | undefined;
}

export interface CraftActions {
  craftCheese: (e?: React.MouseEvent) => void;
  craftQueijo: (tipo: string, e?: React.MouseEvent) => void;
  craftBuffaloMozzarella: (e?: React.MouseEvent) => void;
  craftButter: (e?: React.MouseEvent) => void;
  craftYogurt: (e?: React.MouseEvent) => void;
  craftQueijoCabra: (e?: React.MouseEvent) => void;
  craftIogurteCabra: (e?: React.MouseEvent) => void;
  craftLeiteCondensado: (e?: React.MouseEvent) => void;
  craftQueijoParmesao: (e?: React.MouseEvent) => void;
  craftQueijoSerra: (e?: React.MouseEvent) => void;
  craftScarf: (e?: React.MouseEvent) => void;
  craftTapeteLhama: (e?: React.MouseEvent) => void;
  craftCachecolAngora: (e?: React.MouseEvent) => void;
  craftTecidoAlpaca: (e?: React.MouseEvent) => void;
  craftFioSeda: (e?: React.MouseEvent) => void;
  craftMantaPremium: (e?: React.MouseEvent) => void;
  craftMayonese: (e?: React.MouseEvent) => void;
  craftPatePato: (e?: React.MouseEvent) => void;
  craftOvoDefumado: (e?: React.MouseEvent) => void;
  craftConservaCodorna: (e?: React.MouseEvent) => void;
  craftIncubarOvos: (e?: React.MouseEvent) => void;
  craftHidromel: (e?: React.MouseEvent) => void;
  craftRisotoCogumelo: (e?: React.MouseEvent) => void;
  craftConservaPeixe: (e?: React.MouseEvent) => void;
  craftMelEnvasado: (e?: React.MouseEvent) => void;
  craftSopaCogumelo: (e?: React.MouseEvent) => void;
  craftCremeCosmetico: (e?: React.MouseEvent) => void;
  craftSaboneteNatural: (e?: React.MouseEvent) => void;
  craftSerumFacial: (e?: React.MouseEvent) => void;
  craftMascaraFacial: (e?: React.MouseEvent) => void;
  craftRacaoOrganica: (e?: React.MouseEvent) => void;
  craftFertilizante: (e?: React.MouseEvent) => void;
  craftColeteCouro: (e?: React.MouseEvent) => void;
  craftBolsaExotica: (e?: React.MouseEvent) => void;
  craftKitGourmet: (e?: React.MouseEvent) => void;
  craftFioLhama: (e?: React.MouseEvent) => void;
  craftCachecolLhama: (e?: React.MouseEvent) => void;
  craftGorroLhama: (e?: React.MouseEvent) => void;
  craftLuvasLhama: (e?: React.MouseEvent) => void;
  craftPonchoLhama: (e?: React.MouseEvent) => void;
  craftMantaLhama: (e?: React.MouseEvent) => void;
  craftIogurteBufala: (e?: React.MouseEvent) => void;
  craftManteiganBufala: (e?: React.MouseEvent) => void;
  craftDoceLeitelBufala: (e?: React.MouseEvent) => void;
  craftBurrata: (e?: React.MouseEvent) => void;
  craftMassaFresca: (e?: React.MouseEvent) => void;
  craftCrepeRustico: (e?: React.MouseEvent) => void;
  craftPaoRustico: (e?: React.MouseEvent) => void;
  craftWaffelMel: (e?: React.MouseEvent) => void;
  craftBiofertilizante: (e?: React.MouseEvent) => void;
  craftQueijoPecorino: (e?: React.MouseEvent) => void;
  craftIoguteOvelha: (e?: React.MouseEvent) => void;
  craftRicotaOvelha: (e?: React.MouseEvent) => void;
  craftDoceLeiteOvelha: (e?: React.MouseEvent) => void;
}

interface QueijariaModalProps {
  farmLevel: number;
  inventory: Inventory;
  queijosEmMaturacao: QueijosEmMaturacao[];
  maxPrateleiras: number;
  scarfQueue: { diasRestantes: number }[];
  atelieTab: 'queijaria' | 'tecelagem' | 'cozinha' | 'cosmeticos' | 'luxo';
  setAtelieTab: (tab: 'queijaria' | 'tecelagem' | 'cozinha' | 'cosmeticos' | 'luxo') => void;
  racaoOrganicaDays: number;
  fertilizanteDays: number;
  craftActions: CraftActions;
  onClose: () => void;
  onOpenMelhorias: () => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const QueijariaModal: React.FC<QueijariaModalProps> = ({
  farmLevel, inventory, queijosEmMaturacao, maxPrateleiras, scarfQueue,
  atelieTab, setAtelieTab, racaoOrganicaDays, fertilizanteDays,
  craftActions: c, onClose, onOpenMelhorias, triggerAudioResult, sfx,
}) => {
  const handleClose = () => {
    onClose();
    triggerAudioResult(() => sfx.playSound('click'));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-amber-950 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-gradient-to-r from-amber-700 to-yellow-800 p-5 border-b-4 border-amber-950 text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #451a03' }}>
              🏺 Ateliê Aurora
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Transforme matérias-primas em produtos artesanais de valor
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-amber-950 hover:bg-amber-900 border-2 border-amber-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-amber-50 px-4 pt-3 pb-0 border-b-2 border-amber-200 shrink-0 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {([
              { key: 'queijaria', label: '🏭 Produção' },
              { key: 'tecelagem', label: '🧶 Tecelagem' },
              { key: 'cozinha', label: '🥣 Cozinha' },
              { key: 'cosmeticos', label: '🌿 Cosméticos' },
              { key: 'luxo', label: '🏺 Luxo' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setAtelieTab(tab.key)}
                className={`whitespace-nowrap text-[10px] font-mono font-black uppercase px-3 py-2 rounded-t-xl border-2 border-b-0 transition-all cursor-pointer focus:outline-none ${
                  atelieTab === tab.key
                    ? 'bg-[#fffbeb] border-amber-400 text-amber-900'
                    : 'bg-amber-100/60 border-transparent text-amber-700 hover:bg-amber-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {atelieTab === 'queijaria' && (
            <div className="bg-[#fef3c7] px-6 py-3 border-b-2 border-yellow-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
              <div className="text-xs text-[#78350f] leading-relaxed">
                📦 <strong>Prateleiras:</strong> <span className="bg-[#f59e0b]/20 px-2 py-0.5 rounded-md font-bold text-amber-900">{queijosEmMaturacao.length} / {maxPrateleiras} ocupadas</span>
                {racaoOrganicaDays > 0 && <span className="ml-2 text-green-700 font-bold">🌿 Ração Orgânica: {racaoOrganicaDays}d</span>}
                {fertilizanteDays > 0 && <span className="ml-2 text-emerald-700 font-bold">🌱 Fertilizante: {fertilizanteDays}d</span>}
              </div>
              <button type="button" onClick={() => { onClose(); onOpenMelhorias(); }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 focus:outline-none">
                🔧 Ampliar Queijaria
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>

            {/* TAB: QUEIJARIA */}
            {atelieTab === 'queijaria' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#78350f] mb-2 flex items-center gap-1.5">⏳ Maturômetro ({queijosEmMaturacao.length} ativos)</h4>
                  {queijosEmMaturacao.length === 0 ? (
                    <div className="border-4 border-dashed border-stone-200 rounded-2xl p-4 text-center text-xs text-stone-500 bg-white/50">🥛 Nenhuma prateleira ocupada. Escolha uma receita abaixo!</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {queijosEmMaturacao.map((item, idx) => {
                        const totalDays = item.tipo === 'coalho' ? 3 : item.tipo === 'mucarela' ? 6 : item.tipo === 'buffalo_mozzarella' ? 10 : item.tipo === 'yogurt' ? 2 : item.tipo === 'butter' ? 1 : item.tipo === 'queijo_cabra' ? 5 : item.tipo === 'iogurte_cabra' ? 1 : item.tipo === 'parmesao' ? 15 : item.tipo === 'serra' ? 20 : item.tipo === 'iogurte_bufala' ? 2 : item.tipo === 'manteiga_bufala' ? 1 : item.tipo === 'doce_leite_bufala' ? 3 : item.tipo === 'burrata' ? 4 : item.tipo === 'queijo_pecorino' ? 10 : item.tipo === 'iogurte_ovelha' ? 2 : item.tipo === 'doce_leite_ovelha' ? 3 : item.tipo === 'ricota_ovelha' ? 1 : 12;
                        const elapsed = totalDays - item.diasRestantes;
                        const progressPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
                        const label = item.tipo === 'coalho' ? 'Queijo Coalho' : item.tipo === 'mucarela' ? 'Queijo Muçarela' : item.tipo === 'buffalo_mozzarella' ? 'Muçarela de Búfala' : item.tipo === 'yogurt' ? 'Iogurte' : item.tipo === 'butter' ? 'Manteiga' : item.tipo === 'queijo_cabra' ? 'Queijo de Cabra' : item.tipo === 'iogurte_cabra' ? 'Iogurte de Cabra' : item.tipo === 'parmesao' ? 'Queijo Parmesão' : item.tipo === 'serra' ? 'Queijo da Serra' : item.tipo === 'iogurte_bufala' ? 'Iogurte de Búfala' : item.tipo === 'manteiga_bufala' ? 'Manteiga de Búfala' : item.tipo === 'doce_leite_bufala' ? 'Doce de Leite Búfala' : item.tipo === 'burrata' ? 'Burrata' : item.tipo === 'queijo_pecorino' ? 'Queijo Pecorino' : item.tipo === 'iogurte_ovelha' ? 'Iogurte de Ovelha' : item.tipo === 'doce_leite_ovelha' ? 'Doce de Leite Ovelha' : item.tipo === 'ricota_ovelha' ? 'Ricota de Ovelha' : 'Queijo Brie';
                        const maturIcon = item.tipo === 'butter' || item.tipo === 'manteiga_bufala' ? '🧈' : item.tipo === 'yogurt' || item.tipo === 'iogurte_cabra' || item.tipo === 'iogurte_bufala' || item.tipo === 'iogurte_ovelha' ? '🥛' : item.tipo === 'doce_leite_bufala' || item.tipo === 'doce_leite_ovelha' ? '🍮' : item.tipo === 'ricota_ovelha' ? '🥛' : '🧀';
                        return (
                          <div key={idx} className="bg-white border-2 border-amber-100 rounded-xl p-3 flex items-center gap-3">
                            <span className="text-2xl">{maturIcon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-display font-black text-xs uppercase text-[#78350f]">{label}</span>
                                <span className="text-[9px] text-amber-800 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded">⌛ {item.diasRestantes}d</span>
                              </div>
                              <div className="mt-1.5 w-full bg-stone-100 h-2 rounded-full overflow-hidden relative">
                                <div className="bg-gradient-to-r from-amber-400 to-green-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#78350f] mb-2">📖 Receitas</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'Queijo Básico', emoji: '🧀', req: `🥛 3 leite (${inventory.milk}/3) • Instantâneo`, canCraft: inventory.milk >= 3, reqLevel: 1, onClick: (e: React.MouseEvent) => c.craftCheese(e) },
                      { label: 'Queijo Coalho', emoji: '🧀', req: `🥛 3 leite (${inventory.milk}/3) • ⌛ 3d`, canCraft: inventory.milk >= 3 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 1, onClick: (e: React.MouseEvent) => c.craftQueijo('coalho', e) },
                      { label: 'Queijo Muçarela', emoji: '🧀', req: `🥛 5 leite (${inventory.milk}/5) • ⌛ 6d • Nv3`, canCraft: farmLevel >= 3 && inventory.milk >= 5 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftQueijo('mucarela', e) },
                      { label: 'Queijo Brie', emoji: '🧀', req: `🥛 8 leite (${inventory.milk}/8) • ⌛ 12d • Nv5`, canCraft: farmLevel >= 5 && inventory.milk >= 8 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftQueijo('brie', e) },
                      { label: 'Muçarela Búfala', emoji: '🧀', req: `🥛 3 L.Búfala (${inventory.buffalo_milk ?? 0}/3) • ⌛ 5d • Nv4`, canCraft: farmLevel >= 4 && (inventory.buffalo_milk ?? 0) >= 3 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftBuffaloMozzarella(e) },
                      { label: 'Manteiga', emoji: '🧈', req: `🥛 2 leite (${inventory.milk}/2) • ⌛ 1d • Nv2`, canCraft: farmLevel >= 2 && inventory.milk >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 2, onClick: (e: React.MouseEvent) => c.craftButter(e) },
                      { label: 'Iogurte', emoji: '🥛', req: `🥛 1 leite (${inventory.milk}/1) • ⌛ 2d • Nv2`, canCraft: farmLevel >= 2 && inventory.milk >= 1 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 2, onClick: (e: React.MouseEvent) => c.craftYogurt(e) },
                      { label: 'Queijo de Cabra', emoji: '🧀', req: `🐐 3 L.Cabra (${inventory.goat_milk ?? 0}/3) • ⌛ 5d • Nv3`, canCraft: farmLevel >= 3 && (inventory.goat_milk ?? 0) >= 3 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftQueijoCabra(e) },
                      { label: 'Iogurte de Cabra', emoji: '🥛', req: `🐐 2 L.Cabra (${inventory.goat_milk ?? 0}/2) • ⌛ 1d • Nv4`, canCraft: farmLevel >= 4 && (inventory.goat_milk ?? 0) >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftIogurteCabra(e) },
                      { label: 'Leite Condensado', emoji: '🥛', req: `🥛 4 leite (${inventory.milk}/4) + 🧈 1 manteiga (${inventory.butter ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && inventory.milk >= 4 && (inventory.butter ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftLeiteCondensado(e) },
                      { label: 'Queijo Parmesão', emoji: '🧀', req: `🥛 10 leite (${inventory.milk}/10) + 🧀 2 Q.Coalho (${inventory.queijoCoalho ?? 0}/2) • ⌛ 15d • Nv10`, canCraft: farmLevel >= 10 && inventory.milk >= 10 && (inventory.queijoCoalho ?? 0) >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 10, onClick: (e: React.MouseEvent) => c.craftQueijoParmesao(e) },
                      { label: 'Queijo da Serra', emoji: '🧀', req: `🐐 6 L.Cabra (${inventory.goat_milk ?? 0}/6) + 🥛 4 leite (${inventory.milk}/4) • ⌛ 20d • Nv14`, canCraft: farmLevel >= 14 && (inventory.goat_milk ?? 0) >= 6 && inventory.milk >= 4 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 14, onClick: (e: React.MouseEvent) => c.craftQueijoSerra(e) },
                      { label: 'Iogurte de Búfala', emoji: '🥛', req: `🐃 2 L.Búfala (${inventory.buffalo_milk ?? 0}/2) • ⌛ 2d • Nv4`, canCraft: farmLevel >= 4 && (inventory.buffalo_milk ?? 0) >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftIogurteBufala(e) },
                      { label: 'Manteiga de Búfala', emoji: '🧈', req: `🐃 2 L.Búfala (${inventory.buffalo_milk ?? 0}/2) • ⌛ 1d • Nv4`, canCraft: farmLevel >= 4 && (inventory.buffalo_milk ?? 0) >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftManteiganBufala(e) },
                      { label: 'Doce de Leite Búfala', emoji: '🍮', req: `🐃 3 L.Búfala (${inventory.buffalo_milk ?? 0}/3) + 🧈 1 Mant.Búfala (${(inventory as any).manteiga_bufala ?? 0}/1) • ⌛ 3d • Nv5`, canCraft: farmLevel >= 5 && (inventory.buffalo_milk ?? 0) >= 3 && ((inventory as any).manteiga_bufala ?? 0) >= 1 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftDoceLeitelBufala(e) },
                      { label: 'Burrata', emoji: '🧀', req: `🐃 3 L.Búfala (${inventory.buffalo_milk ?? 0}/3) + 🧀 1 Muç.Búfala (${inventory.buffalo_mozzarella ?? 0}/1) • ⌛ 4d • Nv7`, canCraft: farmLevel >= 7 && (inventory.buffalo_milk ?? 0) >= 3 && (inventory.buffalo_mozzarella ?? 0) >= 1 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 7, onClick: (e: React.MouseEvent) => c.craftBurrata(e) },
                      { label: 'Queijo Pecorino', emoji: '🧀', req: `🐑 5 L.Ovelha (${inventory.sheep_milk ?? 0}/5) • ⌛ 10d • Nv5`, canCraft: farmLevel >= 5 && (inventory.sheep_milk ?? 0) >= 5 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftQueijoPecorino(e) },
                      { label: 'Iogurte de Ovelha', emoji: '🥛', req: `🐑 2 L.Ovelha (${inventory.sheep_milk ?? 0}/2) • ⌛ 2d • Nv3`, canCraft: farmLevel >= 3 && (inventory.sheep_milk ?? 0) >= 2 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftIoguteOvelha(e) },
                      { label: 'Ricota de Ovelha', emoji: '🧀', req: `🐑 3 L.Ovelha (${inventory.sheep_milk ?? 0}/3) • Nv4`, canCraft: farmLevel >= 4 && (inventory.sheep_milk ?? 0) >= 3, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftRicotaOvelha(e) },
                      { label: 'Doce de Leite Ovelha', emoji: '🍯', req: `🐑 4 L.Ovelha (${inventory.sheep_milk ?? 0}/4) • ⌛ 3d • Nv6`, canCraft: farmLevel >= 6 && (inventory.sheep_milk ?? 0) >= 4 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftDoceLeiteOvelha(e) },
                    ].map((r, i) => (
                      <div key={i} className="bg-white border-2 border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <div className="font-display font-black text-xs uppercase text-amber-900 flex items-center gap-1">
                              {r.label}
                              {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                            </div>
                            <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                          </div>
                        </div>
                        <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                          className="shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                          {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TECELAGEM */}
            {atelieTab === 'tecelagem' && (
              <div className="space-y-2">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-indigo-900 mb-2">🧶 Tecelagem & Fibras</h4>
                {[
                  { label: `Cachecol (Lã)${scarfQueue.length > 0 ? ` ⏳ ${scarfQueue.length} em prod.` : ''}`, emoji: '🧣', req: `🧶 2 lã (${inventory.wool}/2) • Pronto em 2 dias${scarfQueue.length > 0 ? ` • Min: ${Math.min(...scarfQueue.map(s => s.diasRestantes))}d` : ''}`, canCraft: inventory.wool >= 2, reqLevel: 1, onClick: (e: React.MouseEvent) => c.craftScarf(e) },
                  { label: 'Fio de Lhama', emoji: '🧶', req: `🦙 1 Lã Lhama (${inventory.llama_wool ?? 0}/1) • Nv3`, canCraft: farmLevel >= 3 && (inventory.llama_wool ?? 0) >= 1, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftFioLhama(e) },
                  { label: 'Cachecol de Lhama', emoji: '🧣', req: `🧶 1 Fio Lhama (${(inventory as any).fio_lhama ?? 0}/1) + 🦙 1 Lã Lhama (${inventory.llama_wool ?? 0}/1) • Nv4`, canCraft: farmLevel >= 4 && ((inventory as any).fio_lhama ?? 0) >= 1 && (inventory.llama_wool ?? 0) >= 1, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftCachecolLhama(e) },
                  { label: 'Gorro de Lhama', emoji: '🧢', req: `🦙 2 Lã Lhama (${inventory.llama_wool ?? 0}/2) • Nv4`, canCraft: farmLevel >= 4 && (inventory.llama_wool ?? 0) >= 2, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftGorroLhama(e) },
                  { label: 'Luvas de Lhama', emoji: '🧤', req: `🦙 2 Lã Lhama (${inventory.llama_wool ?? 0}/2) • Nv5`, canCraft: farmLevel >= 5 && (inventory.llama_wool ?? 0) >= 2, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftLuvasLhama(e) },
                  { label: 'Poncho de Lhama', emoji: '🦙', req: `🧶 2 Fio Lhama (${(inventory as any).fio_lhama ?? 0}/2) • Nv5`, canCraft: farmLevel >= 5 && ((inventory as any).fio_lhama ?? 0) >= 2, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftPonchoLhama(e) },
                  { label: 'Manta de Lhama', emoji: '🛏️', req: `🦙 1 Poncho Lhama (${(inventory as any).poncho_lhama ?? 0}/1) + 🧶 1 Fio Lhama (${(inventory as any).fio_lhama ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && ((inventory as any).poncho_lhama ?? 0) >= 1 && ((inventory as any).fio_lhama ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftMantaLhama(e) },
                  { label: 'Tapete de Lhama', emoji: '🪢', req: `🦙 3 Lã Lhama (${inventory.llama_wool ?? 0}/3) • Nv4`, canCraft: farmLevel >= 4 && (inventory.llama_wool ?? 0) >= 3, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftTapeteLhama(e) },
                  { label: 'Cachecol Angorá', emoji: '🧣', req: `🐇 2 Lã Angorá (${inventory.angora_wool ?? 0}/2) • Nv8`, canCraft: farmLevel >= 8 && (inventory.angora_wool ?? 0) >= 2, reqLevel: 8, onClick: (e: React.MouseEvent) => c.craftCachecolAngora(e) },
                  { label: 'Tecido de Alpaca', emoji: '🧶', req: `🦙 3 Lã Alpaca (${inventory.alpaca_wool ?? 0}/3) • Nv5`, canCraft: farmLevel >= 5 && (inventory.alpaca_wool ?? 0) >= 3, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftTecidoAlpaca(e) },
                  { label: 'Fio de Seda', emoji: '🪡', req: `🪲 2 Seda Bruta (${inventory.seda_bruta ?? 0}/2) • Nv10`, canCraft: farmLevel >= 10 && (inventory.seda_bruta ?? 0) >= 2, reqLevel: 10, onClick: (e: React.MouseEvent) => c.craftFioSeda(e) },
                  { label: 'Manta Premium', emoji: '✨', req: `🪡 1 Fio Seda (${inventory.fio_seda ?? 0}/1) + 🧣 1 Cachecol Angorá (${inventory.cachecol_angora ?? 0}/1) + 🧶 1 Tecido Alpaca (${inventory.tecido_alpaca ?? 0}/1) • Nv13`, canCraft: farmLevel >= 13 && (inventory.fio_seda ?? 0) >= 1 && (inventory.cachecol_angora ?? 0) >= 1 && (inventory.tecido_alpaca ?? 0) >= 1, reqLevel: 13, onClick: (e: React.MouseEvent) => c.craftMantaPremium(e) },
                ].map((r, i) => (
                  <div key={i} className="bg-white border-2 border-indigo-100 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.emoji}</span>
                      <div>
                        <div className="font-display font-black text-xs uppercase text-indigo-900 flex items-center gap-1">
                          {r.label}
                          {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                        </div>
                        <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                      </div>
                    </div>
                    <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                      className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                      {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: COZINHA */}
            {atelieTab === 'cozinha' && (
              <div className="space-y-2">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-orange-900 mb-2">🥣 Cozinha & Processados</h4>
                {[
                  { label: 'Maionese', emoji: '🥣', req: `🥚 2 ovos (${inventory.egg}/2) • Nv1`, canCraft: inventory.egg >= 2, reqLevel: 1, onClick: (e: React.MouseEvent) => c.craftMayonese(e) },
                  { label: 'Panquecinhas Douradas de Ovos de Pato', emoji: '🥞', req: `🦆 2 Ov.Pato (${inventory.duck_egg ?? 0}/2) + 🧈 1 Manteiga (${inventory.butter ?? 0}/1) • Nv5`, canCraft: farmLevel >= 5 && (inventory.duck_egg ?? 0) >= 2 && (inventory.butter ?? 0) >= 1, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftPatePato(e) },
                  { label: 'Ovo Defumado', emoji: '🥚', req: `🪿 1 Ov.Ganso (${inventory.goose_egg ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && (inventory.goose_egg ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftOvoDefumado(e) },
                  { label: 'Conserva de Codorna', emoji: '🥚', req: `🐦 6 Ov.Codorna (${inventory.quail_egg ?? 0}/6) • Nv4`, canCraft: farmLevel >= 4 && (inventory.quail_egg ?? 0) >= 6, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftConservaCodorna(e) },
                  { label: 'Incubar Ovos (Nova Galinha)', emoji: '🐣', req: `🥚 3 Ov.Férteis (${inventory.fertile_egg ?? 0}/3) • Nv7`, canCraft: farmLevel >= 7 && (inventory.fertile_egg ?? 0) >= 3, reqLevel: 7, onClick: (e: React.MouseEvent) => c.craftIncubarOvos(e) },
                  { label: 'Hidromel Artesanal', emoji: '🍺', req: `🍯 2 Mel (${inventory.mel ?? 0}/2) + 🥛 3 Leite (${inventory.milk}/3) • Nv8`, canCraft: farmLevel >= 8 && (inventory.mel ?? 0) >= 2 && inventory.milk >= 3, reqLevel: 8, onClick: (e: React.MouseEvent) => c.craftHidromel(e) },
                  { label: 'Risoto de Cogumelo', emoji: '🍄', req: `🍄 3 Cogumelos (${inventory.cogumelo ?? 0}/3) • Nv5`, canCraft: farmLevel >= 5 && (inventory.cogumelo ?? 0) >= 3, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftRisotoCogumelo(e) },
                  { label: 'Conserva de Peixe', emoji: '🐟', req: `🐟 2 Peixe (${inventory.peixe ?? 0}/2) • Nv4`, canCraft: farmLevel >= 4 && (inventory.peixe ?? 0) >= 2, reqLevel: 4, onClick: (e: React.MouseEvent) => c.craftConservaPeixe(e) },
                  { label: 'Mel Envasado', emoji: '🍯', req: `🍯 3 Mel (${inventory.mel ?? 0}/3) • Nv3`, canCraft: farmLevel >= 3 && (inventory.mel ?? 0) >= 3, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftMelEnvasado(e) },
                  { label: 'Sopa de Cogumelo', emoji: '🍲', req: `🍄 2 Cogumelos (${inventory.cogumelo ?? 0}/2) • Nv3`, canCraft: farmLevel >= 3 && (inventory.cogumelo ?? 0) >= 2, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftSopaCogumelo(e) },
                  { label: 'Massa Fresca de Ovo de Ganso', emoji: '🍝', req: `🪿 1 Ov.Ganso (${inventory.goose_egg ?? 0}/1) + 🌾 1 Farinha (${(inventory as any).farinha ?? 0}/1) • Nv5`, canCraft: farmLevel >= 5 && (inventory.goose_egg ?? 0) >= 1 && ((inventory as any).farinha ?? 0) >= 1, reqLevel: 5, onClick: (e: React.MouseEvent) => c.craftMassaFresca(e) },
                  { label: 'Crepe Rústico', emoji: '🥞', req: `🥚 1 Ovo (${inventory.egg}/1) + 🌾 1 Farinha (${(inventory as any).farinha ?? 0}/1) • Nv3`, canCraft: farmLevel >= 3 && (inventory.egg ?? 0) >= 1 && ((inventory as any).farinha ?? 0) >= 1, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftCrepeRustico(e) },
                  { label: 'Pão Rústico', emoji: '🥐', req: `🌾 2 Farinha (${(inventory as any).farinha ?? 0}/2) + 🥛 1 Leite (${inventory.milk}/1) • Nv3`, canCraft: farmLevel >= 3 && ((inventory as any).farinha ?? 0) >= 2 && (inventory.milk ?? 0) >= 1, reqLevel: 3, onClick: (e: React.MouseEvent) => c.craftPaoRustico(e) },
                  { label: 'Waffle de Mel', emoji: '🧇', req: `🌾 1 Farinha (${(inventory as any).farinha ?? 0}/1) + 🥚 1 Ovo (${inventory.egg}/1) + 🍯 1 Mel (${(inventory as any).mel ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && ((inventory as any).farinha ?? 0) >= 1 && (inventory.egg ?? 0) >= 1 && ((inventory as any).mel ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftWaffelMel(e) },
                ].map((r, i) => (
                  <div key={i} className="bg-white border-2 border-orange-100 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.emoji}</span>
                      <div>
                        <div className="font-display font-black text-xs uppercase text-orange-900 flex items-center gap-1">
                          {r.label}
                          {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                        </div>
                        <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                      </div>
                    </div>
                    <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                      className="shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                      {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: COSMÉTICOS */}
            {atelieTab === 'cosmeticos' && (
              <div className="space-y-2">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-green-900 mb-2">🌿 Cosméticos & Orgânicos</h4>
                {[
                  { label: 'Creme Cosmético', emoji: '🧴', req: `🐌 2 Muco (${inventory.muco ?? 0}/2) + 🍯 1 Mel (${(inventory as any).mel ?? 0}/1) • Nv7`, canCraft: farmLevel >= 7 && (inventory.muco ?? 0) >= 2 && ((inventory as any).mel ?? 0) >= 1, reqLevel: 7, onClick: (e: React.MouseEvent) => c.craftCremeCosmetico(e) },
                  { label: 'Sérum Facial', emoji: '💧', req: `🐌 2 Muco (${inventory.muco ?? 0}/2) + 🍯 1 Mel (${(inventory as any).mel ?? 0}/1) • Nv7`, canCraft: farmLevel >= 7 && (inventory.muco ?? 0) >= 2 && ((inventory as any).mel ?? 0) >= 1, reqLevel: 7, onClick: (e: React.MouseEvent) => c.craftSerumFacial(e) },
                  { label: 'Máscara Facial', emoji: '🧖', req: `🐌 3 Muco (${inventory.muco ?? 0}/3) • Nv8`, canCraft: farmLevel >= 8 && (inventory.muco ?? 0) >= 3, reqLevel: 8, onClick: (e: React.MouseEvent) => c.craftMascaraFacial(e) },
                  { label: 'Sabonete Natural', emoji: '🧼', req: `🐌 1 Muco (${inventory.muco ?? 0}/1) + 🍯 1 Mel (${(inventory as any).mel ?? 0}/1) + 🐐 1 L.Cabra (${inventory.goat_milk ?? 0}/1) • Nv9`, canCraft: farmLevel >= 9 && (inventory.muco ?? 0) >= 1 && ((inventory as any).mel ?? 0) >= 1 && (inventory.goat_milk ?? 0) >= 1, reqLevel: 9, onClick: (e: React.MouseEvent) => c.craftSaboneteNatural(e) },
                  { label: 'Ração Orgânica (+3d buff)', emoji: '🌿', req: `🪱 2 Húmus (${inventory.humus ?? 0}/2) • Nv6`, canCraft: farmLevel >= 6 && (inventory.humus ?? 0) >= 2, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftRacaoOrganica(e) },
                  { label: 'Fertilizante (+5d buff)', emoji: '🌱', req: `🪱 3 Húmus (${inventory.humus ?? 0}/3) • Nv8`, canCraft: farmLevel >= 8 && (inventory.humus ?? 0) >= 3, reqLevel: 8, onClick: (e: React.MouseEvent) => c.craftFertilizante(e) },
                  { label: 'Biofertilizante Líquido', emoji: '🧴', req: `🪱 3 Húmus (${inventory.humus ?? 0}/3) • Nv6`, canCraft: farmLevel >= 6 && (inventory.humus ?? 0) >= 3, reqLevel: 6, onClick: (e: React.MouseEvent) => c.craftBiofertilizante(e) },
                ].map((r, i) => (
                  <div key={i} className="bg-white border-2 border-green-100 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.emoji}</span>
                      <div>
                        <div className="font-display font-black text-xs uppercase text-green-900 flex items-center gap-1">
                          {r.label}
                          {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                        </div>
                        <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                      </div>
                    </div>
                    <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                      className="shrink-0 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                      {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                    </button>
                  </div>
                ))}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-xs text-green-800 font-mono">
                  <div className="font-black mb-1">🌟 Buffs Ativos:</div>
                  <div>🌿 Ração Orgânica: {racaoOrganicaDays > 0 ? `${racaoOrganicaDays} dias restantes` : 'Inativo'}</div>
                  <div>🌱 Fertilizante: {fertilizanteDays > 0 ? `${fertilizanteDays} dias restantes` : 'Inativo'}</div>
                </div>
              </div>
            )}

            {/* TAB: LUXO */}
            {atelieTab === 'luxo' && (
              <div className="space-y-2">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-purple-900 mb-2">🏺 Produtos de Luxo</h4>
                {[
                  { label: 'Colete de Couro', emoji: '🦺', req: `🦤 1 Couro Avestruz (${inventory.couro_avestruz ?? 0}/1) • Nv15`, canCraft: farmLevel >= 15 && (inventory.couro_avestruz ?? 0) >= 1, reqLevel: 15, onClick: (e: React.MouseEvent) => c.craftColeteCouro(e) },
                  { label: 'Bolsa Exótica', emoji: '👜', req: `🐊 1 Couro Jacaré (${inventory.couro_jacare ?? 0}/1) • Nv18`, canCraft: farmLevel >= 18 && (inventory.couro_jacare ?? 0) >= 1, reqLevel: 18, onClick: (e: React.MouseEvent) => c.craftBolsaExotica(e) },
                  { label: 'Kit Gourmet Premiado', emoji: '🎁', req: `🧀 2 Q.Brie (${inventory.queijoBrie ?? 0}/2) + ✨ 1 Manta Premium (${inventory.manta_premium ?? 0}/1) + 🍯 2 Mel (${inventory.mel ?? 0}/2) • Nv16`, canCraft: farmLevel >= 16 && (inventory.queijoBrie ?? 0) >= 2 && (inventory.manta_premium ?? 0) >= 1 && (inventory.mel ?? 0) >= 2, reqLevel: 16, onClick: (e: React.MouseEvent) => c.craftKitGourmet(e) },
                ].map((r, i) => (
                  <div key={i} className={`bg-white border-2 rounded-xl p-3 flex items-center justify-between gap-3 ${farmLevel >= r.reqLevel ? 'border-purple-200' : 'border-stone-200 opacity-70'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{r.emoji}</span>
                      <div>
                        <div className="font-display font-black text-xs uppercase text-purple-900 flex items-center gap-1">
                          {r.label}
                          {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                        </div>
                        <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                      </div>
                    </div>
                    <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                      className="shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                      {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="bg-amber-50 p-4 border-t border-amber-100 flex justify-end shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="bg-amber-700 hover:bg-amber-600 text-white border-b-4 border-amber-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer focus:outline-none"
            >
              Fechar Ateliê
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueijariaModal;
