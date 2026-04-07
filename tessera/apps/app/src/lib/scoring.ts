/**
 * Calculates the overall productivity score for a given day in the Sprint & Project Module.
 * 
 * Formula details:
 * - Base Score: Everyone starts with 20 base points for showing up.
 * - Task Points: Sprint tasks carry a 1:1 weight. Completed tasks add directly to the score.
 * - Economy Points: Household/Life economy tasks carry a 0.5:1 weight (divided by 2), reflecting secondary effort.
 * 
 * Constraints:
 * - The final score is strictly clamped between a floor of 0 and a maximum cap of 100.
 *
 * @param taskPoints Total sum of points from completed sprint tasks
 * @param economyPoints Total sum of points from completed life economy (household) tasks
 * @returns Final productivity score scaled between 0 and 100
 */
export function calculateProductivityScore(taskPoints: number, economyPoints: number): number {
  if (taskPoints < 0 || economyPoints < 0) {
    return 20; // Safe fallback for invalid/negative inputs
  }
  
  const baseScore = 20;
  const economyWeight = economyPoints / 2;
  const rawTotal = baseScore + taskPoints + economyWeight;
  
  return Math.max(0, Math.min(100, Math.floor(rawTotal)));
}
