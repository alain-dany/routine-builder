
import React, { useState, useEffect, useRef } from 'react';
import { 
  Tag, 
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  Library,
  X,
  User as UserIcon,
  Calendar as CalendarIcon,
  Database,
  Monitor,
  RefreshCw,
  Loader2,
  HardDrive
} from 'lucide-react';
import { Exercise, Routine, Category, ViewType, User, ScheduledRoutine } from './types.ts';
import { DEFAULT_CATEGORIES } from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import RoutineBuilder from './components/RoutineBuilder.tsx';
import ExerciseLibrary from './components/ExerciseLibrary.tsx';
import CalendarView from './components/CalendarView.tsx';
import DataManagement from './components/DataManagement.tsx';

// Mock user for local-only mode
const LOCAL_USER: User = {
  id: 'local-device-user',
  email: 'local@device',
  name: 'User'
};

export default function App() {
  const [user, setUser] = useState<User | null>(LOCAL_USER);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  const [view, setView] = useState<ViewType>('main');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [scheduledRoutines, setScheduledRoutines] = useState<ScheduledRoutine[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const initialLoadRef = useRef(false);

  // Load Data from Local Storage on Start
  useEffect(() => {
    const loadData = () => {
      try {
        const savedExercises = localStorage.getItem('rb_exercises');
        const savedRoutines = localStorage.getItem('rb_routines');
        const savedSchedules = localStorage.getItem('rb_schedules');
        const savedCategories = localStorage.getItem('rb_categories');

        if (savedExercises) setExercises(JSON.parse(savedExercises));
        if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
        if (savedSchedules) setScheduledRoutines(JSON.parse(savedSchedules));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        
        setLastSynced(new Date());
        initialLoadRef.current = true;
      } catch (e) {
        console.error("Local storage load error", e);
      }
    };

    loadData();
  }, []);

  // Sync Data to Local Storage (Auto-save)
  useEffect(() => {
    if (!initialLoadRef.current) return;

    const syncToLocal = () => {
      setIsSyncing(true);
      try {
        localStorage.setItem('rb_exercises', JSON.stringify(exercises));
        localStorage.setItem('rb_routines', JSON.stringify(routines));
        localStorage.setItem('rb_schedules', JSON.stringify(scheduledRoutines));
        localStorage.setItem('rb_categories', JSON.stringify(categories));
        setLastSynced(new Date());
      } catch (e) {
        console.error("Local storage save error", e);
      } finally {
        setTimeout(() => setIsSyncing(false), 300);
      }
    };

    const debounceTimer = setTimeout(syncToLocal, 500);
    return () => clearTimeout(debounceTimer);
  }, [exercises, routines, scheduledRoutines, categories]);

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1` : null;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight hidden sm:block">Routine Builder</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {isSyncing ? (
              <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Saving...
              </div>
            ) : lastSynced && (
              <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                <HardDrive size={10} /> Local Session
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mr-2 sm:mr-4 overflow-x-auto max-w-[50vw]">
            {[
              { id: 'main', icon: LayoutDashboard, label: 'Builder' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'exercises', icon: BookOpen, label: 'Library' },
              { id: 'data', icon: Database, label: 'Data' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setView(nav.id as ViewType)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                  view === nav.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                <nav.icon size={14} /> <span className="hidden lg:inline">{nav.label}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold hover:bg-blue-100 transition-colors flex-shrink-0"
            >
              <UserIcon size={18} />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Storage Status</p>
                  <p className="text-sm font-bold text-gray-800 truncate">Device Session</p>
                  <p className="text-[10px] text-gray-500">Local Browser Storage</p>
                </div>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                >
                  <Monitor size={16} /> Home
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {view === 'main' ? (
          <>
            <div className={`flex h-full relative z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full lg:w-1/3 min-w-[320px]' : 'w-0 lg:w-10 bg-white border-r border-gray-200'}`}>
              <aside className={`h-full w-full bg-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 border-r border-gray-200' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full h-full min-w-[320px]">
                  <Sidebar exercises={exercises} setExercises={setExercises} categories={categories} />
                </div>
              </aside>
              <div className={`absolute top-4 z-50 transition-all duration-300 ${isSidebarOpen ? '-right-4' : 'left-1'}`}>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                  className="flex lg:flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {isSidebarOpen ? <ChevronLeft size={20} /> : <Library size={18} />}
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 ${isSidebarOpen ? 'hidden lg:block' : 'block'}`}>
              <div className="max-w-5xl mx-auto">
                <RoutineBuilder 
                  routines={routines} 
                  setRoutines={setRoutines} 
                  exercises={exercises}
                  setExercises={setExercises}
                  categories={categories}
                />
              </div>
            </div>
          </>
        ) : view === 'exercises' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <ExerciseLibrary 
                exercises={exercises} 
                setExercises={setExercises} 
                categories={categories} 
                setCategories={setCategories}
                onPlayVideo={setActiveVideoUrl} 
              />
            </div>
          </div>
        ) : view === 'calendar' ? (
          <CalendarView routines={routines} scheduledRoutines={scheduledRoutines} setScheduledRoutines={setScheduledRoutines} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <DataManagement 
                exercises={exercises} 
                setExercises={setExercises}
                routines={routines}
                setRoutines={setRoutines}
                categories={categories}
                setCategories={setCategories}
                scheduledRoutines={scheduledRoutines}
                setScheduledRoutines={setScheduledRoutines}
              />
            </div>
          </div>
        )}
      </main>

      {activeVideoUrl && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative aspect-video">
             <button onClick={() => setActiveVideoUrl(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg">
               <X size={24} />
             </button>
             <iframe src={getYoutubeEmbedUrl(activeVideoUrl) || ''} className="w-full h-full" frameBorder="0" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
