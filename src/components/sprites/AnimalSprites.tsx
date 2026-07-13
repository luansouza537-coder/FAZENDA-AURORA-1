/**
 * Sprites SVG dos animais — estilo primitivas chapadas (mesmo padrão do
 * cabra_angora inline em AnimalCard). Vista lateral para caminhada na cena.
 *
 * Classes de animação (definidas em index.css):
 *  .sprite-eye      → pisca a cada ~4s
 *  .sprite-tail     → rabo abanando
 *  .sprite-head     → abaixa para pastar (grazeBob) quando .sprite-eating
 *  .leg-a / .leg-b  → pernas alternando quando .sprite-walking
 */
import React from 'react';
import type { AnimalType } from '../../types';

export interface SpriteProps {
  size?: number;
  variant?: 'idle' | 'walk' | 'eat';
  flip?: boolean;
  className?: string;
}

const wrap = (variant: SpriteProps['variant'], flip: boolean | undefined, className?: string) =>
  `sprite ${variant === 'walk' ? 'sprite-walking' : ''} ${variant === 'eat' ? 'sprite-eating' : ''} ${flip ? '-scale-x-100' : ''} ${className ?? ''}`;

const Eye = ({ cx, cy, r = 1.6 }: { cx: number; cy: number; r?: number }) => (
  <circle className="sprite-eye" cx={cx} cy={cy} r={r} fill="#1c1917" />
);

export const VacaSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    {/* rabo */}
    <path className="sprite-tail" d="M6 22 Q2 26 4 32" stroke="#e7e5e4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="4" cy="32" r="2" fill="#44403c" className="sprite-tail" />
    {/* pernas */}
    <rect className="leg-a" x="11" y="30" width="4" height="12" rx="2" fill="#e7e5e4" />
    <rect className="leg-b" x="19" y="30" width="4" height="12" rx="2" fill="#d6d3d1" />
    <rect className="leg-a" x="27" y="30" width="4" height="12" rx="2" fill="#d6d3d1" />
    <rect className="leg-b" x="33" y="30" width="4" height="12" rx="2" fill="#e7e5e4" />
    {/* corpo */}
    <ellipse cx="23" cy="25" rx="17" ry="11" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="1" />
    <ellipse cx="16" cy="22" rx="5" ry="4" fill="#44403c" />
    <ellipse cx="29" cy="28" rx="4.5" ry="3.5" fill="#44403c" />
    {/* úbere */}
    <ellipse cx="27" cy="34" rx="4" ry="3" fill="#fda4af" />
    {/* cabeça */}
    <g className="sprite-head">
      <ellipse cx="40" cy="17" rx="7" ry="6.5" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="1" />
      <path d="M35 11 Q34 7 37 8" stroke="#a8a29e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M44 11 Q45 7 42 8" stroke="#a8a29e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="20.5" rx="4" ry="2.8" fill="#fda4af" />
      <circle cx="41" cy="20.5" r="0.7" fill="#be123c" />
      <circle cx="43.5" cy="20.5" r="0.7" fill="#be123c" />
      <Eye cx={38} cy={15.5} />
    </g>
  </svg>
);

export const BoiSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <path className="sprite-tail" d="M5 22 Q1 26 3 32" stroke="#92400e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <rect className="leg-a" x="10" y="30" width="4.5" height="12" rx="2" fill="#78350f" />
    <rect className="leg-b" x="18" y="30" width="4.5" height="12" rx="2" fill="#92400e" />
    <rect className="leg-a" x="26" y="30" width="4.5" height="12" rx="2" fill="#92400e" />
    <rect className="leg-b" x="33" y="30" width="4.5" height="12" rx="2" fill="#78350f" />
    <ellipse cx="22" cy="24" rx="17.5" ry="11.5" fill="#a16207" stroke="#78350f" strokeWidth="1" />
    <ellipse cx="22" cy="21" rx="10" ry="6" fill="#b45309" opacity="0.6" />
    <g className="sprite-head">
      <ellipse cx="40" cy="16" rx="7" ry="6.5" fill="#a16207" stroke="#78350f" strokeWidth="1" />
      <path d="M34 10 Q31 6 34 5" stroke="#fef3c7" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M45 10 Q48 6 45 5" stroke="#fef3c7" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="19.5" rx="4" ry="2.6" fill="#d6d3d1" />
      <circle cx="41" cy="19.5" r="0.7" fill="#57534e" />
      <circle cx="43.5" cy="19.5" r="0.7" fill="#57534e" />
      <Eye cx={38} cy={14.5} />
    </g>
  </svg>
);

