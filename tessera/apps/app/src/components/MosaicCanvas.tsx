import React from 'react';

interface TesseraSlot {
  id: number;
  isFilled: boolean;
}

interface MosaicCanvasProps {
  slots?: TesseraSlot[];
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({ slots }) => {
  // Default to 365 mock slots if none provided
  const defaultSlots = Array.from({ length: 365 }).map((_, i) => ({
    id: i,
    // Mock a few filled states for visual testing
    isFilled: [32, 45, 100, 250, 364].includes(i),
  }));

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
          <div
            key={slot.id}
            className={w-3 h-3 rounded-sm transition-colors \}
            title={Day \\}
          />
        ))}
      </div>
    </div>
  );
};
