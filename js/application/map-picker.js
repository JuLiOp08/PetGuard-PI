// @ts-check

// @ts-ignore The browser imports the self-hosted build; JSDoc types come from the npm package.
import { Map as VectorMap, Marker } from '../../vendor/maplibre/maplibre-gl.mjs';

/** @type {WeakMap<HTMLFormElement, { remove: () => void }>} */
const mapByForm = new WeakMap();
const clutterLayerPattern = /(?:^|[-_])(poi|shop|amenity|transit)(?:$|[-_])/i;
const rasterTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

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
    return { center: [fieldLng, fieldLat], zoom: 16, selected: true };
  }

  const contextLat = Number(form.dataset.mapLat);
  const contextLng = Number(form.dataset.mapLng);
  if (validCoordinates(contextLat, contextLng) && form.dataset.mapLat !== '' && form.dataset.mapLng !== '') {
    return { center: [contextLng, contextLat], zoom: 15, selected: false };
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
  status.textContent = 'Ubicación seleccionada. Puedes tocar otro punto o mover el marcador para ajustarla.';
  form.querySelector('[data-error-for="lat"]')?.replaceChildren();
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

/** @param {HTMLElement} canvas */
function resetMapCanvas(canvas) {
  canvas.replaceChildren();
  canvas.className = 'coordinate-map__canvas';
  canvas.removeAttribute('style');
  canvas.removeAttribute('tabindex');
}

/**
 * @param {HTMLFormElement} form
 * @param {HTMLElement} canvas
 * @param {HTMLElement} status
 * @param {{ center: number[], zoom: number, selected: boolean }} initial
 */
function initializeRasterPicker(form, canvas, status, initial) {
  const leaflet = /** @type {Window & { L?: typeof import('leaflet') }} */ (window).L;
  if (!leaflet) throw new Error('No se pudo cargar el mapa compatible.');

  const map = leaflet.map(canvas, {
    attributionControl: true,
    zoomControl: true
  }).setView([initial.center[1], initial.center[0]], initial.zoom);

  leaflet.tileLayer(rasterTiles, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    detectRetina: true,
    maxZoom: 19
  }).addTo(map);

  /** @type {import('leaflet').Marker | null} */
  let marker = null;
  /** @param {number} lat @param {number} lng @param {boolean} [save] */
  const placeMarker = (lat, lng, save = true) => {
    if (marker) marker.setLatLng([lat, lng]);
    else {
      marker = leaflet.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const point = marker?.getLatLng();
        if (point) writeCoordinates(form, status, point.lat, point.lng);
      });
    }
    if (save) writeCoordinates(form, status, lat, lng);
  };

  if (initial.selected) placeMarker(initial.center[1], initial.center[0], false);
  map.on('click', ({ latlng }) => placeMarker(latlng.lat, latlng.lng));
  requestAnimationFrame(() => map.invalidateSize());
  return map;
}

/**
 * @param {HTMLFormElement} form
 * @param {HTMLElement} canvas
 * @param {HTMLElement} status
 * @param {{ center: number[], zoom: number, selected: boolean }} initial
 */
function initializeVectorPicker(form, canvas, status, initial) {
  const map = /** @type {import('maplibre-gl').Map} */ (/** @type {unknown} */ (new VectorMap({
    container: canvas,
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: /** @type {[number, number]} */ (initial.center),
    zoom: initial.zoom,
    attributionControl: true,
    dragRotate: false,
    pitchWithRotate: false,
    maxPitch: 0
  })));
  map.touchZoomRotate.disableRotation();

  map.once('style.load', () => {
    for (const layer of map.getStyle().layers || []) {
      if (clutterLayerPattern.test(layer.id)) map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });

  /** @type {import('maplibre-gl').Marker | null} */
  let marker = null;
  /** @param {number} lat @param {number} lng @param {boolean} [save] */
  const placeMarker = (lat, lng, save = true) => {
    if (marker) marker.setLngLat([lng, lat]);
    else {
      marker = /** @type {import('maplibre-gl').Marker} */ (/** @type {unknown} */ (new Marker({ color: '#145f52', draggable: true }).setLngLat([lng, lat]).addTo(map)));
      marker.on('dragend', () => {
        const point = marker?.getLngLat();
        if (point) writeCoordinates(form, status, point.lat, point.lng);
      });
    }
    if (save) writeCoordinates(form, status, lat, lng);
  };

  if (initial.selected) placeMarker(initial.center[1], initial.center[0], false);
  map.on('click', ({ lngLat }) => placeMarker(lngLat.lat, lngLat.lng));
  requestAnimationFrame(() => map.resize());
  return map;
}

/** @param {HTMLFormElement | null} form */
export function initializeCoordinatePicker(form) {
  if (!form || mapByForm.has(form)) return;
  const canvas = form.querySelector('[data-coordinate-map-canvas]');
  const status = form.querySelector('[data-coordinate-map-status]');
  if (!(canvas instanceof HTMLElement) || !(status instanceof HTMLElement)) return;

  const initial = initialView(form);
  let map;
  if (supportsWebGL2()) {
    try {
      map = initializeVectorPicker(form, canvas, status, initial);
    } catch {
      resetMapCanvas(canvas);
    }
  }
  map ||= initializeRasterPicker(form, canvas, status, initial);
  mapByForm.set(form, map);
}

/** @param {HTMLFormElement | null} form */
export function destroyCoordinatePicker(form) {
  if (!form) return;
  mapByForm.get(form)?.remove();
  mapByForm.delete(form);
}
