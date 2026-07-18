import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Animal } from '../types';
import { useOnlineRace } from '../hooks/useOnlineRace';
import { OnlineEntry, resolveOnlineRace, raceKeyToday, raceKeyYesterday } from '../lib/onlineRace';
import RaceModal, { RaceResult } from './RaceModal';

const BET_VALUES = [50, 100, 250];
const BET_MULT = 3; // palpite certo paga 3×

export interface OnlineRacePanelProps {
  user: User | null;
  farmName: string;
  animals: Animal[];
  gold: number;
  onOpenAuth: () => void;
  onSpendGold: (amount: number, desc: string) => void;
  onEarnGold: (amount: number, desc: string) => void;
  onEarnXp: (amount: number) => void;
  addLog: (msg: string, type: string) => void;
}

export const OnlineRacePanel: React.FC<OnlineRacePanelProps> = (p) => {
  const race = useOnlineRace();
  const todayKey = raceKeyToday();
  const yesterdayKey = raceKeyYesterday();
  const [todayEntries, setTodayEntries] = useState<OnlineEntry[] | null>(null);
  const [yesterdayEntries, setYesterdayEntries] = useState<OnlineEntry[] | null>(null);
  const [inscrito, setInscrito] = useState(false);
  const [betRunner, setBetRunner] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [replay, setReplay] = useState<RaceResult | null>(null);
  const [claimMsg, setClaimMsg] = useState('');

  const meuCavalo: Animal | null = p.animals
    .filter(a => a.type === 'cavalo' && a.isAdult !== false)
    .reduce((best: Animal | null, a) => !best || (a.speed ?? 40) > (best.speed ?? 40) ? a : best, null);
  const betToday = race.getBet(todayKey);
  const betYesterday = race.getBet(yesterdayKey);

  useEffect(() => {
    if (!p.user) return;
    race.fetchEntries(todayKey).then(e => {
      setTodayEntries(e);
      if (e && p.user) setInscrito(e.some(x => x.user_id === p.user!.id));
    });
    race.fetchEntries(yesterdayKey).then(setYesterdayEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.user]);

  const inscrever = async () => {
    if (!p.user || !meuCavalo) return;
    const idade = (meuCavalo.age !== undefined && meuCavalo.maxAge) ? meuCavalo.age / meuCavalo.maxAge : 0.3;
    const forma = idade < 0.15 ? 0.6 : idade < 0.5 ? 1.0 : idade < 0.75 ? 0.9 : 0.75;
    const ok = await race.submitEntry(p.user, {
      race_key: todayKey,
      farm_name: p.farmName || 'Fazenda sem nome',
      horse_name: meuCavalo.name,
      speed: meuCavalo.speed ?? 40,
      forma,
      vigor: meuCavalo.hunger,
      moral: meuCavalo.happiness,
      trait: meuCavalo.trait ?? null,
    });
    if (ok) {
      setInscrito(true);
      p.addLog(`🌐 ${meuCavalo.name} inscrito na Corrida Online de hoje! Resultado amanhã.`, 'success');
      race.fetchEntries(todayKey).then(setTodayEntries);
    }
  };

  const apostar = () => {
    if (!betRunner || !betAmount || betAmount > p.gold || betToday) return;
    const runnerName = todayEntries?.find(e => e.user_id === betRunner)?.horse_name ?? betRunner;
    race.placeBet(todayKey, betRunner, runnerName, betAmount);
    p.onSpendGold(betAmount, `🎰 Palpite Corrida Online — ${runnerName}`);
    p.addLog(`🎰 Palpite de ${betAmount}💰 em ${runnerName}. Acertou o vencedor = ${BET_MULT}× de volta amanhã!`, 'info');
    setBetRunner(null); setBetAmount(null);
  };

  const verResultadoOntem = () => {
    if (!yesterdayEntries) return;
    const runners = resolveOnlineRace(yesterdayKey, yesterdayEntries);
    const myIdx = p.user ? runners.findIndex(r => r.key === p.user!.id) : -1;
    const pos = myIdx + 1;
    const jaPago = race.isClaimed(yesterdayKey);
    let prize = 0, xp = 0;
    if (!jaPago) {
      prize = pos === 1 ? 300 : pos === 2 ? 150 : pos === 3 ? 75 : 0;
      xp = pos === 1 ? 25 : 0; // vitória ONLINE vale mais XP
      if (prize > 0) p.onEarnGold(prize, `🌐 Corrida Online — ${pos}º lugar (${runners[myIdx].name})`);
      if (xp > 0) p.onEarnXp(xp);
      // palpite de ontem
      if (betYesterday) {
        if (betYesterday.runnerKey === runners[0].key) {
          const ganho = betYesterday.amount * BET_MULT;
          p.onEarnGold(ganho, `🎰 Palpite certeiro — ${runners[0].name}`);
          setClaimMsg(`🎰 Palpite CERTEIRO! ${runners[0].name} venceu — +${ganho}💰`);
        } else {
          setClaimMsg(`🎰 Palpite errado: ${runners[0].name} venceu, você apostou em ${betYesterday.runnerName}.`);
        }
      }
      race.markClaimed(yesterdayKey);
    }
    setReplay({
      day: 0,
      runners: runners.map(r => ({ name: r.name, owner: r.isNpc ? r.owner : `🌐 ${r.owner}`, isPlayer: p.user ? r.key === p.user.id : false, performance: r.performance })),
      playerPosition: pos > 0 ? pos : 0,
      prize, xp,
    });
  };

  if (replay) {
    return (
      <RaceModal
        result={replay}
        gold={0}
        skipBetting
        onBet={() => {}}
        onPayout={() => {}}
        onClose={() => { setReplay(null); }}
      />
    );
  }

  return (
    <div className="px-5 pb-5 overflow-y-auto">
      <div className="bg-[#1a3a1a] border-4 border-sky-700 rounded-3xl p-4">
        <p className="text-center text-[10px] font-mono text-sky-100/60 mb-4">🏇 Uma corrida por dia, contra cavalos de jogadores reais. Resultado no dia seguinte!</p>

        {!p.user ? (
          <div className="text-center">
            <p className="text-sm text-amber-100/80 font-mono mb-4">Entre na sua conta para inscrever seu cavalo e dar palpites contra outros fazendeiros!</p>
            <button onClick={() => p.onOpenAuth()} className="bg-sky-600 hover:bg-sky-500 text-white border-b-4 border-sky-800 rounded-2xl py-3 px-6 font-display font-black uppercase text-xs tracking-wider cursor-pointer">
              🔑 Entrar / Criar conta
            </button>
          </div>
        ) : (
          <>
            {race.error && <p className="text-center text-[10px] font-mono text-red-300 mb-3">⚠️ {race.error}</p>}

            {/* ONTEM */}
            <div className="bg-emerald-950/60 border-2 border-emerald-800 rounded-2xl p-3 mb-3">
              <p className="font-display font-black text-xs uppercase text-amber-300 mb-1.5">🏁 Corrida de ontem ({yesterdayKey})</p>
              {yesterdayEntries === null ? (
                <p className="text-[10px] font-mono text-amber-100/50">Carregando…</p>
              ) : (
                <>
                  <p className="text-[10px] font-mono text-amber-100/70 mb-2">
                    {yesterdayEntries.length} fazenda(s) inscrita(s){yesterdayEntries.length < 6 ? ' + NPCs completando o grid' : ''}.
                    {race.isClaimed(yesterdayKey) ? ' Prêmios já recebidos.' : ' Assista para receber prêmios e conferir o palpite!'}
                  </p>
                  {claimMsg && <p className="text-[10px] font-mono font-black text-amber-200 mb-2">{claimMsg}</p>}
                  <button onClick={verResultadoOntem} className="w-full bg-amber-600 hover:bg-amber-500 text-white border-b-4 border-amber-800 rounded-xl py-2 font-display font-black uppercase text-[11px] tracking-wider cursor-pointer">
                    🏇 {race.isClaimed(yesterdayKey) ? 'Rever a corrida' : 'Assistir e receber prêmios'}
                  </button>
                </>
              )}
            </div>

            {/* HOJE */}
            <div className="bg-emerald-950/60 border-2 border-emerald-800 rounded-2xl p-3">
              <p className="font-display font-black text-xs uppercase text-sky-300 mb-1.5">📋 Corrida de hoje ({todayKey})</p>

              {/* inscrição */}
              {meuCavalo ? (
                inscrito ? (
                  <p className="text-[10px] font-mono text-emerald-300 mb-2">✅ {meuCavalo.name} está inscrito! (re-inscrever atualiza os stats)</p>
                ) : (
                  <p className="text-[10px] font-mono text-amber-100/70 mb-2">Seu melhor cavalo: <strong>{meuCavalo.name}</strong> (velocidade {meuCavalo.speed ?? 40})</p>
                )
              ) : (
                <p className="text-[10px] font-mono text-amber-100/70 mb-2">Você ainda não tem cavalo adulto (Nv6 na loja de animais) — mas pode dar palpite!</p>
              )}
              {meuCavalo && (
                <button onClick={inscrever} className="w-full mb-3 bg-sky-600 hover:bg-sky-500 text-white border-b-4 border-sky-800 rounded-xl py-2 font-display font-black uppercase text-[11px] tracking-wider cursor-pointer">
                  {inscrito ? '🔄 Atualizar inscrição' : `🏇 Inscrever ${meuCavalo.name}`}
                </button>
              )}

              {/* inscritos */}
              <p className="text-[9px] font-mono text-amber-100/50 uppercase mb-1">Inscritos até agora:</p>
              {todayEntries === null ? (
                <p className="text-[10px] font-mono text-amber-100/50 mb-2">Carregando…</p>
              ) : todayEntries.length === 0 ? (
                <p className="text-[10px] font-mono text-amber-100/50 mb-2">Ninguém ainda — NPCs completarão o grid.</p>
              ) : (
                <div className="space-y-1 mb-2">
                  {todayEntries.map(e => (
                    <button
                      key={e.user_id}
                      onClick={() => !betToday && setBetRunner(e.user_id)}
                      disabled={!!betToday}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${betRunner === e.user_id ? 'border-amber-400 bg-amber-400/20' : 'border-emerald-800 bg-emerald-900/40'} ${betToday ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-emerald-900'}`}
                    >
                      <span className="text-[10px] font-mono font-black text-amber-100">
                        🐎 {e.horse_name} <span className="font-normal text-amber-100/40">· {e.farm_name}</span>
                      </span>
                      <span className="text-[9px] font-mono text-sky-300 shrink-0">vel {e.speed}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* palpite */}
              {betToday ? (
                <p className="text-[10px] font-mono text-emerald-300">🎰 Palpite do dia: {betToday.amount}💰 em {betToday.runnerName} (paga {BET_MULT}× amanhã se vencer)</p>
              ) : (todayEntries?.length ?? 0) > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {BET_VALUES.map(v => (
                      <button key={v} disabled={v > p.gold} onClick={() => setBetAmount(v)}
                        className={`px-3 py-1.5 rounded-lg font-mono font-black text-[11px] border-b-2 transition-all cursor-pointer ${betAmount === v ? 'bg-amber-400 text-amber-950 border-amber-600' : v > p.gold ? 'bg-stone-700 text-stone-500 border-stone-800 cursor-not-allowed' : 'bg-emerald-800 text-amber-100 border-emerald-950 hover:bg-emerald-700'}`}>
                        {v}💰
                      </button>
                    ))}
                    <button onClick={apostar} disabled={!betRunner || !betAmount || (betAmount ?? 0) > p.gold}
                      className={`flex-1 py-1.5 rounded-lg font-display font-black uppercase text-[10px] tracking-wider transition-all ${betRunner && betAmount ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-2 border-amber-700 cursor-pointer' : 'bg-stone-600 text-stone-400 cursor-not-allowed'}`}>
                      🎰 Palpitar ({BET_MULT}×)
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-amber-100/40">Escolha um inscrito acima + valor. Acertou o vencedor de amanhã = {BET_MULT}× de volta.</p>
                </div>
              ) : null}
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default OnlineRacePanel;
