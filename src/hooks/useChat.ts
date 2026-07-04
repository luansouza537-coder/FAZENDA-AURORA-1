import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  nick: string;
  message: string;
  created_at: string;
}

const MAX_MESSAGES = 50;
const COOLDOWN_MS = 3000;

// Tenta carregar histórico do banco — falha silenciosamente
async function loadHistory(): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, nick, message, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error || !data) return [];
    return data.reverse();
  } catch {
    return [];
  }
}

// Tenta salvar no banco — falha silenciosamente
async function persistMessage(msg: ChatMessage): Promise<void> {
  try {
    await supabase.from('chat_messages').insert({
      id: msg.id,
      nick: msg.nick,
      message: msg.message,
      created_at: msg.created_at,
    });
  } catch {
    // ignora — broadcast já entregou a mensagem
  }
}

export function useChat(isOpen: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastSentAt = useRef<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const addMessage = useCallback((msg: ChatMessage) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages(prev => {
      const next = [...prev, msg];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    seenIds.current = new Set();

    // Carrega histórico do banco (silencioso se falhar)
    loadHistory().then(history => {
      history.forEach(m => seenIds.current.add(m.id));
      setMessages(history);
      setLoading(false);
    });

    const channel = supabase.channel('chat-broadcast', {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        addMessage(payload as ChatMessage);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isOpen, addMessage]);

  const sendMessage = useCallback(async (nick: string, message: string): Promise<boolean> => {
    const now = Date.now();
    if (now - lastSentAt.current < COOLDOWN_MS) {
      setError(`Aguarde ${Math.ceil((COOLDOWN_MS - (now - lastSentAt.current)) / 1000)}s antes de enviar novamente.`);
      return false;
    }
    const trimmed = message.trim().slice(0, 200);
    if (!trimmed || !channelRef.current) return false;

    setError('');
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nick,
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    const status = await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: msg,
    });

    if (status !== 'ok') {
      setError('Erro ao enviar. Tente novamente.');
      return false;
    }

    lastSentAt.current = Date.now();

    // Persiste no banco em segundo plano (silencioso se falhar)
    persistMessage(msg);

    return true;
  }, []);

  return { messages, loading, error, setError, sendMessage };
}
