
import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  Library,
  X,
  LogOut,
  User as UserIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Exercise, Routine, Category, ViewType, User, ScheduledRoutine } from './types.ts';
import { DEFAULT_CATEGORIES } from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import RoutineBuilder from './components/RoutineBuilder.tsx';
import CategoryManager from './components/CategoryManager.tsx';
import ExerciseLibrary from './components/ExerciseLibrary.tsx';
import Auth from './components/Auth.tsx';
import CalendarView from './components/CalendarView.tsx';

export default function App() {
  const [user, setUser] = useState<User | null>({
    id: 'tester_001',
    email: 'tester@example.com',
    name: 'Testing User'
  });
  
  const [view, setView] = useState<ViewType>('main');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [scheduledRoutines, setScheduledRoutines] = useState<ScheduledRoutine[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setDataLoaded(false);
      return;
    }
    try {
      const suffix = `_${user.id}`;
      const savedEx = localStorage.getItem(`exercises${suffix}`);
      const savedRt = localStorage.getItem(`routines${suffix}`);
      const savedCat = localStorage.getItem(`categories${suffix}`);
      const savedSch = localStorage.getItem(`scheduledRoutines${suffix}`);
      
      if (savedEx) {
        const parsed = JSON.parse(savedEx);
        const migrated = parsed.map((ex: any) => ({
          ...ex,
          categories: Array.isArray(ex.categories) ? ex.categories : (ex.category ? [ex.category] : [])
        }));
        setExercises(migrated);
      }
      if (savedRt) setRoutines(JSON.parse(savedRt));
      if (savedCat) setCategories(JSON.parse(savedCat));
      if (savedSch) setScheduledRoutines(JSON.parse(savedSch));
      setDataLoaded(true);
    } catch (e) {
      setDataLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !dataLoaded) return;
    const suffix = `_${user.id}`;
    localStorage.setItem(`exercises${suffix}`, JSON.stringify(exercises));
    localStorage.setItem(`routines${suffix}`, JSON.stringify(routines));
    localStorage.setItem(`categories${suffix}`, JSON.stringify(categories));
    localStorage.setItem(`scheduledRoutines${suffix}`, JSON.stringify(scheduledRoutines));
  }, [exercises, routines, categories, scheduledRoutines, user, dataLoaded]);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1` : null;
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">NeckTrack</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mr-4">
            {[
              { id: 'main', icon: LayoutDashboard, label: 'Builder' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'exercises', icon: BookOpen, label: 'Library' },
              { id: 'categories', icon: Tag, label: 'Labels' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setView(nav.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  view === nav.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                <nav.icon size={14} /> <span className="hidden lg:inline uppercase tracking-widest">{nav.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold hover:bg-blue-100 transition-colors uppercase"
          >
            {user.name[0]}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {view === 'main' ? (
          <>
            <div className={`flex h-full relative z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/3 min-w-[340px]' : 'w-10 bg-white border-r border-gray-200'}`}>
              <aside className={`h-full w-full bg-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 border-r border-gray-200' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full h-full min-w-[340px]">
                  <Sidebar exercises={exercises} setExercises={setExercises} categories={categories} />
                </div>
              </aside>
              <div className={`absolute top-4 z-50 transition-all duration-300 ${isSidebarOpen ? '-right-4' : 'left-1'}`}>
                <button onClick={handleToggleSidebar} className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  {isSidebarOpen ? <ChevronLeft size={20} /> : <Library size={18} />}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
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
              <ExerciseLibrary exercises={exercises} setExercises={setExercises} categories={categories} onPlayVideo={setActiveVideoUrl} />
            </div>
          </div>
        ) : view === 'calendar' ? (
          <CalendarView routines={routines} scheduledRoutines={scheduledRoutines} setScheduledRoutines={setScheduledRoutines} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <CategoryManager categories={categories} setCategories={setCategories} exercises={exercises} />
            </div>
          </div>
        )}
      </main>

      {activeVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative aspect-video">
             <button onClick={() => setActiveVideoUrl(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg">
               <X size={20} />
             </button>
             <iframe src={getYoutubeEmbedUrl(activeVideoUrl) || ''} className="w-full h-full" frameBorder="0" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
