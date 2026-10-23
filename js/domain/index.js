import {
  ALERT_STATUSES,
  LOCATION_FRESHNESS,
  PET_STATUSES,
  SIGHTING_CONFIDENCE,
  SIGHTING_REVIEW_STATUSES
} from '../config.js';

const BACKUP_KEYS = ['profile', 'pets', 'locations', 'alerts', 'alertEvents', 'sightings', 'notifications', 'settings'];

export class ValidationError extends Error {
  constructor(message, field = '') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function validateCoordinates(lat, lng) {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new ValidationError('La latitud debe estar entre -90 y 90.', 'lat');
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new ValidationError('La longitud debe estar entre -180 y 180.', 'lng');
  }
  return { lat, lng };
}

export function validateIsoDate(value, field = 'date') {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    throw new ValidationError('Ingresa una fecha y hora válidas.', field);
  }
  return new Date(value).toISOString();
}

export function computeLocationStatus(dateInput, now = Date.now()) {
  const date = new Date(dateInput).getTime();
  if (Number.isNaN(date)) return 'old';
  const diffMinutes = Math.max(0, (now - date) / 60000);
  if (diffMinutes < LOCATION_FRESHNESS.RECENT_MINUTES) return 'recent';
  if (diffMinutes <= LOCATION_FRESHNESS.INTERMEDIATE_MINUTES) return 'intermediate';
  return 'old';
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function canCreateActiveAlert(petId, existingAlerts = []) {
  return !existingAlerts.some((alert) => alert?.petId === petId && alert.status === ALERT_STATUSES.ACTIVE);
}

export function isValidAlertTransition(fromStatus, toStatus) {
  const validTransitions = {
    active: ['paused', 'resolved', 'cancelled'],
    paused: ['active', 'resolved', 'cancelled'],
    resolved: [],
    cancelled: []
  };
  return Boolean(validTransitions[fromStatus]?.includes(toStatus));
}

export function validateProfileInput(input) {
  const alias = String(input.alias || '').trim();
  if (!alias) throw new ValidationError('El nombre o alias es obligatorio.', 'alias');
  if (alias.length > 60) throw new ValidationError('Usa un nombre de hasta 60 caracteres.', 'alias');
  const email = String(input.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('Ingresa un correo válido.', 'email');
  return {
    alias,
    phone: String(input.phone || '').trim(),
    email,
    district: String(input.district || '').trim(),
    alternateContact: String(input.alternateContact || '').trim(),
    acceptsLocalStorage: Boolean(input.acceptsLocalStorage)
  };
}

export function validatePetInput(input) {
  const name = String(input.name || '').trim();
  const species = String(input.species || '');
  const color = String(input.color || '').trim();
  const size = String(input.size || '');
  const description = String(input.description || '').trim();
  if (!name) throw new ValidationError('El nombre es obligatorio.', 'name');
  if (!['dog', 'cat'].includes(species)) throw new ValidationError('Selecciona perro o gato.', 'species');
  if (!color) throw new ValidationError('El color es obligatorio.', 'color');
  if (!['small', 'medium', 'large'].includes(size)) throw new ValidationError('Selecciona un tamaño.', 'size');
  if (!description) throw new ValidationError('La descripción identificativa es obligatoria.', 'description');
  return {
    name,
    species,
    color,
    size,
    description,
    breed: String(input.breed || '').trim(),
    sex: String(input.sex || '').trim(),
    distinctiveFeatures: String(input.distinctiveFeatures || '').trim(),
    behavior: String(input.behavior || '').trim(),
    medicalNotes: String(input.medicalNotes || '').trim(),
    approachInstructions: String(input.approachInstructions || '').trim()
  };
}

export function validateLocationInput(input) {
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  validateCoordinates(lat, lng);
  const accuracy = input.accuracy === '' || input.accuracy == null ? null : Number(input.accuracy);
  if (accuracy != null && (!Number.isFinite(accuracy) || accuracy <= 0)) {
    throw new ValidationError('La precisión debe ser mayor que cero.', 'accuracy');
  }
  return {
    petId: String(input.petId || ''), lat, lng, accuracy,
    recordedAt: validateIsoDate(input.recordedAt, 'recordedAt'),
    placeReference: String(input.placeReference || '').trim(),
    note: String(input.note || '').trim(),
    source: 'manual'
  };
}

export function validateSightingInput(input) {
  const coordinates = validateCoordinates(Number(input.lat), Number(input.lng));
  const confidence = String(input.confidence || 'medium');
  if (!SIGHTING_CONFIDENCE.includes(confidence)) throw new ValidationError('Selecciona un nivel de confianza válido.', 'confidence');
  const description = String(input.description || '').trim();
  if (!description) throw new ValidationError('Describe el posible avistamiento.', 'description');
  return {
    ...coordinates,
    description,
    confidence,
    seenAt: validateIsoDate(input.seenAt, 'seenAt'),
    placeReference: String(input.placeReference || '').trim(),
    reporterAlias: String(input.reporterAlias || '').trim(),
    reporterPhone: String(input.reporterPhone || '').trim()
  };
}

export function validateSightingReviewStatus(status) {
  if (!SIGHTING_REVIEW_STATUSES.includes(status)) {
    throw new ValidationError('Selecciona un estado de revisión válido.', 'reviewStatus');
  }
  return status;
}

function assertRecordArray(payload, key) {
  if (!Array.isArray(payload[key])) throw new ValidationError(`El campo ${key} debe ser una lista.`);
  payload[key].forEach((record) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new ValidationError(`El campo ${key} contiene un registro inválido.`);
    }
  });
}

