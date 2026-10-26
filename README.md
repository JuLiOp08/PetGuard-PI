# PetGuard MVP

Aplicación web local para registrar mascotas, conservar ubicaciones conocidas, organizar alertas de extravío y respaldar la información.

## Requisitos

- Navegador moderno con soporte de IndexedDB.
- Python 3.x para servir la web localmente.
- Node.js para ejecutar pruebas automáticas.

## Instalación

```bash
npm install
```

## Inicio exacto

```bash
cd "c:/Users/ALIENWARE/Documents/GitHub/PetGuard-PI"
npm start
```

Luego abrir en el navegador:

```text
http://localhost:4173/
```

## Pruebas automatizadas

```bash
cd "c:/Users/ALIENWARE/Documents/GitHub/PetGuard-PI"
node --test
```

También se pueden ejecutar por separado:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run typecheck
npm run lint
```

## Flujo mínimo de prueba

1. Abrir http://localhost:4173/
2. Crear el perfil local; en un almacenamiento vacío se cargan datos de demostración.
3. Revisar las fichas de ejemplo o registrar una mascota propia y, si se desea, añadir una foto e información complementaria.
4. Añadir una ubicación conocida desde Mascotas o Ubicaciones.
5. Activar una alerta de extravío.
6. Registrar y revisar un avistamiento.
7. Marcar la mascota como encontrada.
8. Exportar e importar un respaldo desde Configuración.

## Alcance actual del MVP

- Perfil local persistente.
- Datos de demostración al completar por primera vez un perfil local vacío.
- Registro y eliminación de mascotas.
- Registro manual de ubicaciones conocidas con validación de coordenadas, selección y consulta en mapa.
- Historial de ubicaciones por mascota, con la última como reciente y las anteriores como antiguas.
- Fichas editables con foto, datos principales e información complementaria de mascotas.
- Casos de búsqueda con alerta, historial y resolución.
- Avistamientos con revisión, distancia de referencia y consulta individual en mapa.
- Centro de avisos con lectura y eliminación.
- Respaldo JSON completo y borrado seguro de datos locales.

## Limitaciones reales

- No incluye simulador de collar ni recorridos; ese módulo quedó fuera del alcance actual.
- No incluye backend, PWA, GPS real ni difusión a terceros.
- Los mapas usan OpenFreeMap y requieren conexión; permiten desplazamiento y controles de acercamiento y alejamiento.
- Las pruebas con usuarios reales quedan pendientes.

## Matriz de requisitos

Consulte [MATRIZ_REQUISITOS.md](MATRIZ_REQUISITOS.md).

## Backlog posterior al MVP

Consulte [BACKLOG_POSTERIOR_MVP.md](BACKLOG_POSTERIOR_MVP.md).

## Nota de alcance

La aplicación funciona en el navegador y usa IndexedDB localmente. Las ubicaciones se seleccionan manualmente en el mapa y nunca se presentan como seguimiento GPS en tiempo real.
