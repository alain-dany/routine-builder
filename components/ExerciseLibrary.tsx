
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Star,
  PlayCircle,
  X
} from 'lucide-react';
import { Exercise, Category } from '../types';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
  onPlayVideo: (url: string) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ exercises, setExercises, categories, onPlayVideo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleCategory = (catName: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(catName)) {
      newCollapsed.delete(catName);
    } else {
      newCollapsed.add(catName);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleDelete = (id: number) => {
    if (confirm("Permanently delete this exercise?")) {
      setExercises(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEdit = (ex: Exercise) => {
    setEditingEx(ex);
    setShowAddForm(true);
  };

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groups = categories.map(cat => ({
    category: cat,
    items: filteredExercises.filter(ex => ex.category === cat.name)
  })).filter(g => g.items.length > 0 || searchTerm === '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exercise Library</h2>
          <p className="text-gray-500">View and manage your entire exercise catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search exercises..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingEx(null); setShowAddForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all whitespace-nowrap"
          >
            <Plus size={20} /> Add New
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{editingEx ? 'Edit Exercise' : 'Create Exercise'}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <ExerciseForm 
                initialData={editingEx || undefined} 
                categories={categories} 
                onSave={(data) => {
                  if (editingEx) {
                    setExercises(prev => prev.map(ex => ex.id === editingEx.id ? { ...ex, ...data } as Exercise : ex));
                  } else {
                    setExercises(prev => [...prev, { ...data, id: Date.now() } as Exercise]);
                  }
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {groups.map(({ category, items }) => (
          <div 
            key={category.name} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden"
          >
            {/* Folder Header */}
            <div 
              className={`h-2 w-full ${category.color}`}
            />
            <button 
              onClick={() => toggleCategory(category.name)}
              className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${category.color}`} />
                <h3 className="font-bold text-gray-700">{category.name}</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              {collapsedCategories.has(category.name) ? <ChevronRight size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {/* Folder Content */}
            {!collapsedCategories.has(category.name) && (
              <div className="p-3 space-y-3 min-h-[50px] bg-white animate-in slide-in-from-top-2 duration-200">
                {items.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400 italic">No matching exercises</p>
                ) : (
                  items.map(ex => (
                    <div 
                      key={ex.id} 
                      onClick={() => ex.videoUrl && onPlayVideo(ex.videoUrl)}
                      className={`group p-4 bg-gray-50 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/30 transition-all ${ex.videoUrl ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-sm">{ex.title}</h4>
                          {ex.videoUrl && <PlayCircle size={14} className="text-blue-500" />}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(ex); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                        {ex.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              fill={i < ex.rating ? 'currentColor' : 'none'} 
                              className={i < ex.rating ? 'text-yellow-400' : 'text-gray-200'} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExerciseForm: React.FC<{ 
  initialData?: Exercise, 
  categories: Category[], 
  onSave: (data: Partial<Exercise>) => void,
  onCancel: () => void
}> = ({ initialData, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Exercise>>(initialData || {
    title: '',
    description: '',
    category: categories[0]?.name || 'Mobility',
    videoUrl: '',
    rating: 0
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Chin Tuck"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</label>
          <div className="flex items-center h-full pt-1">
            {[1,2,3,4,5].map(r => (
              <button 
                key={r} 
                onClick={() => setFormData({ ...formData, rating: r })}
                className={`p-1 ${r <= (formData.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                <Star size={20} fill={r <= (formData.rating || 0) ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</label>
        <textarea 
          value={formData.description} 
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Step by step instructions..."
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Video Link (YouTube)</label>
        <input 
          type="text" 
          value={formData.videoUrl} 
          onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="YouTube URL..."
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button 
          onClick={() => onSave(formData)}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md"
        >
          {initialData ? 'Update Exercise' : 'Save Exercise'}
        </button>
        <button 
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
