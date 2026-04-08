import React, { useState } from 'react';

export interface MediaLogData {
  title: string;
  type: 'book' | 'story' | 'article' | 'other';
  progress: number; // 0-100 percentage
  genres: string[];
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
    genres: []
  });

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
    </div>
  );
}
