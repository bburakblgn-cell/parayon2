
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, CategoryDef } from '../types';

interface BudgetProps {
  balance: number;
  transactions: Transaction[];
  categories: CategoryDef[];
  onAddCategory: (cat: Omit<CategoryDef, 'id'>) => void;
  onUpdateCategory: (cat: CategoryDef) => void;
  onDeleteCategory: (id: string) => void;
}

const Budget: React.FC<BudgetProps> = ({ balance, transactions, categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDef | null>(null);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newIcon, setNewIcon] = useState('📦');

  useEffect(() => {
    if (editingCategory) {
      setNewName(editingCategory.name);
      setNewLimit(editingCategory.initialBudget.toString());
      setNewIcon(editingCategory.icon);
    } else {
      setNewName('');
      setNewLimit('');
      setNewIcon('📦');
    }
  }, [editingCategory]);

  const budgetData = useMemo(() => {
    return categories.map(cat => {
      const spent = transactions
        .filter(tx => tx.category === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const available = cat.initialBudget - spent;
      return {
        ...cat,
        spent,
        available,
        percent: cat.initialBudget > 0 ? Math.min(100, (spent / cat.initialBudget) * 100) : 0
      };
    });
  }, [transactions, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLimit) return;
    
    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: newName,
        initialBudget: parseFloat(newLimit),
        icon: newIcon,
      });
    } else {
      onAddCategory({
        name: newName,
        initialBudget: parseFloat(newLimit),
        icon: newIcon,
        color: '#3b82f6',
        bg: 'bg-blue-500'
      });
    }

    setNewName('');
    setNewLimit('');
    setNewIcon('📦');
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item: CategoryDef) => {
    setEditingCategory(item);
    setIsModalOpen(true);
  };

  const icons = ['🍕', '🚕', '👕', '🏠', '🎮', '💡', '💊', '🎓', '💪', '🌴', '📦', '🎁'];

  return (
    <div className="px-6 pt-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Bütçe Yönetimi</h2>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
           ₺{balance.toLocaleString('tr-TR')} Boşta
        </div>
      </div>

      <div className="space-y-4">
        {budgetData.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl p-5 border-white/5 relative group transition-all hover:bg-slate-800/80">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white"
                title="Düzenle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => onDeleteCategory(item.id)}
                className="p-2 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500/20"
                title="Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-3 pr-20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-lg">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kalan</p>
                <p className={`text-xl font-extrabold ${item.available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₺{item.available.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">
                   <span>Harcandı: ₺{item.spent.toLocaleString('tr-TR')}</span>
                   <span>Bütçe: ₺{item.initialBudget.toLocaleString('tr-TR')}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${item.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 mb-4">
         <button 
           onClick={() => {
             setEditingCategory(null);
             setIsModalOpen(true);
           }}
           className="w-full border-2 border-dashed border-slate-700 py-4 rounded-2xl text-slate-500 font-bold hover:border-slate-500 hover:text-slate-300 transition-all flex items-center justify-center gap-2"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Yeni Kategori Ekle
         </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}></div>
          <div className="glass-card relative w-full max-w-sm rounded-[2rem] p-8 border-white/20 animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold mb-6 text-center">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Kategori Adı</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Örn: Ev Giderleri"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Aylık Bütçe (₺)</label>
                <input 
                  type="number" 
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">İkon Seç</label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${newIcon === icon ? 'bg-blue-600 scale-110' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                {editingCategory ? 'Güncelle' : 'Kategoriyi Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
