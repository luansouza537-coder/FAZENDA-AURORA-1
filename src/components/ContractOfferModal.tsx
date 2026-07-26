import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_LABELS } from '../data/sellableProducts';

export interface ContractOfferEntry {
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

interface ContractOfferModalProps {
  offer: ContractOfferEntry;
  onSign: () => void;
  onClose: () => void;
}

const ContractOfferModal: React.FC<ContractOfferModalProps> = ({ offer, onSign, onClose }) => {
  const premiumPct = Math.round(((offer.pricePerUnit - offer.baseMarket) / offer.baseMarket) * 100);
  const isExport = offer.catalogId.startsWith('exp_');
  const productLabel = PRODUCT_LABELS[offer.product] ?? offer.product;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[250] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-violet-600 rounded-[36px] max-w-md w-full shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-violet-600 to-violet-800 p-5 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-violet-200 hover:text-white bg-violet-900/60 hover:bg-violet-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all text-lg font-bold"
            >
              ✕
            </button>
            <div className="text-4xl mb-1">{isExport ? '🌍' : '📋'}</div>
            <h3 className="text-white text-lg font-display font-black uppercase tracking-wide">
              {isExport ? 'Nova Oferta de Exportação!' : 'Novo Fornecedor Disponível!'}
            </h3>
            <p className="text-violet-200 text-xs font-mono mt-1">{offer.client}</p>
          </div>
          <div className="p-5">
            <div className="text-[10px] font-mono text-violet-700 font-black mb-2">{productLabel}</div>
            <p className="text-[11px] text-stone-600 font-mono mb-3 leading-relaxed max-h-32 overflow-y-auto">{offer.description}</p>
            <div className="text-[10px] font-mono text-green-600 mb-2">+{premiumPct}% acima do mercado</div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] font-mono text-stone-600">
              <div className="bg-stone-50 rounded-lg px-2 py-1 text-center">
                <span className="block font-black text-stone-800">{offer.weeklyGoal} un/sem</span>Meta semanal
              </div>
              <div className="bg-stone-50 rounded-lg px-2 py-1 text-center">
                <span className="block font-black text-stone-800">{offer.durationDays} dias</span>Duração
              </div>
              <div className="bg-amber-50 rounded-lg px-2 py-1 text-center">
                <span className="block font-black text-amber-700">{offer.completionBonus}💰</span>Bônus final
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSign}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white border-b-4 border-violet-900 shadow-md px-4 py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
              >
                📝 Assinar Agora
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 border-b-4 border-stone-400 shadow-md px-4 py-3 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
              >
                Ver Depois
              </button>
            </div>
            <p className="text-[9px] text-stone-400 font-mono text-center mt-3">💡 Você pode revisitar essa oferta a qualquer momento em Contratos.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContractOfferModal;
