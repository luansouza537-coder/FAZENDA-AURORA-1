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
    title: '🌾 Alimente TODOS os animais!',
    text: 'Toque no botão verde. O destaque pula para o próximo animal com fome até todos estarem alimentados. Fome alta = produção!',
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
    id: 'collect',
    selector: '[data-onboarding="collect-product-btn"]',
    title: '🧺 Colete a produção!',
    text: 'Seu animal produziu! Toque no botão de coleta para guardar no estoque.',
    side: 'bottom',
  },
  {
    id: 'silo',
    selector: '[data-onboarding="silo-racoes"]',
    title: '🛒 Compre ração!',
    text: 'Cada espécie tem seu tipo de ração. Compre aqui no Silo antes que o estoque acabe!',
    side: 'top',
  },
  {
    id: 'feira',
    selector: '[data-onboarding="feira"]',
    title: '🏷️ Venda na Feira!',
    text: 'Venda o que você coletou! Toque num item das Vendas Diretas para ganhar moedas.',
    side: 'top',
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
    text: 'Missões do dia dão XP e recompensas. Complete para evoluir mais rápido!',
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
    id: 'mais',
    selector: '[data-onboarding="mais-btn"]',
    title: '⋯ Menu de Opções!',
    text: 'Aqui ficam Contratos, Funcionários, Conquistas e mais. Toque para abrir!',
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
    id: 'funcionarios',
    selector: '[data-onboarding="funcionarios-btn"]',
    title: '👷 Funcionários!',
    text: 'Conheça a aba: aqui você contrata ajudantes que automatizam tarefas. Disponível em níveis mais altos — por enquanto, só dê uma olhada!',
    side: 'top',
  },
  {
    id: 'online',
    selector: '[data-onboarding="online-btn"]',
    title: '🌐 Jogue Online!',
    text: 'Crie sua conta e dispute o ranking mundial de fazendeiros. Toque para conhecer!',
    side: 'bottom',
  },
  {
    id: 'loja',
    selector: '[data-onboarding="loja-btn"]',
    title: '🏪 Loja da Fazenda!',
    text: 'Melhorias permanentes: Silo, Celeiro, Câmara Fria, Gerador Solar e mais!',
    side: 'bottom',
  },
  {
    id: 'buy-animal',
    selector: '[data-onboarding="buy-animal-btn"]',
    title: '🛒 Expanda o Rebanho!',
    text: 'Toque para abrir o catálogo de animais e dê uma olhada. Depois toque de novo no botão para fechar e continuar!',
    side: 'bottom',
  },
  {
    id: 'feed2',
    selector: '[data-onboarding="feed-btn"]',
    title: '🌾 Alimente todos de novo!',
    text: 'Todo dia, todos os animais! O destaque pula de um para o outro. Este é o coração do seu negócio!',
    side: 'bottom',
  },
  {
    id: 'advance-day2',
    selector: '[data-onboarding="advance-day"]',
    title: '☀️ Avance mais um dia!',
    text: 'Ciclo completo: alimentar → avançar → coletar → vender. Repita e prospere!',
    side: 'top',
  },
  {
    id: 'collect2',
    selector: '[data-onboarding="collect-product-btn"]',
    title: '🧺 Colete de novo!',
    text: 'Perfeito! Você dominou o ciclo básico da fazenda.',
    side: 'bottom',
  },
  {
    id: 'diary',
    selector: '[data-onboarding="diary"]',
    title: '🎉 Tutorial Concluído!',
    text: 'Você aprendeu o essencial! O Diário da Fazenda registra tudo que acontece. Boas colheitas!',
    side: 'bottom',
  },
];

interface Props {
  step: number; // 1-based; 0 = inactive
  hidden?: boolean; // fora da tela do jogo (splash/title) → nada é exibido
  paused?: boolean; // modal aberto → mostra aviso para fechar, sem perder o passo
  onSkip: () => void; // encerra o tutorial inteiro (botão "pular")
  onAutoAdvance: () => void; // alvo indisponível → pula só este passo
}

interface Rect { top: number; left: number; width: number; height: number; }

