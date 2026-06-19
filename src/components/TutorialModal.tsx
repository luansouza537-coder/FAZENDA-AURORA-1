import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
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
          className="bg-[#fffbeb] border-8 border-[#78350f] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="bg-[#78350f] p-5 border-b-4 border-[#92400e] text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse" style={{ textShadow: '1.5px 1.5px 0px #451a03', animationDuration: '4s' }}>
              📖 Manual da Fazenda Aurora
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Tudo sobre a criação de animais, fabricação e vendas!
            </p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] border-2 border-[#78350f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm font-sans" style={{ scrollbarWidth: 'thin' }}>

            {/* 1. Cuidados Básicos */}
            <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                🌽 Cuidados & Alimentação
              </h4>
              <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                Alimentar os animais consome <strong className="text-[#b45309]">🌾 1 unidade de ração</strong> do Armazém (não deduz ouro diretamente). Isso restaura <strong className="text-green-700">+35% de Fome</strong> e <strong className="text-green-700">+12% de Felicidade</strong>. Compre ração no <strong>Silo de Rações</strong> (loja). Se o <strong>Alimentador Automático</strong> estiver ligado, ele consome ração automaticamente a cada dia. Se os animais ficarem com fome extrema ou felicidade muito baixa, eles começam a definhar. Mantenha-os alimentados!
              </p>
            </div>

            {/* 2. Produção de Matérias-Primas */}
            <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                🥛 Produção dos Animais
              </h4>
              <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                <li>
                  <strong className="text-[#b45309]">🐄 Vacas Leiteiras:</strong> Produzem <strong className="text-[#1d4ed8]">Leite Cru</strong> diariamente no Armazém desde que estejam felizes e alimentadas.
                </li>
                <li>
                  <strong className="text-[#b45309]">🐑 Ovelhas de Lã:</strong> Produzem <strong className="text-purple-700">Novelo de Lã</strong> após 3 dias de crescimento (ou a cada 2 dias se for Melhor Amigo). Estão sujeitas a falhas se tosquiadas em clima inadequado.
                </li>
                <li>
                  <strong className="text-[#b45309]">🐂 Bois de Corte:</strong> Não geram recursos diários, mas ganham peso físico todos os dias. Quando estiverem pesados, podem ser vendidos na feira por um retorno altíssimo!
                </li>
              </ul>
            </div>

            {/* 3. Nível da Fazenda */}
            <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                🏆 Progressão & Nível da Fazenda
              </h4>
              <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                Sua fazenda evolui automaticamente a cada <strong className="text-[#b45309]">10 dias acumulados</strong>. Cada novo nível traz benefícios fixos permanentes de mercado:
              </p>
              <ul className="text-stone-700 space-y-1 mt-2 text-xs list-none pl-1">
                <li>⭐ <strong>Nível 2:</strong> Preço base do Leite Cru sobe de 5 para <strong>6 moedas</strong>.</li>
                <li>⭐ <strong>Nível 3:</strong> Preço base da Lã Crua sobe de 12 para <strong>15 moedas</strong>.</li>
                <li>⭐ <strong>Nível 4:</strong> Desconto de <strong>10%</strong> na compra de qualquer novo animal.</li>
                <li>⭐ <strong>Nível 5:</strong> Bônus extra de de mais <strong>+5 moedas</strong> na venda de qualquer Boi.</li>
              </ul>
            </div>

            {/* 4. Clima Estações & Mercador */}
            <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                🌧️ Eventos, Clima & Mercador Viajante
              </h4>
              <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                <li>
                  <strong>🌧️ Clima Chuvoso:</strong> Reduz a produção de leite das vacas em 20% e traz 30% de chance das ovelhas molharem a lã, atrasando a tosquia do dia.
                </li>
                <li>
                  <strong>☀️ Clima Ensolarado:</strong> Anima as vacas e faz com que produzam +1 balde extra de leite cru!
                </li>
                <li>
                  <strong>🧙‍♂️ Mercador Viajante:</strong> Aparece na fazenda de forma aleatória (a cada 3-7 dias). O mercador paga generosos <strong>1.5x moedas adicionais</strong> por qualquer produto ou animal vendido naquele dia!
                </li>
              </ul>
            </div>

            {/* 5. Melhor Amigo e Crafting */}
            <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
              <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                💖 Melhor Amigo & Fabricação (Ateliê)
              </h4>
              <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                <li>
                  <strong>💖 Status Melhor Amigo:</strong> Se mantiver a felicidade do animal em <strong className="text-rose-600">100% por 3 dias consecutivos</strong>, ele se torna seu melhor amigo de forma permanente (dando bônus: +1 leite para vaca, lã a cada 2 dias para ovelha, e ganho acelerado de peso para o boi). Cuidado! Se a felicidade cair abaixo de 80% por 2 dias, o status de melhor amigo será perdido.
                </li>
                <li>
                  <strong>🧀 Ateliê de Queijo:</strong> Combine <strong>3 Leites Crus</strong> no Ateliê para fabricar 1 <strong>Queijo Nobre</strong> (vende por 15 moedas base, aumentando ainda mais o lucro!).
                </li>
                <li>
                  <strong>🧣 Ateliê de Costura:</strong> Combine <strong>2 Lãs Cruas</strong> no Ateliê para costurar 1 elegante <strong>Cachecol</strong> (vende por 30 moedas base!).
                </li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-[#78350f]/10 p-4 border-t-2 border-[#78350f]/20 flex justify-end shrink-0">
            <button
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
