import React from 'react';

export interface BMPMetadata {
  moodScore?: number; // 1-10
  socialBattery?: number; // 1-10
  productivityScore?: number; // 0-100
  frameTier?: number; // 0: None, 1: Bronze, 2: Silver, 3: Gold, 4: Legendary
}

interface TesseraCellProps {
  id: number;
  isFilled: boolean;
  metadata?: BMPMetadata;
  isNewMint?: boolean;
  onClick?: (id: number) => void;
  hasPrevStreak?: boolean;
  hasNextStreak?: boolean;
}

export const TesseraCell: React.FC<TesseraCellProps> = ({ id, isFilled, metadata, isNewMint = false, onClick, hasPrevStreak, hasNextStreak }) => {
  if (!isFilled || !metadata) {
    return (
      <div 
        className="w-3 h-3 rounded-sm transition-colors bg-gray-200 dark:bg-gray-800 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
        title={`Day ${id} - Empty`}
        onClick={() => onClick && onClick(id)}
      />
    );
  }

  // Derive visual properties from BMP metadata
  // Mood dictates hue (red to green)
  const hue = ((metadata.moodScore || 5) / 10) * 120; // 0 to 120 (red to green)
  // Social battery dictates lightness
  const lightness = 40 + ((metadata.socialBattery || 5) / 10) * 20; // 40% to 60%
  const color = `hsl(${hue}, 70%, ${lightness}%)`;

  // Productivity dicates opacity
  const opacity = 0.4 + ((metadata.productivityScore || 50) / 100) * 0.6; // 0.4 to 1.0

  // Frame tier dictates border and shadow
  let borderClass = 'border border-transparent';
  let shadowClass = '';
  switch (metadata.frameTier) {
    case 1: // Bronze
      borderClass = 'border border-[#cd7f32]';
      break;
    case 2: // Silver
      borderClass = 'border border-[#c0c0c0]';
      shadowClass = 'shadow-[0_0_2px_#c0c0c0]';
      break;
    case 3: // Gold
      borderClass = 'border border-[#ffd700]';
      shadowClass = 'shadow-[0_0_4px_#ffd700]';
      break;
    case 4: // Legendary
      borderClass = 'border border-[#9400d3]';
      shadowClass = 'shadow-[0_0_6px_#9400d3] animate-pulse';
      break;
  }

  const baseClasses = 'relative w-3 h-3 rounded-sm transition-all hover:z-10 hover:animate-subtle-pulse cursor-pointer';
  const mintClass = isNewMint ? 'animate-mint-glow' : '';

  return (
    <div
      className={`${baseClasses} ${mintClass} ${borderClass} ${shadowClass}`}
      style={{ backgroundColor: color, opacity }}
      title={`Day ${id}\nMood: ${metadata.moodScore}/10\nSocial: ${metadata.socialBattery}/10\nProductivity: ${metadata.productivityScore}/100\nTier: ${metadata.frameTier}\n${(hasPrevStreak || hasNextStreak) ? '🔥 On a streak!' : ''}`}
      onClick={() => onClick && onClick(id)}
    >
      {(hasPrevStreak || hasNextStreak) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 bg-white/70 rounded-full shadow-[0_0_2px_#fff]"></div>
        </div>
      )}
    </div>
  );
};
