import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useOnlinePresence(nick?: string) {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: 'user' } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ nick: nick ?? 'visitante', at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nick]);

  return onlineCount;
}
