import React from 'react';
import { TesseraCell } from './TesseraCell';

export const MosaicLegend: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 mt-6 bg-white dark:bg-stone-800 rounded-xl shadow-lg flex flex-col gap-6 text-sm">
      <h3 className="text-lg font-semibold border-b border-stone-200 dark:border-stone-700 pb-2">Mosaic Legend</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Mood */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Mood (Hue)</span>
          <div className="flex gap-1 items-center justify-between">
            <span className="text-xs text-stone-500">Bad</span>
            <div className="flex gap-1">
              {[1, 3, 5, 7, 10].map(val => (
                <TesseraCell key={`mood-${val}`} id={val} isFilled={true} metadata={{ moodScore: val, socialBattery: 5, productivityScore: 100, frameTier: 0 }} />
              ))}
            </div>
            <span className="text-xs text-stone-500">Good</span>
          </div>
        </div>

        {/* Social Battery */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Social Battery (Lightness)</span>
          <div className="flex gap-1 items-center justify-between">
            <span className="text-xs text-stone-500">Drained</span>
            <div className="flex gap-1">
              {[1, 3, 5, 7, 10].map(val => (
                <TesseraCell key={`social-${val}`} id={val} isFilled={true} metadata={{ moodScore: 10, socialBattery: val, productivityScore: 100, frameTier: 0 }} />
              ))}
            </div>
            <span className="text-xs text-stone-500">Charged</span>
          </div>
        </div>

        {/* Productivity */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Productivity (Opacity)</span>
          <div className="flex gap-1 items-center justify-between">
            <span className="text-xs text-stone-500">Low</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map(val => (
                <TesseraCell key={`prod-${val}`} id={val} isFilled={true} metadata={{ moodScore: 10, socialBattery: 5, productivityScore: val, frameTier: 0 }} />
              ))}
            </div>
            <span className="text-xs text-stone-500">High</span>
          </div>
        </div>

        {/* Frame Tier */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Frame Tier (Border)</span>
          <div className="flex gap-3 items-center justify-center pt-1">
            {[
              { tier: 0, label: 'None' },
              { tier: 1, label: 'Bronze' },
              { tier: 2, label: 'Silver' },
              { tier: 3, label: 'Gold' },
              { tier: 4, label: 'Epc' },
            ].map(val => (
              <div key={`tier-${val.tier}`} className="flex flex-col items-center gap-1" title={val.label}>
                <TesseraCell id={val.tier} isFilled={true} metadata={{ moodScore: 10, socialBattery: 5, productivityScore: 100, frameTier: val.tier }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
