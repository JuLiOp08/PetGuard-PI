import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import 'fake-indexeddb/auto';

import {
  createAlert,
  deletePet,
  exportAllData,
  importAllData,
  loadAppData,
  resetAllData,
  resolveAlert,
  reviewSighting,
  saveLocation,
  saveSighting,
  savePet,
  saveProfile
} from '../../js/services/petguard-store.js';

beforeEach(async () => {
  await resetAllData();
});

test('un respaldo con historial huérfano se rechaza y conserva los datos actuales', async () => {
  await saveProfile({ alias: 'Perfil vigente', acceptsLocalStorage: true });
  await savePet({
    name: 'Luna',
    species: 'dog',
    color: 'Marrón',
    size: 'medium',
    relevantInformation: 'Oreja derecha doblada',
    photo: 'data:image/jpeg;base64,AA=='
  });

  const invalidBackup = {
    version: 2,
    exportedAt: '2026-10-23T12:00:00.000Z',
    profile: null,
    pets: [],
    locations: [],
    alerts: [],
    alertEvents: [{ id: 'event-1', alertId: 'missing-alert', occurredAt: '2026-10-23T12:00:00.000Z' }],
    sightings: [],
    notifications: [],
    settings: []
  };

  await assert.rejects(() => importAllData(invalidBackup), /evento.*sin alerta/i);

  const current = await loadAppData();
  assert.equal(current.profile.alias, 'Perfil vigente');
  assert.equal(current.pets.length, 1);
  assert.equal(current.pets[0].name, 'Luna');
  assert.equal(current.pets[0].photo, 'data:image/jpeg;base64,AA==');
  assert.equal((await exportAllData()).version, 2);
});

test('un avistamiento conserva un estado de revisión válido', async () => {
  const pet = await savePet({
    name: 'Nube',
    species: 'cat',
    color: 'Blanco',
    size: 'small',
    relevantInformation: 'Cola gris'
  });
  const alert = await createAlert({
    petId: pet.id,
    lostAt: '2026-10-23T12:00:00.000Z',
    searchMessage: 'Buscar cerca del parque'
  });
  const sighting = await saveSighting({
    alertId: alert.id,
    lat: 4.711,
    lng: -74.0721,
    seenAt: '2026-10-23T12:30:00.000Z',
    confidence: 'medium',
    description: 'Posible observación junto a la entrada'
  });

  await assert.rejects(() => reviewSighting(sighting.id, 'invented'), /estado de revisión/i);

  const current = await loadAppData();
  assert.equal(current.sightings[0].reviewStatus, 'new');
});

test('un respaldo con identificadores duplicados se rechaza sin perder datos', async () => {
  await saveProfile({ alias: 'Perfil protegido', acceptsLocalStorage: true });
  const duplicatedPet = {
    id: 'pet-duplicated',
    ownerId: 'owner_local',
    name: 'Sol',
    species: 'dog',
    color: 'Dorado',
    size: 'medium',
    relevantInformation: 'Pañuelo azul',
    status: 'safe'
  };
  const invalidBackup = {
    version: 2,
    exportedAt: '2026-10-23T12:00:00.000Z',
    profile: null,
    pets: [duplicatedPet, { ...duplicatedPet, name: 'Otro registro' }],
    locations: [],
    alerts: [],
    alertEvents: [],
    sightings: [],
    notifications: [],
    settings: []
  };

  await assert.rejects(() => importAllData(invalidBackup), /identificador duplicado/i);
  assert.equal((await loadAppData()).profile.alias, 'Perfil protegido');
});

test('el ciclo del caso de búsqueda se respalda y se elimina en cascada', async () => {
  await saveProfile({ alias: 'Familia Rivera', acceptsLocalStorage: true });
  const pet = await savePet({
    name: 'Milo', species: 'dog', color: 'Negro', size: 'large', relevantInformation: 'Pecho blanco'
  });
  await saveLocation({
    petId: pet.id,
    lat: 4.6533,
    lng: -74.0836,
    recordedAt: '2026-10-23T11:45:00.000Z',
    source: 'manual'
  });
  const alert = await createAlert({
    petId: pet.id,
    lostAt: '2026-10-23T12:00:00.000Z',
    searchMessage: 'Milo se perdió cerca de casa'
  });
  const sighting = await saveSighting({
    alertId: alert.id,
    lat: 4.654,
    lng: -74.082,
    seenAt: '2026-10-23T12:30:00.000Z',
    confidence: 'high',
    description: 'Perro con pecho blanco'
  });
  await reviewSighting(sighting.id, 'relevant', 'Coincide con la descripción');
  await resolveAlert(alert.id, {
    foundAt: '2026-10-23T13:00:00.000Z',
    place: 'Parque del barrio',
    note: 'Regresó con su familia'
  });

  const backup = await exportAllData();
  assert.equal(backup.pets[0].status, 'safe');
  assert.equal(backup.alerts[0].status, 'resolved');
  assert.equal(backup.alertEvents.length, 2);
  assert.equal(backup.sightings[0].reviewStatus, 'relevant');

  assert.equal(await deletePet(pet.id), true);
  const current = await loadAppData();
  assert.deepEqual(
    [current.pets, current.locations, current.alerts, current.alertEvents, current.sightings, current.notifications].map((records) => records.length),
    [0, 0, 0, 0, 0, 0]
  );
});

test('un respaldo versión 1 se migra al contrato vigente sin datos del simulador', async () => {
  await importAllData({
    version: 1,
    exportedAt: '2026-10-23T12:00:00.000Z',
    profile: { id: 'legacy-owner', alias: 'Perfil anterior', acceptsLocalStorage: true },
    pets: [{
      id: 'legacy-pet', ownerId: 'legacy-owner', name: 'Toby', species: 'dog', color: 'Café',
      size: 'small', description: 'Collar verde', status: 'safe'
    }],
    locations: [],
    routes: [{ id: 'legacy-route', petId: 'legacy-pet' }],
    alerts: [],
    sightings: [],
    notifications: [],
    settings: []
  });

  const migrated = await exportAllData();
  assert.equal(migrated.version, 2);
  assert.equal(migrated.profile.id, 'owner_local');
  assert.equal(migrated.pets[0].name, 'Toby');
  assert.deepEqual(migrated.alertEvents, []);
  assert.equal('routes' in migrated, false);
});

test('una importación no almacenable revierte todos los cambios', async () => {
  await saveProfile({ alias: 'Perfil que debe conservarse', acceptsLocalStorage: true });
  const invalidBackup = {
    version: 2,
    exportedAt: '2026-10-23T12:00:00.000Z',
    profile: null,
    pets: [{
      id: 'pet-with-function', ownerId: 'owner_local', name: 'Rayo', species: 'dog', color: 'Negro',
      size: 'medium', description: 'Mancha blanca', status: 'safe', invalidValue: () => true
    }],
    locations: [], alerts: [], alertEvents: [], sightings: [], notifications: [], settings: []
  };

  await assert.rejects(() => importAllData(invalidBackup));
  const current = await loadAppData();
  assert.equal(current.profile.alias, 'Perfil que debe conservarse');
  assert.equal(current.pets.length, 0);
});
