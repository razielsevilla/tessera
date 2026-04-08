import { describe, it, expect } from 'vitest';
import { getTileColor } from './colorMapping';

describe('colorMapping', () => {
  it('maps low mood score to a red hue', () => {
    // Mood 1 should map to Hue 0 (Red)
    const color = getTileColor(1, 10);
    expect(color).toMatch(/^hsl\(0, /);
  });

  it('maps high mood score to a green hue', () => {
    // Mood 10 should map to Hue 120 (Green)
    const color = getTileColor(10, 10);
    expect(color).toMatch(/^hsl\(120, /);
  });

  it('maps low social battery (1-10 scale) to low saturation', () => {
    // Battery 1 -> saturation 20%
    const color = getTileColor(5, 1);
    expect(color).toBe('hsl(53, 20%, 50%)');
  });

  it('maps high social battery (0-100 scale) to high saturation', () => {
    // Battery 100 -> saturation 100%
    const color = getTileColor(5, 100);
    expect(color).toBe('hsl(53, 100%, 50%)');
  });
});
