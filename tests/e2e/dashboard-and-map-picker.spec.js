import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.afterEach(async ({ page }) => {
  await page.goto('about:blank');
});

async function createProfile(page, role = 'owner') {
  await page.goto('/');
  await page.getByRole('button', { name: role === 'owner' ? /Entrar como propietario/ : /Entrar como familiar/ }).click();
  await expect(page.getByRole('heading', { name: role === 'owner' ? 'Tus mascotas y casos de búsqueda' : 'Mascotas y casos compartidos' })).toBeVisible();
}

test('la entrada pet friendly ofrece ambos perfiles sin desbordar en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '¿Cómo quieres entrar?' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Persona junto a su perro en un parque' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Familia abrazando a su perro' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Entrar como propietario/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Entrar como familiar/ })).toBeVisible();
  await expectPageToFitViewport(page, 'entrada');
});

async function createPet(page) {
  await page.getByRole('button', { name: /Registrar mascota/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre *').fill('Luna');
  await dialog.getByLabel('Color principal *').fill('Marrón');
  await dialog.getByRole('button', { name: 'Guardar mascota' }).click();
  await page.goto('/#/pets');
  await expect(page.getByText('Luna').first()).toBeVisible();
  await page.goto('/#/home');
}

async function pickMapCenter(dialog) {
  const map = dialog.getByRole('application', { name: 'Mapa para seleccionar coordenadas' });
  await expect(map).toBeVisible();
  await map.click({ position: { x: 160, y: 110 } });
  await expect(dialog.locator('[name="lat"]')).not.toHaveValue('');
  await expect(dialog.locator('[name="lng"]')).not.toHaveValue('');
}

test('el propietario elige familiares y retoma mensajes preparados desde el caso', async ({ page }) => {
  await createProfile(page);
  await createPet(page);
  await page.goto('/#/pets');
  await page.getByText('Luna').first().click();
  await page.getByRole('button', { name: 'Reportar extravío' }).click();
  const dialog = page.getByRole('dialog');
  await pickMapCenter(dialog);
  await dialog.getByLabel('Referencia o detalles para la búsqueda *').fill('Junto al parque');
  await expect(dialog.getByLabel('No notificar')).toBeChecked();
  await dialog.getByLabel('Notificar familiares').check();
  await dialog.getByLabel(/Aneliz de la Cruz/).check();
  await dialog.getByRole('button', { name: 'Activar alerta' }).click();
  await expect(page.getByText('Aneliz de la Cruz').last()).toBeVisible();
  await expect(page.getByText(/Comprueba que WhatsApp esté abierto con 922 165667/)).toBeVisible();
  await page.reload();
  await expect(page.getByText('Aneliz de la Cruz').last()).toBeVisible();
  const link = page.getByRole('link', { name: /Abrir WhatsApp.*Aneliz/ });
  await expect(link).toHaveAttribute('href', /wa\.me\/51983146185\?text=/);
  await expect(link).toHaveAttribute('href', /google\.com%2Fmaps%2Fsearch/);
});

async function expectPageToFitViewport(page, context = 'página actual') {
  const dimensions = await page.evaluate(() => {
    const viewportWidth = globalThis.document.documentElement.clientWidth;
    return {
      viewportWidth,
      contentWidth: globalThis.document.documentElement.scrollWidth,
      offenders: [...globalThis.document.querySelectorAll('body *')]
        .filter((element) => element.getBoundingClientRect().right > viewportWidth + 1)
        .slice(0, 5)
        .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
    };
  });

  expect(dimensions.contentWidth, `${context}: elementos fuera del viewport: ${dimensions.offenders.join(', ')}`)
    .toBeLessThanOrEqual(dimensions.viewportWidth);
}

test('las vistas principales caben en un celular sin indicadores internos innecesarios', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await createProfile(page);

  for (const path of ['home', 'pets', 'locations', 'alerts', 'notifications', 'settings']) {
    await page.goto(`/#/${path}`);
    await expectPageToFitViewport(page, path);
  }

  await expect(page.getByText(/Ubicación (manual|lista)/)).toHaveCount(0);
  await expect(page.getByText(/Vista (propietario|familiar)/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cambiar vista' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir configuración' })).toBeVisible();

  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/#/home');
  await expectPageToFitViewport(page, 'inicio horizontal');
});

