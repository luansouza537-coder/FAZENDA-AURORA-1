/**
 * Cena 2D do pasto — faixa decorativa viva acima do curral.
 * Reage ao clima real (sol/chuva/nublado + tempestade prevista), à estação
 * (cores de céu e chão) e ao rebanho (até 8 animais passeando).
 * Só CSS animations/transform — zero JS por frame.
 */
import React, { useMemo } from 'react';
import type { Animal } from '../types';
import { getAnimalSprite } from './sprites/AnimalSprites';

type Season = 'primavera' | 'verao' | 'outono' | 'inverno';
type Weather = 'sol' | 'chuva' | 'nublado';

interface Props {
  animals: Animal[];
  weather: Weather;
  season: Season;
  stormComing?: boolean;
}

const SKY: Record<Season, string> = {
  primavera: 'linear-gradient(to bottom, #7dd3fc 0%, #bae6fd 60%, #e0f2fe 100%)',
  verao: 'linear-gradient(to bottom, #38bdf8 0%, #7dd3fc 50%, #fde68a 100%)',
  outono: 'linear-gradient(to bottom, #93c5fd 0%, #fcd34d 70%, #fdba74 100%)',
  inverno: 'linear-gradient(to bottom, #cbd5e1 0%, #e2e8f0 60%, #f1f5f9 100%)',
};

const GROUND: Record<Season, { main: string; dark: string }> = {
  primavera: { main: '#4ade80', dark: '#22c55e' },
  verao: { main: '#a3e635', dark: '#84cc16' },
  outono: { main: '#d9a86c', dark: '#b98a52' },
  inverno: { main: '#f1f5f9', dark: '#cbd5e1' },
};

