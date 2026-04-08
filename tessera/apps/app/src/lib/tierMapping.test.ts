import { describe, it, expect } from 'vitest';
import { getFrameStyle } from './tierMapping';

describe('tierMapping', () => {
  it('returns default none styling for tier 0', () => {
    const style = getFrameStyle(0);
    expect(style.borderWidth).toEqual('0px');
    expect(style.borderColor).toEqual('transparent');
  });

  it('maps tier 1 to Bronze', () => {
    const style = getFrameStyle(1);
    expect(style.borderColor).toEqual('#CD7F32');
    expect(style.borderWidth).toEqual('2px');
  });

  it('maps tier 2 to Silver', () => {
    const style = getFrameStyle(2);
    expect(style.borderColor).toEqual('#C0C0C0');
    expect(style.borderWidth).toEqual('3px');
  });

  it('maps tier 3 to Gold with box shadow', () => {
    const style = getFrameStyle(3);
    expect(style.borderColor).toEqual('#FFD700');
    expect(style.boxShadow).toBeDefined();
  });

  it('maps tier 4 to Legendary with glowing borders', () => {
    const style = getFrameStyle(4);
    expect(style.borderColor).toEqual('#E5E4E2');
    expect(style.boxShadow).toBeDefined();
  });
});
