
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  Layers,
  PlayCircle,
  X,
  Search,
  Check,
  Clock,
  Download
} from 'lucide-react';
import { Routine, Exercise, Category, ExerciseItem, RoutineSchedule } from '../types.ts';

interface RoutineBuilderProps {
  routines: Routine[];
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  categories: Category[];
}

const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1` : null;
};

const ExerciseSelectorModal: React.FC<{
  exercises: Exercise[];
  categories: Category[];
  onClose: () => void;
  onSelect: (exerciseId: number) => void;
  onAddNew: (title: string) => void;
  currentExerciseIds: number[];
}> = ({ exercises, categories, onClose, onSelect, onAddNew, currentExerciseIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = exercises.filter(ex => ex.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-800">Select Exercises</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search or add missing exercise..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchTerm.trim().length > 0 && !exercises.some(e => e.title.toLowerCase() === searchTerm.toLowerCase()) && (
            <button 
              onClick={() => onAddNew(searchTerm)}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all"
            >
              <Plus size={14} /> Create "{searchTerm}" and add to routine
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {filtered.map(ex => {
            const isAdded = currentExerciseIds.includes(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5 shrink-0">
                    {(ex.categories || []).map(c => <div key={c} className={`w-1.5 h-1.5 rounded-full ${categories.find(ci => ci.name === c)?.color || 'bg-gray-400'}`} />)}
                  </div>
                  <p className="text-sm font-bold text-gray-800">{ex.title}</p>
                </div>
                {isAdded ? <Check size={16} className="text-green-600" /> : <Plus size={16} className="text-gray-300" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>
  );
};

const CompactExerciseRow: React.FC<{ 
  exerciseId: number; 
  onRemove: () => void; 
  exercises: Exercise[]; 
  categories: Category[];
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}> = ({ exerciseId, onRemove, exercises, categories, onDragStart, onDrop }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex) return null;
  const embedUrl = ex.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;

  return (
    <div draggable onDragStart={onDragStart} onDragOver={e => e.preventDefault()} onDrop={onDrop} className="group flex flex-col bg-white border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/50">
      <div className="flex items-start gap-3 px-3 py-3">
        <GripVertical size={14} className="mt-1 text-gray-300 group-hover:text-blue-400 cursor-grab shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 truncate">{ex.title}</span>
            {embedUrl && <button onClick={() => setIsVideoOpen(!isVideoOpen)} className="text-blue-500 hover:text-blue-700 shrink-0"><PlayCircle size={14} /></button>}
            <div className="flex gap-1 shrink-0">
              {(ex.categories || []).map(cat => <span key={cat} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${categories.find(c => c.name === cat)?.color || 'bg-gray-400'}`}>{cat}</span>)}
            </div>
          </div>
          {ex.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed italic">
              {ex.description}
            </p>
          )}
        </div>
        <button onClick={onRemove} className="p-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
      </div>
      {isVideoOpen && embedUrl && (
        <div className="px-3 pb-3">
          <iframe src={embedUrl} className="w-full aspect-video rounded-lg" frameBorder="0" allowFullScreen />
        </div>
      )}
    </div>
  );
};

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ routines, setRoutines, exercises, setExercises, categories }) => {
  const [selectorTarget, setSelectorTarget] = useState<{ rid: number; srid?: number } | null>(null);
  const [draggedRoutineIndex, setDraggedRoutineIndex] = useState<number | null>(null);

  const updateRoutine = (id: number, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleExerciseInRoutine = (routineId: number, exerciseId: number, subRoutineId?: number) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      if (subRoutineId) {
        return {
          ...r,
          subRoutines: r.subRoutines.map(s => {
            if (s.id !== subRoutineId) return s;
            const isAdded = s.exerciseItems.some(i => i.exerciseId === exerciseId);
            return { ...s, exerciseItems: isAdded ? s.exerciseItems.filter(i => i.exerciseId !== exerciseId) : [...s.exerciseItems, { exerciseId }] };
          })
        };
      } else {
        const isAdded = r.exerciseItems.some(i => i.exerciseId === exerciseId);
        return { ...r, exerciseItems: isAdded ? r.exerciseItems.filter(i => i.exerciseId !== exerciseId) : [...r.exerciseItems, { exerciseId }] };
      }
    }));
  };

  const handleAddNewExercise = (title: string, target: { rid: number; srid?: number }) => {
    const newEx: Exercise = { id: Date.now(), title, description: '', categories: [], videoUrl: '', rating: 0 };
    setExercises(prev => [...prev, newEx]);
    toggleExerciseInRoutine(target.rid, newEx.id, target.srid);
  };

  // Routine Drag and Drop Logic
  const handleRoutineDragStart = (index: number) => {
    setDraggedRoutineIndex(index);
  };

  const handleRoutineDrop = (index: number) => {
    if (draggedRoutineIndex === null || draggedRoutineIndex === index) return;
    
    const newRoutines = [...routines];
    const [movedItem] = newRoutines.splice(draggedRoutineIndex, 1);
    newRoutines.splice(index, 0, movedItem);
    
    setRoutines(newRoutines);
    setDraggedRoutineIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Routine Builder</h2>
        <button onClick={() => setRoutines([{ id: Date.now(), name: 'New Routine', exerciseItems: [], subRoutines: [], isExpanded: true }, ...routines])} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
          <Plus size={20} /> New Routine
        </button>
      </div>

      <div className="grid gap-6">
        {routines.map((routine, index) => (
          <div 
            key={routine.id} 
            draggable 
            onDragStart={() => handleRoutineDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleRoutineDrop(index)}
            className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${draggedRoutineIndex === index ? 'opacity-40 scale-95 border-blue-400 border-dashed' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-2 p-3 bg-gray-50/50 border-b border-gray-100">
              <div 
                className="p-1.5 text-gray-300 hover:text-blue-500 cursor-grab active:cursor-grabbing transition-colors"
                title="Drag to reorder routine"
              >
                <GripVertical size={18} />
              </div>
              <button onClick={() => updateRoutine(routine.id, { isExpanded: !routine.isExpanded })} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                {routine.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              <input type="text" value={routine.name} onChange={(e) => updateRoutine(routine.id, { name: e.target.value })} className="bg-transparent font-bold text-gray-800 focus:outline-none flex-1 truncate" />
              <div className="flex items-center gap-1">
                <button onClick={() => updateRoutine(routine.id, { subRoutines: [...routine.subRoutines, { id: Date.now(), name: 'New Section', exerciseItems: [], isExpanded: true }] })} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg" title="Add Section"><Layers size={18} /></button>
                <button onClick={() => setRoutines(routines.filter(r => r.id !== routine.id))} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg" title="Delete Routine"><Trash2 size={18} /></button>
              </div>
            </div>

            {routine.isExpanded && (
              <div className="p-4 space-y-4">
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                  {routine.exerciseItems.map((item, idx) => (
                    <CompactExerciseRow key={`${item.exerciseId}-${idx}`} exerciseId={item.exerciseId} exercises={exercises} categories={categories} onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId)} onDragStart={() => {}} onDrop={() => {}} />
                  ))}
                  <button onClick={() => setSelectorTarget({ rid: routine.id })} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-50">
                    <Plus size={14} /> Add Exercise
                  </button>
                </div>

                {routine.subRoutines.map((sr) => (
                  <div key={sr.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 p-2 px-3 bg-blue-50/30 border-b border-blue-100">
                      <input type="text" value={sr.name} onChange={(e) => updateRoutine(routine.id, { subRoutines: routine.subRoutines.map(s => s.id === sr.id ? { ...s, name: e.target.value } : s) })} className="bg-transparent text-sm font-bold text-blue-900 focus:outline-none flex-1 truncate" />
                      <button onClick={() => updateRoutine(routine.id, { subRoutines: routine.subRoutines.filter(s => s.id !== sr.id) })} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 size={14} /></button>
                    </div>
                    {sr.isExpanded && (
                      <div>
                        {sr.exerciseItems.map((item, idx) => (
                          <CompactExerciseRow key={`${item.exerciseId}-${idx}`} exerciseId={item.exerciseId} exercises={exercises} categories={categories} onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId, sr.id)} onDragStart={() => {}} onDrop={() => {}} />
                        ))}
                        <button onClick={() => setSelectorTarget({ rid: routine.id, srid: sr.id })} className="w-full flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-blue-50/50">
                          <Plus size={12} /> Add to Section
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectorTarget && (
        <ExerciseSelectorModal 
          exercises={exercises} 
          categories={categories} 
          currentExerciseIds={routines.find(r => r.id === selectorTarget.rid)?.exerciseItems.map(i => i.exerciseId) || []}
          onClose={() => setSelectorTarget(null)} 
          onSelect={(eid) => toggleExerciseInRoutine(selectorTarget.rid, eid, selectorTarget.srid)} 
          onAddNew={(title) => handleAddNewExercise(title, selectorTarget)} 
        />
      )}
    </div>
  );
};

export default RoutineBuilder;
