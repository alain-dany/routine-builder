
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X,
  Star,
  GripVertical,
  PlayCircle
} from 'lucide-react';
import { Exercise, Category } from '../types';

interface SidebarProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
}

const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  if (!id) return null;
  const origin = window.location.origin;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}&enablejsapi=1`;
};

const Sidebar: React.FC<SidebarProps> = ({ exercises, setExercises, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    category: categories[0]?.name || 'Mobility',
    videoUrl: '',
    rating: 0
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: categories[0]?.name || 'Mobility',
      videoUrl: '',
      rating: 0
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) return;
    
    if (editingId) {
      setExercises(prev => prev.map(ex => ex.id === editingId ? { ...ex, ...formData } as Exercise : ex));
    } else {
      const newEx: Exercise = {
        id: Date.now(),
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category || categories[0]?.name || 'Mobility',
        videoUrl: formData.videoUrl || '',
        rating: formData.rating || 0,
      };
      setExercises(prev => [...prev, newEx]);
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

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = categories.map(cat => ({
    category: cat,
    items: filteredExercises.filter(ex => ex.category === cat.name)
  })).filter(g => g.items.length > 0);

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
      <div className="p-5 border-b border-gray-50 bg-gray-50/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Exercise Library</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm"
          >
            <Plus size={16} /> <span>New</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Filter library..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm space-y-4 relative animate-in fade-in slide-in-from-top-2 duration-200">
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
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</label>
                  <StarRating rating={formData.rating || 0} onRate={r => setFormData({...formData, rating: r})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Instructions for the exercise..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Video Link (YouTube)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="Paste URL to enable in-app player"
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

        {grouped.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No exercises found.</p>
          </div>
        ) : (
          grouped.map(({ category, items }) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className={`w-2 h-2 rounded-full ${category.color}`} />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category.name}</h4>
              </div>
              <div className="space-y-1.5">
                {items.map(ex => {
                  const embedUrl = ex.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;
                  const isExpanded = expandedVideoId === ex.id;
                  
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
                        <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
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
                          {ex.rating > 0 && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[...Array(ex.rating)].map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-gray-200">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              frameBorder="0"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
