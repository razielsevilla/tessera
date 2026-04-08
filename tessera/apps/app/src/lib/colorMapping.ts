/**
 * Map mood and social battery to an HSL color string.
 *
 * @param moodScore - A number from 1 to 10 representing daily mood.
 *                    (1 = worst, 10 = best)
 * @param socialBattery - A number representing social energy.
 *                        Higher value means higher saturation.
 * @returns A string representing the CSS HSL color (e.g., "hsl(120, 100%, 50%)")
 */
export function getTileColor(moodScore: number, socialBattery: number): string {
  // Clamp mood to 1-10
  const clampedMood = Math.max(1, Math.min(10, moodScore));
  
  // Map mood (1-10) to Hue (0 to 120 degrees: Red -> Yellow -> Green)
  // 1 -> 0 (Red)
  // 5.5 -> 60 (Yellow)
  // 10 -> 120 (Green)
  const hue = Math.floor(((clampedMood - 1) / 9) * 120);

  // Clamp social battery
  // If socialBattery is a 1-10 scale like mood, map it to 0-100 logic.
  let batteryScale = socialBattery;
  if (socialBattery <= 10 && socialBattery >= 1) {
    // Treat as 1-10 scale
    batteryScale = ((socialBattery - 1) / 9) * 100;
  }
  
  const clampedBattery = Math.max(0, Math.min(100, batteryScale));
  
  // Map social battery to saturation (e.g., 20% to 100%)
  const minSaturation = 20;
  const saturation = minSaturation + Math.floor((clampedBattery / 100) * (100 - minSaturation));

  // Lightness can be fixed to 50% for vibrant colors, or adjusted slightly
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Map productivity score to CSS opacity and blur (glow) intensity.
 *
 * @param productivityScore - A number representing productivity. (e.g., 0-100)
 * @returns An object containing `opacity` (0.2 to 1) and `glowBlurOffset` (in px)
 */
export function getGlowAndOpacity(productivityScore: number): { opacity: number; blurRadius: number } {
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  
  // Assume productivity score varies generally between 0 and 100 for this scale
  const clampedScore = clamp(productivityScore, 0, 100);

  // Map 0 -> 0.3 opacity to still allow visibility, 100 -> 1.0 opacity
  const minOpacity = 0.3;
  const opacity = minOpacity + (clampedScore / 100) * (1 - minOpacity);

  // Map 0 -> 0px blur, 100 -> 24px blur (representing a strong glow)
  const blurRadius = Math.floor((clampedScore / 100) * 24);

  return {
    opacity: Number(opacity.toFixed(2)),
    blurRadius,
  };
}
