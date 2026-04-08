import { describe, it, expect } from 'vitest';
import { getTileColor, getGlowAndOpacity } from './colorMapping';

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

  describe('getGlowAndOpacity', () => {
    it('sets minimum opacity and no glow for 0 productivity', () => {
      const { opacity, blurRadius } = getGlowAndOpacity(0);
      expect(opacity).toBe(0.3);
      expect(blurRadius).toBe(0);
    });

    it('sets maximum opacity and max glow for 100 productivity', () => {
      const { opacity, blurRadius } = getGlowAndOpacity(100);
      expect(opacity).toBe(1);
      expect(blurRadius).toBe(24);
    });

    it('clamps values correctly for inputs > 100 or < 0', () => {
      const { opacity, blurRadius } = getGlowAndOpacity(250);
      expect(opacity).toBe(1);
      expect(blurRadius).toBe(24);

      const negativeResult = getGlowAndOpacity(-20);
      expect(negativeResult.opacity).toBe(0.3);
      expect(negativeResult.blurRadius).toBe(0);
    });
  });
});