function assertUniqueRecordKeys(payload, key, keyField = 'id') {
  const values = payload[key].map((record) => record[keyField]);
  if (values.some((value) => typeof value !== 'string' || !value.trim())) {
    throw new ValidationError(`El campo ${key} contiene un registro sin identificador.`);
  }
  if (new Set(values).size !== values.length) {
    throw new ValidationError(`El campo ${key} contiene un identificador duplicado.`);
  }
}

export function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new ValidationError('La estructura del respaldo es inválida.');
  if (![1, 2].includes(payload.version)) throw new ValidationError('La versión del respaldo no es compatible.');
  validateIsoDate(payload.exportedAt, 'exportedAt');
  if (payload.profile !== null && (!payload.profile || typeof payload.profile !== 'object' || Array.isArray(payload.profile))) {
    throw new ValidationError('El perfil del respaldo es inválido.');
  }
  for (const key of BACKUP_KEYS.filter((key) => key !== 'profile')) {
    if (payload.version === 1 && key === 'alertEvents' && !(key in payload)) continue;
    if (!(key in payload)) throw new ValidationError(`Falta el campo ${key} en el respaldo.`);
    assertRecordArray(payload, key);
    assertUniqueRecordKeys(payload, key, key === 'settings' ? 'key' : 'id');
  }
  const petIds = new Set(payload.pets.map((pet) => pet.id));
  const alertIds = new Set(payload.alerts.map((alert) => alert.id));
  payload.locations.forEach((location) => {
    validateCoordinates(Number(location.lat), Number(location.lng));
    if (!petIds.has(location.petId)) throw new ValidationError('El respaldo contiene una ubicación sin mascota.');
  });
  payload.alerts.forEach((alert) => {
    if (!petIds.has(alert.petId)) throw new ValidationError('El respaldo contiene una alerta sin mascota.');
    if (!Object.values(ALERT_STATUSES).includes(alert.status)) throw new ValidationError('El respaldo contiene un estado de alerta inválido.');
  });
  (payload.alertEvents || []).forEach((event) => {
    if (!alertIds.has(event.alertId)) throw new ValidationError('El respaldo contiene un evento sin alerta.');
  });
  payload.sightings.forEach((sighting) => {
    validateCoordinates(Number(sighting.lat), Number(sighting.lng));
    if (!alertIds.has(sighting.alertId)) throw new ValidationError('El respaldo contiene un avistamiento sin alerta.');
    if (!SIGHTING_REVIEW_STATUSES.includes(sighting.reviewStatus)) throw new ValidationError('El respaldo contiene una revisión inválida.');
  });
  payload.pets.forEach((pet) => {
    if (!Object.values(PET_STATUSES).includes(pet.status)) throw new ValidationError('El respaldo contiene un estado de mascota inválido.');
  });
  return true;
}

export function formatRelativeTime(dateInput, now = Date.now()) {
  const value = new Date(dateInput).getTime();
  if (Number.isNaN(value)) return 'Sin fecha';
  const diffMinutes = Math.max(0, Math.round((now - value) / 60000));
  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return `Hace ${Math.round(diffHours / 24)} d`;
}

export function locationStatusLabel(status) {
  return ({ recent: 'Reciente', intermediate: 'Intermedia', old: 'Antigua' })[status] || 'Sin datos';
}
