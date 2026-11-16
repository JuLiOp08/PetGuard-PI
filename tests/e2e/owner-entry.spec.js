import { expect, test } from '@playwright/test';

test('la carga de cinco segundos da paso a la selección de perfil', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  const splash = page.locator('.entry-splash');
  await expect(splash).toBeVisible();
  await expect(splash.getByRole('heading', { name: 'Cada huella cuenta' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Entrar como propietario/ })).toHaveCount(0);
  const progressDuration = await splash.locator('.entry-splash__progress').evaluate((bar) => globalThis.getComputedStyle(bar, '::after').animationDuration);
  expect(progressDuration).toBe('5s');
  await page.waitForTimeout(4200);
  await expect(splash).toBeVisible();
  await expect(page.getByRole('button', { name: /Entrar como propietario/ })).toBeVisible();
  await expect(splash).toHaveCount(0);
  expect(Date.now() - started).toBeGreaterThanOrEqual(4900);
  const cornerRadius = await page.locator('.role-entry__intro').evaluate((intro) => globalThis.getComputedStyle(intro).borderRadius);
  expect(cornerRadius === '0px').toBe(page.viewportSize().width <= 760);
});

test('el propietario ve un camino de huellas durante cinco segundos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  const started = Date.now();
  const transition = page.locator('.entry-transition[data-role="owner"]');
  await expect(transition).toBeVisible();
  await expect(transition.getByRole('heading', { name: 'Bienvenido a tu espacio' })).toBeVisible();
  await expect(transition.locator('.entry-transition__paw')).toHaveCount(8);
  await page.waitForTimeout(4200);
  await expect(transition).toBeVisible();
  const content = await transition.locator('.entry-transition__content').boundingBox();
  const viewport = page.viewportSize();
  expect(content.y).toBeGreaterThanOrEqual(0);
  expect(content.y + content.height).toBeLessThanOrEqual(viewport.height);
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  expect(Date.now() - started).toBeGreaterThanOrEqual(4900);
  const overflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('el familiar ve mensajes propios durante la transición de cinco segundos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Entrar como familiar/ }).click();
  const started = Date.now();
  const transition = page.locator('.entry-transition[data-role="family"]');
  await expect(transition).toBeVisible();
  await expect(transition.getByRole('heading', { name: 'Tu apoyo hace la diferencia' })).toBeVisible();
  await expect(transition.getByText('Preparando las fichas compartidas y los avisos de tu círculo.')).toBeVisible();
  await expect(transition.locator('.entry-transition__paw')).toHaveCount(8);
  await page.waitForTimeout(4200);
  await expect(transition).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mascotas y casos compartidos' })).toBeVisible();
  expect(Date.now() - started).toBeGreaterThanOrEqual(4900);
});

test('el movimiento reducido omite las pantallas de espera', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.entry-splash')).toHaveCount(0);
  await page.getByRole('button', { name: /Entrar como familiar/ }).click();
  await expect(page.locator('.entry-transition')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Mascotas y casos compartidos' })).toBeVisible();
});
