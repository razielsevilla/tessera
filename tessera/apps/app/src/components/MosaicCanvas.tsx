import React from 'react';
import { TesseraCell, BMPMetadata } from './TesseraCell';

interface TesseraSlot {
  id: number;
  isFilled: boolean;
  metadata?: BMPMetadata;
}

interface MosaicCanvasProps {
  slots?: TesseraSlot[];
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({ slots }) => {
  // Default to 365 mock slots if none provided
  const defaultSlots = Array.from({ length: 365 }).map((_, i) => {
    const isFilled = [32, 45, 100, 250, 364].includes(i);
    
    // Generate some mock metadata to visually test the cell logic
    const mockMetadata: BMPMetadata | undefined = isFilled ? {
      moodScore: Math.floor(Math.random() * 10) + 1,
      socialBattery: Math.floor(Math.random() * 10) + 1,
      productivityScore: Math.floor(Math.random() * 100) + 1,
      frameTier: Math.floor(Math.random() * 5),
    } : undefined;

    return {
      id: i,
      isFilled,
      metadata: mockMetadata
    };
  });

  const displaySlots = slots || defaultSlots;

  return (
    <div className="w-full overflow-x-auto p-4 flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Your Year in Tessera</h3>
      <div 
        className="grid gap-1" 
        style={{ 
          gridTemplateColumns: 'repeat(52, minmax(12px, 1fr))',
          gridTemplateRows: 'repeat(7, 12px)'
        }}
      >
        {displaySlots.map((slot) => (
          <TesseraCell
            key={slot.id}
            id={slot.id}
            isFilled={slot.isFilled}
            metadata={slot.metadata}
          />
        ))}
      </div>
    </div>
  );
};
