import { describe, it, expect } from 'vitest';
import { calculateProductivityScore } from './scoring';

describe('calculateProductivityScore', () => {
  it('returns the base score of 20 when no tasks are completed', () => {
    expect(calculateProductivityScore(0, 0)).toBe(20);
  });

  it('correctly adds task points at a 1:1 weight', () => {
    // 20 (base) + 30 (task) = 50
    expect(calculateProductivityScore(30, 0)).toBe(50);
  });

  it('correctly calculates economy points at half weight (0.5:1)', () => {
    // 20 (base) + (30 / 2) = 35
    expect(calculateProductivityScore(0, 30)).toBe(35);
  });

  it('handles a mix of task and economy points and floors non-integer values', () => {
    // 20 (base) + 40 (task) + 15 / 2 = 67.5 -> floored to 67
    expect(calculateProductivityScore(40, 15)).toBe(67);
  });

  it('aggressively caps the total score at 100 on perfect days', () => {
    // 20 + 80 = 100
    expect(calculateProductivityScore(80, 0)).toBe(100);
    // 20 + 100 + 40 = 160 -> capped at 100
    expect(calculateProductivityScore(100, 80)).toBe(100);
  });

  it('defaults to base score if points somehow register as mathematically negative', () => {
    expect(calculateProductivityScore(-10, -5)).toBe(20);
  });
});
