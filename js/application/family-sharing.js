export const trustedContacts = Object.freeze([
  { name: 'Aneliz de la Cruz', phone: '983146185', real: true },
  { name: 'Ignacio Vidal', phone: '964672590', real: true },
  { name: 'Mary Jane Godoy', phone: '999714695', real: true },
  { name: 'Carlos Torres', phone: '900000001', real: false },
  { name: 'Lucía Torres', phone: '900000002', real: false },
  { name: 'Mario Vega', phone: '900000003', real: false }
]);

export function preparedSearchMessage(alert) {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${alert.lat},${alert.lng}`)}`;
  return `Se busca a ${alert.petName}. Extravío: ${new Date(alert.lostAt).toLocaleString('es-PE')}. ${alert.searchMessage}. Contacto: ${alert.contactSnapshot?.phone || 'consultar con el propietario'}. Ubicación: ${map}`;
}

export function whatsappLink(contact, alert) {
  if (!contact.real) return '';
  return `https://wa.me/51${contact.phone}?text=${encodeURIComponent(preparedSearchMessage(alert))}`;
}
