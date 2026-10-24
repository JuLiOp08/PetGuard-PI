import { expect, test } from '@playwright/test';

test.afterEach(async ({ page }) => {
  await page.goto('about:blank');
});

async function createProfile(page) {
  await page.goto('/');
  await page.getByLabel('Nombre o alias').fill('Ana');
  await page.getByRole('button', { name: /Entrar a PetGuard/ }).click();
  await expect(page.getByRole('heading', { name: 'Todo lo importante, a mano.' })).toBeVisible();
}

async function createPet(page) {
  await page.getByRole('button', { name: /Registrar mascota/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre *').fill('Luna');
  await dialog.getByLabel('Color principal *').fill('Marrón');
  await dialog.getByRole('button', { name: 'Guardar mascota' }).click();
  await expect(page.getByText('Luna').first()).toBeVisible();
}

async function pickMapCenter(dialog) {
  const map = dialog.getByRole('application', { name: 'Mapa para seleccionar coordenadas' });
  await expect(map).toBeVisible();
  await map.click({ position: { x: 160, y: 110 } });
  await expect(dialog.locator('[name="lat"]')).not.toHaveValue('');
  await expect(dialog.locator('[name="lng"]')).not.toHaveValue('');
}

test('el primer perfil recibe datos de demostración persistentes', async ({ page }) => {
  await createProfile(page);

  await expect(page.locator('.metric').filter({ hasText: 'Mascotas' }).locator('strong')).toHaveText('2');
  await expect(page.locator('.metric').filter({ hasText: 'Ubicaciones' }).locator('strong')).toHaveText('3');
  await expect(page.locator('.metric').filter({ hasText: 'Alertas activas' }).locator('strong')).toHaveText('1');
  await expect(page.getByText('Canela').first()).toBeVisible();
  await expect(page.getByText('Nube').first()).toBeVisible();

  await page.goto('/#/alerts');
  await expect(page.getByRole('heading', { name: 'Nube' })).toBeVisible();
  await page.getByRole('link', { name: /Abrir caso/ }).click();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Alerta de Nube' })).toBeVisible();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
});

test('los iconos del resumen están centrados dentro de sus cuadrados', async ({ page }) => {
  await createProfile(page);

  const offsets = await page.locator('.metric__icon').evaluateAll((containers) => containers.map((container) => {
    const icon = container.querySelector('svg');
    const outer = container.getBoundingClientRect();
    const inner = icon.getBoundingClientRect();
    return {
      x: Math.abs((outer.left + outer.width / 2) - (inner.left + inner.width / 2)),
      y: Math.abs((outer.top + outer.height / 2) - (inner.top + inner.height / 2))
    };
  }));

  expect(offsets).toHaveLength(4);
  for (const offset of offsets) {
    expect(offset.x).toBeLessThanOrEqual(1);
    expect(offset.y).toBeLessThanOrEqual(1);
  }
});

test('una ubicación conocida se puede seleccionar en el mapa y guardar', async ({ page }) => {
  await createProfile(page);
  await createPet(page);

  await page.getByRole('button', { name: /Añadir/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mascota *').selectOption({ label: 'Luna' });
  await expect(dialog.getByLabel(/Latitud/)).toHaveCount(0);
  await expect(dialog.getByLabel(/Longitud/)).toHaveCount(0);
  await expect(dialog.getByText(/Precisión aproximada/)).toHaveCount(0);
  await expect(dialog.locator('[name="lat"]')).toHaveAttribute('type', 'hidden');
  await expect(dialog.locator('[name="lng"]')).toHaveAttribute('type', 'hidden');
  await pickMapCenter(dialog);
  const lat = await dialog.locator('[name="lat"]').inputValue();
  const lng = await dialog.locator('[name="lng"]').inputValue();
  await dialog.getByRole('button', { name: 'Guardar ubicación' }).click();

  await expect(page.getByText(`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`)).toBeVisible();
});

test('el selector de mapa no depende de archivos publicados desde node_modules', async ({ page }) => {
  await page.route('**/node_modules/**', (route) => route.fulfill({ status: 404, body: 'Not found' }));
  await createProfile(page);
  await createPet(page);

  await page.getByRole('button', { name: /Añadir/ }).click();
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByRole('application', { name: 'Mapa para seleccionar coordenadas' })).toHaveClass(/maplibregl-map/);
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
});

test('el mapa funciona en celulares que sólo ofrecen WebGL1', async ({ page }) => {
  await page.addInitScript(() => {
    const Canvas = globalThis.HTMLCanvasElement;
    const getContext = Canvas.prototype.getContext;
    Canvas.prototype.getContext = function getCompatibleContext(type, ...args) {
      if (type === 'webgl2') return null;
      return getContext.call(this, type, ...args);
    };
  });
  await createProfile(page);
  await createPet(page);

  await page.getByRole('button', { name: /Añadir/ }).click();
  const dialog = page.getByRole('dialog');
  await pickMapCenter(dialog);
  await expect(page.getByText(/Cannot read properties|WebGL2/i)).toHaveCount(0);
});

test('un avistamiento se puede seleccionar en el mapa y guardar', async ({ page }) => {
  await createProfile(page);
  await createPet(page);

  await page.goto('/#/alerts');
  await page.getByRole('button', { name: /Activar alerta/ }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mascota *').selectOption({ label: 'Luna' });
  await dialog.getByLabel('Mensaje de búsqueda *').fill('Luna está extraviada');
  await dialog.getByRole('button', { name: 'Activar alerta' }).click();
  await page.locator('.alert-card').filter({ hasText: 'Luna' }).getByRole('link', { name: /Abrir caso/ }).click();
  await page.getByRole('button', { name: 'Registrar avistamiento' }).click();

  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Descripción *').fill('Vista cerca del parque');
  await pickMapCenter(dialog);
  await dialog.getByRole('button', { name: 'Guardar avistamiento' }).click();

  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
});
