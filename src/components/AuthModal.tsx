import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  onSignUp: (nick: string, password: string) => Promise<void>;
  onSignIn: (nick: string, password: string) => Promise<void>;
  authError: string;
  clearAuthError: () => void;
  onClose: () => void;
}

const nickRegex = /^[a-zA-Z0-9_-]{3,20}$/;
const farmNameRegex = /^[a-zA-Z0-9À-ú\s\-]{3,24}$/;

export default function AuthModal({ onSignUp, onSignIn, authError, clearAuthError, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'entrar' | 'criar'>('entrar');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const error = localError || authError;

  const switchTab = (t: 'entrar' | 'criar') => {
    setTab(t);
    setNick('');
    setPassword('');
    setFarmName('');
    setLocalError('');
    clearAuthError();
  };

  const validateSignUp = () => {
    if (!farmNameRegex.test(farmName)) return 'Nome da fazenda: 3–24 caracteres, sem símbolos especiais.';
    if (!nickRegex.test(nick)) return 'Nick: 3–20 caracteres, sem espaços. Use letras, números, _ ou -.';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres.';
    return '';
  };

  const validateSignIn = () => {
    if (!nick.trim()) return 'Digite seu nick.';
    if (!password.trim()) return 'Digite sua senha.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    const validationError = tab === 'criar' ? validateSignUp() : validateSignIn();
    if (validationError) { setLocalError(validationError); return; }

    setLoading(true);
    try {
      if (tab === 'criar') {
        await onSignUp(nick, password);
      } else {
        await onSignIn(nick, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = tab === 'criar'
    ? farmNameRegex.test(farmName) && nickRegex.test(nick) && password.length >= 6 && !loading
    : nick.trim().length > 0 && password.trim().length > 0 && !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] shadow-[0_8px_0_#d97706] w-full max-w-sm p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-black text-[#78350f] text-lg uppercase tracking-wide">
            🌾 Fazenda Aurora
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl font-black cursor-pointer transition-colors"
          >✕</button>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-5 bg-amber-100 rounded-2xl p-1">
          {(['entrar', 'criar'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === t
                  ? 'bg-[#fbbf24] text-[#78350f] shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t === 'entrar' ? '🔑 Entrar' : '🌱 Criar Conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait">
            {tab === 'criar' && (
              <motion.div
                key="farm-name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[10px] font-black uppercase text-[#92400e] mb-1 tracking-wider">
                  🏡 Nome da Fazenda
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={e => { setFarmName(e.target.value); setLocalError(''); clearAuthError(); }}
                  placeholder="Ex: Fazenda Esperança"
                  maxLength={24}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2.5 font-mono text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-[9px] text-stone-400 font-mono mt-0.5">{farmName.length}/24 caracteres</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] font-black uppercase text-[#92400e] mb-1 tracking-wider">
              👤 Nick
            </label>
            <input
              type="text"
              value={nick}
              onChange={e => { setNick(e.target.value); setLocalError(''); clearAuthError(); }}
              placeholder={tab === 'criar' ? 'Ex: FazendeiroBR' : 'Seu nick'}
              maxLength={20}
              autoCapitalize="none"
              className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2.5 font-mono text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {tab === 'criar' && <p className="text-[9px] text-stone-400 font-mono mt-0.5">Sem espaços. Letras, números, _ ou -</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-[#92400e] mb-1 tracking-wider">
              🔒 Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLocalError(''); clearAuthError(); }}
              placeholder={tab === 'criar' ? 'Mínimo 6 caracteres' : 'Sua senha'}
              className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2.5 font-mono text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Erro */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
              >
                ⚠️ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Botão */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-2xl font-display font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
              canSubmit
                ? 'bg-[#10b981] hover:bg-[#059669] border-b-4 border-[#065f46] text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]'
                : 'bg-stone-200 text-stone-400 border-b-4 border-stone-300 cursor-not-allowed'
            }`}
          >
            {loading
              ? '⏳ Aguarde...'
              : tab === 'criar'
              ? '🌱 Criar Fazenda'
              : '🔑 Entrar'}
          </button>
        </form>

        {tab === 'entrar' && (
          <p className="text-center text-[10px] text-stone-400 font-mono mt-3">
            Não tem conta?{' '}
            <button type="button" onClick={() => switchTab('criar')} className="text-amber-600 font-bold underline cursor-pointer">
              Criar agora
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
