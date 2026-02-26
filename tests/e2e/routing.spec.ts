import { test, expect } from '@playwright/test';

test.describe('Remix Routing & Error Boundaries', () => {

    test('should navigate between Dashboard and Settings seamlessly', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('h1')).toContainText('Your Projects');

        // Click on settings link in sidebar
        await page.click('nav a[href="/settings"]');

        // Assert URL change and content load
        await expect(page).toHaveURL(/\/settings/);
        await expect(page.locator('h1')).toContainText('Account Settings');
    });

    test('should trigger the global Error Boundary when a loader fails', async ({ page }) => {
        // Intercept a critical loader call and return an error
        await page.route('**/api/projects', (route) => {
            route.fulfill({ status: 500 });
        });

        await page.goto('/dashboard');

        // Verify the ErrorBoundary caught the 500 and rendered the fallback UI
        await expect(page.locator('text=Something went wrong')).toBeVisible();
        await expect(page.locator('button:has-text("Try again")')).toBeVisible();
    });

    test('should display a 404 page for non-existent routes', async ({ page }) => {
        await page.goto('/does-not-exist-route');
        await expect(page.locator('text=Page Not Found')).toBeVisible();
        await expect(page.locator('a:has-text("Back to Dashboard")')).toBeVisible();
    });
});

