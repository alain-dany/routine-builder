
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Library,
  GripVertical,
  Plus,
  Trash2,
  Download,
  Calendar as CalendarIcon,
  Clock,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { Routine, ScheduledRoutine } from '../types';

interface CalendarViewProps {
  routines: Routine[];
  scheduledRoutines: ScheduledRoutine[];
  setScheduledRoutines: React.Dispatch<React.SetStateAction<ScheduledRoutine[]>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  routines, 
  scheduledRoutines, 
  setScheduledRoutines,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<ScheduledRoutine | null>(null);

  // Calendar Logic
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startDay = monthStart.getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate days grid
  const days = useMemo(() => {
    const d = [];
    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      const prevDate = new Date(monthStart);
      prevDate.setDate(prevDate.getDate() - (startDay - i));
      d.push({ date: prevDate, currentMonth: false });
    }
    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      d.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), currentMonth: true });
    }
    // Padding for end of month
    const remaining = 42 - d.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(monthEnd);
      nextDate.setDate(nextDate.getDate() + i);
      d.push({ date: nextDate, currentMonth: false });
    }
    return d;
  }, [currentDate, startDay, daysInMonth]);

  const getEventsForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return scheduledRoutines.filter(sr => sr.date === dStr);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const routineIdStr = e.dataTransfer.getData('routineId');
    if (!routineIdStr) return;

    const newEvent: ScheduledRoutine = {
      id: Math.random().toString(36).substr(2, 9),
      routineId: parseInt(routineIdStr),
      date: date.toISOString().split('T')[0],
      duration: 15,
      recurrence: 'once'
    };
    setScheduledRoutines(prev => [...prev, newEvent]);
    setEditingEvent(newEvent);
  };

  const updateEvent = (id: string, updates: Partial<ScheduledRoutine>) => {
    setScheduledRoutines(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
    if (editingEvent?.id === id) setEditingEvent(prev => prev ? { ...prev, ...updates } : null);
  };

  const deleteEvent = (id: string) => {
    if (confirm("Remove this routine from schedule?")) {
      setScheduledRoutines(prev => prev.filter(ev => ev.id !== id));
      setEditingEvent(null);
    }
  };

  // Export to .ics
  const exportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//RoutineBuilder//EN\n";
    
    scheduledRoutines.forEach(sr => {
      const routine = routines.find(r => r.id === sr.routineId);
      if (!routine) return;
      
      const datePart = sr.date.replace(/-/g, '');
      const startTime = "T090000"; // Default to 9 AM
      const endTime = "T093000"; // Default to 9:30 AM
      
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:Exercise: ${routine.name}\n`;
      icsContent += `DTSTART:${datePart}${startTime}\n`;
      icsContent += `DTEND:${datePart}${endTime}\n`;
      
      if (sr.recurrence === 'daily') icsContent += "RRULE:FREQ=DAILY\n";
      if (sr.recurrence === 'weekly') icsContent += "RRULE:FREQ=WEEKLY\n";
      if (sr.recurrence === 'weekdays') icsContent += "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR\n";
      
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'routine_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar - Routine Library for Calendar */}
      <div 
        className={`flex h-full relative z-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-1/3 min-w-[340px]' : 'w-10 bg-white border-r border-gray-200'
        }`}
      >
        <aside className={`h-full w-full bg-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 border-r border-gray-200' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col h-full bg-white">
            <div className="p-5 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Routines Library</h2>
              <p className="text-xs text-gray-500">Drag a routine into the calendar</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {routines.map(r => (
                <div 
                  key={r.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('routineId', r.id.toString())}
                  className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={16} className="text-gray-300 group-hover:text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-700 truncate">{r.name}</p>
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">
                      {r.exerciseItems.length + r.subRoutines.reduce((acc, sr) => acc + sr.exerciseItems.length, 0)} Exercises
                    </p>
                  </div>
                </div>
              ))}
              {routines.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No routines created yet.</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={`absolute top-4 z-50 transition-all duration-300 ${isSidebarOpen ? '-right-4' : 'left-1'}`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Library size={18} />}
          </button>
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Calendar Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">{monthName}</h2>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-blue-600 hover:shadow-sm"><ChevronLeft size={18} /></button>
              <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-white rounded-lg transition-all">Today</button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-blue-600 hover:shadow-sm"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportICS}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
            >
              <Download size={14} /> Sync to Calendar (.ics)
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-50 last:border-0">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[600px]">
            {days.map((d, i) => {
              const dayEvents = getEventsForDate(d.date);
              const isToday = d.date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={i}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, d.date)}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-50 transition-colors group relative ${!d.currentMonth ? 'bg-gray-50/40 opacity-40' : 'hover:bg-blue-50/10'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400'}`}>
                      {d.date.getDate()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(ev => {
                      const routine = routines.find(r => r.id === ev.routineId);
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setEditingEvent(ev)}
                          className="w-full p-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold text-left truncate hover:bg-blue-700 hover:shadow-md transition-all animate-in fade-in zoom-in-95"
                        >
                          {routine?.name || 'Unknown Routine'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Event Panel (Slide-over / Modal) */}
      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <CalendarIcon size={20} />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-tight">Configure Routine</h3>
              </div>
              <button onClick={() => setEditingEvent(null)} className="p-2 text-gray-400 hover:bg-white hover:text-gray-600 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Exercise Routine</label>
                <div className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border border-gray-100 flex items-center gap-3">
                  <Check className="text-green-500" size={18} />
                  {routines.find(r => r.id === editingEvent.routineId)?.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Duration</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      value={editingEvent.duration}
                      onChange={e => updateEvent(editingEvent.id, { duration: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                    >
                      <option value={5}>5 mins</option>
                      <option value={10}>10 mins</option>
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Repeats</label>
                  <div className="relative">
                    <RefreshCw size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      value={editingEvent.recurrence}
                      onChange={e => updateEvent(editingEvent.id, { recurrence: e.target.value as any })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Save Schedule
                </button>
                <button 
                  onClick={() => deleteEvent(editingEvent.id)}
                  className="px-4 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
