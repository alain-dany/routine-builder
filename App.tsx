
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
import { Exercise, Routine, Category, ViewType, User, ScheduledRoutine } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import Sidebar from './components/Sidebar';
import RoutineBuilder from './components/RoutineBuilder';
import CategoryManager from './components/CategoryManager';
import ExerciseLibrary from './components/ExerciseLibrary';
import Auth from './components/Auth';
import CalendarView from './components/CalendarView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('main');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [scheduledRoutines, setScheduledRoutines] = useState<ScheduledRoutine[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load Data
  useEffect(() => {
    if (!user) {
      setDataLoaded(false);
      return;
    }
    
    try {
      const storageKeySuffix = `_${user.id}`;
      const savedExercises = localStorage.getItem(`exercises${storageKeySuffix}`);
      const savedRoutines = localStorage.getItem(`routines${storageKeySuffix}`);
      const savedCategories = localStorage.getItem(`categories${storageKeySuffix}`);
      const savedScheduled = localStorage.getItem(`scheduledRoutines${storageKeySuffix}`);
      
      if (savedExercises) setExercises(JSON.parse(savedExercises));
      if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedScheduled) setScheduledRoutines(JSON.parse(savedScheduled));
      
      setDataLoaded(true);
    } catch (e) {
      console.error("Failed to load data", e);
      setDataLoaded(true);
    }
  }, [user]);

  // Save Data
  useEffect(() => {
    if (!user || !dataLoaded) return;

    const storageKeySuffix = `_${user.id}`;
    localStorage.setItem(`exercises${storageKeySuffix}`, JSON.stringify(exercises));
    localStorage.setItem(`routines${storageKeySuffix}`, JSON.stringify(routines));
    localStorage.setItem(`categories${storageKeySuffix}`, JSON.stringify(categories));
    localStorage.setItem(`scheduledRoutines${storageKeySuffix}`, JSON.stringify(scheduledRoutines));
  }, [exercises, routines, categories, scheduledRoutines, user, dataLoaded]);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    setUser(null);
    setShowProfileMenu(false);
    setDataLoaded(false);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    if (!id) return null;
    const origin = window.location.origin;
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}&enablejsapi=1`;
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">Routine Builder</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mr-4 overflow-x-auto">
            <button
              onClick={() => setView('main')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                view === 'main' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard size={14} /> <span className="hidden lg:inline uppercase tracking-widest">Builder</span>
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                view === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <CalendarIcon size={14} /> <span className="hidden lg:inline uppercase tracking-widest">Calendar</span>
            </button>
            <button
              onClick={() => setView('exercises')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                view === 'exercises' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <BookOpen size={14} /> <span className="hidden lg:inline uppercase tracking-widest">Library</span>
            </button>
            <button
              onClick={() => setView('categories')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                view === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Tag size={14} /> <span className="hidden lg:inline uppercase tracking-widest">Labels</span>
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold hover:bg-blue-100 transition-colors"
            >
              {user.name.split(' ').map(n => n[0]).join('')}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <UserIcon size={16} /> Account Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            <div 
              className={`flex h-full relative z-20 transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'w-1/3 min-w-[340px]' : 'w-10 bg-white border-r border-gray-200'
              }`}
            >
              <aside className={`h-full w-full bg-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 border-r border-gray-200' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full h-full min-w-[340px]">
                  <Sidebar 
                    exercises={exercises} 
                    setExercises={setExercises} 
                    categories={categories}
                  />
                </div>
              </aside>
              <div 
                className={`absolute top-4 z-50 transition-all duration-300 ${isSidebarOpen ? '-right-4' : 'left-1'}`}
              >
                <button 
                  onClick={handleToggleSidebar}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                >
                  {isSidebarOpen ? <ChevronLeft size={20} /> : <Library size={18} />}
                </button>
              </div>
              {!isSidebarOpen && (
                <div 
                  onClick={handleToggleSidebar}
                  className="absolute inset-0 flex flex-col items-center pt-16 cursor-pointer hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex-1 w-[1px] bg-gray-100 mb-6" />
                  <div className="pb-8 opacity-20 select-none">
                    <p className="text-[9px] font-black tracking-[0.3em] text-gray-900 uppercase rotate-90 origin-center whitespace-nowrap">LIBRARY</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
              <div className="max-w-5xl mx-auto">
                <RoutineBuilder 
                  routines={routines} 
                  setRoutines={setRoutines} 
                  exercises={exercises}
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
                onPlayVideo={(url) => setActiveVideoUrl(url)}
              />
            </div>
          </div>
        ) : view === 'calendar' ? (
          <CalendarView 
            routines={routines}
            scheduledRoutines={scheduledRoutines}
            setScheduledRoutines={setScheduledRoutines}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <CategoryManager 
                categories={categories} 
                setCategories={setCategories} 
                exercises={exercises}
              />
            </div>
          </div>
        )}
      </main>

      {activeVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative aspect-video">
             <button 
               onClick={() => setActiveVideoUrl(null)}
               className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg"
             >
               <X size={20} />
             </button>
             <iframe
               src={getYoutubeEmbedUrl(activeVideoUrl) || ''}
               className="w-full h-full"
               frameBorder="0"
               allowFullScreen
             />
          </div>
        </div>
      )}
    </div>
  );
}
