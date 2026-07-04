import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    supabase
      .from('chat_messages')
      .select('id, nick, message, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_MESSAGES)
      .then(({ data }) => {
        if (data) setMessages(data.reverse());
      })
      .finally(() => setLoading(false));

    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages(prev => {
            const next = [...prev, msg];
            return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  const sendMessage = useCallback(async (nick: string, message: string): Promise<boolean> => {
    const now = Date.now();
    if (now - lastSentAt.current < COOLDOWN_MS) {
      setError(`Aguarde ${Math.ceil((COOLDOWN_MS - (now - lastSentAt.current)) / 1000)}s antes de enviar novamente.`);
      return false;
    }
    const trimmed = message.trim().slice(0, 200);
    if (!trimmed) return false;

    setError('');
    const { error: err } = await supabase
      .from('chat_messages')
      .insert({ nick, message: trimmed });

    if (err) {
      setError('Erro ao enviar. Tente novamente.');
      return false;
    }
    lastSentAt.current = Date.now();
    return true;
  }, []);

  return { messages, loading, error, setError, sendMessage };
}
