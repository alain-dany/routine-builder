
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
  PlusCircle
} from 'lucide-react';
import { Routine, Exercise, Category, ExerciseItem } from '../types.ts';

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
  routineId: number;
  subRoutineId?: number;
}> = ({ exerciseId, onRemove, exercises, categories, routineId, subRoutineId }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex) return null;
  const embedUrl = ex.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // CRITICAL: Prevents parent routine from graying out
    e.dataTransfer.setData('exerciseId', exerciseId.toString());
    e.dataTransfer.setData('sourceRoutineId', routineId.toString());
    if (subRoutineId) e.dataTransfer.setData('sourceSubRoutineId', subRoutineId.toString());
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart} 
      onDragOver={e => e.preventDefault()} 
      className="group flex flex-col bg-white border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/50"
    >
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
  const [dragOverTarget, setDragOverTarget] = useState<{ rid: number; srid?: number } | null>(null);

  const updateRoutine = (id: number, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleExerciseDrop = (e: React.DragEvent, destRid: number, destSrid?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    const exerciseId = parseInt(e.dataTransfer.getData('exerciseId'));
    const sourceRid = e.dataTransfer.getData('sourceRoutineId') ? parseInt(e.dataTransfer.getData('sourceRoutineId')) : null;
    const sourceSrid = e.dataTransfer.getData('sourceSubRoutineId') ? parseInt(e.dataTransfer.getData('sourceSubRoutineId')) : null;

    if (isNaN(exerciseId)) return;

    setRoutines(prev => {
      let next = [...prev];

      // 1. Remove from source if it exists
      if (sourceRid !== null) {
        next = next.map(r => {
          if (r.id !== sourceRid) return r;
          if (sourceSrid !== null) {
            return {
              ...r,
              subRoutines: r.subRoutines.map(sr => 
                sr.id === sourceSrid 
                  ? { ...sr, exerciseItems: sr.exerciseItems.filter(i => i.exerciseId !== exerciseId) }
                  : sr
              )
            };
          } else {
            return { ...r, exerciseItems: r.exerciseItems.filter(i => i.exerciseId !== exerciseId) };
          }
        });
      }

      // 2. Add to destination
      next = next.map(r => {
        if (r.id !== destRid) return r;
        if (destSrid !== undefined) {
          return {
            ...r,
            subRoutines: r.subRoutines.map(sr => {
              if (sr.id !== destSrid) return sr;
              // Check for duplicates in this specific section
              if (sr.exerciseItems.some(i => i.exerciseId === exerciseId)) return sr;
              return { ...sr, exerciseItems: [...sr.exerciseItems, { exerciseId }] };
            })
          };
        } else {
          // Check for duplicates in the root of this routine
          if (r.exerciseItems.some(i => i.exerciseId === exerciseId)) return r;
          return { ...r, exerciseItems: [...r.exerciseItems, { exerciseId }] };
        }
      });

      return next;
    });
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
  const handleRoutineDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRoutineIndex(index);
    e.dataTransfer.setData('routineMoveIndex', index.toString());
  };

  const handleRoutineDrop = (e: React.DragEvent, index: number) => {
    const routineMoveIndex = e.dataTransfer.getData('routineMoveIndex');
    if (routineMoveIndex === "" || parseInt(routineMoveIndex) === index) return;
    
    const fromIndex = parseInt(routineMoveIndex);
    const newRoutines = [...routines];
    const [movedItem] = newRoutines.splice(fromIndex, 1);
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
            onDragStart={(e) => handleRoutineDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => setDraggedRoutineIndex(null)}
            onDrop={(e) => handleRoutineDrop(e, index)}
            className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${draggedRoutineIndex === index ? 'opacity-40 scale-[0.98] border-blue-400 border-dashed' : 'opacity-100'}`}
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
                <button 
                  onClick={() => updateRoutine(routine.id, { subRoutines: [...routine.subRoutines, { id: Date.now(), name: 'New Section', exerciseItems: [], isExpanded: true }] })} 
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                  title="Add Section"
                >
                  <PlusCircle size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Section</span>
                </button>
                <button onClick={() => setRoutines(routines.filter(r => r.id !== routine.id))} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg" title="Delete Routine"><Trash2 size={18} /></button>
              </div>
            </div>

            {routine.isExpanded && (
              <div className="p-4 space-y-4">
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTarget({ rid: routine.id });
                  }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => handleExerciseDrop(e, routine.id)}
                  className={`bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden transition-all ${dragOverTarget?.rid === routine.id && dragOverTarget?.srid === undefined ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}
                >
                  {routine.exerciseItems.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 font-medium">No root exercises. Drag items here or add below.</div>
                  ) : (
                    routine.exerciseItems.map((item, idx) => (
                      <CompactExerciseRow 
                        key={`${item.exerciseId}-${idx}`} 
                        exerciseId={item.exerciseId} 
                        exercises={exercises} 
                        categories={categories} 
                        routineId={routine.id}
                        onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId)} 
                      />
                    ))
                  )}
                  <button onClick={() => setSelectorTarget({ rid: routine.id })} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-50 border-t border-gray-100">
                    <Plus size={14} /> Add Exercise
                  </button>
                </div>

                {routine.subRoutines.map((sr) => (
                  <div 
                    key={sr.id} 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverTarget({ rid: routine.id, srid: sr.id });
                    }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleExerciseDrop(e, routine.id, sr.id)}
                    className={`bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden transition-all ${dragOverTarget?.rid === routine.id && dragOverTarget?.srid === sr.id ? 'ring-2 ring-blue-500 scale-[1.01]' : ''}`}
                  >
                    <div className="flex items-center gap-2 p-2 px-3 bg-blue-50/30 border-b border-blue-100">
                      <input type="text" value={sr.name} onChange={(e) => updateRoutine(routine.id, { subRoutines: routine.subRoutines.map(s => s.id === sr.id ? { ...s, name: e.target.value } : s) })} className="bg-transparent text-sm font-bold text-blue-900 focus:outline-none flex-1 truncate" />
                      <button onClick={() => updateRoutine(routine.id, { subRoutines: routine.subRoutines.filter(s => s.id !== sr.id) })} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 size={14} /></button>
                    </div>
                    {sr.isExpanded && (
                      <div>
                        {sr.exerciseItems.length === 0 ? (
                          <div className="py-6 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">Section Empty</div>
                        ) : (
                          sr.exerciseItems.map((item, idx) => (
                            <CompactExerciseRow 
                              key={`${item.exerciseId}-${idx}`} 
                              exerciseId={item.exerciseId} 
                              exercises={exercises} 
                              categories={categories} 
                              routineId={routine.id}
                              subRoutineId={sr.id}
                              onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId, sr.id)} 
                            />
                          ))
                        )}
                        <button onClick={() => setSelectorTarget({ rid: routine.id, srid: sr.id })} className="w-full flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-blue-50/50 border-t border-gray-50">
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
