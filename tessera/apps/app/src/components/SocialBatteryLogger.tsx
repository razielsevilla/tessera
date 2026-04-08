import React, { useState } from 'react';

export interface SocialBatteryData {
  moodScore: number;
  meetings: number;
  calls: number;
  managedTeams: number;
}

interface SocialBatteryLoggerProps {
  onChange: (data: SocialBatteryData) => void;
  disabled?: boolean;
}

export function SocialBatteryLogger({ onChange, disabled }: SocialBatteryLoggerProps) {
  const [data, setData] = useState<SocialBatteryData>({
    moodScore: 8,
    meetings: 0,
    calls: 0,
    managedTeams: 0
  });

  const handleUpdate = (updates: Partial<SocialBatteryData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4 bg-white dark:bg-black dark:border-white/[.145]">
      <h4 className="font-semibold text-md">Social Battery & Mood</h4>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400">Mood Baseline ({data.moodScore}/10)</label>
        </div>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={data.moodScore}
          onChange={(e) => handleUpdate({ moodScore: parseInt(e.target.value, 10) })}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Meetings</label>
          <input 
            type="number" 
            min="0" 
            value={data.meetings || ''}
            onChange={(e) => handleUpdate({ meetings: parseInt(e.target.value, 10) || 0 })}
            disabled={disabled}
            placeholder="0"
            className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Calls</label>
          <input 
            type="number" 
            min="0" 
            value={data.calls || ''}
            onChange={(e) => handleUpdate({ calls: parseInt(e.target.value, 10) || 0 })}
            disabled={disabled}
            placeholder="0"
            className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Managed Teams</label>
          <input 
            type="number" 
            min="0" 
            value={data.managedTeams || ''}
            onChange={(e) => handleUpdate({ managedTeams: parseInt(e.target.value, 10) || 0 })}
            disabled={disabled}
            placeholder="0"
            className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
        </div>
      </div>

    </div>
  );
}