function isTargetUsable(selector: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(selector);
  for (const el of els) {
    if ((el as HTMLButtonElement).disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue; // invisível
    return el; // primeiro candidato utilizável
  }
  return null;
}

export default function Onboarding({ step, hidden = false, paused = false, onSkip, onAutoAdvance }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const onAutoAdvanceRef = useRef(onAutoAdvance);
  onAutoAdvanceRef.current = onAutoAdvance;
  const missStrikesRef = useRef(0);
  const lastElRef = useRef<HTMLElement | null>(null);

  const def = step >= 1 && step <= ONBOARDING_STEPS.length ? ONBOARDING_STEPS[step - 1] : null;

  const measureTarget = useCallback(() => {
    if (!def) { setRect(null); setVisible(false); return; }

    const el = isTargetUsable(def.selector);
    if (!el) return; // o vigia periódico decide o auto-avanço

    const r = el.getBoundingClientRect();
    const inView = r.top >= 0 && r.bottom <= window.innerHeight;

    if (!inView) {
      el.scrollIntoView({ behavior: 'auto', block: 'center' });
      setTimeout(() => {
        const el2 = isTargetUsable(def.selector);
        if (!el2) return;
        const r2 = el2.getBoundingClientRect();
        setRect({ top: r2.top, left: r2.left, width: r2.width, height: r2.height });
        setVisible(true);
      }, 150);
      return;
    }

    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setVisible(true);
  }, [def]);

  // Ao trocar de passo ou despausar: re-mede
  useEffect(() => {
    setVisible(false);
    setRect(null);
    missStrikesRef.current = 0;
    lastElRef.current = null;
    if (hidden || paused || !def) return;
    const t = setTimeout(measureTarget, 300);
    return () => clearTimeout(t);
  }, [step, hidden, paused, measureTarget, def]);

  // Vigia: alvo sumiu/desativado por 2 checagens seguidas → pula só este passo
  useEffect(() => {
    if (!def || hidden || paused) return;
    const check = setInterval(() => {
      const el = isTargetUsable(def.selector);
      if (el) {
        missStrikesRef.current = 0;
        // alvo mudou de elemento (ex: próximo animal com fome) → rola até ele
        if (lastElRef.current && lastElRef.current !== el) {
          const rv = el.getBoundingClientRect();
          if (rv.top < 0 || rv.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
        }
        lastElRef.current = el;
        // acompanha o alvo (layout mudou, scroll, etc.)
        const r = el.getBoundingClientRect();
        setRect(prev => {
          if (prev && Math.abs(prev.top - r.top) < 2 && Math.abs(prev.left - r.left) < 2) return prev;
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        });
        setVisible(true);
      } else {
        missStrikesRef.current += 1;
        if (missStrikesRef.current >= 3) {
          missStrikesRef.current = 0;
          onAutoAdvanceRef.current();
        }
      }
    }, 700);
    return () => clearInterval(check);
  }, [def, hidden, paused]);

  if (!def || step === 0 || hidden) return null;

  // Modal aberto: aviso fixo guiando o jogador a fechar para continuar
  if (paused) {
    return (
      <div
        style={{ position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, pointerEvents: 'none', maxWidth: 'calc(100vw - 24px)' }}
        className="bg-[#1a3a1a] border-2 border-[#fbbf24] rounded-2xl px-4 py-2 shadow-2xl flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center"
      >
        <span className="text-[#fbbf24] text-xs font-black">👀 Explore à vontade!</span>
        <span className="text-[#d4edda] text-[11px] font-mono">Feche esta janela para continuar ({step}/{ONBOARDING_STEPS.length})</span>
      </div>
    );
  }

  if (!rect || !visible) return null;

  const PAD = 8;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const tipW = Math.min(300, viewW - 24);
  const tipH = 140;

  let tipTop: number;
  if (def.side === 'bottom') {
    tipTop = spotTop + spotH + 14;
    if (tipTop + tipH > viewH - 10) tipTop = spotTop - tipH - 14;
  } else {
    tipTop = spotTop - tipH - 14;
    if (tipTop < 10) tipTop = spotTop + spotH + 14;
  }
  tipTop = Math.max(10, Math.min(tipTop, viewH - tipH - 10));

  let tipLeft = rect.left + rect.width / 2 - tipW / 2;
  tipLeft = Math.max(12, Math.min(tipLeft, viewW - tipW - 12));

  const arrowOnTop = tipTop > spotTop + spotH / 2;
  const rawArrowLeft = rect.left + rect.width / 2 - tipLeft - 8;
  const arrowLeft = Math.max(14, Math.min(rawArrowLeft, tipW - 30));

  const isLast = step === ONBOARDING_STEPS.length;

  return (
    <>
      {/* Spotlight — não intercepta cliques */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 14,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
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
      >
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
          <button onClick={onSkip} className="text-[#8fac8f] text-[10px] font-mono hover:text-[#c8e6c9] shrink-0 cursor-pointer leading-none mt-0.5 underline">
            {isLast ? '✅ Concluir' : 'pular tutorial'}
          </button>
        </div>
        <p className="text-[#d4edda] text-xs font-mono leading-relaxed mb-2">{def.text}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#8fac8f] font-mono">{step}/{ONBOARDING_STEPS.length}</span>
          <span className="text-[#fbbf24] text-xs font-black animate-bounce">👆 Toque no destaque</span>
        </div>
      </div>
    </>
  );
}
