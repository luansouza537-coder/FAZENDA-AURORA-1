import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Inventory { milk: number; wool: number; cheese: number; scarf: number; egg?: number; mayo?: number; queijoCoalho?: number; queijoMucarela?: number; queijoBrie?: number; minhoca_viva?: number; biofertilizante?: number; serum_facial?: number; mascara_facial?: number; [key: string]: number | undefined; }

interface SellAllModalProps {
  inventory: Inventory;
  getDynamicTransactionPrice: (key: string) => number;
  sellAllItemsNoConfirm: (flag: boolean) => void;
  onClose: () => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const SellAllModal: React.FC<SellAllModalProps> = ({
  inventory, getDynamicTransactionPrice, sellAllItemsNoConfirm, onClose, triggerAudioResult, sfx,
}) => {
  const itemsToSell = [
    { key: 'milk', label: 'Leite Cru', qty: inventory.milk, icon: '🥛' },
    { key: 'wool', label: 'Lã Crua', qty: inventory.wool, icon: '🧶' },
    { key: 'cheese', label: 'Queijo Nobre', qty: inventory.cheese, icon: '🧀' },
    { key: 'scarf', label: 'Cachecol Elegante', qty: inventory.scarf, icon: '🧣' },
    { key: 'egg', label: 'Ovo de Quintal', qty: inventory.egg || 0, icon: '🥚' },
    { key: 'mayo', label: 'Maionese Cremosa', qty: inventory.mayo || 0, icon: '🥣' },
    { key: 'queijoCoalho', label: 'Queijo Coalho', qty: inventory.queijoCoalho || 0, icon: '🧀' },
    { key: 'queijoMucarela', label: 'Queijo Muçarela', qty: inventory.queijoMucarela || 0, icon: '🧀' },
    { key: 'queijoBrie', label: 'Queijo Brie', qty: inventory.queijoBrie || 0, icon: '🧀' },
    { key: 'fio_lhama', label: 'Fio de Lhama', qty: inventory.fio_lhama || 0, icon: '🧵' },
    { key: 'cachecol_lhama', label: 'Cachecol de Lhama', qty: inventory.cachecol_lhama || 0, icon: '🧣' },
    { key: 'gorro_lhama', label: 'Gorro de Lhama', qty: inventory.gorro_lhama || 0, icon: '🎩' },
    { key: 'luvas_lhama', label: 'Luvas de Lhama', qty: inventory.luvas_lhama || 0, icon: '🧤' },
    { key: 'poncho_lhama', label: 'Poncho de Lhama', qty: inventory.poncho_lhama || 0, icon: '🥻' },
    { key: 'manta_lhama', label: 'Manta de Lhama', qty: inventory.manta_lhama || 0, icon: '🛋️' },
    { key: 'iogurte_bufala', label: 'Iogurte de Búfala', qty: inventory.iogurte_bufala || 0, icon: '🥛' },
    { key: 'manteiga_bufala', label: 'Manteiga de Búfala', qty: inventory.manteiga_bufala || 0, icon: '🧈' },
    { key: 'doce_leite_bufala', label: 'Doce de Leite Búfala', qty: inventory.doce_leite_bufala || 0, icon: '🍮' },
    { key: 'burrata', label: 'Burrata', qty: inventory.burrata || 0, icon: '🧀' },
    { key: 'massa_fresca', label: 'Massa Fresca de Ov. Ganso', qty: inventory.massa_fresca || 0, icon: '🍝' },
    { key: 'crepe_rustico', label: 'Crepe Rústico', qty: inventory.crepe_rustico || 0, icon: '🥞' },
    { key: 'pao_rustico', label: 'Pão Rústico', qty: inventory.pao_rustico || 0, icon: '🥐' },
    { key: 'waffle_mel', label: 'Waffle de Mel', qty: inventory.waffle_mel || 0, icon: '🧇' },
    { key: 'minhoca_viva', label: 'Minhoca Viva', qty: inventory.minhoca_viva || 0, icon: '🪱' },
    { key: 'biofertilizante', label: 'Biofertilizante Líquido', qty: inventory.biofertilizante || 0, icon: '🧴' },
    { key: 'serum_facial', label: 'Sérum Facial', qty: inventory.serum_facial || 0, icon: '💧' },
    { key: 'mascara_facial', label: 'Máscara Facial', qty: inventory.mascara_facial || 0, icon: '🧖' },
  ].filter(i => i.qty > 0);

  const hasItems = itemsToSell.length > 0;

  const totalEstimate = itemsToSell.reduce((sum, item) => sum + item.qty * getDynamicTransactionPrice(item.key), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-xs"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
          className="bg-[#fffbeb] border-8 border-yellow-500 rounded-[40px] max-w-md w-full p-6 text-center shadow-2xl relative"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md select-none border-4 border-[#fffbeb]">💰</div>

          <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-[#78350f] mt-8">Confirmar Liquidação Geral?</h3>
          <p className="text-stone-500 text-xs font-mono mt-1 uppercase tracking-widest">Armazém de Commodities Aurora</p>

          <div className="bg-amber-50/70 border-2 border-yellow-200 rounded-2xl p-4 my-5 space-y-2 text-xs font-mono text-[#78350f] max-h-64 overflow-y-auto">
            <div className="flex justify-between items-center text-stone-500 font-bold border-b border-yellow-100 pb-1 text-[10px] uppercase">
              <span>Produto</span><span className="mr-auto pl-3">Qtd</span><span className="pr-4">Preço</span><span>Total do Item</span>
            </div>
            {!hasItems ? (
              <div className="text-center text-stone-400 py-4 italic">Nenhum item disponível para liquidação.</div>
            ) : itemsToSell.map(item => {
              const price = getDynamicTransactionPrice(item.key);
              return (
                <div key={item.key} className="flex justify-between items-center">
                  <span className="flex items-center gap-1 font-bold"><span>{item.icon}</span> {item.label}:</span>
                  <span className="mr-auto pl-2 font-mono text-stone-500 font-bold">{item.qty}u</span>
                  <span className="text-stone-400 font-mono pr-2">{price}💰</span>
                  <span className="font-mono font-extrabold text-[#78350f]">{item.qty * price} moedas</span>
                </div>
              );
            })}
            {hasItems && (
              <div className="border-t-2 border-yellow-200 pt-2 flex justify-between items-center font-display font-black text-[#92400e] text-sm uppercase">
                <span>Liquidação Estimada:</span>
                <span className="text-amber-600">{totalEstimate} Moedas</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3.5 mt-2">
            <button
              onClick={() => { sellAllItemsNoConfirm(false); onClose(); }}
              disabled={!hasItems}
              className={`flex-1 shadow-md px-5 py-3 rounded-2xl font-mono font-black uppercase text-xs tracking-wider border-b-4 transition-all cursor-pointer active:translate-y-0.5 ${hasItems ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
            >
              Confirmar Venda!
            </button>
            <button
              onClick={() => { onClose(); triggerAudioResult(() => sfx.playSound('click')); }}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 shadow-md px-5 py-3 rounded-2xl font-mono font-black uppercase text-xs tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {!hasItems && (
            <p className="text-[10px] text-red-500 mt-3 font-mono font-bold animate-pulse">⚠️ Nenhum produto armazenado disponível para venda!</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SellAllModal;
