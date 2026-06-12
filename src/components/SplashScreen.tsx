/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onStart: () => void;
  hasSave: boolean;
}

const ANIMALS = ['🐄', '🐑', '🐔', '🦙', '🦆', '🐐', '🦚', '🐊'];

export default function SplashScreen({ onStart, hasSave }: SplashScreenProps) {
  const [floatIndex, setFloatIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFloatIndex(i => (i + 1) % ANIMALS.length), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a3a1a] via-[#2d5a27] to-[#3d7a35] relative overflow-hidden select-none">
      {/* Decorative hills */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#2d5a27] rounded-t-[50%] opacity-40" />
      <div className="absolute bottom-0 left-[-10%] right-[-10%] h-20 bg-[#3d7a35] rounded-t-[50%] opacity-30" />

      {/* Stars */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-yellow-200 rounded-full opacity-60"
          style={{
            top: `${8 + Math.sin(i * 2.7) * 25}%`,
            left: `${(i * 5.5) % 95}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Logo area */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-10 z-10"
      >
        {/* Animated animal carousel */}
        <div className="text-7xl mb-4 h-20 flex items-center justify-center">
          <motion.span
            key={floatIndex}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35 }}
          >
            {ANIMALS[floatIndex]}
          </motion.span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-[#f5e6a3] drop-shadow-lg tracking-wide leading-tight">
          Fazenda
        </h1>
        <h1 className="text-6xl font-extrabold text-[#fbbf24] drop-shadow-lg tracking-wide">
          Aurora
        </h1>

        {/* Tagline */}
        <p className="text-[#a3c48a] text-sm mt-3 max-w-xs mx-auto leading-relaxed">
          Cuide dos seus animais, processe produtos e construa o maior império agrícola do país
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-2 mb-10 max-w-xs z-10"
      >
        {['19 animais', 'Economia dinâmica', 'Eventos mundiais', 'Conquistas', 'Contratos'].map(f => (
          <span
            key={f}
            className="text-xs px-2 py-1 rounded-full bg-[#1a3a1a] border border-[#4a8a3a] text-[#a3c48a]"
          >
            {f}
          </span>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex flex-col gap-3 items-center z-10"
      >
        <button
          onClick={onStart}
          className="px-12 py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1a3a1a] font-extrabold text-xl rounded-2xl shadow-lg shadow-black/40 transition-all active:scale-95 hover:scale-105"
        >
          {hasSave ? '▶ Continuar' : '🌱 Começar Fazenda'}
        </button>
        {hasSave && (
          <button
            onClick={() => {
              if (confirm('Apagar save e começar do zero?')) {
                localStorage.removeItem('aurora_farm_save');
                window.location.reload();
              }
            }}
            className="text-xs text-[#6a8a6a] hover:text-[#f87171] underline transition-colors"
          >
            Nova partida (apagar save)
          </button>
        )}
      </motion.div>

      {/* Version */}
      <div className="absolute bottom-4 text-[10px] text-[#4a6a4a] z-10">v1.0.0</div>
    </div>
  );
}
