
import React, { useState } from 'react';
import { Plus, Trash2, Tag, X, Check } from 'lucide-react';
import { Category, Exercise } from '../types';
import { COLORS } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  exercises: Exercise[];
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories, exercises }) => {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    if (categories.find(c => c.name.toLowerCase() === newName.toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }
    setCategories([...categories, { name: newName.trim(), color: selectedColor }]);
    setNewName('');
    setShowForm(false);
  };

  const handleDelete = (name: string) => {
    const usageCount = exercises.filter(ex => ex.category === name).length;
    
    if (usageCount > 0) {
      alert(`Cannot delete "${name}" because it is currently assigned to ${usageCount} exercise(s). Please change the category of those exercises before deleting this label.`);
      return;
    }

    if (confirm(`Are you sure you want to remove the "${name}" label?`)) {
      setCategories(prev => prev.filter(c => c.name !== name));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Category Labels</h2>
          <p className="text-gray-500 text-sm">Organize your library with custom colored tags</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Create New Label
        </button>
      </div>

      {/* Add Category Form Modal-style */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Tag size={20} />
              </div>
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">New Label Config</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Label Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-bold"
                  placeholder="e.g. Rehabilitation"
                  autoFocus
                />
              </div>
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Categories help you group exercises in the library and filter them when building routines.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Pick Label Color</label>
              <div className="grid grid-cols-5 gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`aspect-square rounded-xl ${color} transition-all relative flex items-center justify-center group overflow-hidden ${selectedColor === color ? 'ring-4 ring-offset-2 ring-gray-300 scale-95' : 'hover:scale-105 shadow-sm'}`}
                    title={color.replace('bg-', '').replace('-500', '')}
                  >
                    {selectedColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              Create Category
            </button>
            <button 
              onClick={() => setShowForm(false)}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map(cat => (
          <div key={cat.name} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`w-5 h-5 rounded-full ${cat.color} shadow-inner flex-shrink-0 ring-4 ring-gray-50`} />
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{cat.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                  {exercises.filter(e => e.category === cat.name).length} Active
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(cat.name)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Label"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <Tag size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-medium">No categories yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
