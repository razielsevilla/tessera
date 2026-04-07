import React, { useState } from 'react';

export interface Task {
  id: string;
  title: string;
  weight: number;
  completed: boolean;
}

interface TaskTrackerProps {
  onPointsUpdate: (totalPoints: number) => void;
  disabled?: boolean;
}

export function TaskTracker({ onPointsUpdate, disabled }: TaskTrackerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWeight, setNewTaskWeight] = useState(1);

  const calculatePoints = (currentTasks: Task[]) => {
    return currentTasks.filter(t => t.completed).reduce((sum, t) => sum + t.weight, 0);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle.trim(),
      weight: newTaskWeight,
      completed: false
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    setNewTaskTitle('');
    setNewTaskWeight(1);
    onPointsUpdate(calculatePoints(newTasks));
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    onPointsUpdate(calculatePoints(newTasks));
  };

  const removeTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    onPointsUpdate(calculatePoints(newTasks));
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4 bg-white dark:bg-black dark:border-white/[.145]">
      <h4 className="font-semibold text-md">Sprint & Project Tasks</h4>
      
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-2">No tasks added yet.</p>
        )}
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between gap-2 p-2 border rounded bg-gray-50 dark:bg-neutral-900 dark:border-white/[.1]">
            <div className="flex items-center gap-2 overflow-hidden">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={disabled}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className={`text-sm truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {task.weight} pts
              </span>
              <button 
                type="button"
                onClick={() => removeTask(task.id)}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center text-sm font-medium pt-2 border-t dark:border-white/[.145]">
        <span>Total Points:</span>
        <span className="text-blue-600 dark:text-blue-400">{calculatePoints(tasks)}</span>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New Task" 
          disabled={disabled}
          className="flex-1 px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && addTask(e as unknown as React.FormEvent)}
        />
        <input 
          type="number" 
          value={newTaskWeight}
          onChange={(e) => setNewTaskWeight(Number(e.target.value))}
          min="1"
          max="100"
          placeholder="Pts" 
          disabled={disabled}
          className="w-16 px-2 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145]"
        />
        <button 
          type="button"
          onClick={addTask}
          disabled={disabled || !newTaskTitle.trim()}
          className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}