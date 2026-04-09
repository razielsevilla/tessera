import React, { useState } from 'react';

export interface RetrospectiveData {
  milestone: string;
  notes: string;
  isSprintEnd: boolean;
}

interface RetrospectiveLoggerProps {
  onChange: (data: RetrospectiveData) => void;
  disabled?: boolean;
}

export function RetrospectiveLogger({ onChange, disabled }: RetrospectiveLoggerProps) {
  const [data, setData] = useState<RetrospectiveData>({
    milestone: '',
    notes: '',
    isSprintEnd: false
  });

  const handleUpdate = (updates: Partial<RetrospectiveData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  return (
    <div className="flex flex-col gap-4 border border-stone-200 dark:border-stone-800 rounded-xl p-6 bg-white dark:bg-stone-900/50 shadow-sm transition-all text-stone-800 dark:text-stone-300 font-serif dark:border-stone-800">
      <h4 className="font-semibold text-md">Milestone & Retrospective</h4>
      
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isSprintEnd"
          checked={data.isSprintEnd}
          onChange={(e) => handleUpdate({ isSprintEnd: e.target.checked })}
          disabled={disabled}
          className="w-4 h-4 rounded border-stone-300"
        />
        <label htmlFor="isSprintEnd" className="text-sm font-medium">Sprint End Retrospective</label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-stone-600 dark:text-stone-400">Milestone Reached (Optional)</label>
        <input 
          type="text" 
          value={data.milestone}
          onChange={(e) => handleUpdate({ milestone: e.target.value })}
          placeholder="e.g. Launched MVP, Reached 100 users" 
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-stone-800 placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-stone-600 dark:text-stone-400">Retrospective Notes</label>
        <textarea 
          value={data.notes}
          onChange={(e) => handleUpdate({ notes: e.target.value })}
          placeholder="What went well? What could be improved?" 
          disabled={disabled}
          rows={3}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-stone-800 placeholder-gray-400 resize-none"
        />
      </div>
    </div>
  );
}
