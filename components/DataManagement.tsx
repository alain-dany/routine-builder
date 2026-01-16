
import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  FileJson,
  Trash2,
  X
} from 'lucide-react';
import { Exercise, Routine, Category, ScheduledRoutine } from '../types';

interface DataManagementProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  routines: Routine[];
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  scheduledRoutines: ScheduledRoutine[];
  setScheduledRoutines: React.Dispatch<React.SetStateAction<ScheduledRoutine[]>>;
}

const DataManagement: React.FC<DataManagementProps> = ({
  exercises, setExercises,
  routines, setRoutines,
  categories, setCategories,
  scheduledRoutines, setScheduledRoutines
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });

  const handleExport = () => {
    const dataToExport = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      exercises,
      routines,
      categories,
      scheduledRoutines
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `necktrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setStatus({ type: 'success', message: 'Backup successfully downloaded!' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!json.exercises || !Array.isArray(json.exercises)) {
          throw new Error("Invalid format: Missing exercises array");
        }

        // Apply data
        setExercises(json.exercises);
        if (json.routines) setRoutines(json.routines);
        if (json.categories) setCategories(json.categories);
        if (json.scheduledRoutines) setScheduledRoutines(json.scheduledRoutines);

        setStatus({ type: 'success', message: `Imported successfully: ${json.exercises.length} exercises restored.` });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to parse JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm("Are you absolutely sure? This will delete all exercises and routines currently in this session.")) {
      setExercises([]);
      setRoutines([]);
      setScheduledRoutines([]);
      setStatus({ type: 'success', message: 'All data cleared.' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Data Management</h2>
        <p className="text-gray-500">Export your progress to avoid losing it during redeployments or clear local storage.</p>
      </div>

      {status.type !== 'none' && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{status.message}</p>
          <button onClick={() => setStatus({ type: 'none', message: '' })} className="ml-auto p-1 hover:bg-black/5 rounded">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Download size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Export Backup</h3>
            <p className="text-sm text-gray-500 mt-2">Download all your exercises, categories, and routines into a portable JSON file.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full pt-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-black uppercase text-gray-400">Exercises</p>
              <p className="text-lg font-bold text-gray-700">{exercises.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-black uppercase text-gray-400">Routines</p>
              <p className="text-lg font-bold text-gray-700">{routines.length}</p>
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={20} /> Backup All Data
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Restore Data</h3>
            <p className="text-sm text-gray-500 mt-2">Upload a previously exported JSON file to restore your entire library instantly.</p>
          </div>

          <div className="w-full">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FileJson size={20} /> Select Backup File
            </button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-left">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Note: Restoring from a file will <span className="font-bold underline">replace</span> any data you currently have in this session.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-center">
        <button 
          onClick={handleClearAll}
          className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-all"
        >
          <Trash2 size={18} /> Wipe Local Data
        </button>
      </div>
    </div>
  );
};

export default DataManagement;
