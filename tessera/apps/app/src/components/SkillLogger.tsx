import React, { useState, useEffect } from 'react';
import { SkillTreeGraph } from './SkillTreeGraph';

export interface SkillLog {
  skillName: string;
  hoursSpent: number;
}

export interface SkillLoggerProps {
  disabled?: boolean;
  onChange: (data: SkillLog[]) => void;
  accumulatedHistory?: Record<string, number>;
}

const getSkillTier = (hours: number) => {
  if (hours >= 1000) return { name: 'Legendary', cls: 'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' };
  if (hours >= 100) return { name: 'Gold', cls: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' };
  if (hours >= 50) return { name: 'Silver', cls: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
  if (hours >= 10) return { name: 'Bronze', cls: 'text-amber-800 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' };
  return { name: 'Novice', cls: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' };
};

export function SkillLogger({ disabled, onChange, accumulatedHistory = {} }: SkillLoggerProps) {
  const [skills, setSkills] = useState<SkillLog[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentHours, setCurrentHours] = useState(1);
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    onChange(skills);
  }, [skills, onChange]);

  const handleAddSkill = () => {
    if (currentSkill.trim() === '') return;
    
    // Check if skill already exists to accumulate hours instead of duplicating
    const existingIndex = skills.findIndex(
      s => s.skillName.toLowerCase() === currentSkill.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const newSkills = [...skills];
      newSkills[existingIndex].hoursSpent += currentHours;
      setSkills(newSkills);
    } else {
      setSkills([...skills, { skillName: currentSkill.trim(), hoursSpent: currentHours }]);
    }
    
    setCurrentSkill('');
    setCurrentHours(1);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <h4 className="text-sm font-semibold">Skill Training (Hours)</h4>
      
      <div className="flex gap-2 items-center">
        <input 
          type="text" 
          placeholder="e.g. Rust, TypeScript..." 
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.target.value)}
          disabled={disabled}
          className="flex-1 p-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
        />
        <input 
          type="number" 
          min="0.5" 
          step="0.5"
          value={currentHours}
          onChange={(e) => setCurrentHours(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-20 p-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
        />
        <button 
          type="button" 
          onClick={handleAddSkill}
          disabled={disabled || !currentSkill.trim()}
          className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 rounded text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </div>

      {skills.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {skills.map((s, i) => {
            const historical = accumulatedHistory[s.skillName.toLowerCase()] || 0;
            const totalToDate = historical + s.hoursSpent;
            const tier = getSkillTier(totalToDate);
            return (
              <li key={i} className="flex justify-between items-center text-sm p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-100 dark:border-zinc-800">
                <div className="flex gap-2 items-center">
                  <span className="font-medium">{s.skillName}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${tier.cls}`}>
                    {tier.name}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">+{s.hoursSpent} hrs</span>
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">Total: {totalToDate}h</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(i)} 
                    disabled={disabled} 
                    className="text-red-500 hover:text-red-700 font-bold px-1"
                  >
                    ×
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showTree && <SkillTreeGraph />}

      <button 
        type="button" 
        onClick={() => setShowTree(!showTree)}
        className="mt-1 text-xs text-blue-500 hover:text-blue-600 transition-colors self-start font-medium"
      >
        {showTree ? 'Hide Skill Dependency Map' : 'View Skill Dependency Map'}
      </button>
    </div>
  );
}
