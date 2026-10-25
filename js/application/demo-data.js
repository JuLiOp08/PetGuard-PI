import { PROFILE_ID } from '../config.js';

const minutesBefore = (referenceTime, minutes) => new Date(referenceTime.getTime() - minutes * 60_000).toISOString();

export function createDemoData(profile, referenceTime = new Date()) {
  const createdAt = minutesBefore(referenceTime, 90);
  const updatedAt = referenceTime.toISOString();
  const canelaId = 'demo-pet-canela';
  const nubeId = 'demo-pet-nube';
  const solId = 'demo-pet-sol';
  const brunoId = 'demo-pet-bruno';
  const nubeLocationId = 'demo-location-nube-1';
  const alertId = 'demo-alert-nube';
  const solAlertId = 'demo-alert-sol';
  const brunoAlertId = 'demo-alert-bruno';

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
      },
      {
        id: solId,
        ownerId: PROFILE_ID,
        name: 'Sol',
        species: 'dog',
        color: 'Dorado',
        size: 'large',
        breed: 'Mestizo',
        sex: 'male',
        relevantInformation: 'Pañuelo verde y una mancha blanca en la pata delantera.',
        status: 'lost',
        createdAt,
        updatedAt
      },
      {
        id: brunoId,
        ownerId: PROFILE_ID,
        name: 'Bruno',
        species: 'cat',
        color: 'Negro',
        size: 'medium',
        sex: 'male',
        condition: 'Usa alimento renal.',
        relevantInformation: 'Ojos verdes y collar rojo.',
        status: 'safe',
        createdAt,
        updatedAt
      }
    ],
    locations: [
      {
        id: 'demo-location-canela-1',
        petId: canelaId,
        lat: -12.121,
        lng: -77.031,
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
        lat: -12.119,
        lng: -77.033,
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
        lat: -12.12,
        lng: -77.0285,
        recordedAt: minutesBefore(referenceTime, 52),
        source: 'manual',
        placeReference: 'Entrada del parque',
        note: 'Última ubicación conocida',
        createdAt,
        updatedAt
      },
      {
        id: 'demo-location-sol-1',
        petId: solId,
        lat: -12.1456,
        lng: -77.0218,
        recordedAt: minutesBefore(referenceTime, 35),
        source: 'manual',
        placeReference: 'Sendero junto al canal',
        note: 'Último paseo',
        createdAt,
        updatedAt
      },
      {
        id: 'demo-location-sol-2',
        petId: solId,
        lat: -12.143,
        lng: -77.023,
        recordedAt: minutesBefore(referenceTime, 2_880),
        source: 'manual',
        placeReference: 'Casa de Lucía',
        note: 'Cuidado familiar',
        createdAt,
        updatedAt
      },
      {
        id: 'demo-location-bruno-1',
        petId: brunoId,
        lat: -12.111,
        lng: -76.99,
        recordedAt: minutesBefore(referenceTime, 720),
        source: 'manual',
        placeReference: 'Patio del edificio',
        note: 'Regresó a casa',
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
        lat: -12.12,
        lng: -77.0285,
        lastKnownLocationId: nubeLocationId,
        placeReference: 'Cerca del parque',
        circumstances: 'Salió al abrirse la puerta durante una visita.',
        searchMessage: 'Nube lleva una placa redonda y puede esconderse bajo los autos.',
        contactSnapshot: { alias: profile.alias, phone: profile.phone || '', email: profile.email || '' },
        createdAt: minutesBefore(referenceTime, 45),
        updatedAt
      },
      {
        id: solAlertId,
        petId: solId,
        petName: 'Sol',
        status: 'active',
        lostAt: minutesBefore(referenceTime, 32),
        lat: -12.1456,
        lng: -77.0218,
        lastKnownLocationId: 'demo-location-sol-1',
        placeReference: 'Sendero junto al canal',
        circumstances: 'Se soltó durante un ruido fuerte.',
        searchMessage: 'Sol lleva un pañuelo verde y suele acercarse si le ofrecen agua.',
        contactSnapshot: { alias: profile.alias, phone: profile.phone || '', email: profile.email || '' },
        createdAt: minutesBefore(referenceTime, 30),
        updatedAt
      },
      {
        id: brunoAlertId,
        petId: brunoId,
        petName: 'Bruno',
        status: 'resolved',
        lostAt: minutesBefore(referenceTime, 4_500),
        lat: -12.112,
        lng: -76.992,
        lastKnownLocationId: 'demo-location-bruno-1',
        placeReference: 'Estacionamiento del edificio',
        circumstances: 'Salió mientras ingresaban compras.',
        searchMessage: 'Bruno es tranquilo, tiene ojos verdes y collar rojo.',
        contactSnapshot: { alias: profile.alias, phone: profile.phone || '', email: profile.email || '' },
        resolvedAt: minutesBefore(referenceTime, 4_320),
        resolution: { foundAt: minutesBefore(referenceTime, 4_320), place: 'Patio del edificio', note: 'Encontrado por Mario' },
        createdAt: minutesBefore(referenceTime, 4_480),
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
      },
      {
        id: 'demo-event-sol-active',
        alertId: solAlertId,
        type: 'status_changed',
        fromStatus: null,
        toStatus: 'active',
        note: 'La familia inició la búsqueda de Sol',
        occurredAt: minutesBefore(referenceTime, 30)
      },
      {
        id: 'demo-event-bruno-resolved',
        alertId: brunoAlertId,
        type: 'status_changed',
        fromStatus: 'active',
        toStatus: 'resolved',
        note: 'Mario confirmó que Bruno regresó a salvo',
        occurredAt: minutesBefore(referenceTime, 4_320)
      }
    ],
    sightings: [
      {
        id: 'demo-sighting-nube-1',
        alertId,
        lat: -12.1194,
        lng: -77.0278,
        seenAt: minutesBefore(referenceTime, 22),
        confidence: 'medium',
        description: 'Vista cerca del parque',
        placeReference: 'Junto a la entrada norte',
        reporterAlias: 'Vecina del sector',
        reporterPhone: '',
        reviewStatus: 'new',
        createdAt: minutesBefore(referenceTime, 20),
        updatedAt
      },
      {
        id: 'demo-sighting-nube-2',
        alertId,
        lat: -12.1182,
        lng: -77.0265,
        seenAt: minutesBefore(referenceTime, 16),
        confidence: 'high',
        description: 'Un gato con placa redonda cruzó hacia los jardines.',
        placeReference: 'Jardines del costado este',
        reporterAlias: 'Mario Vega',
        reporterPhone: '',
        reviewStatus: 'relevant',
        createdAt: minutesBefore(referenceTime, 15),
        updatedAt
      },
      {
        id: 'demo-sighting-nube-3',
        alertId,
        lat: -12.122,
        lng: -77.0302,
        seenAt: minutesBefore(referenceTime, 8),
        confidence: 'medium',
        description: 'Escucharon un maullido bajo un automóvil estacionado.',
        placeReference: 'Calle frente al parque',
        reporterAlias: 'Lucía Torres',
        reporterPhone: '',
        reviewStatus: 'in_review',
        createdAt: minutesBefore(referenceTime, 7),
        updatedAt
      },
      {
        id: 'demo-sighting-sol-1',
        alertId: solAlertId,
        lat: -12.1444,
        lng: -77.0207,
        seenAt: minutesBefore(referenceTime, 19),
        confidence: 'high',
        description: 'Perro dorado con pañuelo verde visto junto al puente.',
        placeReference: 'Puente peatonal',
        reporterAlias: 'Vecino del sector',
        reporterPhone: '',
        reviewStatus: 'relevant',
        createdAt: minutesBefore(referenceTime, 18),
        updatedAt
      },
      {
        id: 'demo-sighting-sol-2',
        alertId: solAlertId,
        lat: -12.1435,
        lng: -77.0194,
        seenAt: minutesBefore(referenceTime, 6),
        confidence: 'medium',
        description: 'Lo vieron avanzar hacia la ciclovía.',
        placeReference: 'Inicio de la ciclovía',
        reporterAlias: 'Carlos Torres',
        reporterPhone: '',
        reviewStatus: 'new',
        createdAt: minutesBefore(referenceTime, 5),
        updatedAt
      },
      {
        id: 'demo-sighting-bruno-1',
        alertId: brunoAlertId,
        lat: -12.111,
        lng: -76.99,
        seenAt: minutesBefore(referenceTime, 4_330),
        confidence: 'high',
        description: 'Bruno apareció en el patio interior.',
        placeReference: 'Patio del edificio',
        reporterAlias: 'Mario Vega',
        reporterPhone: '',
        reviewStatus: 'relevant',
        createdAt: minutesBefore(referenceTime, 4_325),
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
      },
      {
        id: 'demo-notification-sol-alert',
        type: 'alert',
        title: 'La familia busca a Sol',
        message: 'Se compartió su último punto conocido con el círculo de confianza.',
        priority: 'high',
        entityType: 'alert',
        entityId: solAlertId,
        read: false,
        createdAt: minutesBefore(referenceTime, 30)
      },
      {
        id: 'demo-notification-sol-sighting',
        type: 'alert',
        title: 'Nuevo avistamiento de Sol',
        message: 'Carlos registró una referencia cerca de la ciclovía.',
        priority: 'high',
        entityType: 'alert',
        entityId: solAlertId,
        read: false,
        createdAt: minutesBefore(referenceTime, 5)
      },
      {
        id: 'demo-notification-bruno-found',
        type: 'alert',
        title: 'Bruno está a salvo',
        message: 'Mario confirmó el hallazgo y el caso fue cerrado.',
        priority: 'normal',
        entityType: 'alert',
        entityId: brunoAlertId,
        read: true,
        createdAt: minutesBefore(referenceTime, 4_320)
      }
    ],
    settings: []
  };
}