export const BufaloSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <path className="sprite-tail" d="M5 23 Q1 27 3 33" stroke="#44403c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <rect className="leg-a" x="10" y="31" width="5" height="11" rx="2" fill="#292524" />
    <rect className="leg-b" x="18" y="31" width="5" height="11" rx="2" fill="#44403c" />
    <rect className="leg-a" x="26" y="31" width="5" height="11" rx="2" fill="#44403c" />
    <rect className="leg-b" x="33" y="31" width="5" height="11" rx="2" fill="#292524" />
    <ellipse cx="22" cy="25" rx="18" ry="12" fill="#57534e" stroke="#292524" strokeWidth="1" />
    <ellipse cx="18" cy="20" rx="11" ry="6" fill="#44403c" />
    <g className="sprite-head">
      <ellipse cx="40" cy="18" rx="7.5" ry="7" fill="#57534e" stroke="#292524" strokeWidth="1" />
      <path d="M33 13 Q28 10 30 4" stroke="#d6d3d1" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M47 13 Q52 10 50 4" stroke="#d6d3d1" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="22" rx="4.2" ry="2.8" fill="#78716c" />
      <circle cx="41" cy="22" r="0.8" fill="#1c1917" />
      <circle cx="43.6" cy="22" r="0.8" fill="#1c1917" />
      <Eye cx={38} cy={16.5} />
    </g>
  </svg>
);

export const OvelhaSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <rect className="leg-a" x="13" y="31" width="3.5" height="11" rx="1.7" fill="#44403c" />
    <rect className="leg-b" x="20" y="31" width="3.5" height="11" rx="1.7" fill="#57534e" />
    <rect className="leg-a" x="27" y="31" width="3.5" height="11" rx="1.7" fill="#57534e" />
    <rect className="leg-b" x="33" y="31" width="3.5" height="11" rx="1.7" fill="#44403c" />
    {/* lã: nuvem de círculos */}
    <ellipse cx="24" cy="25" rx="15" ry="10" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
    <circle cx="12" cy="20" r="5.5" fill="#fef9e7" />
    <circle cx="20" cy="17" r="6" fill="#fef9e7" />
    <circle cx="29" cy="18" r="5.5" fill="#fef9e7" />
    <circle cx="36" cy="22" r="5" fill="#fef9e7" />
    <g className="sprite-head">
      <ellipse cx="41" cy="20" rx="5.5" ry="5" fill="#57534e" />
      <circle cx="38" cy="14.5" r="3" fill="#fef9e7" />
      <ellipse cx="45" cy="17" rx="2" ry="3" fill="#44403c" />
      <Eye cx={40.5} cy={19} r={1.3} />
      <ellipse cx="43" cy="22.5" rx="1.6" ry="1" fill="#292524" />
    </g>
  </svg>
);

export const CabraSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <path className="sprite-tail" d="M7 22 Q4 19 6 16" stroke="#d6bfa3" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <rect className="leg-a" x="12" y="30" width="3.5" height="12" rx="1.7" fill="#c2a57f" />
    <rect className="leg-b" x="19" y="30" width="3.5" height="12" rx="1.7" fill="#d6bfa3" />
    <rect className="leg-a" x="26" y="30" width="3.5" height="12" rx="1.7" fill="#d6bfa3" />
    <rect className="leg-b" x="32" y="30" width="3.5" height="12" rx="1.7" fill="#c2a57f" />
    <ellipse cx="22" cy="24" rx="15" ry="9.5" fill="#e7d3b3" stroke="#c2a57f" strokeWidth="1" />
    <g className="sprite-head">
      <ellipse cx="38" cy="15" rx="5.5" ry="5" fill="#e7d3b3" stroke="#c2a57f" strokeWidth="1" />
      <path d="M35 10 Q33 5 36 4" stroke="#a8a29e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M41 10 Q43 5 40 4" stroke="#a8a29e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* barbicha */}
      <path d="M40 19.5 L40.5 23.5" stroke="#c2a57f" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="34" cy="14" rx="2" ry="3.2" fill="#d6bfa3" />
      <Eye cx={38} cy={14} r={1.4} />
      <ellipse cx="41.5" cy="17" rx="1.6" ry="1.1" fill="#78716c" />
    </g>
  </svg>
);

export const GalinhaSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <rect className="leg-a" x="20" y="36" width="2.2" height="7" rx="1" fill="#f59e0b" />
    <rect className="leg-b" x="26" y="36" width="2.2" height="7" rx="1" fill="#f59e0b" />
    <ellipse cx="23" cy="28" rx="12" ry="10" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
    {/* asa */}
    <ellipse cx="19" cy="28" rx="6" ry="4.5" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1" />
    {/* cauda */}
    <path className="sprite-tail" d="M12 24 Q6 18 9 14 M12 26 Q5 23 6 18" stroke="#e7e5e4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <g className="sprite-head">
      <circle cx="33" cy="17" r="6" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
      {/* crista */}
      <path d="M30 11.5 Q31 8 33 10 Q34 7 36 9.5 Q37.5 8 37 11.5 Z" fill="#ef4444" />
      <polygon points="39,16 44,17.5 39,19" fill="#f59e0b" />
      <path d="M38.5 19.5 Q39.5 21.5 38 21.5" stroke="#ef4444" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <Eye cx={34.5} cy={15.5} r={1.3} />
    </g>
  </svg>
);

