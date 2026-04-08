import { describe, it, expect } from 'vitest';
import { getPatternStyle } from './patternMapping';

describe('patternMapping', () => {
  it('returns an empty object if no genres are provided', () => {
    expect(getPatternStyle([])).toEqual({});
  });

  it('maps sci-fi correctly on lowercase and with other genres', () => {
    const style1 = getPatternStyle(['Sci-Fi ']);
    const style2 = getPatternStyle(['horror', 'sci-fi']); // Sci-Fi should be precedence due to order of operations inside logic

    expect(style1.backgroundImage).toContain('linear-gradient');
    expect(style1.backgroundSize).toEqual('10px 10px');
    expect(style2.backgroundImage).toContain('linear-gradient');
  });

  it('maps fantasy to dots', () => {
    const style = getPatternStyle(['fantasy']);
    expect(style.backgroundImage).toContain('radial-gradient(circle');
    expect(style.backgroundSize).toEqual('16px 16px');
  });

  it('maps horror to diagonal stripes', () => {
    const style = getPatternStyle(['Horror']);
    expect(style.backgroundImage).toContain('repeating-linear-gradient');
  });

  it('maps romance to dual polka dots', () => {
    const style = getPatternStyle(['ROMANCE']);
    expect(style.backgroundImage).toContain('radial-gradient');
    expect(style.backgroundSize).toEqual('20px 20px');
    expect(style.backgroundPosition).toEqual('0 0, 10px 10px');
  });

  it('maps mystery to checkerboard', () => {
    const style = getPatternStyle(['mystery']);
    expect(style.backgroundImage).toContain('conic-gradient');
    expect(style.backgroundSize).toEqual('20px 20px');
  });
});
