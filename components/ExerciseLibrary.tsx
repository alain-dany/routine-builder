
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Star,
  PlayCircle,
  X,
  Check,
  PlusCircle,
  FolderPlus,
  Tag
} from 'lucide-react';
import { Exercise, Category, Routine } from '../types';
import { COLORS } from '../constants';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onPlayVideo: (url: string) => void;
  routines: Routine[];
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  exercises, 
  setExercises, 
  categories, 
  setCategories,
  onPlayVideo,
  routines
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Category Management States
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormColor, setCatFormColor] = useState(COLORS[0]);

  // Calculate frequency
  const exerciseFrequency = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      let count = 0;
      routines.forEach(r => {
        count += r.exerciseItems.filter(item => item.exerciseId === ex.id).length;
        r.subRoutines.forEach(sr => {
          count += sr.exerciseItems.filter(item => item.exerciseId === ex.id).length;
        });
      });
      acc[ex.id] = count;
      return acc;
    }, {} as Record<number, number>);
  }, [exercises, routines]);

  const toggleFilterCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) 
        ? prev.filter(c => c !== catName) 
        : [...prev, catName]
    );
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

  const handleSaveCategory = () => {
    if (!catFormName.trim()) return;
    
    if (editingCatName) {
      // Edit mode
      const oldName = editingCatName;
      const newName = catFormName.trim();
      
      if (oldName !== newName && categories.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
        alert("A category with this name already exists.");
        return;
      }

      setCategories(prev => prev.map(c => c.name === oldName ? { name: newName, color: catFormColor } : c));
      
      // Update exercises that used the old name
      setExercises(prev => prev.map(ex => ({
        ...ex,
        categories: ex.categories.map(c => c === oldName ? newName : c)
      })));

      // Update active filters
      setSelectedCategories(prev => prev.map(c => c === oldName ? newName : c));
    } else {
      // Create mode
      if (categories.some(c => c.name.toLowerCase() === catFormName.trim().toLowerCase())) {
        alert("A category with this name already exists.");
        return;
      }
      setCategories(prev => [...prev, { name: catFormName.trim(), color: catFormColor }]);
    }
    
    setCatFormName('');
    setEditingCatName(null);
    setShowCatForm(false);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatName(cat.name);
    setCatFormName(cat.name);
    setCatFormColor(cat.color);
    setShowCatForm(true);
  };

  const handleDeleteCategory = (catName: string) => {
    const usage = exercises.filter(ex => ex.categories.includes(catName)).length;
    
    const message = usage > 0 
      ? `This category "${catName}" contains ${usage} exercise(s). Are you sure you want to delete it? The exercises will remain in your library but won't be tagged with "${catName}" anymore.`
      : `Are you sure you want to delete the "${catName}" category?`;

    if (confirm(message)) {
      setCategories(prev => prev.filter(c => c.name !== catName));
      setExercises(prev => prev.map(ex => ({
        ...ex,
        categories: ex.categories.filter(c => c !== catName)
      })));
      setSelectedCategories(prev => prev.filter(c => c !== catName));
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises
      .filter(ex => {
        const matchesSearch = 
          ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          ex.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
          ex.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = 
          selectedCategories.length === 0 || 
          ex.categories.some(c => selectedCategories.includes(c));
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const freqA = exerciseFrequency[a.id] || 0;
        const freqB = exerciseFrequency[b.id] || 0;
        if (freqB !== freqA) return freqB - freqA;
        return a.title.localeCompare(b.title);
      });
  }, [exercises, searchTerm, selectedCategories, exerciseFrequency]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Exercise Library</h2>
            <p className="text-sm text-gray-500">Search and filter your catalog by frequency and category</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search library..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingEx(null); setShowAddForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all whitespace-nowrap"
            >
              <Plus size={20} /> Add Exercise
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter by Category</span>
            <button 
              onClick={() => {
                setEditingCatName(null);
                setCatFormName('');
                setCatFormColor(COLORS[0]);
                setShowCatForm(true);
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <FolderPlus size={12} /> New Label
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategories([])}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategories.length === 0 ? 'bg-gray-800 text-white border-gray-800 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
            >
              All
            </button>
            {categories.map(cat => {
              const isActive = selectedCategories.includes(cat.name);
              return (
                <div key={cat.name} className="flex items-center group/cat">
                  <button
                    onClick={() => toggleFilterCategory(cat.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isActive ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm ring-1 ring-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                  <div className="flex items-center w-0 overflow-hidden group-hover/cat:w-12 transition-all ml-1">
                    <button 
                      onClick={() => handleEditCategory(cat)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title={`Edit ${cat.name}`}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.name)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title={`Delete ${cat.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCatForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
                <Tag size={16} /> {editingCatName ? 'Edit Label' : 'Label Creator'}
              </h4>
              <button 
                onClick={() => {
                  setShowCatForm(false);
                  setEditingCatName(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Category Name..." 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={catFormName}
              onChange={e => setCatFormName(e.target.value)}
              autoFocus
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pick a color</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: catFormColor }} 
                  />
                  <input 
                    type="color" 
                    value={catFormColor}
                    onChange={e => setCatFormColor(e.target.value)}
                    className="w-8 h-8 rounded p-0 border-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 py-2">
                {COLORS.slice(0, 10).map(color => (
                  <button 
                    key={color} 
                    onClick={() => setCatFormColor(color)}
                    className="w-6 h-6 rounded-full transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: color,
                      boxShadow: catFormColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleSaveCategory}
                disabled={!catFormName.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {editingCatName ? 'Update Category' : 'Create Category'}
              </button>
              <button 
                onClick={() => {
                  setShowCatForm(false);
                  setEditingCatName(null);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{editingEx && editingEx.id !== 0 ? 'Edit Exercise' : 'Create Exercise'}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <ExerciseForm 
                initialData={editingEx || undefined} 
                categories={categories} 
                onSave={(data) => {
                  if (editingEx && editingEx.id !== 0) {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Search size={48} />
              <p className="text-sm">No exercises found matches your filters.</p>
              <button 
                onClick={() => { setSelectedCategories([]); setSearchTerm(''); }}
                className="mt-2 text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          filteredExercises.map(ex => {
            const freq = exerciseFrequency[ex.id] || 0;
            return (
              <div 
                key={ex.id} 
                onClick={() => ex.videoUrl && onPlayVideo(ex.videoUrl)}
                className={`group flex flex-col bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all relative ${ex.videoUrl ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800 text-base truncate">{ex.title}</h4>
                      {ex.videoUrl && <PlayCircle size={16} className="text-blue-500 shrink-0" />}
                    </div>
                    {/* Category Dots */}
                    <div className="flex flex-wrap gap-1.5 h-3">
                      {ex.categories.map(c => {
                        const cInfo = categories.find(ci => ci.name === c);
                        return (
                          <div 
                            key={c} 
                            className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white" 
                            style={{ backgroundColor: cInfo?.color || '#94a3b8' }}
                            title={c}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(ex); }} className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }} className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                    <div className="px-2 py-0.5 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Used: {freq}x
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed flex-1 whitespace-pre-wrap">
                  {ex.description || 'No instructions provided for this exercise.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < ex.rating ? 'currentColor' : 'none'} 
                        className={i < ex.rating ? 'text-yellow-400' : 'text-gray-200'} 
                      />
                    ))}
                  </div>
                  {ex.categories.length > 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      {ex.categories[0]} {ex.categories.length > 1 ? `+${ex.categories.length - 1}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
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
    categories: [],
    videoUrl: '',
    rating: 0
  });

  const toggleCategory = (catName: string) => {
    const current = formData.categories || [];
    const updated = current.includes(catName)
      ? current.filter(c => c !== catName)
      : [...current, catName];
    setFormData({ ...formData, categories: updated });
  };

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
          autoFocus
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Categories</label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border rounded-xl border-gray-100">
          {categories.map(c => {
            const isSelected = formData.categories?.includes(c.name);
            return (
              <button 
                key={c.name}
                onClick={() => toggleCategory(c.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'}`}
              >
                <div 
                  className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : ''}`} 
                  style={!isSelected ? { backgroundColor: c.color } : {}}
                />
                {c.name}
                {isSelected && <Check size={10} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</label>
        <div className="flex items-center">
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
          {initialData && initialData.id !== 0 ? 'Update Exercise' : 'Save Exercise'}
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
