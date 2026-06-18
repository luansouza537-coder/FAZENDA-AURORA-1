import React from 'react';
import { FinancialEntry } from '../types';

interface InsuranceState { active: boolean; daysLeft: number; }

interface FinancasModalProps {
  currentDay: number;
  farmLevel: number;
  financialLog: FinancialEntry[];
  gold: number;
  loanActive: boolean;
  loanAmount: number;
  loanInterestRate: number;
  loanWeeksLeft: number;
  loanDaysUntilInterest: number;
  onClose: () => void;
  setGold: (fn: (prev: number) => number) => void;
  setLoanActive: (v: boolean) => void;
  setLoanAmount: (v: number) => void;
  setLoanInterestRate: (v: number) => void;
  setLoanWeeksLeft: (v: number) => void;
  setLoanDaysUntilInterest: (v: number) => void;
  addLog: (msg: string, type: string) => void;
  triggerAudioResult: (fn: () => void) => void;
  sfx: { playSound: (s: string) => void };
  checkAndUnlockAchievement: (id: string) => void;
}

const catEmoji: Record<string, string> = {
  venda: '🛒', compra: '🛍️', custo_diario: '💧', trabalhador: '👷',
  imposto: '🏛️', evento: '🎲', emprestimo: '🏦', outro: '💫',
};

const LOAN_TIERS = [
  { amount: 200,   rate: 0.06, weeks: 3, label: 'Micro',   minLevel: 1,  desc: '200💰 • 6%/sem • 3 sem'  },
  { amount: 500,   rate: 0.05, weeks: 4, label: 'Pequeno', minLevel: 3,  desc: '500💰 • 5%/sem • 4 sem'  },
  { amount: 1500,  rate: 0.08, weeks: 5, label: 'Médio',   minLevel: 5,  desc: '1.500💰 • 8%/sem • 5 sem' },
  { amount: 4000,  rate: 0.12, weeks: 6, label: 'Grande',  minLevel: 8,  desc: '4.000💰 • 12%/sem • 6 sem' },
  { amount: 10000, rate: 0.15, weeks: 8, label: 'Mega',    minLevel: 12, desc: '10.000💰 • 15%/sem • 8 sem' },
];

