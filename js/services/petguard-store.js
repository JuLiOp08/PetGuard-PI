import { PROFILE_ID } from '../config.js';
import {
  ConflictError,
  isValidAlertTransition,
  validateImportPayload,
  validateSightingReviewStatus
} from '../domain/index.js';
import { getAllRecords, requestResult, STORE_NAMES, withTransaction } from '../db/database.js';

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const get = (tx, store, key) => requestResult(tx.objectStore(store).get(key));
const all = (tx, store) => requestResult(tx.objectStore(store).getAll());
const put = (tx, store, value) => requestResult(tx.objectStore(store).put(value));
const remove = (tx, store, key) => requestResult(tx.objectStore(store).delete(key));

function notification({ title, message, priority = 'normal', entityType = '', entityId = '' }) {
  return { id: id(), type: entityType || 'general', title, message, priority, entityType, entityId, read: false, createdAt: now() };
}

export async function loadAppData() {
  const data = await getAllRecords(STORE_NAMES);
  return {
    profile: data.owners.find((owner) => owner.id === PROFILE_ID) || null,
    pets: data.pets,
    locations: data.locations,
    alerts: data.alerts,
    alertEvents: data.alertEvents,
    sightings: data.sightings,
    notifications: data.notifications,
    settings: data.settings
  };
}

export function saveProfile(profile) {
  return withTransaction(['owners'], 'readwrite', async (tx) => {
    const previous = await get(tx, 'owners', PROFILE_ID);
    const record = { ...previous, ...profile, id: PROFILE_ID, createdAt: previous?.createdAt || now(), updatedAt: now() };
    await put(tx, 'owners', record);
    return record;
  });
}

export function savePet(pet) {
  return withTransaction(['pets', 'notifications'], 'readwrite', async (tx) => {
    const previous = pet.id ? await get(tx, 'pets', pet.id) : null;
    const record = {
      ...previous,
      ...pet,
      id: pet.id || id(),
      ownerId: PROFILE_ID,
      status: previous?.status || pet.status || 'safe',
      createdAt: previous?.createdAt || now(),
      updatedAt: now()
    };
    await put(tx, 'pets', record);
    if (!previous) {
      await put(tx, 'notifications', notification({
        title: 'Mascota registrada', message: `${record.name} fue añadida a PetGuard.`, entityType: 'pet', entityId: record.id
      }));
    }
    return record;
  });
}

export function deletePet(petId) {
  const stores = ['pets', 'locations', 'alerts', 'alertEvents', 'sightings', 'notifications'];
  return withTransaction(stores, 'readwrite', async (tx) => {
    const pet = await get(tx, 'pets', petId);
    if (!pet) return false;
    const [locations, alerts, events, sightings, notifications] = await Promise.all([
      all(tx, 'locations'), all(tx, 'alerts'), all(tx, 'alertEvents'), all(tx, 'sightings'), all(tx, 'notifications')
    ]);
    const alertIds = alerts.filter((item) => item.petId === petId).map((item) => item.id);
    const relatedIds = new Set([petId, ...alertIds]);
    await Promise.all([
      ...locations.filter((item) => item.petId === petId).map((item) => remove(tx, 'locations', item.id)),
      ...alerts.filter((item) => item.petId === petId).map((item) => remove(tx, 'alerts', item.id)),
      ...events.filter((item) => alertIds.includes(item.alertId)).map((item) => remove(tx, 'alertEvents', item.id)),
      ...sightings.filter((item) => alertIds.includes(item.alertId)).map((item) => remove(tx, 'sightings', item.id)),
      ...notifications.filter((item) => relatedIds.has(item.entityId)).map((item) => remove(tx, 'notifications', item.id)),
      remove(tx, 'pets', petId)
    ]);
    return true;
  });
}

export function saveLocation(location) {
  return withTransaction(['pets', 'locations', 'notifications'], 'readwrite', async (tx) => {
    const pet = await get(tx, 'pets', location.petId);
    if (!pet) throw new ConflictError('La mascota seleccionada ya no existe.');
    const record = { ...location, id: location.id || id(), createdAt: location.createdAt || now(), updatedAt: now() };
    await put(tx, 'locations', record);
    await put(tx, 'notifications', notification({
      title: 'Ubicación registrada', message: `Se añadió una ubicación conocida para ${pet.name}.`, entityType: 'pet', entityId: pet.id
    }));
    return record;
  });
}

export function createAlert(alertInput) {
  return withTransaction(['pets', 'alerts', 'alertEvents', 'notifications'], 'readwrite', async (tx) => {
    const pet = await get(tx, 'pets', alertInput.petId);
    if (!pet) throw new ConflictError('La mascota seleccionada ya no existe.');
    const alerts = await all(tx, 'alerts');
    if (alerts.some((item) => item.petId === pet.id && item.status === 'active')) {
      throw new ConflictError('Ya existe una alerta activa para esta mascota.');
    }
    const timestamp = now();
    const alert = { ...alertInput, id: id(), status: 'active', createdAt: timestamp, updatedAt: timestamp };
    await put(tx, 'alerts', alert);
    await put(tx, 'pets', { ...pet, status: 'lost', updatedAt: timestamp });
    await put(tx, 'alertEvents', {
      id: id(), alertId: alert.id, type: 'status_changed', fromStatus: null, toStatus: 'active', note: 'Caso de búsqueda activado', occurredAt: timestamp
    });
    await put(tx, 'notifications', notification({
      title: 'Alerta activada', message: `${pet.name} fue marcada como extraviada.`, priority: 'high', entityType: 'alert', entityId: alert.id
    }));
    return alert;
  });
}

