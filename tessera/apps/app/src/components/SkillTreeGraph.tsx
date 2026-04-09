import React from 'react';

export function SkillTreeGraph() {
  return (
    <div className="relative w-full p-6 bg-zinc-50 dark:bg-stone-950 border border-zinc-200 dark:border-zinc-800 rounded-lg mt-4 overflow-hidden flex flex-col items-center">
      <h4 className="text-sm font-semibold mb-6 w-full text-left">Skill Dependency Map</h4>
      <div className="flex w-full justify-between items-stretch min-w-[500px] max-w-2xl relative min-h-[200px]">
        {/* SVG Interconnecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Paths from Tier 1 to Tier 2 */}
          <line x1="16.6%" y1="25%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-700" />
          <line x1="16.6%" y1="75%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-700" />
          {/* Paths from Tier 2 to Tier 3 */}
          <line x1="50%" y1="50%" x2="83.3%" y2="25%" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-700" />
          <line x1="50%" y1="50%" x2="83.3%" y2="75%" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-700" strokeDasharray="4" />
        </svg>

        {/* Tier 1 - Mastered Skills */}
        <div className="flex flex-col justify-around w-1/3 z-10 pb-4">
          <div className="mx-auto bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-100 px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 text-sm font-medium shadow-sm">
            TypeScript Base
          </div>
          <div className="mx-auto bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-100 px-4 py-2 rounded-lg border border-green-300 dark:border-green-700 text-sm font-medium shadow-sm">
            Systems Rust
          </div>
        </div>

        {/* Tier 2 - Active Skills */}
        <div className="flex flex-col justify-center w-1/3 z-10">
          <div className="mx-auto bg-stone-100 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm font-medium shadow-sm shadow-blue-500/20 ring-2 ring-blue-500">
            Solana Programs
          </div>
        </div>

        {/* Tier 3 - Locked / Future Skills */}
        <div className="flex flex-col justify-around w-1/3 z-10 pb-4">
          <div className="mx-auto bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium border-dashed">
            Advanced Vaults
          </div>
          <div className="mx-auto bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium border-dashed">
            ZK Circuits
          </div>
        </div>
      </div>
      
      {/* Dynamic Status Legend */}
      <div className="flex gap-4 mt-6 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-600"></span> Mastered</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-600"></span> Active</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-transparent border-2 border-zinc-400 border-dashed"></span> Locked</div>
      </div>
    </div>
  );
}
