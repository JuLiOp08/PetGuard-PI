# Matriz de requisitos PetGuard MVP

## Estado general

- Alcance funcional actual implementado: perfil, mascotas, ubicaciones conocidas, alertas, avistamientos, avisos y respaldo.
- Fuera del alcance actual: simulador de collar y recorridos simulados.
- Pendiente de verificación externa: pruebas de usabilidad, dispositivos reales y lectores de pantalla.

## Requisitos implementados

| Código | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF-01 | Crear perfil local | Implementado | Perfil local guardado en IndexedDB |
| RF-02 | Editar perfil local | Implementado | Edición desde Configuración |
| RF-03 | Registrar mascota | Implementado | Formulario de alta + almacenamiento local |
| RF-04 | Listar mascotas | Implementado | Vista de lista con estado y acciones |
| RF-05 | Consultar detalle de mascota | Implementado | Pantalla de detalle con última ubicación |
| RF-06 | Editar mascota | Implementado | Formulario de edición de datos y foto sin perder relaciones |
| RF-07 | Eliminar mascota | Implementado | Eliminación con confirmación |
| RF-09 | Registrar coordenada manual | Implementado | Formulario de ubicación conocida con validación de coordenadas |
| RF-11 | Consultar última ubicación | Implementado | La última se presenta como reciente y el historial anterior como antiguo, con consulta en mapa |
| RF-18 | Crear alerta de extravío | Implementado | Activación local con estado lost |
| RF-19 | Consultar alerta activa | Implementado | Detalle de caso con ubicación, historial y avistamientos |
| RF-22 | Marcar mascota como encontrada | Implementado | Resolución transaccional del caso |
| RF-23 | Registrar avistamiento | Implementado | Formulario asociado a caso abierto |
| RF-24 | Listar avistamientos | Implementado | Lista cronológica con consulta individual en mapa |
| RF-25 | Revisar avistamiento | Implementado | Estados de revisión editables |
| RF-26 | Comparar con última ubicación | Implementado | Distancia aproximada con Haversine |
| RF-27 | Generar avisos internos | Implementado | Notificaciones con prioridad y mensajes |
| RF-28 | Consultar centro de avisos | Implementado | Vista dedicada con estado leído/no leído |
| RF-29 | Gestionar avisos | Implementado | Lectura y eliminación |
| RF-30 | Exportar datos | Implementado | Descarga del respaldo JSON |
| RF-31 | Importar datos | Implementado | Validación de estructura y carga |
| RF-33 | Borrar todos los datos | Implementado | Confirmación y limpieza de almacenes |

## Requisitos verificados

| Código | Verificación | Resultado |
|---|---|---|
| validateCoordinates | test unitario | OK |
| computeLocationStatus | test unitario | OK |
| haversineDistanceKm | test unitario | OK |
| canCreateActiveAlert | test unitario | OK |
| validateImportPayload | test unitario | OK |
| Carga de la SPA | navegador local | OK |
| Ciclo completo de caso de búsqueda | test de integración IndexedDB | OK |
| Eliminación en cascada | test de integración IndexedDB | OK |
| Importación de respaldo versión 1 | test de integración IndexedDB | OK |
| Edición de datos y foto de mascota | test E2E | OK |
| Vigencia e historial de ubicaciones | test E2E | OK |
| Consulta de ubicación conocida en mapa | test E2E | OK |
| Rollback de importación fallida | test de integración IndexedDB | OK |

## Requisitos pendientes o parciales

| Código | Requisito | Estado |
|---|---|---|
| RF-08, RF-10, RF-14 a RF-17 | Simulador de collar y recorridos | Fuera del alcance actual |
| RN-09 | Etiquetado de datos simulados | No aplica en el alcance actual |
| RF-20 a RF-21 | Edición y pausa de alertas | Pendiente |
| RF-28 a RF-29 | Filtros avanzados de avisos | Parcial |
| RF-32 | Restaurar datos de demostración | Fuera del alcance actual |
| RNF-03 a RNF-05 | Accesibilidad responsive y prueba real con dispositivos | Parcial |
| Pruebas con usuarios | Pendiente |

## Decisiones documentadas

- Se mantuvo la app local y sin backend, conforme a la especificación del MVP.
- Las ubicaciones manuales se distinguen de cualquier seguimiento GPS en tiempo real.
- Los requisitos posteriores al MVP quedaron separados del flujo principal para no desbordar el alcance.
