import React, { useState } from 'react';

export interface SocialEvent {
  type: 'recharge' | 'drain';
  description: string;
}

export interface SocialBatteryData {
  moodScore: number;
  meetings: number;
  calls: number;
  managedTeams: number;
  events: SocialEvent[];
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
    managedTeams: 0,
    events: []
  });
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<'recharge' | 'drain'>('recharge');

  const handleUpdate = (updates: Partial<SocialBatteryData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  const addEvent = () => {
    if (!newEventDesc.trim()) return;
    handleUpdate({ events: [...data.events, { type: newEventType, description: newEventDesc.trim() }] });
    setNewEventDesc('');
  };

  const removeEvent = (index: number) => {
    const nextEvents = [...data.events];
    nextEvents.splice(index, 1);
    handleUpdate({ events: nextEvents });
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

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Social Recharge/Drain Events</label>
        <div className="flex gap-2">
          <select
            value={newEventType}
            onChange={(e) => setNewEventType(e.target.value as 'recharge' | 'drain')}
            disabled={disabled}
            className="px-2 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] text-gray-700 dark:text-gray-300"
          >
            <option value="recharge">🔋 Recharge</option>
            <option value="drain">🪫 Drain</option>
          </select>
          <input
            type="text"
            value={newEventDesc}
            onChange={(e) => setNewEventDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEvent())}
            placeholder="e.g. Coffee with friends"
            disabled={disabled}
            className="flex-1 px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addEvent}
            disabled={disabled || !newEventDesc.trim()}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/40 dark:text-blue-200"
          >
            Add
          </button>
        </div>
        
        {data.events.length > 0 && (
          <ul className="mt-2 text-sm flex flex-col gap-1">
            {data.events.map((event, i) => (
              <li key={i} className={`flex justify-between items-center px-2 py-1 rounded border ${event.type === 'recharge' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                <span>{event.type === 'recharge' ? '🔋' : '🪫'} {event.description}</span>
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  disabled={disabled}
                  className="hover:opacity-75 font-bold px-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
