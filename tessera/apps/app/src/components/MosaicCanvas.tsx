import React, { useState, useRef, useCallback } from 'react';
import { TesseraCell, BMPMetadata } from './TesseraCell';
import { MosaicLegend } from './MosaicLegend';

interface TesseraSlot {
  id: number;
  isFilled: boolean;
  metadata?: BMPMetadata;
}

interface MosaicCanvasProps {
  slots?: TesseraSlot[];
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({ slots }) => {
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Default to 365 mock slots if none provided
  const defaultSlots = Array.from({ length: 365 }).map((_, i) => {
    // Generate some consecutive days for streak testing
    const isFilled = [32, 33, 34, 45, 100, 250, 251, 364].includes(i);
    
    // Generate deterministic mock metadata to prevent React hydration mismatch
    const mockMetadata: BMPMetadata | undefined = isFilled ? {
      moodScore: (i % 10) + 1,
      socialBattery: ((i * 3) % 10) + 1,
      productivityScore: ((i * 7) % 100) + 1,
      frameTier: i % 5,
    } : undefined;

    return {
      id: i + 1, // Make day ID 1-indexed to look better
      isFilled,
      metadata: mockMetadata
    };
  });

  const displaySlots = slots || defaultSlots;

  const handleCellClick = (id: number) => {
    setSelectedDayId(id);
  };

  const handleBackToYear = () => {
    setSelectedDayId(null);
  };

  const handleExportPNG = useCallback(() => {
    if (mosaicRef.current === null) return;
    setExporting(true);
    // Slight delay to allow any UI changes (like hiding borders) to apply before capture
    setTimeout(() => {
      import('html-to-image').then(({ toPng }) => {
        toPng(mosaicRef.current as HTMLElement, { cacheBust: true, pixelRatio: 2 })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'tessera-mosaic.png';
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => {
            console.error('Oops, something went wrong!', err);
          })
          .finally(() => setExporting(false));
      });
    }, 100);
  }, [mosaicRef]);

  const handleExportSVG = useCallback(() => {
    if (mosaicRef.current === null) return;
    setExporting(true);
    setTimeout(() => {
      import('html-to-image').then(({ toSvg }) => {
        toSvg(mosaicRef.current as HTMLElement, { cacheBust: true })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'tessera-mosaic.svg';
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => {
            console.error('Oops, something went wrong!', err);
          })
          .finally(() => setExporting(false));
      });
    }, 100);
  }, [mosaicRef]);

  if (selectedDayId !== null) {
    const selectedSlot = displaySlots.find(s => s.id === selectedDayId);
    
    return (
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center bg-white dark:bg-stone-800 rounded-lg shadow-lg animate-fade-in transition-all">
        <button 
          onClick={handleBackToYear}
          className="self-start text-sm text-stone-500 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-300 mb-4 flex items-center gap-1"
        >
          &larr; Back to Year View
        </button>
        <h3 className="text-xl sm:text-2xl font-semibold mb-6">Day {selectedDayId}</h3>
        
        <div className="mb-6 transform scale-[4.0] my-8">
          <TesseraCell
            id={selectedDayId}
            isFilled={selectedSlot?.isFilled || false}
            metadata={selectedSlot?.metadata}
          />
        </div>
        
        {selectedSlot?.isFilled ? (
          <div className="w-full space-y-3 pt-6 border-t border-stone-200 dark:border-stone-700">
            <div className="flex justify-between items-center px-4 py-2 bg-stone-50 dark:bg-stone-700/50 rounded">
              <span className="text-stone-500 dark:text-stone-400 text-sm">Mood</span>
              <span className="font-medium">{selectedSlot.metadata?.moodScore}/10</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-stone-50 dark:bg-stone-700/50 rounded">
              <span className="text-stone-500 dark:text-stone-400 text-sm">Social Battery</span>
              <span className="font-medium">{selectedSlot.metadata?.socialBattery}/10</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-stone-50 dark:bg-stone-700/50 rounded">
              <span className="text-stone-500 dark:text-stone-400 text-sm">Productivity</span>
              <span className="font-medium">{selectedSlot.metadata?.productivityScore}/100</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-stone-50 dark:bg-stone-700/50 rounded">
              <span className="text-stone-500 dark:text-stone-400 text-sm">Frame Tier</span>
              <span className="font-medium">{['None', 'Bronze', 'Silver', 'Gold', 'Legendary'][selectedSlot.metadata?.frameTier || 0]}</span>
            </div>
          </div>
        ) : (
          <div className="w-full py-8 text-center text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-700 mt-4">
            No tessera minted on this day.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-2 sm:p-4 flex flex-col items-center animate-fade-in transition-all">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
        <h3 className="text-lg sm:text-xl font-serif text-stone-800 dark:text-stone-200">Past Entries</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleExportPNG} 
            disabled={exporting}
            className="text-xs font-serif bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            Export PNG
          </button>
          <button 
            onClick={handleExportSVG} 
            disabled={exporting}
            className="text-xs font-serif bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            Export SVG
          </button>
        </div>
      </div>
      
      <div ref={mosaicRef} className="p-6 bg-white dark:bg-stone-950 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800 inline-block">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: 'repeat(52, minmax(12px, 16px))',
            gridTemplateRows: 'repeat(7, minmax(12px, 16px))',
            gridAutoFlow: 'column'
          }}
        >
          {displaySlots.map((slot, i) => {
            const hasPrevStreak = slot.isFilled && i > 0 && displaySlots[i - 1].isFilled;
            const hasNextStreak = slot.isFilled && i < displaySlots.length - 1 && displaySlots[i + 1].isFilled;

            return (
              <TesseraCell
                key={slot.id}
                id={slot.id}
                isFilled={slot.isFilled}
                metadata={slot.metadata}
                onClick={handleCellClick}
                hasPrevStreak={hasPrevStreak}
                hasNextStreak={hasNextStreak}
              />
            );
          })}
        </div>
      </div>
      <MosaicLegend />
    </div>
  );
};
