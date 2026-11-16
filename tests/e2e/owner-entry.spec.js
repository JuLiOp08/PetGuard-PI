import { expect, test } from '@playwright/test';

test('la entrada anima la huella y el título durante cinco segundos sin bloquear la selección', async ({ page }) => {
  await page.goto('/');
  await page.locator('.role-entry__intro').waitFor();
  const appearance = await page.evaluate(() => ({
    pawDuration: globalThis.getComputedStyle(globalThis.document.querySelector('.role-entry__intro .brand__mark .icon')).animationDuration,
    titleDuration: globalThis.getComputedStyle(globalThis.document.querySelector('.role-entry__message h1')).animationDuration,
    cornerRadius: globalThis.getComputedStyle(globalThis.document.querySelector('.role-entry__intro')).borderRadius
  }));
  expect(appearance.pawDuration).toBe('5s');
  expect(appearance.titleDuration).toBe('5s');
  expect(appearance.cornerRadius === '0px').toBe(page.viewportSize().width <= 760);
  await expect(page.getByRole('button', { name: /Entrar como propietario/ })).toBeEnabled();
});

test('el propietario ve un camino de huellas durante cinco segundos', async ({ page }) => {
  await page.goto('/');
  const started = Date.now();
  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  const transition = page.locator('.owner-entry');
  await expect(transition).toBeVisible();
  await expect(transition.locator('.owner-entry__paw')).toHaveCount(8);
  await page.waitForTimeout(4200);
  await expect(transition).toBeVisible();
  const content = await transition.locator('.owner-entry__content').boundingBox();
  const viewport = page.viewportSize();
  expect(content.y).toBeGreaterThanOrEqual(0);
  expect(content.y + content.height).toBeLessThanOrEqual(viewport.height);
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  expect(Date.now() - started).toBeGreaterThanOrEqual(4900);
  const overflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('el movimiento reducido omite la transición', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const pawDuration = await page.locator('.role-entry__intro .brand__mark .icon').evaluate((icon) => globalThis.getComputedStyle(icon).animationDuration);
  expect(parseFloat(pawDuration)).toBeLessThan(0.01);
  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  await expect(page.locator('.owner-entry')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
});
