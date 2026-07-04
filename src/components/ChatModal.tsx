import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../hooks/useChat';

interface ChatModalProps {
  onClose: () => void;
  nick?: string;
  isLoggedIn: boolean;
}

const TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

function formatTime(iso: string) {
  return TIME_FORMAT.format(new Date(iso));
}

export default function ChatModal({ onClose, nick, isLoggedIn }: ChatModalProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, loading, error, setError, sendMessage } = useChat(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick || !input.trim() || sending) return;
    setSending(true);
    const ok = await sendMessage(nick, input.trim());
    if (ok) setInput('');
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-t-[32px] sm:rounded-[32px] shadow-[0_8px_0_#d97706] w-full max-w-md flex flex-col"
        style={{ height: '75vh', maxHeight: '600px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b-2 border-amber-200">
          <div>
            <h2 className="font-display font-black text-[#78350f] text-lg uppercase tracking-wide">
              💬 Chat Global
            </h2>
            <p className="text-[10px] font-mono text-stone-400 mt-0.5">Mensagens de todos os jogadores</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl font-black cursor-pointer transition-colors"
          >✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="text-2xl animate-spin">🌾</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <span className="text-3xl">🌱</span>
              <p className="text-stone-400 font-mono text-xs">Nenhuma mensagem ainda.<br />Seja o primeiro a falar!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.nick === nick ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                msg.nick === nick
                  ? 'bg-amber-400 text-amber-900'
                  : 'bg-white border-2 border-amber-200 text-stone-700'
              }`}>
                {msg.nick !== nick && (
                  <p className="text-[9px] font-black uppercase tracking-wider text-amber-600 mb-0.5">{msg.nick}</p>
                )}
                <p className="text-xs font-mono leading-snug break-words">{msg.message}</p>
              </div>
              <span className="text-[9px] text-stone-400 font-mono mt-0.5 px-1">{formatTime(msg.created_at)}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 pb-5 pt-2 border-t-2 border-amber-200">
          {error && (
            <p className="text-[10px] font-mono text-red-500 mb-1.5">⚠️ {error}</p>
          )}
          {isLoggedIn ? (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value.slice(0, 200)); setError(''); }}
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
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
          <p className="text-[9px] text-stone-400 font-mono text-right mt-1">{input.length}/200</p>
        </div>
      </motion.div>
    </div>
  );
}
