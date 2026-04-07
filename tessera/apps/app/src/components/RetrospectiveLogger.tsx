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
    <div className="flex flex-col gap-4 border rounded-lg p-4 bg-white dark:bg-black dark:border-white/[.145]">
      <h4 className="font-semibold text-md">Milestone & Retrospective</h4>
      
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isSprintEnd"
          checked={data.isSprintEnd}
          onChange={(e) => handleUpdate({ isSprintEnd: e.target.checked })}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="isSprintEnd" className="text-sm font-medium">Sprint End Retrospective</label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Milestone Reached (Optional)</label>
        <input 
          type="text" 
          value={data.milestone}
          onChange={(e) => handleUpdate({ milestone: e.target.value })}
          placeholder="e.g. Launched MVP, Reached 100 users" 
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Retrospective Notes</label>
        <textarea 
          value={data.notes}
          onChange={(e) => handleUpdate({ notes: e.target.value })}
          placeholder="What went well? What could be improved?" 
          disabled={disabled}
          rows={3}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400 resize-none"
        />
      </div>
    </div>
  );
}