import React, { useEffect, useState, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  selector: string;
  title: string;
  text: string;
  side: 'top' | 'bottom';
  minDay: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'feed',
    selector: '[data-onboarding="feed-btn"]',
    title: '🌾 Alimente seus animais!',
    text: 'Toque no botão verde de alimentar em qualquer animal. Animais com fome baixa não produzem nada no dia.',
    side: 'top',
    minDay: 1,
  },
  {
    id: 'advance-day',
    selector: '[data-onboarding="advance-day"]',
    title: '☀️ Avance o Dia',
    text: 'Agora toque em AVANÇAR DIA. Seus animais vão produzir, o tempo vai passar e a fazenda vai funcionar!',
    side: 'top',
    minDay: 1,
  },
  {
    id: 'diary',
    selector: '[data-onboarding="diary"]',
    title: '📖 Diário da Fazenda',
    text: 'Aqui ficam registrados todos os eventos do dia. Fique de olho para saber o que está acontecendo!',
    side: 'bottom',
    minDay: 2,
  },
  {
    id: 'missions',
    selector: '[data-onboarding="missions-btn"]',
    title: '🎯 Missões',
    text: 'Complete missões diárias para ganhar XP extra e recompensas. São suas metas de crescimento!',
    side: 'top',
    minDay: 2,
  },
  {
    id: 'loja',
    selector: '[data-onboarding="loja-btn"]',
    title: '🏪 Loja da Fazenda',
    text: 'Invista em melhorias permanentes: celeiro, câmara fria, gerador solar e muito mais. Sua fazenda vai crescer!',
    side: 'top',
    minDay: 2,
  },
  {
    id: 'buy-animal',
    selector: '[data-onboarding="buy-animal-btn"]',
    title: '🛒 Expanda o rebanho!',
    text: 'Compre novos animais para diversificar a produção. Cada espécie tem produtos e mecânicas únicas.',
    side: 'top',
    minDay: 3,
  },
];

interface Props {
  step: number; // 1-based index into ONBOARDING_STEPS; 0 = inactive
  currentDay: number;
  onNext: () => void;
  onSkip: () => void;
}

interface Rect { top: number; left: number; width: number; height: number; }

export default function Onboarding({ step, currentDay, onNext, onSkip }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  const def = step >= 1 && step <= ONBOARDING_STEPS.length ? ONBOARDING_STEPS[step - 1] : null;

  const measureTarget = useCallback(() => {
    if (!def) { setRect(null); return; }
    const el = document.querySelector(def.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setVisible(true);
  }, [def]);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(measureTarget, 120);
    return () => clearTimeout(t);
  }, [step, measureTarget]);

  useEffect(() => {
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget]);

  if (!def || step === 0 || !rect || !visible) return null;

  const PAD = 8;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  // Tooltip dimensions (estimated)
  const tipW = Math.min(280, viewW - 32);
  const tipH = 140;

  let tipTop: number;
  let tipLeft: number;

  if (def.side === 'bottom') {
    tipTop = spotTop + spotH + 12;
    if (tipTop + tipH > viewH - 16) tipTop = spotTop - tipH - 12;
  } else {
    tipTop = spotTop - tipH - 12;
    if (tipTop < 16) tipTop = spotTop + spotH + 12;
  }

  tipLeft = rect.left + rect.width / 2 - tipW / 2;
  if (tipLeft < 16) tipLeft = 16;
  if (tipLeft + tipW > viewW - 16) tipLeft = viewW - tipW - 16;

  const arrowOnTop = tipTop > spotTop;

  return (
    <>
      {/* Dark overlay via huge box-shadow on a transparent spotlight rect */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          pointerEvents: 'none',
        }}
      >
        {/* Spotlight cutout */}
        <div
          style={{
            position: 'absolute',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.68)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Backdrop click-to-skip (below tooltip z) */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9001 }}
        onClick={onSkip}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tipTop,
          left: tipLeft,
          width: tipW,
          zIndex: 9002,
        }}
        className="bg-[#1a3a1a] border-2 border-[#fbbf24] rounded-2xl p-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Arrow */}
        {arrowOnTop ? (
          <div style={{
            position: 'absolute',
            top: -10,
            left: rect.left + rect.width / 2 - tipLeft - 8,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '10px solid #fbbf24',
          }} />
        ) : (
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: rect.left + rect.width / 2 - tipLeft - 8,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #fbbf24',
          }} />
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[#fbbf24] font-black text-sm leading-tight">{def.title}</h3>
          <button onClick={onSkip} className="text-[#a3c48a] text-xs font-mono hover:text-white shrink-0 cursor-pointer">pular</button>
        </div>
        <p className="text-[#d4edda] text-xs font-mono leading-relaxed mb-3">{def.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6a8a6a] font-mono">
            {step}/{ONBOARDING_STEPS.length}
          </span>
          <button
            onClick={onNext}
            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1a3a1a] font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            {step === ONBOARDING_STEPS.length ? 'Concluir ✓' : 'Próximo →'}
          </button>
        </div>
      </div>
    </>
  );
}
