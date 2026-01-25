
import React, { useState, useEffect, useRef } from 'react';
import { 
  Tag, 
  LayoutDashboard,
  BookOpen,
  ChevronLeft,
  Library,
  X,
  LogOut,
  User as UserIcon,
  Calendar as CalendarIcon,
  Database,
  CloudCheck,
  RefreshCw,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Exercise, Routine, Category, ViewType, User, ScheduledRoutine } from './types.ts';
import { DEFAULT_CATEGORIES } from './constants.tsx';
import { supabase } from './lib/supabase.ts';
import Sidebar from './components/Sidebar.tsx';
import RoutineBuilder from './components/RoutineBuilder.tsx';
import CategoryManager from './components/CategoryManager.tsx';
import ExerciseLibrary from './components/ExerciseLibrary.tsx';
import Auth from './components/Auth.tsx';
import CalendarView from './components/CalendarView.tsx';
import DataManagement from './components/DataManagement.tsx';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  const [view, setView] = useState<ViewType>('main');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [scheduledRoutines, setScheduledRoutines] = useState<ScheduledRoutine[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const initialLoadRef = useRef(false);

  // Auth Session Tracking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
        });
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data from Supabase on Login
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsSyncing(true);
      try {
        const [exRes, rtRes, schRes] = await Promise.all([
          supabase.from('exercises').select('*').eq('user_id', user.id),
          supabase.from('routines').select('*').eq('user_id', user.id).order('order_index', { ascending: true }),
          supabase.from('scheduled_routines').select('*').eq('user_id', user.id)
        ]);

        if (exRes.data) setExercises(exRes.data);
        if (rtRes.data) setRoutines(rtRes.data);
        if (schRes.data) setScheduledRoutines(schRes.data);
        
        setLastSynced(new Date());
        initialLoadRef.current = true;
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchData();
  }, [user]);

  // Sync Data to Supabase (Auto-save)
  useEffect(() => {
    if (!user || !initialLoadRef.current) return;

    const syncTimeout = setTimeout(async () => {
      setIsSyncing(true);
      try {
        // Upsert Exercises
        if (exercises.length > 0) {
          await supabase.from('exercises').upsert(
            exercises.map(ex => ({ ...ex, user_id: user.id }))
          );
        }

        // Upsert Routines with order_index
        if (routines.length > 0) {
          await supabase.from('routines').upsert(
            routines.map((rt, idx) => ({ 
              ...rt, 
              user_id: user.id,
              order_index: idx 
            }))
          );
        }

        // Upsert Scheduled Routines
        if (scheduledRoutines.length > 0) {
          await supabase.from('scheduled_routines').upsert(
            scheduledRoutines.map(sr => ({ ...sr, user_id: user.id }))
          );
        }

        setLastSynced(new Date());
      } catch (e) {
        console.error("Sync error", e);
      } finally {
        setIsSyncing(false);
      }
    }, 2000); // Debounce sync by 2 seconds

    return () => clearTimeout(syncTimeout);
  }, [exercises, routines, scheduledRoutines, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfileMenu(false);
    initialLoadRef.current = false;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1` : null;
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

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
          
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Syncing...
              </div>
            ) : lastSynced && (
              <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                <CloudCheck size={10} /> Saved to Cloud
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mr-4 overflow-x-auto max-w-[50vw]">
            {[
              { id: 'main', icon: LayoutDashboard, label: 'Builder' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'exercises', icon: BookOpen, label: 'Library' },
              { id: 'categories', icon: Tag, label: 'Labels' },
              { id: 'data', icon: Database, label: 'Backup' }
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

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold hover:bg-blue-100 transition-colors uppercase flex-shrink-0"
            >
              {user.name[0]}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Account</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
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
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
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
        ) : view === 'data' ? (
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
