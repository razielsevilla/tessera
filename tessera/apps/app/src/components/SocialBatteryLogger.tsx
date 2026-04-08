import React, { useState } from 'react';

export interface SocialBatteryData {
  moodScore: number;
}

interface SocialBatteryLoggerProps {
  onChange: (data: SocialBatteryData) => void;
  disabled?: boolean;
}

export function SocialBatteryLogger({ onChange, disabled }: SocialBatteryLoggerProps) {
  const [data, setData] = useState<SocialBatteryData>({
    moodScore: 8,
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
    </div>
  );
}