/** pseudo-aleatório determinístico a partir do id do animal */
const seeded = (id: number, salt: number) => {
  const x = Math.sin(id * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const SPRITE_SIZE: Record<string, number> = {
  vaca: 46, boi: 48, bufalo: 48, ovelha: 40, ovelha_leiteira: 40,
  cabra: 38, lhama: 44, alpaca: 42, galinha: 28, pato: 30,
};

export default function PastureScene({ animals, weather, season, stormComing = false }: Props) {
  // amostra de até 8 animais do rebanho real (prioriza diversidade de espécies)
  const walkers = useMemo(() => {
    const byType = new Map<string, Animal[]>();
    for (const a of animals) {
      if (!byType.has(a.type)) byType.set(a.type, []);
      byType.get(a.type)!.push(a);
    }
    const picked: Animal[] = [];
    // primeiro um de cada espécie, depois completa com repetidos
    for (const list of byType.values()) { if (picked.length < 8) picked.push(list[0]); }
    for (const a of animals) {
      if (picked.length >= 8) break;
      if (!picked.includes(a)) picked.push(a);
    }
    return picked;
  }, [animals]);

  const snow = season === 'inverno' && weather === 'chuva';
  const rain = weather === 'chuva' && !snow;
  const ground = GROUND[season];

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border-4 border-[#fbbf24] shadow-[0_8px_0_#d97706] h-[150px] select-none"
      style={{ background: SKY[season] }}
      aria-hidden="true"
    >
      {/* tint de nublado/chuva */}
      {(weather === 'nublado' || weather === 'chuva') && (
        <div className="absolute inset-0" style={{ background: weather === 'chuva' ? 'rgba(30,41,59,0.30)' : 'rgba(71,85,105,0.16)' }} />
      )}

      {/* sol com raios */}
      {weather === 'sol' && (
        <div className="absolute top-2 right-5">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <g className="pasture-sunrays" style={{ animation: 'sunRays 24s linear infinite', transformOrigin: '26px 26px' }}>
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x="24.5" y="2" width="3" height="9" rx="1.5" fill="#fbbf24"
                  transform={`rotate(${i * 45} 26 26)`} />
              ))}
            </g>
            <circle cx="26" cy="26" r="11" fill="#fde047" stroke="#fbbf24" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* nuvens */}
      {[0, 1, 2].map(i => (
        <svg key={i} className="pasture-cloud absolute" width="70" height="26" viewBox="0 0 70 26"
          style={{
            top: 6 + i * 14,
            left: 0,
            opacity: weather === 'sol' ? 0.55 : 0.85,
            animation: `cloudDrift ${45 + i * 18}s linear infinite`,
            animationDelay: `${-i * 21}s`,
          }}>
          <ellipse cx="22" cy="16" rx="20" ry="9" fill={weather === 'chuva' ? '#94a3b8' : '#f8fafc'} />
          <ellipse cx="42" cy="13" rx="16" ry="10" fill={weather === 'chuva' ? '#a8b6c8' : '#ffffff'} />
          <ellipse cx="56" cy="17" rx="12" ry="7" fill={weather === 'chuva' ? '#94a3b8' : '#f1f5f9'} />
        </svg>
      ))}

      {/* chuva */}
      {rain && (
        <div className="pasture-rain absolute inset-0 pointer-events-none">
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="absolute w-[2px] h-[12px] rounded-full bg-sky-200/80"
              style={{
                left: `${(i * 4.6 + (i % 3) * 1.4) % 100}%`,
                top: -14,
                animation: `rainFall ${0.9 + (i % 4) * 0.18}s linear infinite`,
                animationDelay: `${-(i * 0.13)}s`,
              }} />
          ))}
        </div>
      )}

      {/* neve (inverno + chuva) */}
      {snow && (
        <div className="pasture-snow absolute inset-0 pointer-events-none">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="absolute w-[5px] h-[5px] rounded-full bg-white/90"
              style={{
                left: `${(i * 6.3 + (i % 4) * 2) % 100}%`,
                top: -8,
                animation: `snowFall ${3.2 + (i % 5) * 0.7}s linear infinite`,
                animationDelay: `${-(i * 0.55)}s`,
              }} />
          ))}
        </div>
      )}

      {/* relâmpago ocasional (tempestade prevista) */}
      {stormComing && (
        <div className="absolute inset-0 bg-yellow-100 pointer-events-none"
          style={{ animation: 'lightningFlash 7s linear infinite' }} />
      )}

      {/* chão: colinas */}
      <svg className="absolute bottom-0 left-0 w-full" height="56" viewBox="0 0 400 56" preserveAspectRatio="none">
        <path d="M0 30 Q 80 8 180 24 T 400 18 L 400 56 L 0 56 Z" fill={ground.dark} />
        <path d="M0 38 Q 110 20 220 34 T 400 30 L 400 56 L 0 56 Z" fill={ground.main} />
        {/* decorações por estação */}
        {season === 'primavera' && (
          <>
            <circle cx="52" cy="42" r="2.4" fill="#f472b6" /><circle cx="140" cy="47" r="2.2" fill="#fbbf24" />
            <circle cx="255" cy="44" r="2.4" fill="#f472b6" /><circle cx="342" cy="48" r="2.2" fill="#ffffff" />
          </>
        )}
        {season === 'outono' && (
          <>
            <circle cx="70" cy="44" r="2.2" fill="#b45309" /><circle cx="200" cy="47" r="2" fill="#92400e" />
            <circle cx="320" cy="45" r="2.2" fill="#b45309" />
          </>
        )}
        {/* moitas */}
        <ellipse cx="24" cy="40" rx="10" ry="5" fill={ground.dark} />
        <ellipse cx="378" cy="44" rx="12" ry="6" fill={ground.dark} />
      </svg>

      {/* animais passeando */}
      {walkers.map((a, i) => {
        const Sprite = getAnimalSprite(a.type);
        const size = SPRITE_SIZE[a.type] ?? 34;
        const from = 2 + seeded(a.id, 1) * 24; // %
        const to = 58 + seeded(a.id, 2) * 30; // %
        const dur = 22 + seeded(a.id, 3) * 26; // s
        const delay = -seeded(a.id, 4) * dur; // começa no meio do ciclo
        const eats = seeded(a.id, 5) > 0.5;
        return (
          <div
            key={`${a.id}-${i}`}
            className="pasture-walker absolute"
            title={a.name}
            style={{
              bottom: 6 + (i % 3) * 7,
              zIndex: 10 + (i % 3),
              ['--walk-from' as string]: `${from}%`,
              ['--walk-to' as string]: `${to}%`,
              ['--walk-dur' as string]: `${dur}s`,
              ['--walk-delay' as string]: `${delay}s`,
            }}
          >
            <div className="pasture-flip">
              <Sprite size={size} variant={eats ? 'eat' : 'walk'} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
