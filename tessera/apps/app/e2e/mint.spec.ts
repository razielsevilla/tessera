import { test, expect } from '@playwright/test';

test.describe('Tessera Dashboard', () => {
  test('should display initial state when wallet is not connected', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.getByRole('heading', { name: 'Tessera Dashboard', exact: true })).toBeVisible();

    // Check disconnected state text
    await expect(page.getByText(/Please connect your.*wallet/i)).toBeVisible();
    
    // Check that grid renders
    await expect(page.locator('.grid')).toBeVisible();
  });
});
