import React, { useState } from 'react';

export interface EconomyTask {
  id: string;
  title: string;
  points: number;
  completed: boolean;
}

const DEFAULT_CHORES: EconomyTask[] = [
  { id: '1', title: 'Dishes / Kitchen Cleanup', points: 5, completed: false },
  { id: '2', title: 'Laundry', points: 10, completed: false },
  { id: '3', title: 'Groceries / Errand', points: 15, completed: false },
  { id: '4', title: 'General Tidying', points: 5, completed: false },
];

interface LifeEconomyTrackerProps {
  onPointsUpdate: (totalPoints: number) => void;
  disabled?: boolean;
}

export function LifeEconomyTracker({ onPointsUpdate, disabled }: LifeEconomyTrackerProps) {
  const [tasks, setTasks] = useState<EconomyTask[]>(DEFAULT_CHORES);

  const calculatePoints = (currentTasks: EconomyTask[]) => {
    return currentTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    onPointsUpdate(calculatePoints(newTasks));
  };

  return (
    <div className="flex flex-col gap-4 border border-stone-200 dark:border-stone-800 rounded-xl p-6 bg-white dark:bg-stone-900/50 shadow-sm transition-all text-stone-800 dark:text-stone-300 font-serif dark:border-stone-800">
      <h4 className="font-semibold text-md">Life Economy (Household Chores)</h4>
      
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between gap-2 p-2 border rounded bg-stone-50 dark:bg-neutral-900 dark:border-stone-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={disabled}
                className="w-4 h-4 rounded border-stone-300"
              />
              <span className={`text-sm truncate ${task.completed ? 'line-through text-stone-400' : ''}`}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                +{task.points} pts
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center text-sm font-medium pt-2 border-t dark:border-stone-800">
        <span>Life Points Generated:</span>
        <span className="text-green-600 dark:text-green-500">{calculatePoints(tasks)}</span>
      </div>
    </div>
  );
}
