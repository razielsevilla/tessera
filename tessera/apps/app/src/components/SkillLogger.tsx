import React, { useState, useEffect } from 'react';
import { SkillTreeGraph } from './SkillTreeGraph';

export interface SkillLog {
  skillName: string;
  hoursSpent: number;
}

export interface SkillLoggerProps {
  disabled?: boolean;
  onChange: (data: SkillLog[]) => void;
}

export function SkillLogger({ disabled, onChange }: SkillLoggerProps) {
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
          {skills.map((s, i) => (
            <li key={i} className="flex justify-between items-center text-sm p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-100 dark:border-zinc-800">
              <span className="font-medium">{s.skillName}</span>
              <div className="flex gap-3 items-center">
                <span className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">{s.hoursSpent} hrs</span>
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
          ))}
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
