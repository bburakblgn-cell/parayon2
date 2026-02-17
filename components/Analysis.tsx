
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Transaction, CategoryDef } from '../types';

interface AnalysisProps {
  transactions: Transaction[];
  categories: CategoryDef[];
}

const INCOME_META: Record<string, { icon: string, color: string, name: string, bg: string }> = {
  'maas': { icon: '💰', color: '#22c55e', name: 'Maaş', bg: 'bg-green-500' },
  'yan_gelir': { icon: '🚀', color: '#34d399', name: 'Yan Gelir', bg: 'bg-emerald-400' },
  'hediye': { icon: '🎁', color: '#fbbf24', name: 'Hediye', bg: 'bg-yellow-400' },
  'diger_gelir': { icon: '💳', color: '#60a5fa', name: 'Diğer Gelir', bg: 'bg-blue-400' },
};

const Analysis: React.FC<AnalysisProps> = ({ transactions, categories }) => {
  const chartData = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    return Object.entries(totals).map(([catId, val]) => {
      const catDef = categories.find(c => c.id === catId);
      return {
        name: catDef?.name || catId,
        value: val,
        percentage: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
        color: catDef?.color || '#3b82f6',
        icon: catDef?.icon || '💰',
        bg: catDef?.bg || 'bg-blue-500'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="px-6 pt-8">
      {/* Month Selector */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-6 mb-2">
          <h2 className="text-xl font-bold">Güncel Durum</h2>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tüm Zamanlar Analizi</p>
      </div>

      {/* Donut Chart */}
      <div className="relative h-64 w-full flex items-center justify-center mb-8">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-center px-4">
             Henüz harcama verisi yok
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Toplam Harcama</p>
          <p className="text-3xl font-extrabold">₺{totalSpent.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Insight Banner */}
      {chartData.length > 0 && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 mb-8 border-blue-500/10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            En çok harcama <span className="text-blue-400 font-bold">{chartData[0].name}</span> kategorisinde yapıldı.
          </p>
        </div>
      )}

      {/* Breakdown */}
      <div className="mb-8">
        <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">Harcama Detayları</h3>
        <div className="space-y-3">
          {chartData.map((cat) => (
            <div key={cat.name} className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{cat.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Toplam harcamanın %{cat.percentage}'i</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">₺{cat.value.toLocaleString('tr-TR')}</p>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${cat.bg} rounded-full transition-all duration-1000`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-dashed border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">
                💵
              </div>
              <div>
                <h4 className="font-bold text-sm">Toplam Gelir</h4>
                <p className="text-[10px] text-slate-500 font-medium">Sisteme giren toplam miktar</p>
              </div>
            </div>
            <p className="font-bold text-green-400">₺{totalIncome.toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