test('las aclaraciones visibles usan frases breves y naturales', async ({ page }) => {
  await createProfile(page);

  await page.goto('/#/locations');
  await expect(page.getByText('Son ubicaciones conocidas. No muestran una posición en tiempo real.')).toBeVisible();

  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  await expect(page.getByText('Cada reporte debe revisarse. No confirma la identidad de la mascota.')).toBeVisible();

  await page.getByRole('button', { name: 'Registrar avistamiento' }).first().click();
  await expect(page.getByText('Un avistamiento sirve como referencia y debe revisarse. No confirma que sea la mascota.')).toBeVisible();
});

test('los encabezados explican el propósito de cada vista con un tono claro', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Organiza la búsqueda de tus mascotas' })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar como propietario' }).click();
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  await expect(page.getByText('Consulta fichas, ubicaciones conocidas y avisos recientes.')).toBeVisible();

  await page.goto('/#/pets');
  await expect(page.getByRole('heading', { name: 'Fichas de mascotas' })).toBeVisible();
  await page.goto('/#/settings');
  await expect(page.getByRole('heading', { name: 'Datos y respaldo' })).toBeVisible();
});

test('sin perfil local se vuelve directamente a elegir propietario o familiar', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/settings');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Borrar datos' }).click();

  await expect(page.getByRole('heading', { name: '¿Cómo quieres entrar?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Crea tu perfil local' })).toHaveCount(0);
});

