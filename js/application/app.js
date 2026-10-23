import {
  createAlert, deleteNotification, deletePet, exportAllData, importAllData, loadAppData,
  markAllNotificationsRead, markNotificationRead, resetAllData, resolveAlert, reviewSighting,
  saveLocation, savePet, saveProfile, saveSighting
} from '../services/petguard-store.js';
import {
  computeLocationStatus, formatRelativeTime, haversineDistanceKm, locationStatusLabel,
  validateImportPayload, validateLocationInput, validatePetInput, validateProfileInput,
  validateSightingInput, ValidationError
} from '../domain/index.js';

const app = document.querySelector('#app');
const state = { profile: null, pets: [], locations: [], alerts: [], alertEvents: [], sightings: [], notifications: [], settings: [] };
const labels = {
  dog: 'Perro', cat: 'Gato', small: 'Pequeño', medium: 'Mediano', large: 'Grande', safe: 'Segura',
  lost: 'Extraviada', found: 'Encontrada', active: 'Activa', paused: 'Pausada', resolved: 'Resuelta',
  cancelled: 'Cancelada', low: 'Baja', high: 'Alta', normal: 'Normal', new: 'Nuevo',
  in_review: 'En revisión', relevant: 'Relevante', discarded: 'Descartado'
};

const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const label = (value) => labels[value] || value || 'Sin datos';
const confidenceLabel = (value) => ({ low: 'Baja', medium: 'Media', high: 'Alta' })[value] || value;
const formatDate = (value) => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin fecha';
const inputDate = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function icon(name) {
  const paths = {
    home: '<path d="M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    pets: '<path d="M8.5 12.5c-2.7 0-5 2.2-5 4.8 0 2.2 1.8 3.7 4 3.2 2.9-.7 6.1-.7 9 0 2.2.5 4-1 4-3.2 0-2.6-2.3-4.8-5-4.8-1.4 0-2.6.6-3.5 1.5-.9-.9-2.1-1.5-3.5-1.5Z"/><circle cx="5" cy="8" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><circle cx="19" cy="8" r="2"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    alert: '<path d="M10.3 3.2 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', arrow: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>', download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 21h14"/>',
    upload: '<path d="M12 17V5m0 0 4 4m-4-4L8 9"/><path d="M5 21h14"/>'
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.arrow}</svg>`;
}

function route() {
  const [page, id] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  return { page, id };
}

function navigate(path) { if (location.hash === `#/${path}`) render(); else location.hash = `#/${path}`; }
function latestLocation(petId) { return state.locations.filter((item) => item.petId === petId).sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0] || null; }
function petName(petId) { return state.pets.find((pet) => pet.id === petId)?.name || 'Mascota'; }
function statusBadge(status) { return `<span class="status status--${escapeHtml(status)}"><span aria-hidden="true"></span>${escapeHtml(label(status))}</span>`; }
function emptyState(title, description, action = '') { return `<div class="empty"><div class="empty__mark">${icon('pets')}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>${action}</div>`; }
function navItem(path, text, iconName, current) { const active = current === path; return `<a href="#/${path}" class="nav-item${active ? ' is-active' : ''}" ${active ? 'aria-current="page"' : ''}>${icon(iconName)}<span>${text}</span></a>`; }

function shell(content, title, current = route().page) {
  const unread = state.notifications.filter((item) => !item.read).length;
  app.innerHTML = `<a class="skip-link" href="#main-content">Saltar al contenido</a><div class="app-shell">
    <aside class="sidebar" aria-label="Navegación principal"><a class="brand" href="#/home" aria-label="PetGuard, inicio"><span class="brand__mark">P</span><span>PetGuard</span></a><nav>
      ${navItem('home', 'Inicio', 'home', current)}${navItem('pets', 'Mascotas', 'pets', current)}${navItem('locations', 'Ubicaciones', 'pin', current)}${navItem('alerts', 'Alertas', 'alert', current)}${navItem('notifications', `Avisos${unread ? ` (${unread})` : ''}`, 'bell', current)}
    </nav><div class="sidebar__foot"><p>Datos guardados en este navegador.</p></div></aside>
    <div class="workspace"><header class="topbar"><div><p class="eyebrow">PetGuard</p><h1>${escapeHtml(title)}</h1></div><div class="topbar__actions"><span class="owner-name">${escapeHtml(state.profile?.alias || '')}</span><a class="icon-button" href="#/settings" aria-label="Abrir configuración">${icon('settings')}</a></div></header><main id="main-content" tabindex="-1">${content}</main></div>
    <nav class="bottom-nav" aria-label="Navegación principal">${navItem('home', 'Inicio', 'home', current)}${navItem('pets', 'Mascotas', 'pets', current)}${navItem('locations', 'Ubicaciones', 'pin', current)}${navItem('alerts', 'Alertas', 'alert', current)}${navItem('notifications', 'Avisos', 'bell', current)}</nav>
  </div><div id="toast-region" class="toast-region" aria-live="polite" aria-atomic="true"></div>`;
}

