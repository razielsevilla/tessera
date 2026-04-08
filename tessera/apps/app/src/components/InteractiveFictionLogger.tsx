import React, { useState } from 'react';

export interface InteractiveFictionData {
  storyTitle: string;
  currentNodeId: string;
  choicesMade: string[];
}

interface InteractiveFictionLoggerProps {
  onChange: (data: InteractiveFictionData) => void;
  disabled?: boolean;
}

export function InteractiveFictionLogger({ onChange, disabled }: InteractiveFictionLoggerProps) {
  const [data, setData] = useState<InteractiveFictionData>({
    storyTitle: '',
    currentNodeId: '',
    choicesMade: []
  });
  const [newChoice, setNewChoice] = useState('');

  const handleUpdate = (updates: Partial<InteractiveFictionData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  const addChoice = () => {
    if (!newChoice.trim()) return;
    handleUpdate({ choicesMade: [...data.choicesMade, newChoice.trim()] });
    setNewChoice('');
  };

  const removeChoice = (index: number) => {
    const nextChoices = [...data.choicesMade];
    nextChoices.splice(index, 1);
    handleUpdate({ choicesMade: nextChoices });
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4 bg-white dark:bg-black dark:border-white/[.145]">
      <h4 className="font-semibold text-md">Interactive Fiction Logger</h4>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Story Title</label>
        <input
          type="text"
          value={data.storyTitle}
          onChange={(e) => handleUpdate({ storyTitle: e.target.value })}
          placeholder="e.g. Choose Your Own Adventure"
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Current Node/Chapter ID</label>
        <input
          type="text"
          value={data.currentNodeId}
          onChange={(e) => handleUpdate({ currentNodeId: e.target.value })}
          placeholder="e.g. Node-42 or Chapter 3"
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Branching Choices Log</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newChoice}
            onChange={(e) => setNewChoice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChoice())}
            placeholder="Choice made..."
            disabled={disabled}
            className="flex-1 px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addChoice}
            disabled={disabled || !newChoice.trim()}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/40 dark:text-blue-200"
          >
            Add
          </button>
        </div>
        
        {data.choicesMade.length > 0 && (
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-1">
            {data.choicesMade.map((choice, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-50 dark:bg-neutral-800 px-2 py-1 rounded">
                <span>{i + 1}. {choice}</span>
                <button
                  type="button"
                  onClick={() => removeChoice(i)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 font-bold px-1"
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
