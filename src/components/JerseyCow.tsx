/**
 * Vaca Jersey — sprite SVG com identidade própria: pelagem caramelo,
 * focinho escuro e os olhos grandes característicos da raça.
 */
import React from 'react';

export default function JerseyCow({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="select-none">
      {/* rabo */}
      <path d="M7 24 Q3 28 5 33" stroke="#b07a3f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="5" cy="33" r="1.8" fill="#6b4423" />
      {/* pernas */}
      <rect x="12" y="31" width="3.8" height="11" rx="1.8" fill="#c68a4c" />
      <rect x="19" y="31" width="3.8" height="11" rx="1.8" fill="#b07a3f" />
      <rect x="26" y="31" width="3.8" height="11" rx="1.8" fill="#b07a3f" />
      <rect x="32" y="31" width="3.8" height="11" rx="1.8" fill="#c68a4c" />
      {/* corpo caramelo (menor porte) */}
      <ellipse cx="22" cy="25" rx="15.5" ry="10" fill="#d99b5b" stroke="#a9713a" strokeWidth="1.2" />
      {/* mancha clara no dorso */}
      <ellipse cx="19" cy="21" rx="8" ry="4.5" fill="#e8b578" opacity="0.85" />
      {/* úbere */}
      <ellipse cx="26" cy="33" rx="3.8" ry="2.8" fill="#f3c7a0" />
      <circle cx="24.8" cy="34.5" r="0.6" fill="#d99b5b" />
      <circle cx="27.2" cy="34.5" r="0.6" fill="#d99b5b" />
      {/* cabeça */}
      <ellipse cx="38" cy="17" rx="7" ry="6.5" fill="#d99b5b" stroke="#a9713a" strokeWidth="1.2" />
      {/* orelhas */}
      <ellipse cx="32.5" cy="12.5" rx="2.6" ry="1.6" fill="#c68a4c" transform="rotate(-30 32.5 12.5)" />
      <ellipse cx="43.5" cy="12.5" rx="2.6" ry="1.6" fill="#c68a4c" transform="rotate(30 43.5 12.5)" />
      {/* chifres curtos */}
      <path d="M34.5 11 Q34 8.5 36 8.5" stroke="#e7d3b3" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M41.5 11 Q42 8.5 40 8.5" stroke="#e7d3b3" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* focinho escuro característico */}
      <ellipse cx="40" cy="20.5" rx="4.4" ry="3" fill="#5b4632" />
      <circle cx="38.8" cy="20.5" r="0.7" fill="#2f2418" />
      <circle cx="41.5" cy="20.5" r="0.7" fill="#2f2418" />
      {/* olhos grandes com cílios (marca da raça) */}
      <circle cx="36" cy="15.5" r="2.2" fill="#ffffff" />
      <circle cx="36.3" cy="15.8" r="1.4" fill="#3b2a1a" />
      <circle cx="36.7" cy="15.3" r="0.5" fill="#ffffff" />
      <path d="M33.8 13.8 L34.6 14.4 M35.2 13.2 L35.7 14" stroke="#3b2a1a" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}
