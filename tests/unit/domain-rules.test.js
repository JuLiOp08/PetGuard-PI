import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateCoordinates,
  computeLocationStatus,
  haversineDistanceKm,
  canCreateActiveAlert,
  validateImportPayload,
  isValidAlertTransition,
  formatRelativeTime,
  validateProfileInput,
  validatePetInput,
  validateLocationInput,
  validateSightingInput
} from '../../js/domain/index.js';

test('validateCoordinates acepta rangos válidos y rechaza fuera de rango', () => {
  assert.doesNotThrow(() => validateCoordinates(-12.0464, -77.0428));
  assert.throws(() => validateCoordinates(100, 0), /latitud/i);
  assert.throws(() => validateCoordinates(0, 181), /longitud/i);
});

test('computeLocationStatus clasifica datos recientes, intermedios y antiguos', () => {
  const now = Date.now();
  assert.equal(computeLocationStatus(new Date(now - 5 * 60 * 1000)), 'recent');
  assert.equal(computeLocationStatus(new Date(now - 30 * 60 * 1000)), 'intermediate');
  assert.equal(computeLocationStatus(new Date(now - 2 * 60 * 60 * 1000)), 'old');
});

test('haversineDistanceKm calcula distancia aproximada entre puntos', () => {
  const d = haversineDistanceKm(-12.0464, -77.0428, -12.0452, -77.0412);
  assert.ok(d > 0 && d < 2);
});

test('canCreateActiveAlert permite solo una alerta activa por mascota', () => {
  const activeAlert = { id: 'a1', petId: 'pet-1', status: 'active' };
  const resolvedAlert = { id: 'a2', petId: 'pet-1', status: 'resolved' };

  assert.equal(canCreateActiveAlert('pet-1', [resolvedAlert]), true);
  assert.equal(canCreateActiveAlert('pet-1', [activeAlert]), false);
  assert.equal(canCreateActiveAlert('pet-2', [activeAlert]), true);
});

test('validateImportPayload rechaza archivos inválidos y acepta estructura mínima', () => {
  assert.throws(() => validateImportPayload({ version: 'bad' }), /versión/);
  assert.doesNotThrow(() => validateImportPayload({
    version: 1,
    exportedAt: '2026-10-23T00:00:00.000Z',
    profile: { id: 'owner_local', alias: 'Ana' },
    pets: [{ id: 'pet-1', status: 'safe' }],
    locations: [],
    alerts: [],
    alertEvents: [],
    sightings: [],
    notifications: [],
    settings: []
  }));
});

test('isValidAlertTransition y formatRelativeTime aplican reglas de negocio', () => {
  assert.equal(isValidAlertTransition('active', 'resolved'), true);
  assert.equal(isValidAlertTransition('resolved', 'active'), false);
  assert.match(formatRelativeTime(new Date(Date.now() - 1000 * 60 * 5)), /5/);
});

test('validateProfileInput exige alias y valida el correo', () => {
  assert.throws(() => validateProfileInput({ alias: '' }), /obligatorio/);
  assert.throws(() => validateProfileInput({ alias: 'Ana', email: 'correo-invalido' }), /correo válido/);
  assert.equal(validateProfileInput({ alias: ' Ana ', acceptsLocalStorage: true }).alias, 'Ana');
});

test('validatePetInput protege la ficha mínima de identificación', () => {
  assert.throws(() => validatePetInput({ name: 'Luna', species: 'dog' }), /color/);
  const pet = validatePetInput({ name: 'Luna', species: 'dog', color: 'Marrón', size: 'medium', description: 'Pecho blanco' });
  assert.equal(pet.name, 'Luna');
  assert.equal(pet.size, 'medium');
});

test('validateLocationInput normaliza una ubicación manual', () => {
  const location = validateLocationInput({ petId: 'pet-1', lat: '-12.04', lng: '-77.04', accuracy: '20', recordedAt: '2026-10-23T10:30' });
  assert.equal(location.source, 'manual');
  assert.equal(location.accuracy, 20);
  assert.match(location.recordedAt, /^2026-10-23T/);
});

test('validateSightingInput exige descripción y confianza válida', () => {
  assert.throws(() => validateSightingInput({ lat: -12, lng: -77, seenAt: '2026-10-23T10:30' }), /Describe/);
  assert.throws(() => validateSightingInput({ lat: -12, lng: -77, seenAt: '2026-10-23T10:30', description: 'Similar', confidence: 'certain' }), /confianza/);
});
