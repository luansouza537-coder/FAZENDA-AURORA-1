/**
 * Boi Angus — sprite SVG: pelagem preta e mocho (sem chifres),
 * as marcas registradas do Aberdeen Angus.
 */
import React from 'react';

export default function AngusOx({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="select-none">
      {/* rabo */}
      <path d="M5 22 Q1 26 3 32" stroke="#1c1917" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="3" cy="32" r="1.8" fill="#0c0a09" />
      {/* pernas robustas */}
      <rect x="10" y="30" width="5" height="12" rx="2.2" fill="#1c1917" />
      <rect x="18" y="30" width="5" height="12" rx="2.2" fill="#292524" />
      <rect x="26" y="30" width="5" height="12" rx="2.2" fill="#292524" />
      <rect x="33" y="30" width="5" height="12" rx="2.2" fill="#1c1917" />
      {/* corpo maciço preto */}
      <ellipse cx="22" cy="24" rx="18" ry="11.5" fill="#292524" stroke="#0c0a09" strokeWidth="1.2" />
      {/* brilho do pelo (acabamento premium) */}
      <ellipse cx="17" cy="19.5" rx="9" ry="4" fill="#44403c" opacity="0.8" />
      <ellipse cx="20" cy="17.5" rx="4" ry="1.6" fill="#57534e" opacity="0.7" />
      {/* cabeça mocha (sem chifres) */}
      <ellipse cx="40" cy="16.5" rx="7" ry="6.8" fill="#292524" stroke="#0c0a09" strokeWidth="1.2" />
      {/* orelhas laterais */}
      <ellipse cx="33.8" cy="12.8" rx="2.6" ry="1.6" fill="#1c1917" transform="rotate(-25 33.8 12.8)" />
      <ellipse cx="46" cy="13.5" rx="2.4" ry="1.5" fill="#1c1917" transform="rotate(25 46 13.5)" />
      {/* topete característico */}
      <path d="M36.5 10.5 Q38.5 8.5 40.5 10 Q42.5 8.5 44 10.8" stroke="#44403c" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* focinho */}
      <ellipse cx="42" cy="20.5" rx="4.4" ry="3" fill="#57534e" />
      <circle cx="40.8" cy="20.5" r="0.75" fill="#0c0a09" />
      <circle cx="43.4" cy="20.5" r="0.75" fill="#0c0a09" />
      {/* olho */}
      <circle cx="38" cy="15.5" r="1.6" fill="#0c0a09" />
      <circle cx="38.4" cy="15.1" r="0.5" fill="#a8a29e" />
    </svg>
  );
}
