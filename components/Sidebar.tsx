
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X,
  Star,
  GripVertical,
  PlayCircle,
  Check,
  PlusCircle,
  Filter,
  FolderPlus,
  Tag
} from 'lucide-react';
import { Exercise, Category, Routine } from '../types';
import { COLORS } from '../constants';

interface SidebarProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  routines: Routine[];
}

const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`;
};

const Sidebar: React.FC<SidebarProps> = ({ exercises, setExercises, categories, setCategories, routines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Category Management States
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormColor, setCatFormColor] = useState(COLORS[0]);
  
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    categories: [],
    videoUrl: '',
    rating: 0
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categories: [],
      videoUrl: '',
      rating: 0
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) return;
    
    const finalData: Exercise = {
      id: editingId || Date.now(),
      title: formData.title || '',
      description: formData.description || '',
      categories: formData.categories || [],
      videoUrl: formData.videoUrl || '',
      rating: formData.rating || 0,
    };

    if (editingId) {
      setExercises(prev => prev.map(ex => ex.id === editingId ? finalData : ex));
    } else {
      setExercises(prev => [...prev, finalData]);
    }
    resetForm();
  };

  const handleEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setFormData({ ...ex });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this exercise from library?")) {
      setExercises(prev => prev.filter(e => e.id !== id));
    }
  };

  const toggleCategorySelection = (catName: string) => {
    setFormData(prev => {
      const currentCats = prev.categories || [];
      const newCats = currentCats.includes(catName)
        ? currentCats.filter(c => c !== catName)
        : [...currentCats, catName];
      return { ...prev, categories: newCats };
    });
  };

  const toggleFilterCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) 
        ? prev.filter(c => c !== catName) 
        : [...prev, catName]
    );
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
      ? `This category "${catName}" contains ${usage} exercise(s). Are you sure you want to delete it?`
      : `Delete "${catName}"?`;

    if (confirm(message)) {
      setCategories(prev => prev.filter(c => c.name !== catName));
      setExercises(prev => prev.map(ex => ({
        ...ex,
        categories: ex.categories.filter(c => c !== catName)
      })));
      setSelectedCategories(prev => prev.filter(c => c !== catName));
    }
  };

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

  const filteredExercises = useMemo(() => {
    return exercises
      .filter(ex => {
        const matchesSearch = 
          ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          ex.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = 
          selectedCategories.length === 0 || 
          ex.categories.some(c => selectedCategories.includes(c));
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Frequency (desc)
        const freqA = exerciseFrequency[a.id] || 0;
        const freqB = exerciseFrequency[b.id] || 0;
        if (freqB !== freqA) return freqB - freqA;
        // Alphabetical
        return a.title.localeCompare(b.title);
      });
  }, [exercises, searchTerm, selectedCategories, exerciseFrequency]);

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          <Star size={16} fill={rating >= star ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-5 border-b border-gray-50 bg-gray-50/30 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Library</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm"
          >
            <Plus size={16} /> <span>New</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all ${showFilters || selectedCategories.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 pb-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Labels</span>
              <button 
                onClick={() => {
                  setEditingCatName(null);
                  setCatFormName('');
                  setCatFormColor(COLORS[0]);
                  setShowCatForm(true);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-[9px] font-black uppercase tracking-widest"
              >
                <FolderPlus size={10} /> New
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => {
                const isActive = selectedCategories.includes(cat.name);
                return (
                  <div key={cat.name} className="flex items-center group/cat">
                    <button
                      onClick={() => toggleFilterCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'}`}
                    >
                      <div 
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : ''}`} 
                        style={!isActive ? { backgroundColor: cat.color } : {}}
                      />
                      {cat.name}
                    </button>
                    <div className="flex items-center w-0 overflow-hidden group-hover/cat:w-10 transition-all ml-0.5">
                      <button onClick={() => handleEditCategory(cat)} className="text-gray-400 hover:text-blue-600 p-0.5 transition-colors"><Edit2 size={10} /></button>
                      <button onClick={() => handleDeleteCategory(cat.name)} className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"><Trash2 size={10} /></button>
                    </div>
                  </div>
                );
              })}
              {selectedCategories.length > 0 && (
                <button 
                  onClick={() => setSelectedCategories([])}
                  className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline px-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
        {showCatForm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
                  <Tag size={12} /> {editingCatName ? 'Update Label' : 'New Label'}
                </h4>
                <button onClick={() => setShowCatForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <input 
                type="text" 
                placeholder="Name..." 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={catFormName}
                onChange={e => setCatFormName(e.target.value)}
                autoFocus
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Color</span>
                  <input 
                    type="color" 
                    value={catFormColor}
                    onChange={e => setCatFormColor(e.target.value)}
                    className="w-6 h-6 rounded p-0 border-0 cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.slice(0, 10).map(color => (
                    <button 
                      key={color} 
                      onClick={() => setCatFormColor(color)}
                      className="w-4 h-4 rounded-full transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: catFormColor === color ? `0 0 0 1px white, 0 0 0 2px ${color}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSaveCategory}
                  disabled={!catFormName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingCatName ? 'Update' : 'Create'}
                </button>
                <button onClick={() => setShowCatForm(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm space-y-4 relative animate-in fade-in slide-in-from-top-2 duration-200 mb-4">
            <button onClick={resetForm} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
            <h3 className="font-bold text-gray-800 text-sm">{editingId ? 'Update Exercise' : 'Create Exercise'}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Chin Tuck Hold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-100 rounded-lg max-h-32 overflow-y-auto">
                      {categories.map(c => {
                        const isSelected = formData.categories?.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            onClick={() => toggleCategorySelection(c.name)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-blue-200'}`}
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
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</label>
                <StarRating rating={formData.rating || 0} onRate={r => setFormData({...formData, rating: r})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Instructions..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">YouTube Link</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="Paste URL..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSave}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Add to Library'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No exercises found.</p>
            </div>
          ) : (
            filteredExercises.map(ex => {
              const embedUrl = ex.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;
              const isExpanded = expandedVideoId === ex.id;
              const freq = exerciseFrequency[ex.id] || 0;
              
              return (
                <div 
                  key={ex.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('exerciseId', ex.id.toString());
                  }}
                  className="group flex flex-col bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 p-3">
                    <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="text-sm font-semibold text-gray-700 truncate">{ex.title}</p>
                        {embedUrl && (
                          <button 
                            onClick={() => setExpandedVideoId(isExpanded ? null : ex.id)}
                            className={`transition-colors ${isExpanded ? 'text-blue-700' : 'text-blue-500 hover:text-blue-700'}`}
                          >
                            <PlayCircle size={14} />
                          </button>
                        )}
                      </div>
                      {/* Category Dots */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ex.categories.map(c => {
                          const cInfo = categories.find(ci => ci.name === c);
                          return (
                            <div 
                              key={c} 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: cInfo?.color || '#94a3b8' }}
                              title={c} 
                            />
                          );
                        })}
                        {freq > 0 && (
                          <span className="text-[8px] font-black text-gray-400 uppercase ml-1">Used {freq}x</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => handleEdit(ex)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ex.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && embedUrl && (
                    <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-gray-200 shadow-inner">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
