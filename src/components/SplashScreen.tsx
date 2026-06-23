/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onStart: () => void;
  hasSave: boolean;
}

const ANIMALS = ['🐄', '🐑', '🐔', '🦙', '🦆', '🐐', '🦚', '🐊'];

export default function SplashScreen({ onStart, hasSave }: SplashScreenProps) {
  const [floatIndex, setFloatIndex] = useState(0);
  const [confirmNew, setConfirmNew] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setFloatIndex(i => (i + 1) % ANIMALS.length), 800);
    return () => clearInterval(id);
  }, []);

  function handleNewGame() {
    if (hasSave) {
      setConfirmNew(true);
    } else {
      onStart();
    }
  }

  function confirmNewGame() {
    localStorage.removeItem('aurora_farm_save');
    onStart();
  }

  function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || parsed === null || !('currentDay' in parsed || 'day' in parsed)) {
          setImportError('Arquivo inválido — não parece um save da Fazenda Aurora.');
          return;
        }
        localStorage.setItem('aurora_farm_save', text);
        window.location.reload();
      } catch {
        setImportError('Não foi possível ler o arquivo. Verifique se é um JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

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
          }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12 z-10"
      >
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

        <h1 className="text-5xl font-extrabold text-[#f5e6a3] drop-shadow-lg tracking-wide leading-tight">
          Fazenda
        </h1>
        <h1 className="text-6xl font-extrabold text-[#fbbf24] drop-shadow-lg tracking-wide">
          Aurora
        </h1>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col gap-3 items-stretch w-64 z-10"
      >
        {hasSave ? (
          <button
            onClick={onStart}
            className="py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1a3a1a] font-extrabold text-xl rounded-2xl shadow-lg shadow-black/40 transition-all active:scale-95 hover:scale-105"
          >
            ▶ Continuar
          </button>
        ) : (
          <div className="py-4 bg-[#3a5a3a] text-[#6a8a6a] font-extrabold text-xl rounded-2xl text-center opacity-40 cursor-not-allowed">
            ▶ Continuar
          </div>
        )}

        <button
          onClick={handleNewGame}
          className="py-3 bg-[#2d5a27] hover:bg-[#3d7a35] border border-[#4a8a3a] text-[#f5e6a3] font-bold text-lg rounded-2xl shadow transition-all active:scale-95 hover:scale-105"
        >
          + Novo Jogo
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="py-3 bg-[#1a3a1a] hover:bg-[#253a25] border border-[#4a8a3a] text-[#a3c48a] font-bold text-lg rounded-2xl shadow transition-all active:scale-95 hover:scale-105"
        >
          📂 Carregar Save
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleLoadFile}
        />

        {importError && (
          <p className="text-[#f87171] text-xs text-center mt-1">{importError}</p>
        )}
      </motion.div>

      {/* Confirm new game modal */}
      <AnimatePresence>
        {confirmNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-8"
            onClick={() => setConfirmNew(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a3a1a] border border-[#4a8a3a] rounded-2xl p-6 w-full max-w-xs text-center shadow-xl"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-[#f5e6a3] font-extrabold text-lg mb-2">Apagar progresso?</h2>
              <p className="text-[#a3c48a] text-sm mb-6">
                Todo o seu progresso atual será perdido. Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmNew(false)}
                  className="flex-1 py-2 rounded-xl border border-[#4a8a3a] text-[#a3c48a] font-bold hover:bg-[#2d5a27] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmNewGame}
                  className="flex-1 py-2 rounded-xl bg-[#f87171] hover:bg-[#ef4444] text-white font-bold transition-colors"
                >
                  Apagar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 text-[10px] text-[#4a6a4a] z-10">v1.0.0</div>
    </div>
  );
}