export const PatoSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <rect className="leg-a" x="20" y="37" width="2.4" height="6" rx="1" fill="#f97316" />
    <rect className="leg-b" x="26" y="37" width="2.4" height="6" rx="1" fill="#f97316" />
    <ellipse cx="23" cy="30" rx="13" ry="9" fill="#fef9e7" stroke="#fde68a" strokeWidth="1" />
    <path className="sprite-tail" d="M11 27 Q7 24 9 21" stroke="#fde68a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <ellipse cx="20" cy="30" rx="6" ry="4" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
    <g className="sprite-head">
      <circle cx="34" cy="18" r="6.5" fill="#fef9e7" stroke="#fde68a" strokeWidth="1" />
      <ellipse cx="41.5" cy="19.5" rx="4.5" ry="2.2" fill="#f97316" />
      <Eye cx={35.5} cy={16.5} r={1.3} />
    </g>
  </svg>
);

export const LhamaSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <rect className="leg-a" x="12" y="32" width="3.5" height="11" rx="1.7" fill="#d9c1a0" />
    <rect className="leg-b" x="18" y="32" width="3.5" height="11" rx="1.7" fill="#e9d8bc" />
    <rect className="leg-a" x="25" y="32" width="3.5" height="11" rx="1.7" fill="#e9d8bc" />
    <rect className="leg-b" x="31" y="32" width="3.5" height="11" rx="1.7" fill="#d9c1a0" />
    <ellipse cx="22" cy="27" rx="14" ry="8.5" fill="#f3e5cd" stroke="#d9c1a0" strokeWidth="1" />
    <path className="sprite-tail" d="M9 24 Q6 21 8 18" stroke="#d9c1a0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    {/* pescoço longo */}
    <rect x="32" y="8" width="7" height="20" rx="3.5" fill="#f3e5cd" stroke="#d9c1a0" strokeWidth="1" />
    <g className="sprite-head">
      <ellipse cx="36.5" cy="7" rx="5" ry="4.5" fill="#f3e5cd" stroke="#d9c1a0" strokeWidth="1" />
      <ellipse cx="33.5" cy="2.8" rx="1.5" ry="2.6" fill="#e9d8bc" />
      <ellipse cx="39.5" cy="2.8" rx="1.5" ry="2.6" fill="#e9d8bc" />
      <Eye cx={36} cy={6.5} r={1.3} />
      <ellipse cx="39.5" cy="9" rx="1.6" ry="1.1" fill="#a8956f" />
    </g>
  </svg>
);

/** Silhueta genérica para espécies sem sprite dedicado */
export const GenericSprite = ({ size = 48, variant = 'idle', flip, className }: SpriteProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={wrap(variant, flip, className)}>
    <rect className="leg-a" x="14" y="31" width="4" height="11" rx="2" fill="#a8875f" />
    <rect className="leg-b" x="22" y="31" width="4" height="11" rx="2" fill="#b8976f" />
    <rect className="leg-a" x="30" y="31" width="4" height="11" rx="2" fill="#a8875f" />
    <ellipse cx="23" cy="25" rx="15" ry="10" fill="#c4a478" stroke="#a8875f" strokeWidth="1" />
    <path className="sprite-tail" d="M8 23 Q5 20 7 17" stroke="#a8875f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <g className="sprite-head">
      <circle cx="38" cy="17" r="6" fill="#c4a478" stroke="#a8875f" strokeWidth="1" />
      <ellipse cx="34.5" cy="11.5" rx="1.8" ry="3" fill="#b8976f" />
      <Eye cx={37.5} cy={16} r={1.4} />
    </g>
  </svg>
);

const SPRITES: Partial<Record<AnimalType, React.FC<SpriteProps>>> = {
  vaca: VacaSprite,
  boi: BoiSprite,
  bufalo: BufaloSprite,
  ovelha: OvelhaSprite,
  ovelha_leiteira: OvelhaSprite,
  cabra: CabraSprite,
  galinha: GalinhaSprite,
  pato: PatoSprite,
  lhama: LhamaSprite,
  alpaca: LhamaSprite,
};

export function getAnimalSprite(type: AnimalType): React.FC<SpriteProps> {
  return SPRITES[type] ?? GenericSprite;
}

/** Espécies com sprite dedicado (usadas para substituir emoji nos cards) */
export const SPRITE_TYPES = new Set<AnimalType>(['vaca', 'boi', 'bufalo', 'ovelha', 'cabra', 'galinha', 'pato', 'lhama']);