test('un familiar entra a los datos compartidos con permisos limitados', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '¿Cómo quieres entrar?' })).toBeVisible();
  await page.getByRole('button', { name: /Entrar como familiar/ }).click();

  await expect(page.getByRole('heading', { name: 'Círculo de confianza' })).toBeVisible();
  await expect(page.locator('.trust-circle').getByText('Carlos Torres', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Registrar mascota/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Activar alerta/ })).toHaveCount(0);

  await page.getByText('Nube').first().click();
  await expect(page.getByRole('button', { name: 'Editar ficha' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Eliminar mascota' })).toHaveCount(0);
  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  await expect(page.getByRole('button', { name: 'Registrar avistamiento' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mascota encontrada' })).toHaveCount(0);
  await expect(page.locator('[data-form="review-sighting"]')).toHaveCount(0);
});

test('el propietario puede actualizar los datos y la foto de una mascota', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/pets');
  await page.getByText('Nube').first().click();
  await page.getByRole('button', { name: 'Editar ficha' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Color principal *').fill('Blanco y gris');
  await dialog.locator('#pet-photo-input').setInputFiles({
    name: 'nube.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  });
  await expect(dialog.getByRole('img', { name: 'Vista previa de la foto seleccionada' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Guardar mascota' }).click();

  await expect(page.getByText(/Gato · Pequeño · Blanco y gris/)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto de Nube' })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Gato · Pequeño · Blanco y gris/)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto de Nube' })).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
});

test('la ubicación compartida al entrar se reutiliza como referencia del mapa', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -12.1191, longitude: -77.0349 });
  await page.goto('/');

  await page.getByRole('button', { name: /Entrar como propietario/ }).click();
  await page.getByRole('button', { name: /Añadir/ }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[name="lat"]')).toHaveValue('-12.119100');
  await expect(dialog.locator('[name="lng"]')).toHaveValue('-77.034900');
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  await expect(page.getByText('Tu ubicación')).toBeVisible();
});

test('la vista de propietario recibe varios casos de demostración persistentes', async ({ page }) => {
  await createProfile(page);

  await expect(page.locator('.metric').filter({ hasText: 'Mascotas' }).locator('strong')).toHaveText('4');
  await expect(page.locator('.metric').filter({ hasText: 'Ubicaciones' }).locator('strong')).toHaveText('6');
  await expect(page.locator('.metric').filter({ hasText: 'Alertas activas' }).locator('strong')).toHaveText('2');
  await expect(page.getByText('Canela').first()).toBeVisible();
  await expect(page.getByText('Nube').first()).toBeVisible();
  await expect(page.getByText('Sol').first()).toBeVisible();

  await page.goto('/#/alerts');
  await expect(page.getByRole('heading', { name: 'Nube' })).toBeVisible();
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Alerta de Nube' })).toBeVisible();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
});

test('registrar una mascota no llena el centro de avisos y sus avisos se pueden gestionar', async ({ page }) => {
  await createProfile(page);
  const initialUnread = await page.locator('.metric').filter({ hasText: 'Avisos nuevos' }).locator('strong').innerText();
  await createPet(page);
  await expect(page.locator('.metric').filter({ hasText: 'Avisos nuevos' }).locator('strong')).toHaveText(initialUnread);

  await page.goto('/#/notifications');
  const notices = page.locator('.notification');
  const initialCount = await notices.count();
  await page.getByRole('button', { name: 'Marcar todos como leídos' }).click();
  await expect(page.getByText('No tienes avisos pendientes.')).toBeVisible();
  await notices.first().getByRole('button', { name: 'Eliminar aviso' }).click();
  await expect(notices).toHaveCount(initialCount - 1);
});

test('el centro de avisos oculta registros rutinarios anteriores y conserva las alertas', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/settings');
  const backup = {
    version: 2, exportedAt: '2026-10-23T12:00:00.000Z',
    profile: { id: 'owner_local', alias: 'Ana Torres', acceptsLocalStorage: true },
    pets: [{ id: 'pet-1', ownerId: 'owner_local', name: 'Luna', species: 'dog', color: 'Marrón', size: 'medium', status: 'lost' }],
    locations: [],
    alerts: [{ id: 'alert-1', petId: 'pet-1', status: 'active', lostAt: '2026-10-23T12:00:00.000Z' }],
    alertEvents: [], sightings: [],
    notifications: [
      { id: 'notice-pet', title: 'Mascota registrada', entityType: 'pet', entityId: 'pet-1', read: false, createdAt: '2026-10-23T12:00:00.000Z' },
      { id: 'notice-location', title: 'Ubicación registrada', entityType: 'pet', entityId: 'pet-1', read: false, createdAt: '2026-10-23T12:01:00.000Z' },
      { id: 'notice-alert', title: 'Alerta activada', entityType: 'alert', entityId: 'alert-1', read: false, createdAt: '2026-10-23T12:02:00.000Z' }
    ],
    settings: []
  };
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#import-file').setInputFiles({
    name: 'respaldo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup))
  });
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  await expect(page.locator('.metric').filter({ hasText: 'Avisos nuevos' }).locator('strong')).toHaveText('1');
  await page.goto('/#/notifications');
  await expect(page.locator('.notification')).toHaveCount(1);
  await expect(page.getByText('Alerta activada')).toBeVisible();
});

test('un aviso de búsqueda abre el caso relacionado', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/notifications');
  await page.locator('.notification').filter({ hasText: 'Nube fue marcada como extraviada.' })
    .getByRole('link', { name: 'Abrir caso' }).click();
  await expect(page.getByRole('heading', { name: 'Alerta de Nube' })).toBeVisible();
});

test('los listados extensos se paginan y las tarjetas conservan su ancho', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/settings');
  const timestamp = (index) => new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString();
  const backup = {
    version: 2, exportedAt: timestamp(20),
    profile: { id: 'owner_local', alias: 'Ana Torres', acceptsLocalStorage: true },
    pets: Array.from({ length: 8 }, (_, i) => ({ id: `pet-${i}`, name: `Mascota ${i}`, species: 'dog', color: 'Marrón', size: 'medium', status: 'lost' })),
    locations: [
      ...Array.from({ length: 8 }, (_, i) => ({ id: `location-${i}`, petId: 'pet-0', lat: 4.65, lng: -74.08, recordedAt: timestamp(i), placeReference: `Lugar ${i}` })),
      ...Array.from({ length: 7 }, (_, i) => ({ id: `other-location-${i}`, petId: `pet-${i + 1}`, lat: 4.65, lng: -74.08, recordedAt: timestamp(-i - 1), placeReference: `Otro lugar ${i}` }))
    ],
    alerts: Array.from({ length: 8 }, (_, i) => ({ id: `alert-${i}`, petId: `pet-${i}`, status: 'active', lostAt: timestamp(i), createdAt: timestamp(i), searchMessage: `Búsqueda ${i}`, lat: 4.65, lng: -74.08 })),
    alertEvents: Array.from({ length: 8 }, (_, i) => ({ id: `event-${i}`, alertId: 'alert-0', note: `Cambio ${i}`, occurredAt: timestamp(i) })),
    sightings: Array.from({ length: 8 }, (_, i) => ({ id: `sighting-${i}`, alertId: 'alert-0', lat: 4.65, lng: -74.08, seenAt: timestamp(i), description: `Reporte ${i}`, reviewStatus: 'in_review' })),
    notifications: Array.from({ length: 8 }, (_, i) => ({ id: `notice-${i}`, title: `Aviso ${i}`, entityType: 'alert', entityId: 'alert-0', read: false, createdAt: timestamp(i) })),
    settings: []
  };
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#import-file').setInputFiles({ name: 'respaldo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();

  for (const [route, selector, key] of [
    ['pets', '.pet-grid--wide .pet-card', 'pets'],
    ['alerts', '.alert-grid .alert-card', 'alerts'],
    ['notifications', '.notification-list .notification', 'notifications'],
    ['alerts/alert-0', '.sighting-list .sighting', 'sightings'],
    ['alerts/alert-0', '.case-details .timeline .timeline-item', 'case-history'],
    ['pets/pet-0', '.detail-grid .timeline .timeline-item', 'pet-locations']
  ]) {
    await page.goto(`/#/${route}`);
    const cards = page.locator(selector);
    await expect(cards).toHaveCount(6);
    const firstWidth = (await cards.first().boundingBox()).width;
    await page.locator(`[data-pagination-key="${key}"]`).getByRole('button', { name: 'Siguiente' }).click();
    await expect(cards).toHaveCount(2);
    if (key === 'pets' || key === 'alerts') {
      expect(Math.abs((await cards.first().boundingBox()).width - firstWidth)).toBeLessThan(2);
    }
    await page.locator(`[data-pagination-key="${key}"]`).getByRole('button', { name: 'Anterior' }).click();
    await expect(cards).toHaveCount(6);
  }

  await page.goto('/#/locations');
  const groups = page.locator('.location-group');
  await expect(groups).toHaveCount(6);
  const firstPet = groups.filter({ has: page.getByRole('heading', { name: 'Mascota 0' }) });
  await expect(firstPet.locator('.timeline-item')).toHaveCount(6);
  await firstPet.locator('[data-pagination-key="locations-pet-0"]').getByRole('button', { name: 'Siguiente' }).click();
  await expect(firstPet.locator('.timeline-item')).toHaveCount(2);
  await page.locator('[data-pagination-key="location-groups"]').getByRole('button', { name: 'Siguiente' }).click();
  await expect(groups).toHaveCount(2);
  await expect(firstPet).toHaveCount(0);
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

test('cada mascota tiene una línea de ubicaciones independiente', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/locations');
  const groups = page.locator('.location-group');
  await expect(groups).toHaveCount(4);
  for (const group of await groups.all()) {
    const name = await group.getByRole('heading').innerText();
    const rows = group.locator('.timeline-item');
    await expect(rows.first()).toBeVisible();
    await expect(group.locator('.timeline')).toHaveCount(1);
    await expect(rows.getByText(name, { exact: true })).toHaveCount(0);
  }
  await expectPageToFitViewport(page, 'ubicaciones por mascota');
});

test('solo la última ubicación de cada mascota se presenta como reciente', async ({ page }) => {
  await createProfile(page);
  await createPet(page);

  for (const [recordedAt, placeReference] of [
    ['2026-10-24T10:00', 'Ubicación anterior de Luna'],
    ['2026-10-24T11:00', 'Ubicación vigente de Luna']
  ]) {
    await page.getByRole('button', { name: /Añadir/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Mascota *').selectOption({ label: 'Luna' });
    await pickMapCenter(dialog);
    await dialog.getByLabel('Fecha y hora *').fill(recordedAt);
    await dialog.getByLabel('Lugar o referencia').fill(placeReference);
    await dialog.getByRole('button', { name: 'Guardar ubicación' }).click();
  }

  await page.goto('/#/locations');
  const luna = page.locator('.location-group').filter({ has: page.getByRole('heading', { name: 'Luna' }) });
  const next = page.locator('[data-pagination-key="location-groups"]').getByRole('button', { name: 'Siguiente' });
  while (await luna.count() === 0) { await expect(next).toBeEnabled(); await next.click(); }
  await expect(luna.locator('.timeline-item').filter({ hasText: 'Ubicación vigente de Luna' })).toContainText('Reciente');
  await expect(luna.locator('.timeline-item').filter({ hasText: 'Ubicación anterior de Luna' })).toContainText('Antigua');
  await expect(luna.getByText('Intermedia', { exact: true })).toHaveCount(0);
});

test('una ubicación conocida se puede abrir en el mapa desde el historial', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/locations');

  const location = page.locator('.timeline-item').filter({ hasText: 'Parque del barrio' }).first();
  await location.getByRole('button', { name: 'Ver en el mapa' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Ubicación de Canela' })).toBeVisible();
  await expect(dialog.getByRole('img', { name: 'Mapa de ubicación conocida de Canela' })).toBeVisible();
  await expect(dialog.getByText('Parque del barrio')).toBeVisible();
  await expect(dialog.locator('.maplibregl-ctrl-zoom-in, .leaflet-control-zoom-in')).toBeVisible();
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

test('una pérdida usa un solo detalle y marca la ubicación actual en el mapa', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: -12.0464, longitude: -77.0428 });
  await createProfile(page);

  await page.goto('/#/alerts');
  await page.getByRole('button', { name: /Activar alerta/ }).click();
  const dialog = page.getByRole('dialog');

  await expect(dialog.getByRole('application', { name: 'Mapa para seleccionar coordenadas' })).toBeVisible();
  await expect(dialog.getByLabel('Referencia o detalles para la búsqueda *')).toBeVisible();
  await expect(dialog.getByLabel('Lugar de referencia')).toHaveCount(0);
  await expect(dialog.getByLabel('Circunstancias')).toHaveCount(0);
  await expect(dialog.locator('[name="lat"]')).toHaveValue('-12.046400');
  await expect(dialog.locator('[name="lng"]')).toHaveValue('-77.042800');
});

test('el caso muestra la pérdida y los últimos avistamientos en un mapa', async ({ page }) => {
  await createProfile(page);

  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();

  const overviewMap = page.getByRole('img', { name: 'Mapa de pérdida y últimos avistamientos' });
  await expect(overviewMap).toBeVisible();
  await expect(overviewMap.locator('.maplibregl-ctrl-zoom-in, .leaflet-control-zoom-in')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Últimos avistamientos' })).toBeVisible();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
  await expect(page.getByText('3 avistamientos en el mapa')).toBeVisible();
  await expect(page.getByText(/Confianza:/)).toHaveCount(0);

  const mapPanel = page.locator('.overview-map.section-block');
  const caseDetails = page.locator('.case-details');
  const gap = await Promise.all([mapPanel.boundingBox(), caseDetails.boundingBox()]);
  expect(gap[0]).not.toBeNull();
  expect(gap[1]).not.toBeNull();
  expect(gap[1].y - (gap[0].y + gap[0].height)).toBeGreaterThanOrEqual(20);

  await page.locator('.sighting').filter({ hasText: 'Vista cerca del parque' }).getByRole('button', { name: 'Ver en el mapa' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Avistamiento en el mapa' })).toBeVisible();
  await expect(dialog.getByRole('img', { name: 'Mapa del avistamiento Vista cerca del parque' })).toBeVisible();
});

test('el caso activo orienta al propietario sobre foto contacto y reportes pendientes', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  const guide = page.getByRole('region', { name: 'Preparar la búsqueda' });
  await expect(guide.getByText('Foto de referencia')).toBeVisible();
  await expect(guide.getByText('Datos de contacto')).toBeVisible();
  await expect(guide.getByText('Reportes por revisar')).toBeVisible();
  await expect(guide.getByRole('link', { name: 'Abrir ficha' })).toHaveAttribute('href', /#\/pets\/demo-pet-nube/);
  await guide.getByRole('button', { name: 'Ver reportes' }).click();
  await expect(page.getByRole('heading', { name: 'Reportes recientes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alerta de Nube' })).toBeVisible();
});

test('el historial muestra los avistamientos relevantes y la revisión solo ofrece decisiones finales', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/alerts/demo-alert-nube');
  const history = page.locator('.case-details .timeline');
  const map = page.getByRole('img', { name: 'Mapa de pérdida y últimos avistamientos' });
  await expect(map.locator('.overview-map__marker--sighting')).toHaveCount(3);
  await expect(history).toContainText('Un gato con placa redonda cruzó hacia los jardines.');
  await expect(history).not.toContainText('Vista cerca del parque');

  const report = page.locator('.sighting').filter({ hasText: 'Vista cerca del parque' });
  await expect(report.getByText('En revisión')).toBeVisible();
  const decision = report.getByRole('combobox', { name: 'Decisión del avistamiento' });
  await expect(decision.locator('option')).toHaveText(['Elegir resultado', 'Relevante', 'Descartado']);
  await decision.selectOption('relevant');
  await report.getByRole('button', { name: 'Actualizar' }).click();
  await expect(history).toContainText('Vista cerca del parque');

  await report.getByRole('combobox', { name: 'Decisión del avistamiento' }).selectOption('discarded');
  await report.getByRole('button', { name: 'Actualizar' }).click();
  await expect(history).not.toContainText('Vista cerca del parque');
  await expect(map.locator('.overview-map__marker--sighting')).toHaveCount(2);
  await expect(report.getByRole('button', { name: 'Ver en el mapa' })).toHaveCount(0);
});

test('el propietario descarga una ficha sin divulgar el teléfono hasta elegirlo', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/alerts');
  await page.locator('.alert-card').filter({ hasText: 'Nube' }).getByRole('link', { name: /Abrir caso/ }).click();
  await page.getByRole('button', { name: 'Preparar ficha' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Incluir teléfono')).not.toBeChecked();
  await dialog.getByLabel('Incluir teléfono').check();
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Descargar ficha' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^petguard-ficha-nube\.svg$/);
  const poster = await readFile(await download.path(), 'utf8');
  expect(poster).toContain('999 321 654');
  expect(poster).not.toContain('ana.torres@example.com');
  await expect(dialog).toHaveCount(0);
});

test('las fichas y casos siguen disponibles sin conexión y el mapa explica su límite', async ({ page, context }) => {
  await createProfile(page);
  await page.waitForFunction(() => Boolean(globalThis.navigator.serviceWorker?.controller), undefined, { timeout: 10000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'Sin conexión' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tus mascotas y casos de búsqueda' })).toBeVisible();
  await page.goto('/#/pets');
  await expect(page.getByText('Nube').first()).toBeVisible();
  await page.goto('/#/alerts/demo-alert-nube');
  await expect(page.getByText('El mapa necesita conexión a Internet.')).toBeVisible();
});

test('los formularios muestran primero lo esencial y conservan detalles opcionales', async ({ page }) => {
  await createProfile(page);
  await page.goto('/#/locations');
  await page.getByRole('button', { name: 'Añadir ubicación' }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Lugar o referencia')).toBeVisible();
  await expect(dialog.getByLabel('Nota')).toBeHidden();
  await dialog.getByText('Más detalles').click();
  await expect(dialog.getByLabel('Nota')).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar' }).click();

  await page.goto('/#/alerts/demo-alert-nube');
  await page.getByRole('button', { name: 'Registrar avistamiento' }).first().click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Descripción *')).toBeVisible();
  await expect(dialog.getByLabel('Informante')).toBeHidden();
  await dialog.getByText('Más detalles').click();
  await expect(dialog.getByLabel('Informante')).toBeVisible();
});

test('un avistamiento se puede seleccionar en el mapa y guardar', async ({ page }) => {
  await createProfile(page);
  await createPet(page);

  await page.goto('/#/alerts');
  await page.getByRole('button', { name: /Activar alerta/ }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mascota *').selectOption({ label: 'Luna' });
  await pickMapCenter(dialog);
  await dialog.getByLabel('Referencia o detalles para la búsqueda *').fill('Luna está extraviada');
  await dialog.getByRole('button', { name: 'Activar alerta' }).click();
  await page.locator('.alert-card').filter({ hasText: 'Luna' }).getByRole('link', { name: /Abrir caso/ }).click();
  await page.getByRole('button', { name: 'Registrar avistamiento' }).click();

  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Descripción *').fill('Vista cerca del parque');
  await expect(dialog.getByLabel('Confianza')).toHaveCount(0);
  await pickMapCenter(dialog);
  await dialog.getByRole('button', { name: 'Guardar avistamiento' }).click();

  await expect(page.getByRole('img', { name: 'Mapa de pérdida y últimos avistamientos' })).toBeVisible();
  await expect(page.getByText('1 avistamiento en el mapa')).toBeVisible();
  await expect(page.getByText('Vista cerca del parque')).toBeVisible();
});