function profileFields(profile = {}) {
  return `<label class="field"><span>Nombre o alias <b aria-hidden="true">*</b></span><input name="alias" value="${escapeHtml(profile.alias || '')}" maxlength="60" autocomplete="name" required><small class="field-error" data-error-for="alias"></small></label>
    <div class="field-grid"><label class="field"><span>Teléfono</span><input name="phone" value="${escapeHtml(profile.phone || '')}" maxlength="40" inputmode="tel" autocomplete="tel"></label><label class="field"><span>Correo</span><input name="email" type="email" value="${escapeHtml(profile.email || '')}" maxlength="80" autocomplete="email"><small class="field-error" data-error-for="email"></small></label></div>
    <div class="field-grid"><label class="field"><span>Distrito</span><input name="district" value="${escapeHtml(profile.district || '')}" maxlength="80"></label><label class="field"><span>Contacto alternativo</span><input name="alternateContact" value="${escapeHtml(profile.alternateContact || '')}" maxlength="80"></label></div>
    <label class="check"><input type="checkbox" name="acceptsLocalStorage" ${profile.acceptsLocalStorage ? 'checked' : ''}><span>Acepto que la información se guarde únicamente en este navegador.</span></label>`;
}

function renderOnboarding() {
  app.innerHTML = `<main class="onboarding"><section class="onboarding__intro"><a class="brand brand--light" href="#"><span class="brand__mark">P</span><span>PetGuard</span></a><div><p class="eyebrow">Información lista cuando importa</p><h1>Protege su historia.<br>Organiza su búsqueda.</h1><p>Guarda datos de identificación, ubicaciones conocidas y avistamientos en un solo lugar, disponible en este dispositivo.</p></div><ul class="feature-list"><li>${icon('check')} Sin cuentas ni contraseñas</li><li>${icon('check')} Respaldo exportable</li><li>${icon('check')} Control total de tus datos</li></ul></section>
    <section class="onboarding__form"><div class="form-card"><p class="step">Configuración inicial</p><h2>Crea tu perfil local</h2><p class="muted">Solo necesitamos un nombre. Los datos de contacto son opcionales.</p><form id="profile-form" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div>${profileFields({ acceptsLocalStorage: true })}<button class="button button--primary button--full" type="submit">Entrar a PetGuard ${icon('arrow')}</button></form></div></section></main>`;
}

function petCard(pet) {
  const location = latestLocation(pet.id);
  return `<article class="pet-card"><a class="pet-card__main" href="#/pets/${encodeURIComponent(pet.id)}"><span class="pet-avatar" aria-hidden="true">${pet.species === 'cat' ? 'G' : 'P'}</span><div><div class="pet-card__title"><h3>${escapeHtml(pet.name)}</h3>${statusBadge(pet.status)}</div><p>${escapeHtml(label(pet.species))} · ${escapeHtml(pet.color)}</p><small>${location ? `${icon('pin')} ${formatRelativeTime(location.recordedAt)}` : 'Sin ubicación registrada'}</small></div></a><a class="card-arrow" href="#/pets/${encodeURIComponent(pet.id)}" aria-label="Ver ficha de ${escapeHtml(pet.name)}">${icon('arrow')}</a></article>`;
}

function locationRow(location) {
  const status = computeLocationStatus(location.recordedAt);
  return `<article class="timeline-item"><span class="timeline-item__dot status-dot--${status}"></span><div><div class="timeline-item__head"><strong>${escapeHtml(petName(location.petId))}</strong><span>${locationStatusLabel(status)}</span></div><p>${escapeHtml(location.placeReference || `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`)}</p><small>${formatDate(location.recordedAt)} · Registro manual</small><small class="coordinates">${Number(location.lat).toFixed(6)}, ${Number(location.lng).toFixed(6)}</small></div></article>`;
}

