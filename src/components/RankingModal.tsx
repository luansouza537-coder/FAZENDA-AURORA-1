import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface RankingEntry {
  id: string;
  farm_name: string;
  farm_level: number;
  weekly_production: number;
  total_earned: number;
  animal_count: number;
  updated_at: string;
}

interface RankingModalProps {
  onClose: () => void;
  currentUserId?: string;
}

export default function RankingModal({ onClose, currentUserId }: RankingModalProps) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    setOffline(false);
    try {
      const { data, error } = await supabase
        .from('farm_rankings')
        .select('*')
        .order('farm_level', { ascending: false })
        .order('total_earned', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRanking(data ?? []);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const medalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const formatNumber = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] shadow-[0_8px_0_#d97706] w-full max-w-md flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="font-display font-black text-[#78350f] text-lg uppercase tracking-wide">
              🏆 Ranking Global
            </h2>
            <p className="text-[10px] font-mono text-stone-400 mt-0.5">Top 50 fazendas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchRanking}
              disabled={loading}
              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 cursor-pointer transition-all"
            >
              🔄 Atualizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-xl font-black cursor-pointer transition-colors"
            >✕</button>
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-[36px_1fr_48px_56px_56px] gap-1 px-4 pb-2 shrink-0">
          <span className="text-[9px] font-black uppercase text-stone-400 text-center">#</span>
          <span className="text-[9px] font-black uppercase text-stone-400">Fazenda</span>
          <span className="text-[9px] font-black uppercase text-stone-400 text-center">Nv</span>
          <span className="text-[9px] font-black uppercase text-stone-400 text-center">💰 Total</span>
          <span className="text-[9px] font-black uppercase text-stone-400 text-center">🐾 Animais</span>
        </div>

        <div className="border-t-2 border-amber-200 mx-4 mb-2 shrink-0" />

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 px-3 pb-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-4xl animate-spin">🌾</div>
              <p className="text-stone-400 font-mono text-xs">Carregando ranking...</p>
            </div>
          )}

          {offline && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-4xl">📡</div>
              <p className="text-stone-500 font-mono text-xs text-center">
                Ranking temporariamente indisponível.<br />Verifique sua conexão.
              </p>
              <button
                type="button"
                onClick={fetchRanking}
                className="text-[11px] font-black uppercase px-4 py-2 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-800 hover:bg-amber-200 cursor-pointer transition-all"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !offline && ranking.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-4xl">🌱</div>
              <p className="text-stone-400 font-mono text-xs text-center">
                Nenhuma fazenda no ranking ainda.<br />Seja o primeiro!
              </p>
            </div>
          )}

          {!loading && !offline && ranking.length > 0 && (
            <div className="space-y-1.5">
              <AnimatePresence>
                {ranking.map((entry, i) => {
                  const isMe = entry.id === currentUserId;
                  const pos = i + 1;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`grid grid-cols-[36px_1fr_48px_56px_56px] gap-1 items-center px-3 py-2.5 rounded-2xl border-2 transition-all ${
                        isMe
                          ? 'bg-amber-100 border-[#fbbf24] shadow-md'
                          : pos <= 3
                          ? 'bg-white border-amber-200 shadow-sm'
                          : 'bg-white/60 border-amber-100'
                      }`}
                    >
                      {/* Posição */}
                      <span className={`text-center font-black text-sm ${
                        pos === 1 ? 'text-xl' : pos === 2 ? 'text-lg' : pos === 3 ? 'text-base' : 'text-[11px] text-stone-500'
                      }`}>
                        {medalEmoji(pos)}
                      </span>

                      {/* Nome */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`font-display font-black text-xs uppercase truncate ${isMe ? 'text-[#92400e]' : 'text-stone-700'}`}>
                            {entry.farm_name}
                          </span>
                          {isMe && <span className="text-[8px] bg-amber-400 text-white font-black px-1.5 py-0.5 rounded-full shrink-0">Você</span>}
                        </div>
                      </div>

                      {/* Nível */}
                      <div className="text-center">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-lg">
                          Nv{entry.farm_level}
                        </span>
                      </div>

                      {/* Total ganho */}
                      <span className="text-center text-[10px] font-mono font-bold text-stone-600">
                        💰{formatNumber(entry.total_earned)}
                      </span>

                      {/* Animais */}
                      <span className="text-center text-[10px] font-mono font-bold text-stone-600">
                        🐾{entry.animal_count}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {!currentUserId && (
          <div className="shrink-0 border-t-2 border-amber-200 mx-4 mt-1 pt-3 pb-4 text-center">
            <p className="text-[10px] font-mono text-stone-400">
              Entre com sua conta para aparecer no ranking
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
