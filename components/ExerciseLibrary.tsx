
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
  X,
  Check,
  PlusCircle,
  FolderPlus,
  Tag
} from 'lucide-react';
import { Exercise, Category } from '../types';
import { COLORS } from '../constants';

interface ExerciseLibraryProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onPlayVideo: (url: string) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  exercises, 
  setExercises, 
  categories, 
  setCategories,
  onPlayVideo 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Category States
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedCatColor, setSelectedCatColor] = useState(COLORS[0]);

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

  const handleAddNewToCategory = (catName: string) => {
    setEditingEx({
      id: 0,
      title: '',
      description: '',
      categories: [catName],
      videoUrl: '',
      rating: 0
    });
    setShowAddForm(true);
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }
    setCategories(prev => [...prev, { name: newCatName.trim(), color: selectedCatColor }]);
    setNewCatName('');
    setShowNewCatForm(false);
  };

  const handleDeleteCategory = (catName: string) => {
    const usage = exercises.filter(ex => ex.categories.includes(catName)).length;
    
    const message = usage > 0 
      ? `This category "${catName}" contains ${usage} exercise(s). Are you sure you want to delete it? The exercises will remain in your library but won't be tagged with "${catName}" anymore.`
      : `Are you sure you want to delete the "${catName}" category?`;

    if (confirm(message)) {
      // Remove category from list
      setCategories(prev => prev.filter(c => c.name !== catName));
      
      // Clean up exercises: remove this category from any exercise that has it
      setExercises(prev => prev.map(ex => ({
        ...ex,
        categories: ex.categories.filter(c => c !== catName)
      })));
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ex.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group and Sort logic: Most exercises at the top, unused at bottom
  const groups = categories.map(cat => ({
    category: cat,
    items: filteredExercises.filter(ex => ex.categories.includes(cat.name))
  })).sort((a, b) => {
    // Primary sort: Count (descending)
    if (b.items.length !== a.items.length) {
      return b.items.length - a.items.length;
    }
    // Secondary sort: Alphabetical
    return a.category.name.localeCompare(b.category.name);
  });

  // Filter groups only if searching, otherwise show all
  const displayedGroups = searchTerm ? groups.filter(g => g.items.length > 0) : groups;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exercise Library</h2>
          <p className="text-gray-500">View and manage your catalog by category</p>
        </div>
        <div className="flex flex-col gap-3">
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
      </div>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {displayedGroups.map(({ category, items }) => (
          <div 
            key={category.name} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden group/cat"
          >
            <div className={`h-2 w-full ${category.color}`} />
            <div className="flex items-center justify-between bg-gray-50/50 hover:bg-gray-100 transition-colors">
              <button 
                onClick={() => toggleCategory(category.name)}
                className="flex flex-1 items-center gap-3 p-4 text-left"
              >
                <span className={`w-3 h-3 rounded-full ${category.color}`} />
                <h3 className="font-bold text-gray-700">{category.name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${items.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200/50 text-gray-400'}`}>
                  {items.length}
                </span>
                {collapsedCategories.has(category.name) ? <ChevronRight size={18} className="text-gray-400 ml-auto" /> : <ChevronDown size={18} className="text-gray-400 ml-auto" />}
              </button>
              <div className="flex items-center mr-2">
                <button 
                  onClick={() => handleAddNewToCategory(category.name)}
                  title={`Add exercise to ${category.name}`}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PlusCircle size={20} />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.name)}
                  className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/cat:opacity-100 transition-opacity"
                  title="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {!collapsedCategories.has(category.name) && (
              <div className="p-3 space-y-3 min-h-[50px] bg-white animate-in slide-in-from-top-2 duration-200">
                {items.length === 0 ? (
                  <p className="text-center py-6 text-xs text-gray-400 italic">No exercises here</p>
                ) : (
                  items.map(ex => (
                    <div 
                      key={ex.id} 
                      onClick={() => ex.videoUrl && onPlayVideo(ex.videoUrl)}
                      className={`group/ex p-4 bg-gray-50 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/30 transition-all ${ex.videoUrl ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-sm">{ex.title}</h4>
                            {ex.videoUrl && <PlayCircle size={14} className="text-blue-500" />}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ex.categories.map(c => {
                              const cInfo = categories.find(ci => ci.name === c);
                              return (
                                <span key={c} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${cInfo?.color || 'bg-gray-400'}`}>
                                  {c}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/ex:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(ex); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                        {ex.description || 'No description.'}
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
                
                <button 
                  onClick={() => handleAddNewToCategory(category.name)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all mt-2"
                >
                  <Plus size={14} /> Add to {category.name}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Inline Add Category Button/Form */}
        <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[120px] justify-center transition-all hover:bg-white hover:border-blue-300">
          {!showNewCatForm ? (
            <button 
              onClick={() => setShowNewCatForm(true)}
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-gray-400 hover:text-blue-500 transition-all"
            >
              <FolderPlus size={32} />
              <span className="text-xs font-black uppercase tracking-widest">New Category</span>
            </button>
          ) : (
            <div className="p-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Tag size={12} /> Label Creator
                </h4>
                <button onClick={() => setShowNewCatForm(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <input 
                type="text" 
                placeholder="Category Name..." 
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {COLORS.slice(0, 10).map(color => (
                  <button 
                    key={color} 
                    onClick={() => setSelectedCatColor(color)}
                    className={`w-5 h-5 rounded-full ${color} transition-all ${selectedCatColor === color ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
              <button 
                onClick={handleCreateCategory}
                disabled={!newCatName.trim()}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Create Category
              </button>
            </div>
          )}
        </div>
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : c.color}`} />
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
