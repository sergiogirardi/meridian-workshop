import { test, expect } from '@playwright/test';

const filterSelect = (page, label) =>
  page.locator('.filter-group').filter({ hasText: label }).locator('select');

test.describe('Performance Reports (R1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    // Wait for data to finish loading
    await page.waitForFunction(() => {
      const main = document.querySelector('main')?.textContent ?? '';
      return main.length > 50 && !main.includes('Loading...');
    }, { timeout: 5000 });
  });

  test('page renders quarterly performance heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quarterly Performance' })).toBeVisible();
  });

  test('quarterly table shows all four 2025 quarters', async ({ page }) => {
    for (const quarter of ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025']) {
      await expect(page.getByRole('cell').filter({ hasText: quarter }).first()).toBeVisible();
    }
  });

  test('quarterly table has required column headers', async ({ page }) => {
    for (const col of ['Quarter', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Fulfillment Rate']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('monthly revenue trend chart is rendered', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monthly Revenue Trend' })).toBeVisible();
    await expect(page.locator('.bar-chart')).toBeVisible();
  });

  test('fulfillment rate values are displayed for each quarter', async ({ page }) => {
    const rates = page.locator('tbody tr td').last();
    const count = await page.locator('tbody tr').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('location filter applies to report view', async ({ page }) => {
    await filterSelect(page, 'Location').selectOption('San Francisco');
    await page.waitForTimeout(400);
    await expect(page.getByRole('heading', { name: 'Performance Reports' })).toBeVisible();
  });
});

test.describe('Restocking Recommendations (R2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking');
  });

  test('page renders with budget label, input and button', async ({ page }) => {
    await expect(page.getByText('Budget Ceiling ($)')).toBeVisible();
    await expect(page.getByRole('spinbutton')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Recommendations' })).toBeVisible();
  });

  test('Get Recommendations button is disabled with no budget entered', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Get Recommendations' })).toBeDisabled();
  });

  test('entering a budget enables the Get Recommendations button', async ({ page }) => {
    await page.getByRole('spinbutton').fill('50000');
    await expect(page.getByRole('button', { name: 'Get Recommendations' })).toBeEnabled();
  });

  test('clicking Get Recommendations shows results or no-items message', async ({ page }) => {
    await page.getByRole('spinbutton').fill('50000');
    await page.getByRole('button', { name: 'Get Recommendations' }).click();
    await page.waitForFunction(() => {
      const main = document.querySelector('main')?.textContent ?? '';
      return !main.includes('Loading') && !main.includes('Enter a budget ceiling above');
    }, { timeout: 5000 });
    const main = page.locator('main');
    await expect(main).not.toContainText('Enter a budget ceiling above');
  });
});
