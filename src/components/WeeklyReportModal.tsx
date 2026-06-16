import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmWorker, WeeklyReportData } from '../types';

interface WorkerType { role: string; emoji: string; }

interface WeeklyReportModalProps {
  currentDay: number;
  weeklyReportData: WeeklyReportData;
  workers: FarmWorker[];
  weeklyTaxPaid: number;
  workerTypes: WorkerType[];
  onClose: () => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
}

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  currentDay, weeklyReportData: d, workers, weeklyTaxPaid,
  workerTypes, onClose, triggerAudioResult, sfx,
}) => {
  const handleClose = () => {
    onClose();
    triggerAudioResult(() => sfx.playSound('click'));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#fffbeb] border-8 border-indigo-900 rounded-[36px] max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
        >
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-5 border-b-4 border-indigo-950 text-center shrink-0">
            <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #1e1b4b' }}>
              📅 Plano de Balanço Semanal
            </h3>
            <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
              Relatório do Dia {currentDay - 7} ao Dia {currentDay - 1} de atividade
            </p>
            <button onClick={handleClose} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-indigo-950 hover:bg-indigo-800 border-2 border-indigo-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold" title="Fechar">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm font-sans" style={{ scrollbarWidth: 'thin' }}>
            <div className="text-center font-bold text-[#78350f] uppercase tracking-wide text-xs mb-1">
              📊 Resumo Estatístico dos Últimos 7 Dias
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-[10px] font-mono tracking-wider font-black text-emerald-700 uppercase leading-none">Lucro Bruto</div>
                  <div className="text-base font-black font-mono text-[#78350f] mt-1">+{d.earnings} moedas</div>
                </div>
              </div>
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                <span className="text-2xl">🌽</span>
                <div>
                  <div className="text-[10px] font-mono tracking-wider font-black text-red-700 uppercase leading-none">Despesas</div>
                  <div className="text-base font-black font-mono text-[#78350f] mt-1">-{d.spending} moedas</div>
                </div>
              </div>
              <div className="bg-[#fef3c7] border-2 border-[#fbbf24] rounded-2xl p-3 flex items-center gap-3 col-span-2 shadow-xs">
                <span className="text-2xl">⚖️</span>
                <div>
                  <div className="text-[10px] font-mono tracking-wider font-black text-stone-700 uppercase leading-none">Balanço Líquido</div>
                  <div className={`text-base font-black font-mono mt-1 ${(d.earnings - d.spending) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {(d.earnings - d.spending) >= 0 ? '+' : ''}{d.earnings - d.spending} moedas de ouro
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/75 border-2 border-[#fbbf24] rounded-2xl p-4 shadow-sm">
              <h4 className="font-display font-black text-xs text-[#78350f] uppercase tracking-wider mb-2 border-b border-stone-200 pb-1">📦 Itens Obtidos & Produzidos</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-stone-700">
                <div className="flex items-center gap-1.5"><span>🥛 Leite Ordenhado:</span><span className="font-bold text-[#78350f]">{d.milk} baldes</span></div>
                <div className="flex items-center gap-1.5"><span>🧶 Novelo de Lã:</span><span className="font-bold text-[#78350f]">{d.wool} fardos</span></div>
                <div className="flex items-center gap-1.5"><span>🧀 Queijo Nobre:</span><span className="font-bold text-yellow-600 font-extrabold">{d.cheese} un</span></div>
                <div className="flex items-center gap-1.5"><span>🧣 Cachecóis Tecidos:</span><span className="font-bold text-indigo-600 font-extrabold">{d.scarf} un</span></div>
                <div className="flex items-center gap-1.5"><span>🥚 Ovos Coletados:</span><span className="font-bold text-orange-600">{d.egg || 0} un</span></div>
                <div className="flex items-center gap-1.5"><span>🥣 Maionese Pronta:</span><span className="font-bold text-[#78350f]">{d.mayo || 0} un</span></div>
                <div className="flex items-center gap-1.5 col-span-2 border-t border-dashed border-stone-200 pt-1.5 mt-1.5">
                  <span>🐂 Bois Vendidos na Feira:</span><span className="font-bold text-[#78350f]">{d.oxSold} animais</span>
                </div>
                {weeklyTaxPaid > 0 && (
                  <div className="flex items-center gap-1.5 col-span-2 text-red-700">
                    <span>🏛️ Imposto pago:</span><span className="font-bold">-{weeklyTaxPaid} moedas</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 col-span-2 text-blue-700">
                  <span>💧 Água gasta:</span><span className="font-bold">-{d.waterCost || 0} moedas</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 text-amber-700">
                  <span>⚡ Energia gasta:</span><span className="font-bold">-{d.energyCost || 0} moedas</span>
                </div>
              </div>
            </div>

            {workers.length > 0 && (
              <div className="bg-white/75 border-2 border-[#fbbf24] rounded-2xl p-4 shadow-sm">
                <h4 className="font-display font-black text-xs text-[#78350f] uppercase tracking-wider mb-2 border-b border-stone-200 pb-1">👷 Salários da Semana</h4>
                <div className="space-y-1.5 text-xs font-mono text-stone-700">
                  {workers.map(worker => {
                    const def = workerTypes.find(w => w.role === worker.role);
                    return (
                      <div key={worker.id} className="flex items-center justify-between">
                        <span>{def?.emoji ?? '👷'} {worker.name} ({worker.role})</span>
                        <span className="font-bold text-red-600">-{worker.dailyCost * 7} moedas</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between border-t border-stone-200 pt-1.5 mt-1">
                    <span className="font-black uppercase text-stone-800">Total Funcionários:</span>
                    <span className="font-black text-red-700">-{workers.reduce((sum, w) => sum + w.dailyCost * 7, 0)} moedas</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-4 text-xs leading-relaxed text-indigo-950 flex gap-2.5 items-start">
              <span className="text-xl shrink-0">🧙‍♂️</span>
              <div>
                <div className="font-bold text-indigo-900 uppercase tracking-widest text-[9px] mb-0.5">Dica de Gestão do Consultor:</div>
                {d.cheese === 0 && d.scarf === 0
                  ? 'Seu Ateliê está ocioso! Transforme seu Leite Cru e Lã Crua em Queijo Nobre e Cachecol. Itens manufaturados dobram seu retorno de moedas!'
                  : d.earnings < 120
                  ? 'Faturamento baixo! Compre mais Vacas Leiteiras ou tosquie Ovelhas. Climas de Sol Forte dão leite extra diariamente!'
                  : d.spending > d.earnings
                  ? 'Cuidado! Suas despesas excederam o lucro semanal. Certifique-se de vender os Bois Gordos quando atingirem o status Premium na feira!'
                  : 'Sua gestão está excelente! Aproveite as visitas periódicas do Mercador Viajante para escoar sua produção manufaturada com bônus de 1.5x moedas!'}
              </div>
            </div>
          </div>

          <div className="bg-indigo-900/10 p-4 border-t-2 border-indigo-900/20 flex justify-end shrink-0">
            <button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer">
              Confirmar Balanço
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklyReportModal;
