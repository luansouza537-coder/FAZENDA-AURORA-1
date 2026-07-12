import React, { useEffect, useState, useCallback, useRef } from 'react';

export interface OnboardingStep {
  id: string;
  selector: string;
  title: string;
  text: string;
  side: 'top' | 'bottom';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'feed',
    selector: '[data-onboarding="feed-btn"]',
    title: '🌾 Alimente seu animal!',
    text: 'Toque no botão verde para alimentar. Depois alimente os outros do mesmo jeito — fome alta = produção!',
    side: 'bottom',
  },
  {
    id: 'advance-day',
    selector: '[data-onboarding="advance-day"]',
    title: '☀️ Avance o Dia!',
    text: 'Toque em AVANÇAR DIA para o tempo passar. Seus animais vão produzir depois disso!',
    side: 'top',
  },
  {
    id: 'collect-milk',
    selector: '[data-onboarding="collect-product-btn"]',
    title: '🧺 Colete a produção!',
    text: 'Seu animal produziu! Toque no botão de coleta para guardar no estoque.',
    side: 'bottom',
  },
  {
    id: 'silo-racoes',
    selector: '[data-onboarding="silo-racoes"]',
    title: '🛒 Compre ração para seus animais!',
    text: 'Cada espécie tem seu tipo de ração. Escolha a certa para seu rebanho e compre antes de acabar!',
    side: 'bottom',
  },
  {
    id: 'financas',
    selector: '[data-onboarding="financas-btn"]',
    title: '💹 Veja suas Finanças!',
    text: 'Acompanhe receitas, despesas e preços de mercado. Essencial para lucrar mais!',
    side: 'bottom',
  },
  {
    id: 'missions',
    selector: '[data-onboarding="missions-btn"]',
    title: '🎯 Confira as Missões!',
    text: 'Missões do dia te dão XP e recompensas. Complete para evoluir sua fazenda mais rápido!',
    side: 'bottom',
  },
  {
    id: 'producao',
    selector: '[data-onboarding="producao-btn"]',
    title: '🏭 Queijaria e Produção!',
    text: 'Transforme leite em queijo artesanal. Produtos processados valem muito mais!',
    side: 'bottom',
  },
  {
    id: 'mais-btn',
    selector: '[data-onboarding="mais-btn"]',
    title: '⋯ Menu de Opções!',
    text: 'Aqui ficam Contratos, Funcionários, Conquistas e mais recursos avançados!',
    side: 'bottom',
  },
  {
    id: 'contratos',
    selector: '[data-onboarding="contratos-btn"]',
    title: '📋 Contratos!',
    text: 'Contratos garantem preço fixo acima do mercado. Assine com o que já produz!',
    side: 'top',
  },
  {
    id: 'loja',
    selector: '[data-onboarding="loja-btn"]',
    title: '🏪 Loja da Fazenda!',
    text: 'Compre melhorias permanentes: Silo, Celeiro, Câmara Fria, Gerador Solar e muito mais!',
    side: 'bottom',
  },
  {
    id: 'buy-animal',
    selector: '[data-onboarding="buy-animal-btn"]',
    title: '🛒 Expanda o Rebanho!',
    text: 'Compre novos animais para diversificar sua produção. Cada espécie tem itens únicos!',
    side: 'bottom',
  },
  {
    id: 'feed2',
    selector: '[data-onboarding="feed-btn"]',
    title: '🌾 Alimente de novo!',
    text: 'Lembre: todo dia, todos os animais. Fome alta garante produção!',
    side: 'bottom',
  },
  {
    id: 'advance-day2',
    selector: '[data-onboarding="advance-day"]',
    title: '☀️ Avance mais um dia!',
    text: 'Ciclo completo: alimentar todos → avançar dia → coletar produção → repetir!',
    side: 'top',
  },
  {
    id: 'collect-milk2',
    selector: '[data-onboarding="collect-product-btn"]',
    title: '🧺 Colete a produção!',
    text: 'Perfeito! Você dominou o ciclo básico da fazenda. Continue assim e prospere!',
    side: 'bottom',
  },
  {
    id: 'diary',
    selector: '[data-onboarding="diary"]',
    title: '🎉 Tutorial Concluído!',
    text: 'Você aprendeu o essencial! Leia o Diário da Fazenda para dicas diárias e boas colheitas!',
    side: 'bottom',
  },
];

interface Props {
  step: number; // 1-based; 0 = inactive
  onSkip: () => void;
}

interface Rect { top: number; left: number; width: number; height: number; }

export default function Onboarding({ step, onSkip }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  const def = step >= 1 && step <= ONBOARDING_STEPS.length ? ONBOARDING_STEPS[step - 1] : null;

  const measureTarget = useCallback(() => {
    if (!def) { setRect(null); setVisible(false); return; }

    const el = document.querySelector<HTMLElement>(def.selector);
    if (!el || (el as HTMLButtonElement).disabled) {
      // Element not in DOM or disabled (e.g. collect button before animal produces)
      onSkipRef.current();
      return;
    }

    const r = el.getBoundingClientRect();
    const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0 && r.height > 0;

    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const t = setTimeout(measureTarget, 180);
    return () => clearTimeout(t);
  }, [step, measureTarget]);

  // Auto-skip se o alvo sumir ou ficar desativado enquanto o passo está ativo
  useEffect(() => {
    if (!def) return;
    const check = setInterval(() => {
      const el = document.querySelector<HTMLElement>(def.selector);
      if (!el || (el as HTMLButtonElement).disabled) onSkipRef.current();
    }, 800);
    return () => clearInterval(check);
  }, [def]);

  useEffect(() => {
    const onResize = () => measureTarget();
    const onScroll = () => {
      if (!def) return;
      const el = document.querySelector<HTMLElement>(def.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [measureTarget, def]);

  if (!def || step === 0 || !rect || !visible) return null;

  const PAD = 10;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const tipW = Math.min(288, viewW - 32);
  const tipH = 130;

  let tipTop: number;
  if (def.side === 'bottom') {
    tipTop = spotTop + spotH + 14;
    if (tipTop + tipH > viewH - 12) tipTop = spotTop - tipH - 14;
  } else {
    tipTop = spotTop - tipH - 14;
    if (tipTop < 12) tipTop = spotTop + spotH + 14;
  }
  tipTop = Math.max(12, Math.min(tipTop, viewH - tipH - 12));

  let tipLeft = rect.left + rect.width / 2 - tipW / 2;
  tipLeft = Math.max(16, Math.min(tipLeft, viewW - tipW - 16));

  const arrowOnTop = tipTop > spotTop + spotH / 2;
  const rawArrowLeft = rect.left + rect.width / 2 - tipLeft - 8;
  const arrowLeft = Math.max(12, Math.min(rawArrowLeft, tipW - 28));

  return (
    <>
      {/* Spotlight overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 14,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            outline: '3px solid #fbbf24',
            outlineOffset: 2,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Tooltip */}
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

        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-[#fbbf24] font-black text-sm leading-tight">{def.title}</h3>
          <button onClick={onSkip} className="text-[#6a8a6a] text-[10px] font-mono hover:text-[#a3c48a] shrink-0 cursor-pointer leading-none mt-0.5">
            {step === ONBOARDING_STEPS.length ? '✅ Concluir' : 'pular'}
          </button>
        </div>
        <p className="text-[#d4edda] text-xs font-mono leading-relaxed mb-2">{def.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#4a6a4a] font-mono">{step}/{ONBOARDING_STEPS.length}</span>
          <span className="text-[#fbbf24] text-xs font-black animate-bounce">👆 Toque no botão acima</span>
        </div>
      </div>
    </>
  );
}
