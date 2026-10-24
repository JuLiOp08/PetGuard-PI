// @ts-check

const leaflet = /** @type {typeof import('leaflet')} */ (window.L);

/** @type {WeakMap<HTMLFormElement, import('leaflet').Map>} */
const mapByForm = new WeakMap();

/** @param {number} lat @param {number} lng */
function validCoordinates(lat, lng) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

/** @param {HTMLFormElement} form @param {'lat' | 'lng'} name */
function coordinateInput(form, name) {
  const input = form.elements.namedItem(name);
  if (!(input instanceof HTMLInputElement)) throw new Error(`No se encontró el campo ${name}.`);
  return input;
}

/** @param {HTMLFormElement} form */
function initialView(form) {
  const latInput = coordinateInput(form, 'lat');
  const lngInput = coordinateInput(form, 'lng');
  const fieldLat = Number(latInput.value);
  const fieldLng = Number(lngInput.value);
  if (validCoordinates(fieldLat, fieldLng) && latInput.value !== '' && lngInput.value !== '') {
    return { center: [fieldLat, fieldLng], zoom: 16, selected: true };
  }

  const contextLat = Number(form.dataset.mapLat);
  const contextLng = Number(form.dataset.mapLng);
  if (validCoordinates(contextLat, contextLng) && form.dataset.mapLat !== '' && form.dataset.mapLng !== '') {
    return { center: [contextLat, contextLng], zoom: 15, selected: false };
  }

  return { center: [0, 0], zoom: 2, selected: false };
}

/** @param {HTMLFormElement} form @param {HTMLElement} status @param {number} lat @param {number} lng */
function writeCoordinates(form, status, lat, lng) {
  const latInput = coordinateInput(form, 'lat');
  const lngInput = coordinateInput(form, 'lng');
  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);
  latInput.dispatchEvent(new Event('input', { bubbles: true }));
  lngInput.dispatchEvent(new Event('input', { bubbles: true }));
  status.textContent = `Punto seleccionado: ${lat.toFixed(6)}, ${lng.toFixed(6)}.`;
}

/** @param {HTMLFormElement} form @param {HTMLButtonElement} button */
export function toggleCoordinatePicker(form, button) {
  if (!form) return;
  const panel = form.querySelector('[data-coordinate-map]');
  const canvas = form.querySelector('[data-coordinate-map-canvas]');
  const status = form.querySelector('[data-coordinate-map-status]');
  if (!(panel instanceof HTMLElement) || !(canvas instanceof HTMLElement) || !(status instanceof HTMLElement)) return;

  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  button.setAttribute('aria-expanded', String(willOpen));
  button.textContent = willOpen ? 'Ocultar mapa' : 'Seleccionar en el mapa';
  if (!willOpen) return;

  const existing = mapByForm.get(form);
  if (existing) {
    requestAnimationFrame(() => existing.invalidateSize());
    return;
  }

  const initial = initialView(form);
  const map = leaflet.map(canvas).setView(/** @type {import('leaflet').LatLngExpression} */ (initial.center), initial.zoom);
  leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  /** @type {import('leaflet').CircleMarker | null} */
  let marker = null;
  /** @param {number} lat @param {number} lng */
  const placeMarker = (lat, lng) => {
    if (marker) marker.setLatLng([lat, lng]);
    else marker = leaflet.circleMarker([lat, lng], { radius: 8, color: '#ffffff', weight: 3, fillColor: '#145f52', fillOpacity: 1 }).addTo(map);
  };

  if (initial.selected) placeMarker(initial.center[0], initial.center[1]);
  map.on('click', (event) => {
    const { latlng } = /** @type {import('leaflet').LeafletMouseEvent} */ (event);
    placeMarker(latlng.lat, latlng.lng);
    writeCoordinates(form, status, latlng.lat, latlng.lng);
  });
  mapByForm.set(form, map);
  requestAnimationFrame(() => map.invalidateSize());
}
