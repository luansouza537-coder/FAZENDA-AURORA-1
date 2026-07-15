/**
 * Galinha Caipira — sprite SVG com identidade própria: penas caramelo,
 * cauda colorida e chapéu de palha de roça.
 */
import React from 'react';

export default function CaipiraHen({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="select-none">
      {/* cauda colorida */}
      <path d="M12 26 Q4 18 8 12" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M13 28 Q5 24 6 17" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M14 30 Q6 29 5 23" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* pernas */}
      <rect x="20" y="38" width="2.4" height="7" rx="1" fill="#f59e0b" />
      <rect x="27" y="38" width="2.4" height="7" rx="1" fill="#f59e0b" />
      <path d="M18.5 45 L21.2 44 L23.5 45" stroke="#f59e0b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M25.5 45 L28.2 44 L30.5 45" stroke="#f59e0b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* corpo caramelo */}
      <ellipse cx="24" cy="30" rx="13" ry="10" fill="#c2660a" stroke="#92400e" strokeWidth="1.2" />
      {/* peito claro */}
      <ellipse cx="27" cy="33" rx="7" ry="5.5" fill="#e8912d" />
      {/* asa */}
      <ellipse cx="20" cy="29" rx="6.5" ry="4.8" fill="#a04e08" stroke="#7c2d12" strokeWidth="1" />
      <path d="M16 29 Q20 30 24 29" stroke="#7c2d12" strokeWidth="0.8" fill="none" />
      {/* cabeça */}
      <circle cx="34" cy="18" r="6.5" fill="#c2660a" stroke="#92400e" strokeWidth="1.2" />
      {/* crista aparecendo atrás do chapéu */}
      <path d="M30 13 Q30.5 11 32 12" stroke="#dc2626" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* barbela */}
      <path d="M38.5 22 Q39.8 25 37.8 24.8" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* bico */}
      <polygon points="40,17.5 45,19 40,20.8" fill="#f59e0b" stroke="#b45309" strokeWidth="0.6" />
      {/* olho */}
      <circle cx="35.5" cy="16.5" r="1.5" fill="#1c1917" />
      <circle cx="36" cy="16" r="0.5" fill="#ffffff" />
      {/* chapéu de palha */}
      <ellipse cx="33" cy="11.5" rx="9.5" ry="2.8" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
      <path d="M28.5 11 Q29 5.5 33 5.5 Q37 5.5 37.5 11 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      <path d="M28.8 9.5 Q33 10.6 37.2 9.5" stroke="#b45309" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
