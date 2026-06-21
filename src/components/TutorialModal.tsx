import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialModalProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    id: 'basico',
    icon: '🌽',
    title: 'Cuidados Básicos',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li>
          <strong className="text-[#b45309]">Ração:</strong> Alimentar consome <strong>1 unidade de ração</strong> do Armazém (não deduz ouro diretamente). Restaura <strong className="text-green-700">+35% de Fome</strong> e <strong className="text-green-700">+12% de Felicidade</strong>. Compre no <strong>Silo de Rações</strong>.
        </li>
        <li>
          <strong className="text-[#b45309]">Alimentador Automático:</strong> Consome ração do armazém automaticamente a cada dia — libera você de alimentar manualmente.
        </li>
        <li>
          <strong className="text-[#b45309]">Atenção!</strong> Animais com fome extrema ou felicidade baixa começam a definhar e param de produzir. Mantenha fome acima de <strong>30%</strong> e felicidade acima de <strong>50%</strong>.
        </li>
        <li>
          <strong className="text-[#b45309]">Vacinas & Veterinário:</strong> Vacine os animais periodicamente para evitar doenças. O veterinário cura animais doentes por um custo em ouro.
        </li>
      </ul>
    ),
  },
  {
    id: 'animais',
    icon: '🐄',
    title: 'Animais & Produção',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li><strong className="text-[#b45309]">🐄 Vaca / 🐐 Cabra / 🦬 Búfalo:</strong> Produzem leite diariamente. Felicidade e alimentação afetam a quantidade produzida.</li>
        <li><strong className="text-[#b45309]">🐑 Ovelha / 🦙 Lhama / 🦙 Alpaca / 🐇 Coelho Angorá:</strong> Produzem fibras (lã/pelo/seda). Intervalo de coleta varia por animal.</li>
        <li><strong className="text-[#b45309]">🐔 Galinha / 🦆 Pato / 🪿 Ganso / 🐦 Codorna / 🦚 Pavão:</strong> Produzem ovos diariamente. Ovos de raças especiais valem muito mais.</li>
        <li><strong className="text-[#b45309]">🐂 Boi / 🐷 Porco:</strong> Animais de corte — ganham peso com o tempo. Venda no <strong>Abatedouro</strong> por alto retorno.</li>
        <li><strong className="text-[#b45309]">🐛 Bicho-da-Seda:</strong> Produz seda bruta — rara e valiosa para crafting de tecidos premium.</li>
        <li><strong className="text-[#b45309]">🐊 Jacaré / 🦤 Avestruz:</strong> Animais exóticos de nível alto. Geram couro e carne de altíssimo valor.</li>
        <li><strong className="text-[#b45309]">🐟 Peixe / 🍄 Cogumelo / 🐝 Abelha:</strong> Cultivados em áreas especiais. Colha periodicamente para estoque.</li>
      </ul>
    ),
  },
  {
    id: 'crafting',
    icon: '🧀',
    title: 'Fabricação (Ateliê)',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li><strong className="text-[#b45309]">Laticínios:</strong> Leite → Queijo, Manteiga, Iogurte, Leite Condensado, Queijo Coalho, Muçarela, Brie, Parmesão, Serra.</li>
        <li><strong className="text-[#b45309]">Têxteis:</strong> Lã → Cachecol · Pelo de Lhama → Tapete · Angorá → Cachecol Angorá · Alpaca → Tecido · Seda → Fio de Seda → Manta Premium.</li>
        <li><strong className="text-[#b45309]">Aves & Exóticos:</strong> Ovo de Pato → Patê de Pato · Ovo de Ganso → Ovo Defumado · Ovos de Codorna → Conserva · Penas → Almofada · Penas de Pavão → Enfeite.</li>
        <li><strong className="text-[#b45309]">Couro:</strong> Couro de Avestruz → Colete · Couro de Jacaré → Bolsa Exótica.</li>
        <li><strong className="text-[#b45309]">Especiais:</strong> Mel → Mel Envasado / Hidromel · Cogumelo → Risoto / Sopa · Peixe → Conserva.</li>
        <li><strong className="text-rose-700">Kit Gourmet</strong> (item máximo): 2 Queijo Brie + 1 Manta Premium + 2 Mel = vende por <strong>2.000+ moedas</strong>!</li>
        <li>Itens processados valem muito mais que a matéria-prima bruta. Sempre que puder, fabrique antes de vender!</li>
      </ul>
    ),
  },
  {
    id: 'feira',
    icon: '🏪',
    title: 'Feira & Vendas',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li><strong className="text-[#b45309]">Vendas Diretas:</strong> Use o painel lateral para vender itens do inventário diretamente à feira. O preço varia por estação, clima e oferta/demanda.</li>
        <li><strong className="text-[#b45309]">Oferta & Demanda:</strong> Vender muito do mesmo item reduz o preço. Diversifique os produtos para manter os preços altos!</li>
        <li><strong className="text-[#b45309]">🧙‍♂️ Mercador Viajante:</strong> Aparece aleatoriamente (a cada 3-7 dias) e paga <strong>+8% a mais</strong> em qualquer produto.</li>
        <li><strong className="text-[#b45309]">Exposição de Raças:</strong> Evento de feira especial — inscreva seus melhores animais para ganhar prêmios de ouro e prestígio.</li>
        <li><strong className="text-[#b45309]">Contratos:</strong> Aceite contratos para entregar uma quantidade específica de produto em prazo determinado. Recompensas em ouro e XP. Não adie muito — contratos vencem!</li>
        <li><strong className="text-[#b45309]">Abatedouro:</strong> Venda animais de corte (boi, porco) com base no peso acumulado. Quanto mais pesado, mais ouro.</li>
      </ul>
    ),
  },
  {
    id: 'progressao',
    icon: '🏆',
    title: 'Progressão & Nível',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li><strong className="text-[#b45309]">Nível da Fazenda:</strong> Sobe a cada 10 dias acumulados. Desbloqueia novos animais, preços melhores e funcionalidades.</li>
        <li><strong className="text-[#b45309]">💖 Melhor Amigo:</strong> Mantenha felicidade em <strong>100% por 3 dias seguidos</strong>. Bônus permanente: +1 leite (vaca), lã a cada 2 dias (ovelha), ganho de peso acelerado (boi). Perde-se se a felicidade cair abaixo de 80% por 2 dias.</li>
        <li><strong className="text-[#b45309]">Cruzamento:</strong> Animais adultos com Licença de Criadouro podem ser cruzados para gerar filhotes com <strong>raças especiais</strong> e bônus permanentes de produção.</li>
        <li><strong className="text-[#b45309]">Trabalhadores:</strong> Contrate funcionários para automatizar tarefas (alimentação, coleta, etc.). Reduz a necessidade de ação manual.</li>
        <li><strong className="text-[#b45309]">Prestígio:</strong> Ao atingir nível máximo, faça o Prestígio para recomeçar com bônus permanentes acumulados.</li>
      </ul>
    ),
  },
  {
    id: 'clima',
    icon: '🌤️',
    title: 'Clima & Estações',
    content: (
      <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
        <li><strong className="text-[#b45309]">☀️ Ensolarado:</strong> Vacas produzem +1 balde extra. Felicidade dos animais cresce mais rápido.</li>
        <li><strong className="text-[#b45309]">🌧️ Chuvoso:</strong> Produção de leite reduzida em 20%. Ovelhas molhadas atrasam a tosquia. Alguns preços sobem (mel, cogumelos).</li>
        <li><strong className="text-[#b45309]">🌩️ Tempestade:</strong> Pode afetar o bem-estar dos animais. Verifique após a tempestade.</li>
        <li><strong className="text-[#b45309]">🌸 Primavera:</strong> Alta demanda por produtos frescos (leite, ovos). Preços em alta.</li>
        <li><strong className="text-[#b45309]">☀️ Verão:</strong> Boa época para fibras e mel. Vacas produzem mais.</li>
        <li><strong className="text-[#b45309]">🍂 Outono:</strong> Alta demanda por queijos curados e conservas. Ótimo para vender processados.</li>
        <li><strong className="text-[#b45309]">❄️ Inverno:</strong> Produção reduzida. Priorize fabricação de itens premium com estoque acumulado.</li>
      </ul>
    ),
  },
];

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-[#78350f] rounded-[36px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-[#78350f] p-4 border-b-4 border-[#92400e] text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
              📖 Manual da Fazenda Aurora
            </h3>
            <p className="text-[#fcd57e] text-[10px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Guia completo · animais · fabricação · feira · progressão
            </p>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] border-2 border-[#78350f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto shrink-0 bg-[#92400e]/10 border-b-2 border-[#78350f]/20 gap-1 p-2" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(i)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  activeSection === i
                    ? 'bg-[#78350f] text-white shadow-md'
                    : 'bg-white/60 text-[#78350f] hover:bg-white/90'
                }`}
              >
                {s.icon} {s.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm min-h-[200px]"
              >
                <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  {SECTIONS[activeSection].icon} {SECTIONS[activeSection].title}
                </h4>
                {SECTIONS[activeSection].content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={() => setActiveSection(i => Math.max(0, i - 1))}
                disabled={activeSection === 0}
                className="text-xs font-display font-black text-[#78350f] disabled:opacity-30 hover:underline cursor-pointer disabled:cursor-default"
              >
                ← Anterior
              </button>
              <span className="text-[10px] text-stone-400 font-mono">
                {activeSection + 1} / {SECTIONS.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveSection(i => Math.min(SECTIONS.length - 1, i + 1))}
                disabled={activeSection === SECTIONS.length - 1}
                className="text-xs font-display font-black text-[#78350f] disabled:opacity-30 hover:underline cursor-pointer disabled:cursor-default"
              >
                Próximo →
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#78350f]/10 p-4 border-t-2 border-[#78350f]/20 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
            >
              Entendi, Voltar ao Jogo!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialModal;
