
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  PlayCircle,
  X,
  Search,
  Check,
  PlusCircle,
  Play,
  ArrowLeft,
  ArrowRight,
  Video,
  Zap
} from 'lucide-react';
import { Routine, Exercise, Category, ExerciseItem, SubRoutine } from '../types.ts';

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

/**
 * Focus Mode Component for playing a routine
 * Optimized for Gym environment: Big, Centered, High-Contrast
 */
const FocusMode: React.FC<{
  routine: Routine;
  exercises: Exercise[];
  categories: Category[];
  onClose: () => void;
}> = ({ routine, exercises, categories, onClose }) => {
  // Flatten routine into a sequence of steps including section title screens
  const sequence = useMemo(() => {
    const steps: any[] = [];
    
    if (routine.exerciseItems.length > 0) {
      steps.push(...routine.exerciseItems.map(item => ({ ...item, type: 'exercise', section: 'Main' })));
    }

    routine.subRoutines.forEach(sr => {
      if (sr.exerciseItems.length > 0) {
        // Add a title screen for the subsection
        steps.push({ type: 'header', name: sr.name });
        // Add exercises in that subsection
        steps.push(...sr.exerciseItems.map(item => ({ ...item, type: 'exercise', section: sr.name })));
      }
    });

    return steps;
  }, [routine]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const next = () => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowVideo(false);
    }
  };
  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowVideo(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    if (distance > 70) next();
    if (distance < -70) prev();
    setTouchStart(null);
  };

  const currentStep = sequence[currentIndex];
  const isHeader = currentStep?.type === 'header';
  const ex = !isHeader ? exercises.find(e => e.id === currentStep?.exerciseId) : null;
  const embedUrl = ex?.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;

  if (sequence.length === 0) return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
      <p className="text-gray-400 font-bold mb-4 uppercase tracking-widest text-lg">Routine is empty</p>
      <button onClick={onClose} className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Back to Builder</button>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-500"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="px-6 py-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{routine.name}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Step {currentIndex + 1} of {sequence.length}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors shadow-sm"><X size={32} /></button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 overflow-y-auto text-center bg-gradient-to-b from-white to-gray-50">
        
        {isHeader ? (
          /* Transition Screen for Subsections */
          <div className="space-y-6 animate-in zoom-in-95 duration-700 flex flex-col items-center">
             <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-4">
                <Zap size={48} fill="currentColor" />
             </div>
             <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-sm">Entering Subsection</p>
             <h1 className="text-5xl sm:text-7xl font-black text-gray-900 leading-tight">
               {currentStep.name}
             </h1>
             <p className="text-gray-400 font-medium max-w-xs pt-4">Get ready for the next phase of your workout.</p>
          </div>
        ) : (
          /* Main Exercise Focus View */
          <div className="w-full flex flex-col items-center space-y-10 sm:space-y-12">
            {/* Subsection Marker (Line 0) */}
            <div className="animate-in fade-in duration-500">
               <span className="inline-block text-[12px] font-black text-blue-500 bg-blue-50 px-5 py-2 rounded-full uppercase tracking-[0.2em]">
                 {currentStep.section}
               </span>
            </div>

            {/* Exercise Title (Line 1) */}
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl">
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-[1.15] tracking-tight">
                {ex?.title}
              </h1>
            </div>

            {/* Comment / Description (Line 2) */}
            {ex?.description && (
              <div className="max-w-3xl w-full animate-in fade-in slide-in-from-top-4 delay-150 duration-500">
                <div className="p-8 sm:p-10 bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100/50">
                  <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed font-semibold">
                    {ex.description}
                  </p>
                </div>
              </div>
            )}

            {/* Video Button (Line 3) */}
            {embedUrl && (
              <div className="animate-in fade-in slide-in-from-top-4 delay-300 duration-500">
                <button 
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-4 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] hover:scale-105 transition-all shadow-2xl shadow-gray-900/20 active:scale-95"
                >
                  <Video size={24} /> Watch Demonstration
                </button>
              </div>
            )}

            {/* Categories (Line 4) */}
            <div className="flex flex-wrap justify-center gap-3 animate-in fade-in delay-500 duration-500">
              {ex?.categories.map(cat => (
                <span key={cat} className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-lg ${categories.find(c => c.name === cat)?.color || 'bg-gray-400'}`}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="p-8 sm:p-10 bg-white border-t flex gap-6 shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.04)]">
        <button 
          onClick={prev} 
          disabled={currentIndex === 0} 
          className="flex-1 py-6 bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-[2.5rem] font-black uppercase tracking-widest disabled:opacity-30 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <ArrowLeft size={28} /> <span className="hidden sm:inline">Back</span>
        </button>
        <button 
          onClick={next} 
          className="flex-[2.5] py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {currentIndex === sequence.length - 1 ? "Complete Workout" : (isHeader ? "Start Section" : "Next Exercise")} <ArrowRight size={28} />
        </button>
      </footer>

      {showVideo && embedUrl && (
        <div className="fixed inset-0 z-[250] bg-black/98 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setShowVideo(false)}
            className="absolute top-8 right-8 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl transition-all z-[260]"
          >
            <X size={36} />
          </button>
          <div className="w-full max-w-6xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            <iframe src={embedUrl} className="w-full h-full" frameBorder="0" allowFullScreen />
          </div>
          <button 
            onClick={() => setShowVideo(false)}
            className="mt-10 px-10 py-4 bg-white/10 text-white font-black uppercase tracking-[0.2em] rounded-full border border-white/20 hover:bg-white/20"
          >
            Close Video
          </button>
          <div className="absolute inset-0 -z-10" onClick={() => setShowVideo(false)} />
        </div>
      )}
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
  index: number;
  onDropAt: (e: React.DragEvent, index: number) => void;
}> = ({ exerciseId, onRemove, exercises, categories, routineId, subRoutineId, index, onDropAt }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex) return null;
  const embedUrl = ex.videoUrl ? getYoutubeEmbedUrl(ex.videoUrl) : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('exerciseId', exerciseId.toString());
    e.dataTransfer.setData('sourceRoutineId', routineId.toString());
    if (subRoutineId) e.dataTransfer.setData('sourceSubRoutineId', subRoutineId.toString());
    e.dataTransfer.setData('sourceIndex', index.toString());
  };

  return (
    <div 
      className="relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDropAt(e, index); }}
    >
      {isDragOver && <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 z-10 animate-pulse rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
      
      <div 
        draggable 
        onDragStart={handleDragStart} 
        className="group flex flex-col bg-white border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50/50 active:scale-[0.99]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 py-4 sm:py-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400 cursor-grab shrink-0" />
            <span className="text-sm font-bold text-gray-800 truncate flex-1">{ex.title}</span>
            {embedUrl && <button onClick={() => setIsVideoOpen(!isVideoOpen)} className="text-blue-500 hover:text-blue-700 shrink-0 sm:hidden"><PlayCircle size={20} /></button>}
          </div>

          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 w-full">
            <div className="flex flex-wrap gap-1 shrink-0">
              {(ex.categories || []).map(cat => (
                <span key={cat} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${categories.find(c => c.name === cat)?.color || 'bg-gray-400'}`}>{cat}</span>
              ))}
            </div>
            
            <div className="flex-1 flex items-center justify-between gap-2">
              {ex.description && (
                <p className="text-[11px] text-gray-500 line-clamp-1 italic flex-1 leading-tight">{ex.description}</p>
              )}
              
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                {embedUrl && <button onClick={() => setIsVideoOpen(!isVideoOpen)} className="hidden sm:block text-blue-500 hover:text-blue-700 p-2"><PlayCircle size={18} /></button>}
                <button onClick={onRemove} className="p-2 opacity-100 sm:opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        </div>
        
        {isVideoOpen && embedUrl && (
          <div className="px-3 pb-4">
            <iframe src={embedUrl} className="w-full aspect-video rounded-2xl shadow-inner bg-black" frameBorder="0" allowFullScreen />
          </div>
        )}
      </div>
    </div>
  );
};

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ routines, setRoutines, exercises, setExercises, categories }) => {
  const [selectorTarget, setSelectorTarget] = useState<{ rid: number; srid?: number } | null>(null);
  const [draggedRoutineIndex, setDraggedRoutineIndex] = useState<number | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ rid: number; srid?: number } | null>(null);
  const [routineToPlay, setRoutineToPlay] = useState<Routine | null>(null);

  const updateRoutine = (id: number, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleExerciseDrop = (e: React.DragEvent, destRid: number, destSrid?: number, destIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);

    const exerciseIdString = e.dataTransfer.getData('exerciseId');
    const exerciseId = parseInt(exerciseIdString);
    const sourceRidString = e.dataTransfer.getData('sourceRoutineId');
    const sourceRid = sourceRidString ? parseInt(sourceRidString) : null;
    const sourceSridString = e.dataTransfer.getData('sourceSubRoutineId');
    const sourceSrid = sourceSridString ? parseInt(sourceSridString) : null;
    const sourceIndexString = e.dataTransfer.getData('sourceIndex');
    const sourceIndex = sourceIndexString !== "" ? parseInt(sourceIndexString) : null;

    if (isNaN(exerciseId)) return;

    setRoutines(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      if (sourceRid !== null) {
        const sourceRoutine = next.find((r: Routine) => r.id === sourceRid);
        if (sourceRoutine) {
          if (sourceSrid !== null) {
            const sourceSR = sourceRoutine.subRoutines.find((sr: SubRoutine) => sr.id === sourceSrid);
            if (sourceSR && sourceIndex !== null) {
              sourceSR.exerciseItems.splice(sourceIndex, 1);
            }
          } else {
            if (sourceIndex !== null) {
              sourceRoutine.exerciseItems.splice(sourceIndex, 1);
            }
          }
        }
      }

      const destRoutine = next.find((r: Routine) => r.id === destRid);
      if (destRoutine) {
        if (destSrid !== undefined) {
          const destSR = destRoutine.subRoutines.find((sr: SubRoutine) => sr.id === destSrid);
          if (destSR) {
            const idx = destIndex !== undefined ? destIndex : destSR.exerciseItems.length;
            destSR.exerciseItems.splice(idx, 0, { exerciseId });
            destSR.exerciseItems = destSR.exerciseItems.filter((item: any, i: number) => 
              destSR.exerciseItems.findIndex((obj: any) => obj.exerciseId === item.exerciseId) === i
            );
          }
        } else {
          const idx = destIndex !== undefined ? destIndex : destRoutine.exerciseItems.length;
          destRoutine.exerciseItems.splice(idx, 0, { exerciseId });
          destRoutine.exerciseItems = destRoutine.exerciseItems.filter((item: any, i: number) => 
            destRoutine.exerciseItems.findIndex((obj: any) => obj.exerciseId === item.exerciseId) === i
          );
        }
      }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Routine Builder</h2>
          <p className="text-gray-500 text-sm">Organize your training plans</p>
        </div>
        <button 
          onClick={() => setRoutines([{ id: Date.now(), name: 'New Routine', exerciseItems: [], subRoutines: [], isExpanded: true }, ...routines])} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={22} /> New Routine
        </button>
      </div>

      <div className="grid gap-6">
        {routines.map((routine, index) => (
          <div 
            key={routine.id} 
            draggable 
            onDragStart={(e) => {
              setDraggedRoutineIndex(index);
              e.dataTransfer.setData('routineMoveIndex', index.toString());
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => setDraggedRoutineIndex(null)}
            onDrop={(e) => {
              const routineMoveIndex = e.dataTransfer.getData('routineMoveIndex');
              if (routineMoveIndex === "" || parseInt(routineMoveIndex) === index) return;
              const fromIndex = parseInt(routineMoveIndex);
              const newRoutines = [...routines];
              const [movedItem] = newRoutines.splice(fromIndex, 1);
              newRoutines.splice(index, 0, movedItem);
              setRoutines(newRoutines);
              setDraggedRoutineIndex(null);
            }}
            className={`bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${draggedRoutineIndex === index ? 'opacity-40 scale-[0.98] border-blue-400 border-dashed bg-blue-50/10' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-2 p-4 bg-gray-50/30 border-b border-gray-100">
              <div className="p-1.5 text-gray-300 hover:text-blue-500 cursor-grab active:cursor-grabbing transition-colors shrink-0">
                <GripVertical size={20} />
              </div>
              <button onClick={() => updateRoutine(routine.id, { isExpanded: !routine.isExpanded })} className="p-1 hover:bg-gray-200 rounded-lg text-gray-400">
                {routine.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              <input type="text" value={routine.name} onChange={(e) => updateRoutine(routine.id, { name: e.target.value })} className="bg-transparent font-black text-gray-800 focus:outline-none flex-1 truncate text-lg" />
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setRoutineToPlay(routine)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md mr-1 active:scale-95"
                >
                  <Play size={14} fill="currentColor" /> Play
                </button>
                <button 
                  onClick={() => updateRoutine(routine.id, { subRoutines: [...routine.subRoutines, { id: Date.now(), name: 'New Section', exerciseItems: [], isExpanded: true }] })} 
                  className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors" 
                  title="Add Section"
                >
                  <PlusCircle size={20} />
                </button>
                <button onClick={() => setRoutines(routines.filter(r => r.id !== routine.id))} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors" title="Delete"><Trash2 size={20} /></button>
              </div>
            </div>

            {routine.isExpanded && (
              <div className="p-6 space-y-6">
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget({ rid: routine.id }); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => handleExerciseDrop(e, routine.id)}
                  className={`bg-gray-50/50 border border-gray-100 rounded-2xl overflow-hidden transition-all ${dragOverTarget?.rid === routine.id && dragOverTarget?.srid === undefined ? 'ring-4 ring-blue-500/20 bg-blue-50/30 border-blue-200' : ''}`}
                >
                  {routine.exerciseItems.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Drop items here</div>
                  ) : (
                    routine.exerciseItems.map((item, idx) => (
                      <CompactExerciseRow 
                        key={`${item.exerciseId}-${idx}`} 
                        exerciseId={item.exerciseId} 
                        index={idx}
                        exercises={exercises} 
                        categories={categories} 
                        routineId={routine.id}
                        onDropAt={(e, i) => handleExerciseDrop(e, routine.id, undefined, i)}
                        onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId)} 
                      />
                    ))
                  )}
                  <button onClick={() => setSelectorTarget({ rid: routine.id })} className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors">
                    <Plus size={16} /> Add Exercise
                  </button>
                </div>

                {routine.subRoutines.map((sr) => (
                  <div 
                    key={sr.id} 
                    onDragOver={(e) => { e.preventDefault(); setDragOverTarget({ rid: routine.id, srid: sr.id }); }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleExerciseDrop(e, routine.id, sr.id)}
                    className={`bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden transition-all ${dragOverTarget?.rid === routine.id && dragOverTarget?.srid === sr.id ? 'ring-4 ring-blue-500/20 scale-[1.01] border-blue-200' : ''}`}
                  >
                    <div className="flex items-center gap-2 p-3 px-4 bg-blue-50/40 border-b border-blue-100">
                      <input type="text" value={sr.name} onChange={(e) => updateRoutine(routine.id, { subRoutines: routine.subRoutines.map(s => s.id === sr.id ? { ...s, name: e.target.value } : s) })} className="bg-transparent text-sm font-black text-blue-900 focus:outline-none flex-1 truncate" />
                      <button onClick={() => updateRoutine(routine.id, { subRoutines: routine.subRoutines.filter(s => s.id !== sr.id) })} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div>
                      {sr.exerciseItems.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">Section Empty</div>
                      ) : (
                        sr.exerciseItems.map((item, idx) => (
                          <CompactExerciseRow 
                            key={`${item.exerciseId}-${idx}`} 
                            exerciseId={item.exerciseId} 
                            index={idx}
                            exercises={exercises} 
                            categories={categories} 
                            routineId={routine.id}
                            subRoutineId={sr.id}
                            onDropAt={(e, i) => handleExerciseDrop(e, routine.id, sr.id, i)}
                            onRemove={() => toggleExerciseInRoutine(routine.id, item.exerciseId, sr.id)} 
                          />
                        ))
                      )}
                      <button onClick={() => setSelectorTarget({ rid: routine.id, srid: sr.id })} className="w-full flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-50/50 border-t border-gray-50 transition-colors">
                        <Plus size={14} /> Add to Section
                      </button>
                    </div>
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
          onAddNew={(title) => {
             const newEx: Exercise = { id: Date.now(), title, description: '', categories: [], videoUrl: '', rating: 0 };
             setExercises(prev => [...prev, newEx]);
             toggleExerciseInRoutine(selectorTarget.rid, newEx.id, selectorTarget.srid);
          }} 
        />
      )}

      {routineToPlay && (
        <FocusMode 
          routine={routineToPlay} 
          exercises={exercises} 
          categories={categories} 
          onClose={() => setRoutineToPlay(null)} 
        />
      )}
    </div>
  );
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-black text-gray-800 uppercase tracking-tight">Select Exercises</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search or create exercise..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchTerm.trim().length > 0 && !exercises.some(e => e.title.toLowerCase() === searchTerm.toLowerCase()) && (
            <button 
              onClick={() => onAddNew(searchTerm)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
            >
              <Plus size={16} /> Create "{searchTerm}"
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 bg-gray-50/30">
          {filtered.map(ex => {
            const isAdded = currentExerciseIds.includes(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-blue-50 transition-all border border-gray-100 hover:border-blue-200 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5 shrink-0">
                    {(ex.categories || []).map(c => <div key={c} className={`w-2 h-2 rounded-full ${categories.find(ci => ci.name === c)?.color || 'bg-gray-400'}`} />)}
                  </div>
                  <p className="text-sm font-bold text-gray-800">{ex.title}</p>
                </div>
                {isAdded ? <Check size={20} className="text-green-600" /> : <Plus size={20} className="text-gray-300" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t bg-white flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Done</button>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilder;
