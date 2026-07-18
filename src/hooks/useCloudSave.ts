import { useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Campos pesados e recuperáveis que NÃO sobem para a nuvem (cortam o payload de ~200KB p/ ~30-50KB).
// Na restauração eles começam vazios — todos os initializers têm fallback.
const CAMPOS_LOCAIS = ['financialLog', 'priceHistory', 'logs', 'notifications', 'previousPrices'];

const THROTTLE_MS = 60_000;

export type CloudStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface CloudSaveResult {
  save: Record<string, any>;
  gameDay: number;
  farmLevel: number;
  updatedAt: string;
}

export function useCloudSave() {
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const lastUploadRef = useRef(0);

  /** Sobe o save local para a nuvem. Fire-and-forget: nunca lança nem bloqueia o jogo. */
  const uploadSave = useCallback((user: User | null) => {
    if (!user) return;
    const now = Date.now();
    if (now - lastUploadRef.current < THROTTLE_MS) return;
    lastUploadRef.current = now;

    try {
      const raw = localStorage.getItem('aurora_farm_save');
      if (!raw) return;
      const full = JSON.parse(raw);
      const slim: Record<string, any> = { ...full };
      for (const k of CAMPOS_LOCAIS) delete slim[k];

      setCloudStatus('saving');
      supabase
        .from('player_saves')
        .upsert({
          user_id: user.id,
          save_data: slim,
          game_day: full.currentDay ?? 1,
          farm_level: full.farmLevel ?? 1,
          updated_at: new Date().toISOString(),
        })
        .then(
          ({ error }) => {
            if (error) { setCloudStatus('error'); return; }
            setCloudStatus('saved');
            setLastSyncAt(new Date());
          },
          () => setCloudStatus('error')
        );
    } catch {
      setCloudStatus('error');
    }
  }, []);

  /** Busca o save do usuário na nuvem. Retorna null se não existir (ou em erro). */
  const fetchCloudSave = useCallback(async (user: User | null): Promise<CloudSaveResult | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('player_saves')
        .select('save_data, game_day, farm_level, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error || !data?.save_data) return null;
      return {
        save: data.save_data as Record<string, any>,
        gameDay: data.game_day ?? 1,
        farmLevel: data.farm_level ?? 1,
        updatedAt: data.updated_at,
      };
    } catch {
      return null;
    }
  }, []);

  /** Grava o save da nuvem no localStorage e recarrega (mesmo mecanismo do import de arquivo). */
  const applyCloudSave = useCallback((cloud: CloudSaveResult) => {
    localStorage.setItem('aurora_farm_save', JSON.stringify(cloud.save));
    localStorage.setItem('aurora_import_autoload', '1');
    window.location.reload();
  }, []);

  return { cloudStatus, lastSyncAt, uploadSave, fetchCloudSave, applyCloudSave };
}
