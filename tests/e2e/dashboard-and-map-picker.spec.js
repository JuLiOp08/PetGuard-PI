import { expect, test } from '@playwright/test';

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
  await dialog.getByRole('button', { name: 'Seleccionar en el mapa' }).click();
  const map = dialog.getByRole('application', { name: 'Mapa para seleccionar coordenadas' });
  await expect(map).toBeVisible();
  await map.click({ position: { x: 160, y: 110 } });
  await expect(dialog.locator('[name="lat"]')).not.toHaveValue('');
  await expect(dialog.locator('[name="lng"]')).not.toHaveValue('');
}

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
  await pickMapCenter(dialog);
  const lat = await dialog.locator('[name="lat"]').inputValue();
  const lng = await dialog.locator('[name="lng"]').inputValue();
  await dialog.getByRole('button', { name: 'Guardar ubicación' }).click();

  await expect(page.getByText(`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`)).toBeVisible();
});

test('un avistamiento se puede seleccionar en el mapa y guardar', async ({ page }) => {
  await createProfile(page);
  await createPet(page);

  await page.goto('/#/alerts');
  await page.getByRole('button', { name: /Activar alerta/ }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mensaje de búsqueda *').fill('Luna está extraviada');
  await dialog.getByRole('button', { name: 'Activar alerta' }).click();
  await page.getByRole('link', { name: /Abrir caso/ }).click();
  await page.getByRole('button', { name: 'Registrar avistamiento' }).click();

  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Descripción *').fill('Vista cerca del parque');
  await pickMapCenter(dialog);
  await dialog.getByRole('button', { name: 'Guardar avistamiento' }).click();

  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
});