export function resolveAlert(alertId, resolution) {
  return withTransaction(['pets', 'alerts', 'alertEvents', 'notifications'], 'readwrite', async (tx) => {
    const alert = await get(tx, 'alerts', alertId);
    if (!alert) throw new ConflictError('La alerta ya no existe.');
    if (!isValidAlertTransition(alert.status, 'resolved')) throw new ConflictError('Esta alerta ya no se puede resolver.');
    const pet = await get(tx, 'pets', alert.petId);
    if (!pet) throw new ConflictError('La mascota relacionada ya no existe.');
    const timestamp = now();
    const updatedAlert = { ...alert, status: 'resolved', resolvedAt: resolution.foundAt, resolution, updatedAt: timestamp };
    await put(tx, 'alerts', updatedAlert);
    await put(tx, 'pets', { ...pet, status: 'safe', updatedAt: timestamp });
    await put(tx, 'alertEvents', {
      id: id(), alertId, type: 'status_changed', fromStatus: alert.status, toStatus: 'resolved', note: resolution.note || 'Mascota encontrada', occurredAt: timestamp
    });
    await put(tx, 'notifications', notification({
      title: 'Caso resuelto', message: `${pet.name} fue marcada como encontrada.`, entityType: 'alert', entityId: alertId
    }));
    return updatedAlert;
  });
}

export function saveSighting(sightingInput) {
  return withTransaction(['alerts', 'sightings', 'notifications'], 'readwrite', async (tx) => {
    const alert = await get(tx, 'alerts', sightingInput.alertId);
    if (!alert || !['active', 'paused'].includes(alert.status)) throw new ConflictError('Solo puedes añadir avistamientos a un caso abierto.');
    const record = { ...sightingInput, id: id(), reviewStatus: 'new', createdAt: now(), updatedAt: now() };
    await put(tx, 'sightings', record);
    await put(tx, 'notifications', notification({
      title: 'Nuevo avistamiento', message: 'Se registró información para revisar.', priority: 'high', entityType: 'alert', entityId: alert.id
    }));
    return record;
  });
}

export function reviewSighting(sightingId, reviewStatus, reviewNote = '') {
  return withTransaction(['sightings', 'notifications'], 'readwrite', async (tx) => {
    const sighting = await get(tx, 'sightings', sightingId);
    if (!sighting) throw new ConflictError('El avistamiento ya no existe.');
    validateSightingReviewStatus(reviewStatus);
    const record = { ...sighting, reviewStatus, reviewNote: reviewNote.trim(), updatedAt: now() };
    await put(tx, 'sightings', record);
    if (reviewStatus === 'relevant') {
      await put(tx, 'notifications', notification({
        title: 'Avistamiento relevante', message: 'Un avistamiento fue marcado como relevante.', priority: 'high', entityType: 'alert', entityId: sighting.alertId
      }));
    }
    return record;
  });
}

export function markNotificationRead(notificationId, read = true) {
  return withTransaction(['notifications'], 'readwrite', async (tx) => {
    const item = await get(tx, 'notifications', notificationId);
    if (!item) return null;
    const record = { ...item, read };
    await put(tx, 'notifications', record);
    return record;
  });
}

export function markAllNotificationsRead() {
  return withTransaction(['notifications'], 'readwrite', async (tx) => {
    const items = await all(tx, 'notifications');
    await Promise.all(items.filter((item) => !item.read).map((item) => put(tx, 'notifications', { ...item, read: true })));
    return true;
  });
}

export function deleteNotification(notificationId) {
  return withTransaction(['notifications'], 'readwrite', (tx) => remove(tx, 'notifications', notificationId));
}

export async function exportAllData() {
  const data = await loadAppData();
  return { version: 2, exportedAt: now(), ...data };
}

export async function importAllData(payload) {
  validateImportPayload(payload);
  const normalized = {
    owners: payload.profile ? [{ ...payload.profile, id: PROFILE_ID }] : [],
    pets: payload.pets,
    locations: payload.locations,
    alerts: payload.alerts,
    alertEvents: payload.alertEvents || [],
    sightings: payload.sightings,
    notifications: payload.notifications,
    settings: payload.settings
  };
  return withTransaction(STORE_NAMES, 'readwrite', async (tx) => {
    for (const storeName of STORE_NAMES) {
      const store = tx.objectStore(storeName);
      await requestResult(store.clear());
      for (const record of normalized[storeName]) await requestResult(store.put(record));
    }
    return true;
  });
}

export function resetAllData() {
  return withTransaction(STORE_NAMES, 'readwrite', async (tx) => {
    await Promise.all(STORE_NAMES.map((storeName) => requestResult(tx.objectStore(storeName).clear())));
    return true;
  });
}
