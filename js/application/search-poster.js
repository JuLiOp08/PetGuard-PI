const xml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

function lines(value, max = 56) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  const result = [];
  let current = '';
  for (const word of words) {
    if (current && `${current} ${word}`.length > max) {
      result.push(current);
      current = word;
    } else current = current ? `${current} ${word}` : word;
  }
  if (current) result.push(current);
  return result;
}

function textLines(value, x, y, max = 56) {
  return lines(value, max).map((line, index) => `<text x="${x}" y="${y + index * 28}">${xml(line)}</text>`).join('');
}

export function createSearchPosterSvg({ pet, alert, location, contact = {} }) {
  const description = alert.searchMessage || 'Si la ves, comparte cualquier dato que ayude a encontrarla.';
  const descriptionLines = lines(description);
  const height = Math.max(1056, 960 + descriptionLines.length * 28);
  const place = location?.placeReference || (Number.isFinite(Number(alert.lat)) && Number.isFinite(Number(alert.lng))
    ? `${Number(alert.lat).toFixed(5)}, ${Number(alert.lng).toFixed(5)}` : 'Sin punto registrado');
  const date = alert.lostAt && !Number.isNaN(new Date(alert.lostAt).getTime())
    ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(alert.lostAt)) : 'Fecha sin registrar';
  const photo = /^data:image\/(?:jpeg|png|webp);base64,[a-z\d+/=]+$/i.test(pet.photo || '') ? pet.photo : '';
  const contactLines = [contact.alias, contact.phone, contact.email].filter(Boolean);
  const contactBlock = contactLines.length
    ? `<text x="72" y="${height - 157}" class="section">CONTACTO ELEGIDO PARA COMPARTIR</text>${contactLines.map((line, index) => `<text x="72" y="${height - 123 + index * 26}" class="body">${xml(line)}</text>`).join('')}`
    : `<text x="72" y="${height - 123}" class="body">Consulta el caso directamente con la persona que compartió esta ficha.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="816" height="${height}" viewBox="0 0 816 ${height}" role="img" aria-label="Ficha de búsqueda de ${xml(pet.name)}">
<style>.title{font:700 48px system-ui,sans-serif;fill:#14211e}.section{font:700 15px system-ui,sans-serif;letter-spacing:2px;fill:#145f52}.body{font:20px system-ui,sans-serif;fill:#14211e}.small{font:16px system-ui,sans-serif;fill:#60706b}.name{font:700 38px system-ui,sans-serif;fill:#14211e}</style>
<rect width="816" height="${height}" fill="#fff"/><rect width="816" height="18" fill="#b42332"/>
<text x="72" y="86" class="section">PETGUARD · CASO DE BÚSQUEDA</text><text x="72" y="152" class="title">SE BUSCA MASCOTA</text>
<rect x="72" y="190" width="250" height="250" rx="16" fill="#edf3f0"/>
${photo ? `<clipPath id="photo"><rect x="72" y="190" width="250" height="250" rx="16"/></clipPath><image href="${photo}" x="72" y="190" width="250" height="250" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>` : '<text x="125" y="322" class="small">Sin fotografía</text>'}
<text x="355" y="252" class="name">${xml(pet.name)}</text><text x="355" y="295" class="body">${xml(pet.species === 'cat' ? 'Gato' : 'Perro')} · ${xml(pet.color || 'Color sin registrar')}</text>
<text x="355" y="330" class="small">${xml(pet.size === 'small' ? 'Tamaño pequeño' : pet.size === 'large' ? 'Tamaño grande' : 'Tamaño mediano')}</text>
<line x1="72" y1="482" x2="744" y2="482" stroke="#d9e2de"/>
<text x="72" y="528" class="section">ÚLTIMA REFERENCIA DE PÉRDIDA</text><text x="72" y="566" class="body">${xml(place)}</text>
<text x="72" y="599" class="small">${xml(date)}</text><text x="72" y="630" class="small">Ubicación conocida registrada manualmente. Puede haber cambiado.</text>
<text x="72" y="686" class="section">INFORMACIÓN PARA LA BÚSQUEDA</text>
<g class="body">${textLines(description, 72, 722)}</g>
<line x1="72" y1="${height - 192}" x2="744" y2="${height - 192}" stroke="#d9e2de"/>
${contactBlock}<text x="72" y="${height - 42}" class="small">Ficha creada en PetGuard · Información aportada por el propietario</text>
</svg>`;
}
