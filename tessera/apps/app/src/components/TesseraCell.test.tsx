// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TesseraCell } from './TesseraCell';

describe('TesseraCell Visual Variants', () => {
  it('renders correctly when empty', () => {
    const { container } = render(<TesseraCell id={1} isFilled={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  const tiers = [
    { name: 'None (Tier 0)', tier: 0 },
    { name: 'Bronze (Tier 1)', tier: 1 },
    { name: 'Silver (Tier 2)', tier: 2 },
    { name: 'Gold (Tier 3)', tier: 3 },
    { name: 'Legendary (Tier 4)', tier: 4 },
  ];

  tiers.forEach(({ name, tier }) => {
    it(`renders correctly with Frame Tier: ${name}`, () => {
      const { container } = render(
        <TesseraCell 
          id={1} 
          isFilled={true} 
          metadata={{ moodScore: 8, socialBattery: 6, productivityScore: 85, frameTier: tier }} 
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it('renders correctly with streak styling', () => {
    const { container } = render(
      <TesseraCell 
        id={1} 
        isFilled={true} 
        hasPrevStreak={true}
        metadata={{ moodScore: 8, socialBattery: 6, productivityScore: 85, frameTier: 0 }} 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders correctly as newly minted', () => {
    const { container } = render(
      <TesseraCell 
        id={1} 
        isFilled={true} 
        isNewMint={true}
        metadata={{ moodScore: 8, socialBattery: 6, productivityScore: 85, frameTier: 0 }} 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  
  it('renders correctly with low mood, low social, low prod', () => {
    const { container } = render(
      <TesseraCell 
        id={1} 
        isFilled={true} 
        metadata={{ moodScore: 1, socialBattery: 1, productivityScore: 0, frameTier: 0 }} 
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
