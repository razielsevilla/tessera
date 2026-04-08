import React, { useState } from 'react';

export interface MediaLogData {
  title: string;
  type: 'book' | 'story' | 'article' | 'other';
  progress: number; // 0-100 percentage
  genres: string[];
  pacing?: 'slow' | 'medium' | 'fast';
  tropes: string[];
  sessionDurationMinutes: number;
}

interface MediaLoggerProps {
  onChange: (data: MediaLogData) => void;
  disabled?: boolean;
}

const AVAILABLE_GENRES = [
  'Sci-Fi',
  'Fantasy',
  'Non-Fiction',
  'Technical',
  'Biography',
  'Mystery',
  'Romance',
  'History'
];

export function MediaLogger({ onChange, disabled }: MediaLoggerProps) {
  const [data, setData] = useState<MediaLogData>({
    title: '',
    type: 'book',
    progress: 0,
    genres: [],
    pacing: 'medium',
    tropes: [],
    sessionDurationMinutes: 0
  });
  const [newTrope, setNewTrope] = useState('');

  const handleUpdate = (updates: Partial<MediaLogData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onChange(newData);
  };

  const toggleGenre = (genre: string) => {
    const newGenres = data.genres.includes(genre)
      ? data.genres.filter(g => g !== genre)
      : [...data.genres, genre];
    handleUpdate({ genres: newGenres });
  };

  const addTrope = () => {
    if (!newTrope.trim()) return;
    const trope = newTrope.trim();
    if (!data.tropes.includes(trope)) {
      handleUpdate({ tropes: [...data.tropes, trope] });
    }
    setNewTrope('');
  };

  const removeTrope = (trope: string) => {
    handleUpdate({ tropes: data.tropes.filter(t => t !== trope) });
  };

  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4 bg-white dark:bg-black dark:border-white/[.145]">
      <h4 className="font-semibold text-md">Media & Literature Log</h4>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Title</label>
        <input 
          type="text" 
          value={data.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="What are you reading?" 
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Type</label>
        <select
          value={data.type}
          onChange={(e) => handleUpdate({ type: e.target.value as any })}
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145]"
        >
          <option value="book">Book</option>
          <option value="story">Short Story</option>
          <option value="article">Article</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400">Progress ({data.progress}%)</label>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={data.progress}
          onChange={(e) => handleUpdate({ progress: parseInt(e.target.value, 10) })}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Genres</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              disabled={disabled}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                data.genres.includes(genre)
                  ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Pacing</label>
        <div className="flex gap-4">
          {['slow', 'medium', 'fast'].map((pacing) => (
            <label key={pacing} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="pacing"
                value={pacing}
                checked={data.pacing === pacing}
                onChange={(e) => handleUpdate({ pacing: e.target.value as 'slow' | 'medium' | 'fast' })}
                disabled={disabled}
              />
              {pacing.charAt(0).toUpperCase() + pacing.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Tropes</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTrope}
            onChange={(e) => setNewTrope(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrope())}
            placeholder="e.g. Enemies to lovers, Found family"
            disabled={disabled}
            className="flex-1 px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addTrope}
            disabled={disabled || !newTrope.trim()}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/40 dark:text-blue-200"
          >
            Add
          </button>
        </div>
        {data.tropes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {data.tropes.map((trope, i) => (
              <span key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300">
                {trope}
                <button
                  type="button"
                  onClick={() => removeTrope(trope)}
                  title="Remove trope"
                  disabled={disabled}
                  className="text-gray-500 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">Session Duration (minutes)</label>
        <input 
          type="number" 
          min="0"
          value={data.sessionDurationMinutes || ''}
          onChange={(e) => handleUpdate({ sessionDurationMinutes: parseInt(e.target.value, 10) || 0 })}
          placeholder="e.g. 45" 
          disabled={disabled}
          className="px-3 py-1.5 text-sm border rounded dark:bg-neutral-900 dark:border-white/[.145] placeholder-gray-400"
        />
      </div>

    </div>
  );
}
