import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('Tessera tile variants render correctly', async ({ page }) => {
    // Navigate to the main page which contains the MosaicLegend and variants
    await page.goto('/');
    
    // Wait for the canvas and legend to load
    const legend = page.locator('text=Mosaic Legend').locator('..');
    
    // Ensure legend is fully visible and rendered
    await expect(legend).toBeVisible();

    // Since animations can cause visual noise in snapshots, we might want to disable them
    // but playwright has utilities for that `animations: 'disabled'`
    await expect(legend).toHaveScreenshot('mosaic-legend-variants.png', {
      animations: 'disabled'
    });
  });
});
