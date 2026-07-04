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

export function useChat(isOpen: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastSentAt = useRef<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    const channel = supabase.channel('chat-broadcast', {
      config: { broadcast: { self: true } },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setMessages(prev => {
          const next = [...prev, msg];
          return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLoading(false);
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isOpen]);

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
      id: `${Date.now()}-${Math.random()}`,
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
    return true;
  }, []);

  return { messages, loading, error, setError, sendMessage };
}
