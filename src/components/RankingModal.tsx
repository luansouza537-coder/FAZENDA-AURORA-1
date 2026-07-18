import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useChat } from '../hooks/useChat';
import OnlineRacePanel, { OnlineRacePanelProps } from './OnlineRaceModal';

interface RankingEntry {
  id: string;
  farm_name: string;
  farm_level: number;
  weekly_production: number;
  total_earned: number;
  animal_count: number;
  online_race_wins?: number;
  updated_at: string;
}

interface RankingModalProps {
  onClose: () => void;
  raceProps: OnlineRacePanelProps;
  currentUserId?: string;
  currentNick?: string;
  isLoggedIn: boolean;
  onlineCount: number;
  onSignOut?: () => void;
}

const TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
function formatTime(iso: string) { return TIME_FORMAT.format(new Date(iso)); }

export default function RankingModal({ onClose, currentUserId, currentNick, isLoggedIn, onlineCount, onSignOut, raceProps }: RankingModalProps) {
  const [tab, setTab] = useState<'ranking' | 'chat' | 'corrida'>('ranking');

  // --- RANKING STATE ---
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [myEntry, setMyEntry] = useState<RankingEntry | null>(null);

  // --- CHAT STATE ---
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, loading: chatLoading, error: chatError, setError: setChatError, sendMessage } = useChat(tab === 'chat');

  useEffect(() => {
    fetchRanking();
  }, []);

  useEffect(() => {
    if (tab === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [tab, messages]);

  const fetchRanking = async () => {
    setLoading(true);
    setOffline(false);
    try {
      const [rankResult, countResult] = await Promise.all([
        supabase.from('farm_rankings').select('*')
          .order('farm_level', { ascending: false })
          .order('total_earned', { ascending: false })
          .limit(50),
        supabase.from('farm_rankings').select('*', { count: 'exact', head: true }),
      ]);

      if (rankResult.error) throw rankResult.error;
      const data = rankResult.data ?? [];
      setRanking(data);
      setTotalPlayers(countResult.count ?? null);

      if (currentUserId) {
        const posInTop50 = data.findIndex(e => e.id === currentUserId);
        if (posInTop50 >= 0) {
          setMyPosition(posInTop50 + 1);
          setMyEntry(null);
        } else {
          const { data: allAbove } = await supabase
            .from('farm_rankings')
            .select('id, farm_name, farm_level, total_earned, animal_count, weekly_production, online_race_wins, updated_at')
            .order('farm_level', { ascending: false })
            .order('total_earned', { ascending: false });
          if (allAbove) {
            const idx = allAbove.findIndex(e => e.id === currentUserId);
            if (idx >= 0) { setMyPosition(idx + 1); setMyEntry(allAbove[idx]); }
          }
        }
      }
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNick || !chatInput.trim() || sending) return;
    setSending(true);
    const ok = await sendMessage(currentNick, chatInput.trim());
    if (ok) setChatInput('');
    setSending(false);
  };

  const medalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const formatNumber = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const isInTop50 = currentUserId ? ranking.some(e => e.id === currentUserId) : false;

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
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-[#78350f] text-lg uppercase tracking-wide">
              🌐 Online
            </h2>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-mono bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {onlineCount} online
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && onSignOut && (
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border-2 border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-300 bg-white cursor-pointer transition-all"
                title="Sair da conta"
              >
                ↩ Sair
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-xl font-black cursor-pointer transition-colors"
            >✕</button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mx-5 mb-3 bg-amber-100 rounded-2xl p-1 shrink-0">
          {(['ranking', 'chat', 'corrida'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === t
                  ? 'bg-[#fbbf24] text-[#78350f] shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t === 'ranking' ? '🏆 Ranking' : t === 'chat' ? '💬 Chat' : '🏇 Corrida'}
            </button>
          ))}
        </div>

        {/* ===== ABA CORRIDA ONLINE ===== */}
        {tab === 'corrida' && <OnlineRacePanel {...raceProps} />}

        {/* ===== ABA RANKING ===== */}
        {tab === 'ranking' && (
          <>
            <div className="flex items-center justify-between px-5 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono text-stone-400">Top 50 fazendas</p>
                {totalPlayers !== null && (
                  <span className="text-[9px] font-mono bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full">
                    👥 {totalPlayers} jogadores
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={fetchRanking}
                disabled={loading}
                className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 cursor-pointer transition-all"
              >
                🔄 Atualizar
              </button>
            </div>

            {!loading && !offline && currentUserId && myPosition !== null && !isInTop50 && myEntry && (
              <div className="mx-4 mb-2 shrink-0">
                <div className="bg-amber-100 border-2 border-[#fbbf24] rounded-2xl px-3 py-2 flex items-center gap-2">
                  <span className="text-[11px] font-black text-amber-800">Sua posição:</span>
                  <span className="text-[11px] font-mono font-bold text-amber-900">#{myPosition}</span>
                  <span className="text-[10px] font-display font-black text-stone-700 truncate flex-1">{myEntry.farm_name}</span>
                  <span className="text-[9px] bg-amber-400 text-white font-black px-1.5 py-0.5 rounded-full shrink-0">Você</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[36px_1fr_48px_56px_56px] gap-1 px-4 pb-2 shrink-0">
              <span className="text-[9px] font-black uppercase text-stone-400 text-center">#</span>
              <span className="text-[9px] font-black uppercase text-stone-400">Fazenda</span>
              <span className="text-[9px] font-black uppercase text-stone-400 text-center">Nv</span>
              <span className="text-[9px] font-black uppercase text-stone-400 text-center">💰 Total</span>
              <span className="text-[9px] font-black uppercase text-stone-400 text-center">🐾 Animais</span>
            </div>
            <div className="border-t-2 border-amber-200 mx-4 mb-2 shrink-0" />

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
                  <button type="button" onClick={fetchRanking}
                    className="text-[11px] font-black uppercase px-4 py-2 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-800 hover:bg-amber-200 cursor-pointer transition-all">
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
                            isMe ? 'bg-amber-100 border-[#fbbf24] shadow-md'
                            : pos <= 3 ? 'bg-white border-amber-200 shadow-sm'
                            : 'bg-white/60 border-amber-100'
                          }`}
                        >
                          <span className={`text-center font-black text-sm ${
                            pos === 1 ? 'text-xl' : pos === 2 ? 'text-lg' : pos === 3 ? 'text-base' : 'text-[11px] text-stone-500'
                          }`}>{medalEmoji(pos)}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`font-display font-black text-xs uppercase truncate ${isMe ? 'text-[#92400e]' : 'text-stone-700'}`}>
                                {entry.farm_name}{(entry.online_race_wins ?? 0) > 0 && <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-1.5 font-black" title="Vitórias na Corrida Online">🏇{entry.online_race_wins}</span>}
                              </span>
                              {isMe && <span className="text-[8px] bg-amber-400 text-white font-black px-1.5 py-0.5 rounded-full shrink-0">Você</span>}
                            </div>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-lg">
                              Nv{entry.farm_level}
                            </span>
                          </div>
                          <span className="text-center text-[10px] font-mono font-bold text-stone-600">💰{formatNumber(entry.total_earned)}</span>
                          <span className="text-center text-[10px] font-mono font-bold text-stone-600">🐾{entry.animal_count}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {!currentUserId && (
              <div className="shrink-0 border-t-2 border-amber-200 mx-4 mt-1 pt-3 pb-4 text-center">
                <p className="text-[10px] font-mono text-stone-400">Entre com sua conta para aparecer no ranking</p>
              </div>
            )}
          </>
        )}

        {/* ===== ABA CHAT ===== */}
        {tab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {chatLoading && (
                <div className="flex justify-center py-8">
                  <span className="text-2xl animate-spin">🌾</span>
                </div>
              )}
              {!chatLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-12">
                  <span className="text-3xl">🌱</span>
                  <p className="text-stone-400 font-mono text-xs">Nenhuma mensagem ainda.<br />Seja o primeiro a falar!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.nick === currentNick ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    msg.nick === currentNick
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-white border-2 border-amber-200 text-stone-700'
                  }`}>
                    {msg.nick !== currentNick && (
                      <p className="text-[9px] font-black uppercase tracking-wider text-amber-600 mb-0.5">{msg.nick}</p>
                    )}
                    <p className="text-xs font-mono leading-snug break-words">{msg.message}</p>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5 px-1">{formatTime(msg.created_at)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 px-4 pb-5 pt-2 border-t-2 border-amber-200">
              {chatError && <p className="text-[10px] font-mono text-red-500 mb-1.5">⚠️ {chatError}</p>}
              {isLoggedIn ? (
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => { setChatInput(e.target.value.slice(0, 200)); setChatError(''); }}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || sending}
                    className="bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-amber-500 text-amber-900 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {sending ? '⏳' : '📤'}
                  </button>
                </form>
              ) : (
                <p className="text-center text-[11px] font-mono text-stone-500 py-2">
                  🔒 Entre com sua conta para enviar mensagens
                </p>
              )}
              <p className="text-[9px] text-stone-400 font-mono text-right mt-1">{chatInput.length}/200</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
