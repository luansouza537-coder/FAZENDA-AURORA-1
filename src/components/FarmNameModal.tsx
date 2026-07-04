import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FarmNameModalProps {
  onSave: (name: string) => Promise<void>;
}

const farmNameRegex = /^[a-zA-Z0-9À-ú\s\-]{3,24}$/;

export default function FarmNameModal({ onSave }: FarmNameModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = farmNameRegex.test(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    try {
      await onSave(name.trim());
    } catch {
      setError('Erro ao salvar. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] shadow-[0_8px_0_#d97706] w-full max-w-sm p-7 text-center"
      >
        <div className="text-5xl mb-3">🌾</div>
        <h2 className="font-display font-black text-[#78350f] text-xl uppercase tracking-wide mb-1">
          Bem-vindo!
        </h2>
        <p className="text-stone-500 font-mono text-xs mb-5">
          Como se chama sua fazenda?
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Ex: Fazenda Esperança"
            maxLength={24}
            autoFocus
            className="w-full bg-white border-2 border-amber-300 rounded-xl px-4 py-3 font-mono text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-center"
          />
          <p className="text-[9px] text-stone-400 font-mono">{name.length}/24 · letras, números, espaços e hífens</p>

          {error && (
            <p className="text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full py-3 rounded-2xl font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
              isValid && !loading
                ? 'bg-[#10b981] hover:bg-[#059669] border-b-4 border-[#065f46] text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]'
                : 'bg-stone-200 text-stone-400 border-b-4 border-stone-300 cursor-not-allowed'
            }`}
          >
            {loading ? '⏳ Salvando...' : '🚀 Começar!'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
