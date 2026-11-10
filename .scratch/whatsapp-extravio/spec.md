# Compartir casos de búsqueda por WhatsApp

## Problem Statement

Al activar una alerta de extravío, el propietario no puede preparar avisos para su círculo de confianza. Debe copiar los datos del caso manualmente y corre el riesgo de omitir la ubicación o de creer que un chat abierto equivale a un mensaje enviado.

## Solution

Al final del formulario de alerta, mostrar a los familiares de confianza relacionados con la mascota y una decisión inicial «No notificar». Si el propietario elige notificar, puede seleccionar destinatarios individuales y revisar el texto de búsqueda. Tras activar la alerta, PetGuard ofrece un botón por destinatario para abrir WhatsApp con el mensaje preparado. La alerta permanece activa aunque se cancele o falle cualquier apertura. El producto no afirma que el mensaje se haya enviado.

## User Stories

1. Como propietario, quiero ver los familiares de confianza al reportar un extravío para saber a quién puedo avisar.
2. Como propietario, quiero que «No notificar» sea la opción inicial para evitar abrir chats por accidente.
3. Como propietario, quiero seleccionar destinatarios individuales para compartir solo con quienes elija.
4. Como propietario, quiero activar la alerta sin notificar para registrar el caso igualmente.
5. Como propietario, quiero revisar el texto antes de abrir WhatsApp para saber qué información compartiré.
6. Como propietario, quiero que el texto incluya mascota, fecha, referencia, teléfono y ubicación para orientar la búsqueda.
7. Como familiar, quiero abrir directamente el punto de extravío desde un enlace de mapa para ubicarlo.
8. Como propietario, quiero abrir un chat por destinatario para enviar el mensaje desde mi sesión de WhatsApp.
9. Como propietario, quiero distinguir los chats pendientes de los abiertos para continuar el proceso sin confundir apertura con entrega.
10. Como propietario, quiero conservar el caso activo aunque WhatsApp no abra o yo cancele el envío.
11. Como propietario, quiero volver al caso y retomar la preparación de mensajes si interrumpo el flujo.
12. Como usuario de la demostración, quiero reconocer a Aneliz de la Cruz, Ignacio Vidal y Mary Jane Godoy con sus números indicados, y ver números ficticios en los demás integrantes.
13. Como propietario, quiero que el número de origen se explique como una condición de la sesión de WhatsApp, para no asumir que PetGuard controla la cuenta remitente.

## Implementation Decisions

- El círculo de confianza compartido se muestra para todas las mascotas del prototipo. El propietario no es destinatario.
- Contactos facilitados: Aneliz de la Cruz `983146185`, Ignacio Vidal `964672590`, Mary Jane Godoy `999714695`. Carlos Torres, Lucía Torres y Mario Vega tendrán números ficticios claramente identificados como datos de demostración.
- El número `922 165667` se muestra como cuenta de origen esperada; PetGuard no puede elegir ni verificar la cuenta activa de WhatsApp. La interfaz pide comprobarla antes de enviar.
- Una alerta se guarda antes de ofrecer los enlaces de WhatsApp. La elección de destinatarios y el estado local de cada apertura se asocian al caso para poder retomarlo, sin registrar estados de entrega.
- Los enlaces de WhatsApp se generan individualmente, con número peruano normalizado y texto codificado. Un botón abre cada chat por acción explícita del propietario.
- El mensaje contiene nombre de la mascota, fecha y hora del extravío, referencia, teléfono de contacto y enlace de mapa generado con las coordenadas seleccionadas. Si falta teléfono, se explica y no se inventa uno.
- El «enlace al reporte» público queda fuera de esta versión: el caso vive solo en IndexedDB del dispositivo local. El mensaje contiene el resumen suficiente y un enlace de mapa que sí pueden abrir los destinatarios.
- Los números ficticios no deben apuntar inadvertidamente a números reales: se identificarán como demostrativos y sus botones de envío quedarán deshabilitados hasta sustituirlos por contactos verificables.
- El respaldo exporta e importa las preferencias y aperturas locales relacionadas con cada alerta sin romper respaldos anteriores.

## Testing Decisions

- Probar comportamiento observable, evitando detalles del DOM o funciones internas cuando haya una ruta pública más alta.
- En prueba de navegador, activar una alerta con «No notificar» y otra con destinatarios elegidos; verificar creación del caso, mensaje visible, enlaces correctos y continuidad tras recargar.
- En pruebas de dominio y almacenamiento, verificar normalización y selección de contactos, persistencia, importación de respaldos anteriores y que un error al abrir WhatsApp no revierta la alerta.
- Seguir los ejemplos existentes de pruebas de dominio, almacenamiento con IndexedDB simulado y Playwright para el flujo completo.

## Out of Scope

- Envío automático, WhatsApp Business API, confirmaciones de envío o entrega.
- Publicar un reporte accesible desde otros dispositivos, backend o sincronización.
- Gestión general de contactos reales o relación de familiares distinta por mascota.

## Further Notes

- El prototipo ofrece vistas de propietario y familiar, pero no cuentas reales ni permisos remotos. La sesión de WhatsApp del navegador debe corresponder a `922 165667` para enviar desde ese número.
- La especificación está en un archivo local porque no hay un rastreador de incidencias configurado en el repositorio.
