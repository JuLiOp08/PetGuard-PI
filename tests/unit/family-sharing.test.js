import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trustedContacts, preparedSearchMessage, whatsappLink } from '../../js/application/family-sharing.js';

test('el mensaje de búsqueda permite abrir el punto de extravío y contactar al propietario', () => {
  const alert = { petName: 'Luna', lostAt: '2026-11-10T12:00:00.000Z', searchMessage: 'Cerca del parque', lat: -12.12, lng: -77.03, contactSnapshot: { phone: '922 165667' } };
  const message = preparedSearchMessage(alert);
  assert.match(message, /Luna/);
  assert.match(message, /Cerca del parque/);
  assert.match(message, /922 165667/);
  assert.match(message, /maps\/search\/\?api=1&query=-12\.12%2C-77\.03/);
  assert.match(whatsappLink(trustedContacts[0], alert), /^https:\/\/wa\.me\/51983146185\?text=/);
  assert.equal(whatsappLink(trustedContacts[3], alert), '');
});