const FinancasModal: React.FC<FinancasModalProps> = (p) => {
  const { currentDay, farmLevel, financialLog, gold, loanActive, loanAmount, loanInterestRate, loanWeeksLeft, loanDaysUntilInterest, onClose } = p;

  const todayEntries = financialLog.filter(e => e.day === currentDay);
  const todayIncome = todayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const todayExpense = todayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const todayNet = todayIncome - todayExpense;
  const days = [...new Set(financialLog.map(e => e.day))].sort((a, b) => b - a);

  const availableTiers = LOAN_TIERS.filter(t => farmLevel >= t.minLevel);
  const nextTier = LOAN_TIERS.find(t => farmLevel < t.minLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-stone-900 border-4 border-emerald-600 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-emerald-700">
          <h2 className="text-emerald-300 font-mono font-black text-base uppercase tracking-wide">💰 Finanças da Fazenda</h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-white text-xl font-bold cursor-pointer">✕</button>
        </div>

        {/* Resumo do dia */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-stone-700">
          <div className="bg-emerald-900/60 border border-emerald-600 rounded-xl p-3 text-center">
            <div className="text-[10px] text-emerald-400 font-mono uppercase mb-1">Receita Hoje</div>
            <div className="text-emerald-300 font-mono font-black text-sm">+{todayIncome}💰</div>
          </div>
          <div className="bg-red-900/60 border border-red-700 rounded-xl p-3 text-center">
            <div className="text-[10px] text-red-400 font-mono uppercase mb-1">Despesas Hoje</div>
            <div className="text-red-300 font-mono font-black text-sm">-{todayExpense}💰</div>
          </div>
          <div className={`border rounded-xl p-3 text-center ${todayNet >= 0 ? 'bg-emerald-900/60 border-emerald-600' : 'bg-red-900/60 border-red-700'}`}>
            <div className="text-[10px] text-stone-400 font-mono uppercase mb-1">Saldo Hoje</div>
            <div className={`font-mono font-black text-sm ${todayNet >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{todayNet >= 0 ? '+' : ''}{todayNet}💰</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Banco Rural */}
          <div className="px-5 py-4 border-b border-stone-700">
            <h3 className="text-violet-300 font-mono font-black text-sm uppercase tracking-wide mb-3">🏦 Banco Rural — Empréstimo</h3>
            {loanActive ? (
              <div className="bg-stone-800 border border-violet-600 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-400">Valor emprestado</span>
                  <span className="text-white font-black">{loanAmount.toLocaleString()}💰</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-400">Juros semanais</span>
                  <span className="text-red-300 font-black">{Math.round(loanInterestRate * 100)}% — próximo em {loanDaysUntilInterest}d</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-400">Semanas restantes</span>
                  <span className="text-amber-300 font-black">{loanWeeksLeft} sem</span>
                </div>
                <button
                  disabled={gold < loanAmount}
                  onClick={() => {
                    if (gold >= loanAmount) {
                      p.setGold(prev => prev - loanAmount);
                      p.setLoanActive(false);
                      p.setLoanAmount(0);
                      p.setLoanWeeksLeft(0);
                      p.addLog(`🏦 Empréstimo quitado antecipadamente! -${loanAmount}💰`, 'success');
                      p.triggerAudioResult(() => p.sfx.playSound('levelup'));
                      setTimeout(() => p.checkAndUnlockAchievement('loan_paid'), 0);
                    }
                  }}
                  className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all mt-1 cursor-pointer ${gold >= loanAmount ? 'bg-violet-500 hover:bg-violet-400 text-white border-violet-700' : 'bg-stone-700 text-stone-400 border-stone-600 cursor-not-allowed opacity-60'}`}
                >
                  Quitar Antecipado ({loanAmount.toLocaleString()}💰)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-400 font-mono">Receba ouro agora e pague juros semanais. Opções desbloqueadas por nível:</p>
                {availableTiers.length === 0 && (
                  <div className="text-center text-stone-500 text-xs font-mono py-3">Nenhum empréstimo disponível no nível {farmLevel}.</div>
                )}
                {LOAN_TIERS.map(opt => {
                  const unlocked = farmLevel >= opt.minLevel;
                  return (
                    <div key={opt.amount} className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${unlocked ? 'bg-stone-800 border-violet-700' : 'bg-stone-800/40 border-stone-700 opacity-50'}`}>
                      <div>
                        <div className="text-xs font-mono font-black text-white">{opt.label}</div>
                        <div className="text-[10px] font-mono text-stone-400">{opt.desc}</div>
                        {!unlocked && <div className="text-[9px] font-mono text-amber-400">🔒 Nível {opt.minLevel}+</div>}
                      </div>
                      <button
                        disabled={!unlocked}
                        onClick={() => {
                          p.setGold(prev => prev + opt.amount);
                          p.setLoanActive(true);
                          p.setLoanAmount(opt.amount);
                          p.setLoanInterestRate(opt.rate);
                          p.setLoanWeeksLeft(opt.weeks);
                          p.setLoanDaysUntilInterest(7);
                          p.addLog(`🏦 Empréstimo de ${opt.amount}💰 obtido! Juros: ${Math.round(opt.rate * 100)}%/semana por ${opt.weeks} semanas.`, 'success');
                          p.triggerAudioResult(() => p.sfx.playSound('levelup'));
                          setTimeout(() => p.checkAndUnlockAchievement('loan_taken'), 0);
                        }}
                        className={`text-xs font-mono font-black py-1.5 px-3 rounded-xl border-b-2 transition-all cursor-pointer shrink-0 ml-3 ${unlocked ? 'bg-violet-500 hover:bg-violet-400 text-white border-violet-700' : 'bg-stone-600 text-stone-400 border-stone-700 cursor-not-allowed'}`}
                      >
                        {unlocked ? 'Pegar' : `🔒 Nv${opt.minLevel}`}
                      </button>
                    </div>
                  );
                })}
                {nextTier && (
                  <p className="text-[10px] text-stone-500 font-mono text-center pt-1">Próxima opção: {nextTier.label} no nível {nextTier.minLevel}</p>
                )}
              </div>
            )}
          </div>

          {/* Histórico */}
          <div className="px-5 py-3 space-y-4">
            <h3 className="text-stone-400 font-mono font-black text-xs uppercase tracking-wide">📋 Histórico de Transações</h3>
            {financialLog.length === 0 ? (
              <div className="text-center text-stone-500 text-sm py-8">Nenhuma transação registrada ainda.</div>
            ) : days.map(day => {
              const entries = financialLog.filter(e => e.day === day);
              return (
                <div key={day}>
                  <div className="text-[10px] font-mono font-black text-stone-500 uppercase tracking-wider mb-1.5">Dia {day}</div>
                  <div className="space-y-1">
                    {entries.map(entry => (
                      <div key={entry.id} className="flex items-center gap-2 bg-stone-800 rounded-lg px-3 py-2">
                        <span className="text-base">{catEmoji[entry.category] ?? '💫'}</span>
                        <span className="flex-1 text-[11px] text-stone-300 font-mono truncate">{entry.description}</span>
                        <span className={`font-mono font-black text-xs ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {entry.type === 'income' ? '+' : '-'}{entry.amount}💰
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancasModal;
