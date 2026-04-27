import { test, expect } from '@playwright/test';

// Helper: find a filter <select> by its label text
const filterSelect = (page, label) =>
  page.locator('.filter-group').filter({ hasText: label }).locator('select');

test.describe('Global Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main');
  });

  test('filter bar is visible with all four dropdowns', async ({ page }) => {
    for (const label of ['Time Period', 'Location', 'Category', 'Order Status']) {
      await expect(filterSelect(page, label)).toBeVisible();
    }
  });

  test('Reset button is disabled when no filters active', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Reset all filters/i })).toBeDisabled();
  });

  test('Reset button enables after selecting a location filter', async ({ page }) => {
    await filterSelect(page, 'Location').selectOption('San Francisco');
    await expect(page.getByRole('button', { name: /Reset all filters/i })).toBeEnabled();
  });

  test('Reset button clears all filters and disables itself', async ({ page }) => {
    await filterSelect(page, 'Location').selectOption('London');
    await filterSelect(page, 'Category').selectOption('sensors');

    const resetBtn = page.getByRole('button', { name: /Reset all filters/i });
    await expect(resetBtn).toBeEnabled();
    await resetBtn.click();

    await expect(filterSelect(page, 'Location')).toHaveValue('all');
    await expect(filterSelect(page, 'Category')).toHaveValue('all');
    await expect(resetBtn).toBeDisabled();
  });

  test('location filter has all warehouse options', async ({ page }) => {
    const select = filterSelect(page, 'Location');
    await expect(select.getByRole('option', { name: 'All' })).toBeAttached();
    await expect(select.getByRole('option', { name: 'San Francisco' })).toBeAttached();
    await expect(select.getByRole('option', { name: 'London' })).toBeAttached();
    await expect(select.getByRole('option', { name: 'Tokyo' })).toBeAttached();
  });

  test('category filter has all five product categories', async ({ page }) => {
    const select = filterSelect(page, 'Category');
    for (const cat of ['Circuit Boards', 'Sensors', 'Actuators', 'Controllers', 'Power Supplies']) {
      await expect(select.getByRole('option', { name: cat })).toBeAttached();
    }
  });

  test('filters persist when navigating between pages', async ({ page }) => {
    await filterSelect(page, 'Location').selectOption('Tokyo');
    await page.getByRole('link', { name: 'Performance Reports' }).click();
    await expect(filterSelect(page, 'Location')).toHaveValue('Tokyo');
  });
});
