import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('loads home page with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Factory Inventory Management System/);
    await expect(page.getByRole('heading', { name: 'Catalyst Components' })).toBeVisible();
  });

  test('all nav links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Inventory' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Finance' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Demand Forecast' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Performance Reports' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Restocking Recommendations' })).toBeVisible();
  });

  test('navigates to Performance Reports', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Performance Reports' }).click();
    await expect(page).toHaveURL('/reports');
    await expect(page.getByRole('heading', { name: 'Performance Reports' })).toBeVisible();
  });

  test('navigates to Restocking Recommendations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Restocking Recommendations' }).click();
    await expect(page).toHaveURL('/restocking');
    await expect(page.getByRole('heading', { name: 'Restocking Recommendations' })).toBeVisible();
  });

  test('direct URL routing works for all pages', async ({ page }) => {
    const routes = [
      { path: '/', heading: 'Overview' },
      { path: '/inventory', heading: 'Inventory' },
      { path: '/orders', heading: 'Orders' },
      { path: '/reports', heading: 'Performance Reports' },
      { path: '/restocking', heading: 'Restocking Recommendations' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { name: route.heading, level: 2 })).toBeVisible();
    }
  });
});
