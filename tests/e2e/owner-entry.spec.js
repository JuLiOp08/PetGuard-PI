import { expect, test } from '@playwright/test';

test('el propietario ve un camino de huellas durante tres segundos', async ({ page }) => {
  await page.goto('/');
  const started = Date.now();
  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  const transition = page.locator('.owner-entry');
  await expect(transition).toBeVisible();
  await expect(transition.locator('.owner-entry__paw')).toHaveCount(8);
  await page.waitForTimeout(2200);
  await expect(transition).toBeVisible();
  const content = await transition.locator('.owner-entry__content').boundingBox();
  const viewport = page.viewportSize();
  expect(content.y).toBeGreaterThanOrEqual(0);
  expect(content.y + content.height).toBeLessThanOrEqual(viewport.height);
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  expect(Date.now() - started).toBeGreaterThanOrEqual(2900);
  const overflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('el movimiento reducido omite la transición', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  await expect(page.locator('.owner-entry')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
});
