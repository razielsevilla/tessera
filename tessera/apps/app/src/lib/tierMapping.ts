export type FrameTier = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Legendary';

export interface FrameStyle {
  borderColor: string;
  borderWidth: string;
  boxShadow?: string;
}

/**
 * Maps a frame tier number from the on-chain payload to a visual frame style.
 *
 * Tier Mapping:
 * 0 -> None
 * 1 -> Bronze
 * 2 -> Silver
 * 3 -> Gold
 * 4 -> Legendary
 *
 * @param tierLevel - The numeric tier level (e.g., from user's milestone account)
 * @returns A style object containing border properties
 */
export function getFrameStyle(tierLevel: number): FrameStyle {
  switch (tierLevel) {
    case 1:
      return {
        borderColor: '#CD7F32', // Bronze
        borderWidth: '2px',
      };
    case 2:
      return {
        borderColor: '#C0C0C0', // Silver
        borderWidth: '3px',
      };
    case 3:
      return {
        borderColor: '#FFD700', // Gold
        borderWidth: '4px',
        boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.6)',
      };
    case 4:
      return {
        borderColor: '#E5E4E2', // Platinum/Legendary base
        borderWidth: '4px',
        boxShadow: '0 0 12px 4px rgba(229, 228, 226, 0.8)',
      };
    case 0:
    default:
      return {
        borderColor: 'transparent',
        borderWidth: '0px',
      };
  }
}
