# PetGuard Design System

Dirección visual para una aplicación de cuidado y búsqueda de mascotas: calmada, confiable, accesible y orientada a actuar con rapidez.

## Principios

- Priorizar legibilidad, contraste y comprensión bajo estrés.
- Mantener cinco destinos principales como máximo en navegación móvil.
- Usar controles táctiles de al menos 44 × 44 px y foco visible.
- Mostrar errores junto al campo y un resumen enfocable en formularios.
- Identificar estados con texto y forma, nunca solo con color.
- Respetar `prefers-reduced-motion` y utilizar movimiento sutil.
- Mantener descripciones en una frase breve y evitar repetir el título de la sección.
- Mostrar primero los campos imprescindibles y agrupar los detalles opcionales bajo divulgación progresiva.
- Permitir elegir y previsualizar la foto de una mascota antes de guardar, con una acción visible para quitarla.
- Usar estados vacíos con una acción clara sólo cuando pueda ejecutarse de inmediato.

## Tokens principales

- Verde bosque / primario: `#0F4A3B`
- Primario fuerte: `#0B3D30`
- Peligro: `#b42332`
- Fondo crema cálido: `#FDF3E6`
- Superficie: blanco cálido `#FDFBF8`
- Superficie suave: salvia claro `#E8F0E6`, para recuadros dentro de tarjetas
- Verde salvia: `#D5E4D3`, para botones secundarios, estados y detalles
- Salvia de interacción: `#C3D9C1`, para el hover de botones secundarios
- Durazno: `#F2A66F`, para foco y acentos puntuales
- Texto: `#14211e`
- Texto secundario gris verdoso: `#45534F`
- Borde: `#C8D7C7`

El fondo crema se reserva para el lienzo de página. Las tarjetas usan blanco cálido y los recuadros contenidos en ellas usan salvia claro para mantenerlos distinguibles.

## Forma y tipografía

- Tipografía: pila nativa del sistema para disponibilidad local y rendimiento.
- Radios: 12 px en controles, 16 px en paneles y 24 px en superficies protagonistas.
- Sombras suaves y planas; evitar efectos tridimensionales complejos.

## Composición

- Inicio: resumen accionable, métricas navegables y dos paneles de actividad con igual jerarquía.
- Formularios: encabezado y acciones siempre visibles; contenido desplazable dentro del diálogo.
- Móvil: navegación inferior de cinco destinos, avisos flotantes por encima de ella y entrada siempre desde el inicio de la pantalla.