function renderHome() {
  const activeAlerts = state.alerts.filter((item) => item.status === 'active');
  const recentLocations = [...state.locations].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, 4);
  shell(`<section class="welcome"><div><p class="eyebrow">Buenos días, ${escapeHtml(state.profile.alias)}</p><h2>Todo lo importante, a mano.</h2><p>Revisa el estado de tus mascotas y conserva información útil para actuar con rapidez.</p></div><button class="button button--primary" data-action="new-pet">${icon('plus')} Registrar mascota</button></section>
    <section class="metrics" aria-label="Resumen"><article class="metric"><span class="metric__icon metric__icon--green">${icon('pets')}</span><div><strong>${state.pets.length}</strong><span>Mascotas</span></div></article><article class="metric"><span class="metric__icon metric__icon--blue">${icon('pin')}</span><div><strong>${state.locations.length}</strong><span>Ubicaciones</span></div></article><article class="metric"><span class="metric__icon metric__icon--red">${icon('alert')}</span><div><strong>${activeAlerts.length}</strong><span>Alertas activas</span></div></article><article class="metric"><span class="metric__icon metric__icon--amber">${icon('bell')}</span><div><strong>${state.notifications.filter((item) => !item.read).length}</strong><span>Avisos nuevos</span></div></article></section>
    ${activeAlerts.length ? `<section class="attention"><div>${icon('alert')}<div><strong>${activeAlerts.length === 1 ? 'Hay un caso de búsqueda activo' : `Hay ${activeAlerts.length} casos de búsqueda activos`}</strong><p>Consulta los datos y avistamientos disponibles.</p></div></div><a class="button button--light" href="#/alerts">Ver alertas</a></section>` : ''}
    <div class="content-grid"><section><div class="section-head"><div><p class="eyebrow">Tu familia</p><h2>Mascotas</h2></div><a href="#/pets">Ver todas ${icon('arrow')}</a></div><div class="pet-grid">${state.pets.slice(0, 3).map(petCard).join('') || emptyState('Aún no hay mascotas', 'Registra la primera ficha para comenzar.', '<button class="button button--primary" data-action="new-pet">Registrar mascota</button>')}</div></section><section><div class="section-head"><div><p class="eyebrow">Registro reciente</p><h2>Ubicaciones</h2></div><button class="text-button" data-action="new-location">Añadir ${icon('plus')}</button></div><div class="timeline">${recentLocations.map(locationRow).join('') || emptyState('Sin ubicaciones', 'Añade una ubicación conocida cuando la necesites.')}</div></section></div>`, 'Inicio', 'home');
}

function renderPets() {
  shell(`<div class="page-head"><div><p class="eyebrow">Fichas de identificación</p><h2>Mascotas registradas</h2><p>Conserva sus rasgos y cuidados importantes siempre disponibles.</p></div><button class="button button--primary" data-action="new-pet">${icon('plus')} Nueva mascota</button></div><div class="pet-grid pet-grid--wide">${state.pets.map(petCard).join('') || emptyState('Aún no hay mascotas', 'Registra una ficha con sus rasgos principales.', '<button class="button button--primary" data-action="new-pet">Registrar mascota</button>')}</div>`, 'Mascotas', 'pets');
}

