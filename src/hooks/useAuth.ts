import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  farmName: string;
  isNewUser: boolean;
  loading: boolean;
  authError: string;
}

export interface AuthActions {
  signUp: (nick: string, password: string) => Promise<void>;
  signIn: (nick: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveFarmName: (name: string) => Promise<void>;
  syncRanking: (data: SyncData) => void;
  clearAuthError: () => void;
}

export interface SyncData {
  farmLevel: number;
  totalCollected: number;
  totalEarned: number;
  animalCount: number;
}

const DOMAIN = '@fazenda-aurora.local';

const nickToEmail = (nick: string) =>
  nick.trim().toLowerCase().replace(/\s+/g, '_') + DOMAIN;

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [farmName, setFarmName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Restaura sessão ao recarregar a página
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else {
        setFarmName('');
        setIsNewUser(false);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('farm_name')
        .eq('id', userId)
        .single();

      if (data?.farm_name) {
        setFarmName(data.farm_name);
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch {
      setIsNewUser(true);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (nick: string, password: string) => {
    setAuthError('');
    try {
      const email = nickToEmail(nick);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes('already registered')) {
          setAuthError('Este nick já está em uso. Tente outro.');
        } else {
          setAuthError('Erro ao criar conta. Tente novamente.');
        }
      }
    } catch {
      setAuthError('Erro de conexão. Verifique sua internet.');
    }
  };

  const signIn = async (nick: string, password: string) => {
    setAuthError('');
    try {
      const email = nickToEmail(nick);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError('Nick ou senha incorretos.');
      }
    } catch {
      setAuthError('Erro de conexão. Verifique sua internet.');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // silencioso
    }
    setUser(null);
    setFarmName('');
    setIsNewUser(false);
  };

  const saveFarmName = async (name: string) => {
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({ id: user.id, farm_name: name });
      await supabase.from('farm_rankings').upsert({ id: user.id, farm_name: name });
      setFarmName(name);
      setIsNewUser(false);
    } catch {
      throw new Error('Erro ao salvar nome da fazenda.');
    }
  };

  const syncRanking = (data: SyncData) => {
    if (!user || !farmName) return;
    // fire-and-forget — nunca bloqueia o jogo
    supabase.from('farm_rankings').upsert({
      id: user.id,
      farm_name: farmName,
      farm_level: data.farmLevel,
      weekly_production: data.totalCollected,
      total_earned: data.totalEarned,
      animal_count: data.animalCount,
      updated_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});
  };

  const clearAuthError = () => setAuthError('');

  return {
    user,
    farmName,
    isNewUser,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    saveFarmName,
    syncRanking,
    clearAuthError,
  };
}
