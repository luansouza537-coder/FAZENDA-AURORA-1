import React from 'react';
import { FinancialEntry } from '../types';

interface FinancasModalProps {
  currentDay: number;
  financialLog: FinancialEntry[];
  onClose: () => void;
}

const catEmoji: Record<string, string> = {
  venda: '🛒', compra: '🛍️', custo_diario: '💧', trabalhador: '👷',
  imposto: '🏛️', evento: '🎲', emprestimo: '🏦', outro: '💫',
};

const FinancasModal: React.FC<FinancasModalProps> = ({ currentDay, financialLog, onClose }) => {
  const todayEntries = financialLog.filter(e => e.day === currentDay);
  const todayIncome = todayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const todayExpense = todayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const todayNet = todayIncome - todayExpense;
  const days = [...new Set(financialLog.map(e => e.day))].sort((a, b) => b - a);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-stone-900 border-4 border-emerald-600 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-emerald-700">
          <h2 className="text-emerald-300 font-mono font-black text-base uppercase tracking-wide">💰 Finanças da Fazenda</h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-white text-xl font-bold cursor-pointer">✕</button>
        </div>
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
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4" style={{ scrollbarWidth: 'thin' }}>
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
  );
};

export default FinancasModal;
