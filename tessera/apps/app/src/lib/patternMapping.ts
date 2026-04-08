export interface PatternStyle {
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
}

/**
 * Maps media genres to a CSS background pattern system.
 * Provides at least 5 distinct patterns for different genre types.
 *
 * @param genres - Array of genre strings (e.g., ['sci-fi', 'mystery'])
 * @returns A style object containing background (pattern) properties
 */
export function getPatternStyle(genres: string[]): PatternStyle {
  if (!genres || genres.length === 0) return {};

  const lowerGenres = genres.map(g => g.toLowerCase().trim());

  // 1. Sci-Fi: Grid pattern
  if (lowerGenres.includes('sci-fi')) {
    return {
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    };
  }
  
  // 2. Fantasy: Dots/Stars pattern
  if (lowerGenres.includes('fantasy')) {
    return {
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)',
      backgroundSize: '16px 16px',
    };
  }
  
  // 3. Horror: Diagonal stripes
  if (lowerGenres.includes('horror')) {
    return {
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)',
    };
  }
  
  // 4. Romance: Soft polka dots
  if (lowerGenres.includes('romance')) {
    return {
      backgroundImage: 'radial-gradient(rgba(255,192,203,0.3) 15%, transparent 16%), radial-gradient(rgba(255,192,203,0.3) 15%, transparent 16%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
    };
  }
  
  // 5. Mystery: Checkerboard
  if (lowerGenres.includes('mystery')) {
    return {
      backgroundImage: 'conic-gradient(rgba(0,0,0,0.1) 90deg, transparent 90deg 180deg, rgba(0,0,0,0.1) 180deg 270deg, transparent 270deg)',
      backgroundSize: '20px 20px',
    };
  }

  // Default: empty object maps to no pattern
  return {};
}
