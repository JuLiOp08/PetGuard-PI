import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSearchPosterSvg } from '../../js/application/search-poster.js';

test('la ficha descargable distingue la referencia manual y respeta el contacto elegido', () => {
  const svg = createSearchPosterSvg({
    pet: { name: 'Luna & Sol', species: 'dog', color: 'Marrón', size: 'medium', photo: 'data:image/jpeg;base64,AA==' },
    alert: { lostAt: '2026-10-23T12:00:00.000Z', searchMessage: 'Collar azul < visible', lat: -12.12, lng: -77.03 },
    location: { placeReference: 'Parque Central' },
    contact: { alias: 'Ana', phone: '999 123 456', email: '' }
  });

  assert.match(svg, /Luna &amp; Sol/);
  assert.match(svg, /Ubicación conocida registrada manualmente/);
  assert.match(svg, /Parque Central/);
  assert.match(svg, /999 123 456/);
  assert.match(svg, /Collar azul &lt; visible/);
  assert.match(svg, /data:image\/jpeg;base64,AA==/);
  assert.doesNotMatch(svg, /posición actual|GPS en tiempo real/i);
});

test('la ficha no divulga datos de contacto que no fueron elegidos', () => {
  const svg = createSearchPosterSvg({
    pet: { name: 'Nube', species: 'cat', color: 'Blanco', size: 'small' },
    alert: { lostAt: '2026-10-23T12:00:00.000Z', searchMessage: 'Puede estar cerca del parque' },
    location: null,
    contact: {}
  });

  assert.match(svg, /Nube/);
  assert.match(svg, /Sin punto registrado/);
  assert.doesNotMatch(svg, /999 123 456|ana@example.com/);
});
