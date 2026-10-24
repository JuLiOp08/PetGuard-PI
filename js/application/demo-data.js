import { PROFILE_ID } from '../config.js';

const minutesBefore = (referenceTime, minutes) => new Date(referenceTime.getTime() - minutes * 60_000).toISOString();

export function createDemoData(profile, referenceTime = new Date()) {
  const createdAt = minutesBefore(referenceTime, 90);
  const updatedAt = referenceTime.toISOString();
  const canelaId = 'demo-pet-canela';
  const nubeId = 'demo-pet-nube';
  const nubeLocationId = 'demo-location-nube-1';
  const alertId = 'demo-alert-nube';

  return {
    version: 2,
    exportedAt: updatedAt,
    profile: { ...profile, id: PROFILE_ID, createdAt, updatedAt },
    pets: [
      {
        id: canelaId,
        ownerId: PROFILE_ID,
        name: 'Canela',
        species: 'dog',
        color: 'Marrón',
        size: 'medium',
        breed: 'Mestiza',
        sex: 'female',
        condition: 'Esterilizada',
        relevantInformation: 'Pecho blanco y collar azul.',
        status: 'safe',
        createdAt,
        updatedAt
      },
      {
        id: nubeId,
        ownerId: PROFILE_ID,
        name: 'Nube',
        species: 'cat',
        color: 'Blanco y gris',
        size: 'small',
        sex: 'male',
        relevantInformation: 'Cola gris y placa redonda.',
        status: 'lost',
        createdAt,
        updatedAt
      }
    ],
    locations: [
      {
        id: 'demo-location-canela-1',
        petId: canelaId,
        lat: 4.711,
        lng: -74.0721,
        recordedAt: minutesBefore(referenceTime, 18),
        source: 'manual',
        placeReference: 'Parque del barrio',
        note: 'Paseo de la mañana',
        createdAt,
        updatedAt
      },
      {
        id: 'demo-location-canela-2',
        petId: canelaId,
        lat: 4.7088,
        lng: -74.0745,
        recordedAt: minutesBefore(referenceTime, 1_440),
        source: 'manual',
        placeReference: 'Veterinaria Central',
        note: 'Control rutinario',
        createdAt,
        updatedAt
      },
      {
        id: nubeLocationId,
        petId: nubeId,
        lat: 4.7132,
        lng: -74.0704,
        recordedAt: minutesBefore(referenceTime, 52),
        source: 'manual',
        placeReference: 'Entrada del parque',
        note: 'Última ubicación conocida',
        createdAt,
        updatedAt
      }
    ],
    alerts: [
      {
        id: alertId,
        petId: nubeId,
        petName: 'Nube',
        status: 'active',
        lostAt: minutesBefore(referenceTime, 48),
        lat: 4.7132,
        lng: -74.0704,
        lastKnownLocationId: nubeLocationId,
        placeReference: 'Cerca del parque',
        circumstances: 'Salió al abrirse la puerta durante una visita.',
        searchMessage: 'Nube lleva una placa redonda y puede esconderse bajo los autos.',
        contactSnapshot: { alias: profile.alias, phone: profile.phone || '', email: profile.email || '' },
        createdAt: minutesBefore(referenceTime, 45),
        updatedAt
      }
    ],
    alertEvents: [
      {
        id: 'demo-event-nube-active',
        alertId,
        type: 'status_changed',
        fromStatus: null,
        toStatus: 'active',
        note: 'Caso de búsqueda activado',
        occurredAt: minutesBefore(referenceTime, 45)
      }
    ],
    sightings: [
      {
        id: 'demo-sighting-nube-1',
        alertId,
        lat: 4.714,
        lng: -74.0698,
        seenAt: minutesBefore(referenceTime, 22),
        confidence: 'medium',
        description: 'Vista cerca del parque',
        placeReference: 'Junto a la entrada norte',
        reporterAlias: 'Vecina del sector',
        reporterPhone: '',
        reviewStatus: 'new',
        createdAt: minutesBefore(referenceTime, 20),
        updatedAt
      }
    ],
    notifications: [
      {
        id: 'demo-notification-alert',
        type: 'alert',
        title: 'Alerta activada',
        message: 'Nube fue marcada como extraviada.',
        priority: 'high',
        entityType: 'alert',
        entityId: alertId,
        read: false,
        createdAt: minutesBefore(referenceTime, 45)
      },
      {
        id: 'demo-notification-sighting',
        type: 'alert',
        title: 'Nuevo avistamiento',
        message: 'Se registró información para revisar.',
        priority: 'high',
        entityType: 'alert',
        entityId: alertId,
        read: false,
        createdAt: minutesBefore(referenceTime, 20)
      }
    ],
    settings: []
  };
}