function renderPetDetail(id) {
  const pet = state.pets.find((item) => item.id === id);
  if (!pet) return renderNotFound();
  const locations = state.locations.filter((item) => item.petId === id).sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  const alerts = state.alerts.filter((item) => item.petId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const active = alerts.find((item) => item.status === 'active');
  shell(`<a class="back-link" href="#/pets">← Volver a mascotas</a><section class="profile-hero"><span class="pet-avatar pet-avatar--large" aria-hidden="true">${pet.species === 'cat' ? 'G' : 'P'}</span><div><div class="profile-hero__title"><h2>${escapeHtml(pet.name)}</h2>${statusBadge(pet.status)}</div><p>${escapeHtml(label(pet.species))} · ${escapeHtml(label(pet.size))} · ${escapeHtml(pet.color)}</p></div><div class="profile-hero__actions"><button class="button button--secondary" data-action="edit-pet" data-id="${escapeHtml(pet.id)}">Editar ficha</button>${active ? `<a class="button button--danger" href="#/alerts/${encodeURIComponent(active.id)}">Ver alerta</a>` : `<button class="button button--danger" data-action="new-alert" data-pet-id="${escapeHtml(pet.id)}">Reportar extravío</button>`}</div></section>
    <div class="detail-grid"><section class="panel"><div class="section-head"><h3>Identificación</h3></div><dl class="data-list"><div><dt>Descripción</dt><dd>${escapeHtml(pet.description)}</dd></div><div><dt>Raza</dt><dd>${escapeHtml(pet.breed || 'No especificada')}</dd></div><div><dt>Señas particulares</dt><dd>${escapeHtml(pet.distinctiveFeatures || 'No especificadas')}</dd></div><div><dt>Comportamiento</dt><dd>${escapeHtml(pet.behavior || 'No especificado')}</dd></div><div><dt>Cuidados médicos</dt><dd>${escapeHtml(pet.medicalNotes || 'No especificados')}</dd></div><div><dt>Cómo acercarse</dt><dd>${escapeHtml(pet.approachInstructions || 'Sin indicaciones especiales')}</dd></div></dl></section><section class="panel"><div class="section-head"><div><h3>Ubicaciones conocidas</h3><p>No representan seguimiento en tiempo real.</p></div><button class="text-button" data-action="new-location" data-pet-id="${escapeHtml(pet.id)}">Añadir ${icon('plus')}</button></div><div class="timeline">${locations.slice(0, 6).map(locationRow).join('') || emptyState('Sin ubicaciones', 'Todavía no se ha registrado una ubicación conocida.')}</div></section></div>
    <section class="danger-zone"><div><h3>Eliminar ficha</h3><p>También se eliminarán sus ubicaciones, alertas y avistamientos.</p></div><button class="button button--danger-outline" data-action="delete-pet" data-id="${escapeHtml(pet.id)}">Eliminar mascota</button></section>`, pet.name, 'pets');
}

function renderLocations() {
  const locations = [...state.locations].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  shell(`<div class="page-head"><div><p class="eyebrow">Referencias para la búsqueda</p><h2>Ubicaciones conocidas</h2><p>Registros manuales con fecha y origen. No son posiciones en tiempo real.</p></div><button class="button button--primary" data-action="new-location">${icon('plus')} Añadir ubicación</button></div><section class="panel"><div class="timeline timeline--roomy">${locations.map(locationRow).join('') || emptyState('Sin ubicaciones conocidas', 'Registra una referencia cuando conozcas dónde estuvo una mascota.', '<button class="button button--primary" data-action="new-location">Añadir ubicación</button>')}</div></section>`, 'Ubicaciones', 'locations');
}

function alertCard(alert) {
  const pet = state.pets.find((item) => item.id === alert.petId);
  const count = state.sightings.filter((item) => item.alertId === alert.id).length;
  return `<article class="alert-card"><div class="alert-card__top"><div><p class="eyebrow">${formatRelativeTime(alert.createdAt)}</p><h3>${escapeHtml(pet?.name || 'Mascota')}</h3></div>${statusBadge(alert.status)}</div><p>${escapeHtml(alert.searchMessage || alert.circumstances || 'Caso de búsqueda')}</p><div class="alert-card__meta"><span>${icon('pin')} ${escapeHtml(alert.placeReference || 'Sin referencia')}</span><span>${icon('bell')} ${count} avistamiento${count === 1 ? '' : 's'}</span></div><a class="button button--secondary button--full" href="#/alerts/${encodeURIComponent(alert.id)}">Abrir caso ${icon('arrow')}</a></article>`;
}

function renderAlerts() {
  const alerts = [...state.alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  shell(`<div class="page-head"><div><p class="eyebrow">Casos de búsqueda</p><h2>Alertas de extravío</h2><p>Centraliza la información y los posibles avistamientos.</p></div><button class="button button--danger" data-action="new-alert">${icon('alert')} Activar alerta</button></div><div class="alert-grid">${alerts.map(alertCard).join('') || emptyState('No hay alertas', 'Si una mascota se extravía, podrás organizar aquí su búsqueda.', '<button class="button button--danger" data-action="new-alert">Activar alerta</button>')}</div>`, 'Alertas', 'alerts');
}

function sightingCard(item, last, open) {
  const distance = last ? haversineDistanceKm(last.lat, last.lng, item.lat, item.lng) : null;
  return `<article class="sighting"><div class="sighting__top"><div><strong>${escapeHtml(item.placeReference || 'Ubicación indicada')}</strong><p>${formatDate(item.seenAt)}</p></div>${statusBadge(item.reviewStatus)}</div><p>${escapeHtml(item.description)}</p><div class="sighting__facts"><span>Confianza: ${escapeHtml(confidenceLabel(item.confidence))}</span>${distance != null ? `<span>Distancia de referencia: ${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>` : ''}</div>${open ? `<form class="review-form" data-form="review-sighting" data-id="${escapeHtml(item.id)}"><label><span class="sr-only">Estado de revisión</span><select name="reviewStatus"><option value="new" ${item.reviewStatus === 'new' ? 'selected' : ''}>Nuevo</option><option value="in_review" ${item.reviewStatus === 'in_review' ? 'selected' : ''}>En revisión</option><option value="relevant" ${item.reviewStatus === 'relevant' ? 'selected' : ''}>Relevante</option><option value="discarded" ${item.reviewStatus === 'discarded' ? 'selected' : ''}>Descartado</option></select></label><button class="button button--secondary button--small" type="submit">Actualizar</button></form>` : ''}</article>`;
}

function renderAlertDetail(id) {
  const alert = state.alerts.find((item) => item.id === id);
  if (!alert) return renderNotFound();
  const pet = state.pets.find((item) => item.id === alert.petId);
  const sightings = state.sightings.filter((item) => item.alertId === id).sort((a, b) => new Date(b.seenAt) - new Date(a.seenAt));
  const events = state.alertEvents.filter((item) => item.alertId === id).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  const last = latestLocation(alert.petId); const open = ['active', 'paused'].includes(alert.status);
  shell(`<a class="back-link" href="#/alerts">← Volver a alertas</a><section class="case-hero"><div><p class="eyebrow">Caso de búsqueda</p><div class="profile-hero__title"><h2>${escapeHtml(pet?.name || 'Mascota')}</h2>${statusBadge(alert.status)}</div><p>${escapeHtml(alert.searchMessage || 'Sin mensaje de búsqueda')}</p></div>${open ? `<div class="profile-hero__actions"><button class="button button--secondary" data-action="new-sighting" data-alert-id="${escapeHtml(alert.id)}">Registrar avistamiento</button><button class="button button--primary" data-action="resolve-alert" data-alert-id="${escapeHtml(alert.id)}">Mascota encontrada</button></div>` : ''}</section>
    <div class="detail-grid"><section class="panel"><div class="section-head"><h3>Información del caso</h3></div><dl class="data-list"><div><dt>Reportada</dt><dd>${formatDate(alert.lostAt)}</dd></div><div><dt>Lugar de referencia</dt><dd>${escapeHtml(alert.placeReference || 'No especificado')}</dd></div><div><dt>Circunstancias</dt><dd>${escapeHtml(alert.circumstances || 'No especificadas')}</dd></div><div><dt>Última ubicación conocida</dt><dd>${last ? `${escapeHtml(last.placeReference || `${last.lat}, ${last.lng}`)} · ${formatRelativeTime(last.recordedAt)}` : 'Sin ubicación previa'}</dd></div></dl></section><section class="panel"><div class="section-head"><div><h3>Historial</h3><p>Cambios importantes del caso.</p></div></div><div class="timeline">${events.map((event) => `<article class="timeline-item"><span class="timeline-item__dot"></span><div><strong>${escapeHtml(event.note)}</strong><p>${formatDate(event.occurredAt)}</p></div></article>`).join('') || '<p class="muted">Sin eventos registrados.</p>'}</div></section></div>
    <section class="panel section-block"><div class="section-head"><div><h3>Avistamientos</h3><p>Son referencias por revisar, no confirmaciones de identidad.</p></div>${open ? `<button class="text-button" data-action="new-sighting" data-alert-id="${escapeHtml(alert.id)}">Añadir ${icon('plus')}</button>` : ''}</div><div class="sighting-list">${sightings.map((item) => sightingCard(item, last, open)).join('') || emptyState('Sin avistamientos', 'Aún no hay reportes asociados a este caso.')}</div></section>`, `Alerta de ${pet?.name || 'mascota'}`, 'alerts');
}

function renderNotifications() {
  const items = [...state.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  shell(`<div class="page-head"><div><p class="eyebrow">Actividad importante</p><h2>Centro de avisos</h2><p>${items.filter((item) => !item.read).length} pendientes de leer.</p></div>${items.some((item) => !item.read) ? '<button class="button button--secondary" data-action="mark-all-read">Marcar todos como leídos</button>' : ''}</div><section class="panel notification-list">${items.map((item) => `<article class="notification${item.read ? '' : ' is-unread'}"><span class="notification__icon">${icon(item.priority === 'high' ? 'alert' : 'bell')}</span><div><div class="notification__title"><strong>${escapeHtml(item.title)}</strong><span>${formatRelativeTime(item.createdAt)}</span></div><p>${escapeHtml(item.message)}</p></div><div class="notification__actions">${!item.read ? `<button class="icon-button" data-action="mark-read" data-id="${escapeHtml(item.id)}" aria-label="Marcar como leído">${icon('check')}</button>` : ''}<button class="icon-button" data-action="delete-notification" data-id="${escapeHtml(item.id)}" aria-label="Eliminar aviso">×</button></div></article>`).join('') || emptyState('No hay avisos', 'La actividad importante aparecerá aquí.')}</section>`, 'Avisos', 'notifications');
}

function renderSettings() {
  shell(`<div class="page-head"><div><p class="eyebrow">Privacidad y respaldo</p><h2>Configuración</h2><p>La información permanece en este navegador hasta que decidas exportarla o borrarla.</p></div></div><div class="settings-grid"><section class="panel"><div class="settings-row"><div><h3>Perfil local</h3><p>${escapeHtml(state.profile.alias)}${state.profile.email ? ` · ${escapeHtml(state.profile.email)}` : ''}</p></div><button class="button button--secondary" data-action="edit-profile">Editar</button></div></section><section class="panel"><h3>Respaldo de datos</h3><p>Guarda una copia completa o restaura un archivo exportado anteriormente.</p><div class="button-row"><button class="button button--primary" data-action="export">${icon('download')} Exportar respaldo</button><label class="button button--secondary file-button">${icon('upload')} Importar respaldo<input id="import-file" type="file" accept="application/json"></label></div></section><section class="panel panel--danger"><div><h3>Borrar todos los datos</h3><p>Esta acción elimina el perfil, las mascotas y todos sus registros de este navegador.</p></div><button class="button button--danger-outline" data-action="reset">Borrar datos</button></section></div>`, 'Configuración', 'settings');
}

function renderNotFound() { shell(emptyState('Contenido no encontrado', 'La información solicitada no existe.', '<a class="button button--primary" href="#/home">Volver al inicio</a>'), 'No encontrado'); }
function render() {
  if (!state.profile) return renderOnboarding();
  const current = route();
  if (current.page === 'home') return renderHome();
  if (current.page === 'pets' && current.id) return renderPetDetail(decodeURIComponent(current.id));
  if (current.page === 'pets') return renderPets();
  if (current.page === 'locations') return renderLocations();
  if (current.page === 'alerts' && current.id) return renderAlertDetail(decodeURIComponent(current.id));
  if (current.page === 'alerts') return renderAlerts();
  if (current.page === 'notifications') return renderNotifications();
  if (current.page === 'settings') return renderSettings();
  return renderNotFound();
}

function petForm(pet = {}) {
  return `<form id="pet-form" data-id="${escapeHtml(pet.id || '')}" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div><div class="field-grid"><label class="field"><span>Nombre <b>*</b></span><input name="name" value="${escapeHtml(pet.name || '')}" maxlength="60" required><small class="field-error" data-error-for="name"></small></label><label class="field"><span>Especie <b>*</b></span><select name="species"><option value="dog" ${pet.species !== 'cat' ? 'selected' : ''}>Perro</option><option value="cat" ${pet.species === 'cat' ? 'selected' : ''}>Gato</option></select></label></div><div class="field-grid"><label class="field"><span>Color principal <b>*</b></span><input name="color" value="${escapeHtml(pet.color || '')}" required><small class="field-error" data-error-for="color"></small></label><label class="field"><span>Tamaño <b>*</b></span><select name="size"><option value="small" ${pet.size === 'small' ? 'selected' : ''}>Pequeño</option><option value="medium" ${!pet.size || pet.size === 'medium' ? 'selected' : ''}>Mediano</option><option value="large" ${pet.size === 'large' ? 'selected' : ''}>Grande</option></select></label></div><label class="field"><span>Descripción identificativa <b>*</b></span><textarea name="description" rows="3" required>${escapeHtml(pet.description || '')}</textarea><small class="field-error" data-error-for="description"></small></label><div class="field-grid"><label class="field"><span>Raza</span><input name="breed" value="${escapeHtml(pet.breed || '')}"></label><label class="field"><span>Sexo</span><select name="sex"><option value="">No especificado</option><option value="female" ${pet.sex === 'female' ? 'selected' : ''}>Hembra</option><option value="male" ${pet.sex === 'male' ? 'selected' : ''}>Macho</option></select></label></div><label class="field"><span>Señas particulares</span><textarea name="distinctiveFeatures" rows="2">${escapeHtml(pet.distinctiveFeatures || '')}</textarea></label><label class="field"><span>Comportamiento</span><textarea name="behavior" rows="2">${escapeHtml(pet.behavior || '')}</textarea></label><label class="field"><span>Condición médica relevante</span><textarea name="medicalNotes" rows="2">${escapeHtml(pet.medicalNotes || '')}</textarea></label><label class="field"><span>Indicaciones para acercarse</span><textarea name="approachInstructions" rows="2">${escapeHtml(pet.approachInstructions || '')}</textarea></label><div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--primary" type="submit">Guardar mascota</button></div></form>`;
}

function locationForm(selectedPetId = '') {
  return `<form id="location-form" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>Mascota <b>*</b></span><select name="petId" required>${state.pets.map((pet) => `<option value="${escapeHtml(pet.id)}" ${pet.id === selectedPetId ? 'selected' : ''}>${escapeHtml(pet.name)}</option>`).join('')}</select></label><div class="field-grid"><label class="field"><span>Latitud <b>*</b></span><input name="lat" type="number" inputmode="decimal" step="0.000001" required><small class="field-error" data-error-for="lat"></small></label><label class="field"><span>Longitud <b>*</b></span><input name="lng" type="number" inputmode="decimal" step="0.000001" required><small class="field-error" data-error-for="lng"></small></label></div><div class="field-grid"><label class="field"><span>Fecha y hora <b>*</b></span><input name="recordedAt" type="datetime-local" value="${inputDate()}" required><small class="field-error" data-error-for="recordedAt"></small></label><label class="field"><span>Precisión aproximada (m)</span><input name="accuracy" type="number" min="1" inputmode="numeric"><small class="field-error" data-error-for="accuracy"></small></label></div><label class="field"><span>Lugar o referencia</span><input name="placeReference" maxlength="120" placeholder="Ej. Parque del barrio"></label><label class="field"><span>Nota</span><textarea name="note" rows="2"></textarea></label><p class="form-note">Este registro es una ubicación conocida ingresada manualmente, no seguimiento GPS en tiempo real.</p><div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--primary" type="submit">Guardar ubicación</button></div></form>`;
}

function alertForm(selectedPetId = '') {
  const available = state.pets.filter((pet) => !state.alerts.some((alert) => alert.petId === pet.id && alert.status === 'active'));
  return `<form id="alert-form" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>Mascota <b>*</b></span><select name="petId" required>${available.map((pet) => `<option value="${escapeHtml(pet.id)}" ${pet.id === selectedPetId ? 'selected' : ''}>${escapeHtml(pet.name)}</option>`).join('')}</select></label><label class="field"><span>Fecha y hora del extravío <b>*</b></span><input name="lostAt" type="datetime-local" value="${inputDate()}" required></label><label class="field"><span>Lugar de referencia</span><input name="placeReference" maxlength="120"></label><label class="field"><span>Circunstancias</span><textarea name="circumstances" rows="3" placeholder="Qué ocurrió y hacia dónde se dirigió"></textarea></label><label class="field"><span>Mensaje de búsqueda <b>*</b></span><textarea name="searchMessage" rows="3" required placeholder="Descripción breve y cómo acercarse"></textarea></label><p class="form-note">La alerta organiza el caso dentro de PetGuard. No se publica ni se envía a terceros automáticamente.</p><div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--danger" type="submit">Activar alerta</button></div></form>`;
}

function sightingForm(alertId) {
  return `<form id="sighting-form" data-alert-id="${escapeHtml(alertId)}" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>Descripción <b>*</b></span><textarea name="description" rows="3" required></textarea><small class="field-error" data-error-for="description"></small></label><div class="field-grid"><label class="field"><span>Latitud <b>*</b></span><input name="lat" type="number" inputmode="decimal" step="0.000001" required><small class="field-error" data-error-for="lat"></small></label><label class="field"><span>Longitud <b>*</b></span><input name="lng" type="number" inputmode="decimal" step="0.000001" required><small class="field-error" data-error-for="lng"></small></label></div><div class="field-grid"><label class="field"><span>Fecha y hora <b>*</b></span><input name="seenAt" type="datetime-local" value="${inputDate()}" required></label><label class="field"><span>Confianza</span><select name="confidence"><option value="low">Baja</option><option value="medium" selected>Media</option><option value="high">Alta</option></select></label></div><label class="field"><span>Lugar de referencia</span><input name="placeReference" maxlength="120"></label><div class="field-grid"><label class="field"><span>Informante</span><input name="reporterAlias" maxlength="60"></label><label class="field"><span>Teléfono</span><input name="reporterPhone" inputmode="tel" maxlength="40"></label></div><p class="form-note">Un avistamiento es una referencia por revisar; no confirma que sea la mascota.</p><div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--primary" type="submit">Guardar avistamiento</button></div></form>`;
}

function resolutionForm(alertId) {
  return `<form id="resolution-form" data-alert-id="${escapeHtml(alertId)}" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>Fecha y hora del hallazgo <b>*</b></span><input name="foundAt" type="datetime-local" value="${inputDate()}" required></label><label class="field"><span>Lugar del hallazgo</span><input name="place" maxlength="120"></label><label class="field"><span>Nota</span><textarea name="note" rows="3"></textarea></label><div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--primary" type="submit">Resolver caso</button></div></form>`;
}

function openDialog(title, body) {
  document.querySelector('#app-dialog')?.remove();
  const dialog = document.createElement('dialog'); dialog.id = 'app-dialog'; dialog.className = 'dialog';
  dialog.innerHTML = `<div class="dialog__head"><div><p class="eyebrow">PetGuard</p><h2>${escapeHtml(title)}</h2></div><button class="icon-button" type="button" data-action="close-dialog" aria-label="Cerrar">×</button></div><div class="dialog__body">${body}</div>`;
  document.body.append(dialog); dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }); dialog.addEventListener('close', () => dialog.remove()); dialog.showModal(); dialog.querySelector('input, select, textarea, button')?.focus();
}

function values(form) { return Object.fromEntries(new FormData(form).entries()); }
function showFormError(form, error) {
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach((node) => { node.textContent = ''; });
  const summary = form.querySelector('.form-error'); if (summary) { summary.hidden = false; summary.textContent = error.message || 'Revisa los datos ingresados.'; summary.focus(); }
  if (error.field) { const field = form.elements[error.field]; field?.setAttribute('aria-invalid', 'true'); const inline = form.querySelector(`[data-error-for="${CSS.escape(error.field)}"]`); if (inline) inline.textContent = error.message; }
}

async function refresh(message = '') { Object.assign(state, await loadAppData()); render(); if (message) toast(message); }
function toast(message) { const region = document.querySelector('#toast-region'); if (!region) return; const item = document.createElement('div'); item.className = 'toast'; item.textContent = message; region.append(item); setTimeout(() => item.remove(), 3500); }

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  try {
    if (action === 'close-dialog') return button.closest('dialog')?.close();
    if (action === 'new-pet') return openDialog('Registrar mascota', petForm());
    if (action === 'edit-pet') return openDialog('Editar mascota', petForm(state.pets.find((pet) => pet.id === button.dataset.id)));
    if (action === 'new-location') { if (!state.pets.length) return openDialog('Primero registra una mascota', '<p class="muted">Las ubicaciones siempre pertenecen a una mascota.</p><div class="dialog-actions"><button class="button button--primary" data-action="new-pet">Registrar mascota</button></div>'); return openDialog('Añadir ubicación conocida', locationForm(button.dataset.petId)); }
    if (action === 'new-alert') { if (!state.pets.length) return openDialog('Primero registra una mascota', '<p class="muted">Una alerta siempre pertenece a una mascota.</p><div class="dialog-actions"><button class="button button--primary" data-action="new-pet">Registrar mascota</button></div>'); const available = state.pets.some((pet) => !state.alerts.some((item) => item.petId === pet.id && item.status === 'active')); if (!available) return toast('Todas las mascotas ya tienen una alerta activa.'); return openDialog('Activar alerta de extravío', alertForm(button.dataset.petId)); }
    if (action === 'new-sighting') return openDialog('Registrar avistamiento', sightingForm(button.dataset.alertId));
    if (action === 'resolve-alert') return openDialog('Marcar mascota como encontrada', resolutionForm(button.dataset.alertId));
    if (action === 'edit-profile') return openDialog('Editar perfil local', `<form id="profile-form" novalidate><div class="form-error" role="alert" tabindex="-1" hidden></div>${profileFields(state.profile)}<div class="dialog-actions"><button class="button button--secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button--primary" type="submit">Guardar perfil</button></div></form>`);
    if (action === 'delete-pet') { const pet = state.pets.find((item) => item.id === button.dataset.id); if (pet && confirm(`¿Eliminar a ${pet.name} y todos sus registros relacionados?`)) { await deletePet(pet.id); navigate('pets'); await refresh('Mascota eliminada.'); } }
    if (action === 'mark-read') await markNotificationRead(button.dataset.id);
    if (action === 'mark-all-read') await markAllNotificationsRead();
    if (action === 'delete-notification') await deleteNotification(button.dataset.id);
    if (['mark-read', 'mark-all-read', 'delete-notification'].includes(action)) await refresh();
    if (action === 'export') { const payload = await exportAllData(); const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `petguard-respaldo-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); toast('Respaldo exportado correctamente.'); }
    if (action === 'reset' && confirm('¿Borrar definitivamente todos los datos de PetGuard en este navegador? Exporta un respaldo antes si deseas conservarlos.')) { await resetAllData(); await refresh(); navigate('home'); }
  } catch (error) { toast(error.message || 'No se pudo completar la acción.'); }
});

document.addEventListener('submit', async (event) => {
  const form = event.target; event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton?.innerHTML;
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Guardando…'; }
  try {
    if (form.id === 'profile-form') { const data = values(form); data.acceptsLocalStorage = form.elements.acceptsLocalStorage.checked; const profile = validateProfileInput(data); if (!profile.acceptsLocalStorage) throw new ValidationError('Debes aceptar el almacenamiento local para continuar.', 'acceptsLocalStorage'); await saveProfile(profile); form.closest('dialog')?.close(); await refresh('Perfil guardado.'); }
    if (form.id === 'pet-form') { const pet = validatePetInput(values(form)); await savePet({ ...pet, id: form.dataset.id || undefined }); form.closest('dialog')?.close(); await refresh('Ficha guardada.'); }
    if (form.id === 'location-form') { const location = validateLocationInput(values(form)); await saveLocation(location); form.closest('dialog')?.close(); await refresh('Ubicación registrada.'); }
    if (form.id === 'alert-form') { const data = values(form); if (!data.searchMessage.trim()) throw new ValidationError('El mensaje de búsqueda es obligatorio.', 'searchMessage'); const pet = state.pets.find((item) => item.id === data.petId); await createAlert({ ...data, lostAt: new Date(data.lostAt).toISOString(), lastKnownLocationId: latestLocation(data.petId)?.id || null, contactSnapshot: { alias: state.profile.alias, phone: state.profile.phone, email: state.profile.email }, petName: pet?.name || '' }); form.closest('dialog')?.close(); await refresh('Alerta activada.'); navigate('alerts'); }
    if (form.id === 'sighting-form') { const sighting = validateSightingInput(values(form)); await saveSighting({ ...sighting, alertId: form.dataset.alertId }); form.closest('dialog')?.close(); await refresh('Avistamiento registrado.'); }
    if (form.id === 'resolution-form') { const data = values(form); if (!data.foundAt) throw new ValidationError('Indica la fecha del hallazgo.', 'foundAt'); await resolveAlert(form.dataset.alertId, { foundAt: new Date(data.foundAt).toISOString(), place: data.place.trim(), note: data.note.trim() }); form.closest('dialog')?.close(); await refresh('Caso resuelto.'); }
    if (form.dataset.form === 'review-sighting') { await reviewSighting(form.dataset.id, values(form).reviewStatus); await refresh('Revisión actualizada.'); }
  } catch (error) { showFormError(form, error); }
  finally { if (submitButton?.isConnected) { submitButton.disabled = false; submitButton.innerHTML = submitLabel; } }
});

document.addEventListener('change', async (event) => {
  if (event.target.id !== 'import-file') return; const file = event.target.files?.[0]; if (!file) return;
  try { const payload = JSON.parse(await file.text()); validateImportPayload(payload); if (!confirm('La importación reemplazará todos los datos actuales. ¿Deseas continuar?')) return; await importAllData(payload); await refresh('Respaldo importado correctamente.'); navigate('home'); }
  catch (error) { toast(error.message || 'No se pudo importar el respaldo.'); } finally { event.target.value = ''; }
});

window.addEventListener('hashchange', () => { render(); requestAnimationFrame(() => document.querySelector('#main-content')?.focus()); });
async function bootstrap() {
  try {
    Object.assign(state, await loadAppData());
    render();
  } catch (error) {
    app.innerHTML = `<main class="fatal"><h1>No pudimos abrir PetGuard</h1><p>${escapeHtml(error.message)}</p><button class="button button--primary" id="retry-bootstrap" type="button">Reintentar</button></main>`;
    document.querySelector('#retry-bootstrap')?.addEventListener('click', () => location.reload());
  }
}
bootstrap();
