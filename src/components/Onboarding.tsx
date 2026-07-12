import React, { useEffect, useState, useCallback, useRef } from 'react';

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
    side: 'bottom',
    minDay: 1,
  },
  {
    id: 'advance-day',
    selector: '[data-onboarding="advance-day"]',
    title: '☀️ Avance o Dia',
    text: 'Toque em AVANÇAR DIA. Seus animais vão produzir, o tempo vai passar e a fazenda vai funcionar!',
    side: 'top',
    minDay: 1,
  },
  {
    id: 'missions',
    selector: '[data-onboarding="missions-btn"]',
    title: '🎯 Missões',
    text: 'Complete missões diárias para ganhar XP e recompensas. São suas metas de crescimento!',
    side: 'bottom',
    minDay: 2,
  },
  {
    id: 'loja',
    selector: '[data-onboarding="loja-btn"]',
    title: '🏪 Loja da Fazenda',
    text: 'Invista em melhorias permanentes: celeiro, câmara fria, gerador solar e muito mais!',
    side: 'bottom',
    minDay: 2,
  },
  {
    id: 'buy-animal',
    selector: '[data-onboarding="buy-animal-btn"]',
    title: '🛒 Expanda o rebanho!',
    text: 'Compre novos animais para diversificar a produção. Cada espécie tem produtos e mecânicas únicas.',
    side: 'bottom',
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
  const skipRef = useRef(onNext);
  skipRef.current = onNext;

  const def = step >= 1 && step <= ONBOARDING_STEPS.length ? ONBOARDING_STEPS[step - 1] : null;

  const measureTarget = useCallback(() => {
    if (!def) { setRect(null); setVisible(false); return; }

    const el = document.querySelector<HTMLElement>(def.selector);
    if (!el) {
      // Element not in DOM (e.g. sidebar hidden on mobile) — auto-skip this step
      skipRef.current();
      return;
    }

    const r = el.getBoundingClientRect();

    // Element exists but is out of viewport — scroll it into view first
    const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0 && r.height > 0;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Re-measure after scroll settles
      setTimeout(() => {
        const r2 = el.getBoundingClientRect();
        if (r2.width > 0 && r2.height > 0) {
          setRect({ top: r2.top, left: r2.left, width: r2.width, height: r2.height });
          setVisible(true);
        }
      }, 500);
      return;
    }

    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setVisible(true);
  }, [def]);

  useEffect(() => {
    setVisible(false);
    setRect(null);
    const t = setTimeout(measureTarget, 150);
    return () => clearTimeout(t);
  }, [step, measureTarget]);

  useEffect(() => {
    const onResize = () => measureTarget();
    const onScroll = () => {
      if (rect) {
        // Re-measure on scroll to keep spotlight on element
        const el = def && document.querySelector<HTMLElement>(def.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [measureTarget, def, rect]);

  if (!def || step === 0 || !rect || !visible) return null;

  const PAD = 10;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const tipW = Math.min(288, viewW - 32);
  const tipH = 148;

  // Position tooltip — always clamp inside viewport
  let tipTop: number;
  if (def.side === 'bottom') {
    tipTop = spotTop + spotH + 12;
    if (tipTop + tipH > viewH - 12) tipTop = spotTop - tipH - 12;
  } else {
    tipTop = spotTop - tipH - 12;
    if (tipTop < 12) tipTop = spotTop + spotH + 12;
  }
  // Final clamp
  tipTop = Math.max(12, Math.min(tipTop, viewH - tipH - 12));

  let tipLeft = rect.left + rect.width / 2 - tipW / 2;
  tipLeft = Math.max(16, Math.min(tipLeft, viewW - tipW - 16));

  const arrowOnTop = tipTop > spotTop + spotH / 2;

  // Clamp arrow position inside tooltip
  const rawArrowLeft = rect.left + rect.width / 2 - tipLeft - 8;
  const arrowLeft = Math.max(12, Math.min(rawArrowLeft, tipW - 28));

  return (
    <>
      {/* Full-screen overlay with spotlight cutout via box-shadow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 14,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.70)',
            outline: '3px solid #fbbf24',
            outlineOffset: 2,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Backdrop — tap to skip */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9001 }} onClick={onSkip} />

      {/* Tooltip card */}
      <div
        style={{ position: 'fixed', top: tipTop, left: tipLeft, width: tipW, zIndex: 9002 }}
        className="bg-[#1a3a1a] border-2 border-[#fbbf24] rounded-2xl p-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Arrow */}
        {arrowOnTop ? (
          <div style={{
            position: 'absolute', top: -10, left: arrowLeft,
            width: 0, height: 0,
            borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
            borderBottom: '10px solid #fbbf24',
          }} />
        ) : (
          <div style={{
            position: 'absolute', bottom: -10, left: arrowLeft,
            width: 0, height: 0,
            borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
            borderTop: '10px solid #fbbf24',
          }} />
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[#fbbf24] font-black text-sm leading-tight">{def.title}</h3>
          <button onClick={onSkip} className="text-[#a3c48a] text-[11px] font-mono hover:text-white shrink-0 cursor-pointer leading-none mt-0.5">
            pular
          </button>
        </div>
        <p className="text-[#d4edda] text-xs font-mono leading-relaxed mb-3">{def.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6a8a6a] font-mono">{step}/{ONBOARDING_STEPS.length}</span>
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
