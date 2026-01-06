
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  rating: number;
}

export interface ExerciseItem {
  exerciseId: number;
}

export interface SubRoutine {
  id: number;
  name: string;
  exerciseItems: ExerciseItem[];
  isExpanded?: boolean;
}

export interface RoutineSchedule {
  duration: number; // minutes
  timeOfDay: string; // HH:mm
  daysOfWeek: string[]; // ['MO', 'TU', etc]
  frequency: 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
}

export interface Routine {
  id: number;
  name: string;
  exerciseItems: ExerciseItem[];
  subRoutines: SubRoutine[];
  isExpanded?: boolean;
  schedule?: RoutineSchedule;
}

/**
 * ScheduledRoutine represents a specific instance of a routine on the calendar.
 */
export interface ScheduledRoutine {
  id: string;
  routineId: number;
  date: string; // ISO string YYYY-MM-DD
  duration: number;
  recurrence: 'once' | 'daily' | 'weekly' | 'weekdays';
}

export interface Category {
  name: string;
  color: string;
}

export type ViewType = 'main' | 'categories' | 'exercises' | 'calendar';
