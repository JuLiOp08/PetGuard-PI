# PetGuard

> **Alcance vigente de implementación:** por decisión de producto, el simulador de collar y los recorridos simulados quedan temporalmente fuera del MVP actual. Las ubicaciones se registran manualmente como ubicaciones conocidas y nunca se presentan como seguimiento GPS en tiempo real. El resto del documento continúa como referencia funcional y técnica.

## Especificación técnica para aplicación web responsive

- **Versión del documento:** 1.0
- **Estado:** MVP funcional implementado; evolución posterior documentada
- **Tecnologías iniciales:** HTML5, CSS3 y JavaScript moderno
- **Persistencia inicial:** IndexedDB en el navegador
- **Plataforma inicial:** Aplicación web responsive, mobile-first
- **Evolución prevista:** Progressive Web App (PWA), backend, collar GPS e integraciones externas

---

## 1. Propósito del documento

Este documento define de manera práctica y detallada cómo desarrollar PetGuard como una aplicación web responsive con apariencia y comportamiento similares a los de una aplicación móvil. La primera versión funcionará completamente en el navegador, sin backend y sin depender de un dispositivo GPS real.

La especificación sirve como guía para:

- diseñar la interfaz;
- organizar el código fuente;
- implementar los módulos;
- definir la estructura de datos local;
- construir el simulador de ubicaciones y recorridos;
- validar los flujos de extravío y búsqueda;
- ejecutar pruebas funcionales, técnicas y de usabilidad;
- preparar una evolución posterior hacia PWA, backend y collar GPS.

El documento diferencia explícitamente entre:

1. las funciones que deben implementarse en el prototipo inicial;
2. las funciones que se simularán;
3. las integraciones que quedan preparadas para fases futuras.

---

## 2. Descripción general del sistema

PetGuard es un sistema de apoyo para la identificación, localización y búsqueda de perros y gatos ante extravíos relacionados con emergencias o eventos estresantes, como sismos, incendios, pirotecnia y ruidos intensos.

En su visión completa, PetGuard integra un collar electrónico y una aplicación. Sin embargo, la versión descrita en este documento se concentra en una aplicación web funcional que representa y valida digitalmente el proceso de búsqueda. La aplicación permitirá registrar mascotas, ingresar ubicaciones manualmente, simular recorridos, consultar la última ubicación disponible, reportar una mascota como extraviada, registrar avistamientos y recibir avisos dentro de la propia interfaz.

La aplicación inicial no afirmará que una ubicación simulada es una lectura GPS real. Cada dato de localización mostrará su origen, fecha, hora y estado de actualización.

---

## 3. Problema que atiende PetGuard

Durante una emergencia o un episodio de estrés, una mascota puede esconderse, huir, desorientarse o rechazar ser sujetada. Esto dificulta que su propietario conozca su ubicación y actúe con rapidez. La incertidumbre aumenta cuando la mascota queda fuera del alcance visual, permanece sola en casa o escapa a una zona desconocida.

PetGuard no pretende evitar las reacciones naturales de miedo ni garantizar la recuperación de una mascota. Su propósito es organizar información útil y ofrecer herramientas de apoyo para facilitar:

- la identificación de la mascota;
- la consulta de su última ubicación conocida;
- el inicio de una búsqueda estructurada;
- el registro de posibles avistamientos;
- el seguimiento del caso hasta su cierre.

---

## 4. Público objetivo

El público objetivo inicial está compuesto por propietarios de perros y gatos, principalmente residentes en Lima Metropolitana, que:

- participan activamente en el cuidado de sus mascotas;
- consideran importante prepararse ante emergencias;
- han tenido dificultades para encontrar o sujetar a su mascota durante episodios de miedo;
- dejan a su mascota sola en casa durante determinados periodos;
- necesitan una herramienta simple y comprensible para organizar una búsqueda.

Para las pruebas del prototipo se priorizará a usuarios con experiencia real en episodios de escondimiento, huida o desorientación de mascotas.

---

## 5. Objetivos

### 5.1 Objetivo general

Desarrollar un prototipo funcional de aplicación web responsive que permita representar y evaluar las funciones principales de identificación, localización y búsqueda de mascotas de PetGuard utilizando HTML, CSS, JavaScript e IndexedDB.

### 5.2 Objetivos específicos

1. Permitir que el usuario cree y administre perfiles de mascotas.
2. Registrar ubicaciones mediante un simulador manual de coordenadas.
3. Crear y reproducir recorridos simulados para representar el desplazamiento de una mascota.
4. Mostrar con claridad la última ubicación disponible, su fecha, hora y origen.
5. Permitir la activación y gestión de una alerta de extravío.
6. Registrar avistamientos relacionados con una alerta activa.
7. Mostrar avisos internos asociados a cambios y eventos importantes.
8. Almacenar la información localmente mediante IndexedDB.
9. Validar la facilidad de uso mediante tareas y simulaciones de extravío.
10. Preparar la arquitectura para incorporar posteriormente una PWA, un backend, mapas, notificaciones push y un collar GPS.

---

## 6. Decisiones técnicas confirmadas

| Tema | Decisión para la primera versión |
|---|---|
| Plataforma | Aplicación web responsive |
| Enfoque visual | Mobile-first, estilo aplicación móvil |
| Tecnologías | HTML5, CSS3 y JavaScript sin framework obligatorio |
| Backend | No se utilizará inicialmente |
| Persistencia | IndexedDB en el navegador |
| Autenticación | No habrá autenticación real en el MVP local |
| Ubicación | Coordenadas y recorridos ingresados o generados manualmente |
| GPS real | Fuera del alcance inicial |
| Mapas externos | Opcionales para una fase posterior |
| Notificaciones | Avisos internos dentro de la aplicación |
| PWA | Evolución posterior, no requisito de la primera entrega |
| Operación sin Internet | Las funciones locales principales deben seguir funcionando |
| Usuarios comunitarios | Se simularán; no habrá sincronización entre dispositivos |

---

## 7. Alcance del producto

### 7.1 Alcance de la primera versión funcional

La primera versión incluirá:

- perfil local del propietario;
- registro, edición, consulta y eliminación controlada de mascotas;
- fotografía de la mascota guardada localmente;
- información física y datos útiles para identificarla;
- estado de la mascota: segura, extraviada o encontrada;
- simulador de coordenadas;
- historial de ubicaciones;
- creación de recorridos con varios puntos;
- reproducción visual de recorridos;
- indicador de última actualización;
- alerta de extravío;
- registro y consulta de avistamientos;
- avisos internos;
- búsqueda y filtros básicos;
- exportación e importación de respaldo en JSON;
- datos de demostración opcionales;
- diseño responsive para teléfonos, tabletas y computadoras;
- validaciones, mensajes de error y estados vacíos;
- pruebas funcionales y de usabilidad.

### 7.2 Funciones simuladas

Las siguientes funciones existirán en la interfaz, pero trabajarán con datos generados manualmente:

- conexión del collar;
- recepción de coordenadas GPS;
- nivel de batería del collar;
- recorrido de la mascota;
- avistamientos de otros usuarios;
- cercanía entre el último punto y un avistamiento;
- avisos asociados a eventos de ubicación;
- difusión de una alerta a una comunidad cercana.

La interfaz deberá etiquetar estos datos como **simulados**.

### 7.3 Fuera del alcance inicial

- cuentas reales y recuperación de contraseña;
- sincronización en la nube;
- comunicación entre usuarios reales;
- seguimiento GPS en tiempo real;
- conexión Bluetooth, Wi-Fi, LoRa o celular con un collar;
- notificaciones push del sistema operativo;
- envío de SMS, correo o WhatsApp;
- pagos y suscripciones;
- panel administrativo remoto;
- moderación comunitaria;
- publicación pública real de alertas;
- garantía de recuperación de una mascota.

---

## 8. Roles del sistema

### 8.1 Propietario

Es el usuario principal del MVP. Puede:

- configurar su perfil local;
- registrar mascotas;
- consultar ubicaciones;
- crear recorridos simulados;
- reportar un extravío;
- revisar y registrar avistamientos;
- cerrar una alerta al recuperar la mascota;
- consultar avisos internos;
- exportar o importar sus datos.

### 8.2 Colaborador simulado

Representa a una persona que habría visto a la mascota. En la primera versión no inicia sesión ni utiliza otro dispositivo. Sus datos se ingresan desde el mismo simulador para validar el flujo de avistamientos.

### 8.3 Sistema

Es responsable de:

- validar los datos;
- guardar y recuperar información de IndexedDB;
- calcular estados derivados;
- generar avisos internos;
- mantener la consistencia entre mascota, alerta, ubicación y avistamientos;
- mostrar errores recuperables sin perder información del formulario.

---

## 9. Supuestos y restricciones

### 9.1 Supuestos

- El navegador utilizado admite JavaScript moderno e IndexedDB.
- El usuario utiliza un único navegador y dispositivo durante la validación inicial.
- Las coordenadas se expresan en grados decimales.
- El usuario comprende que el prototipo no recibe datos de un collar real.
- Las fotografías seleccionadas se comprimen antes de almacenarse.

### 9.2 Restricciones

- Los datos quedan asociados al navegador y perfil local donde se crearon.
- Borrar los datos del navegador puede eliminar toda la información de PetGuard.
- El modo privado puede limitar o descartar el almacenamiento.
- Sin backend no existe sincronización, recuperación remota ni colaboración real.
- Una pestaña abierta en otro dispositivo no tendrá acceso a los mismos datos.
- La capacidad disponible depende del navegador y del dispositivo.
- Las alertas y avistamientos no se difunden realmente fuera de la aplicación local.

---

## 10. Requerimientos funcionales

### 10.1 Perfil local del propietario

#### RF-01. Crear perfil local

El sistema deberá permitir crear un perfil con:

- nombre o alias;
- teléfono de contacto opcional;
- correo opcional;
- distrito opcional;
- contacto alternativo opcional;
- aceptación del aviso sobre almacenamiento local.

**Criterios de aceptación:**

- El nombre o alias es obligatorio.
- El usuario puede continuar sin teléfono ni correo.
- La aplicación informa que los datos se almacenan solo en el dispositivo.
- Al guardar, el perfil permanece disponible después de recargar la página.

#### RF-02. Editar perfil local

El usuario deberá poder modificar sus datos. Los cambios deberán reflejarse en las alertas creadas posteriormente. Las alertas existentes conservarán una copia de los datos de contacto utilizados al crearlas, salvo que el usuario decida actualizarlas.

### 10.2 Gestión de mascotas

#### RF-03. Registrar mascota

El sistema deberá permitir registrar:

- nombre;
- especie: perro o gato;
- fotografía;
- sexo opcional;
- raza o descripción de raza;
- color principal y colores secundarios;
- tamaño;
- edad o fecha de nacimiento aproximada;
- peso opcional;
- señas particulares;
- comportamiento ante personas;
- condición médica relevante opcional;
- indicaciones de aproximación segura;
- identificador del collar simulado;
- código de ficha local.

**Criterios de aceptación:**

- Nombre, especie, color, tamaño y descripción identificativa son obligatorios.
- La fotografía es recomendada; si falta, se muestra un avatar por especie.
- El sistema genera un identificador único.
- Una mascota nueva inicia con estado `segura`.
- El registro queda disponible después de cerrar y volver a abrir la aplicación.

#### RF-04. Listar mascotas

El sistema deberá mostrar las mascotas registradas en tarjetas con:

- fotografía o avatar;
- nombre;
- especie;
- estado;
- última ubicación disponible;
- fecha de actualización;
- acceso rápido al detalle.

#### RF-05. Consultar detalle de mascota

El detalle deberá reunir:

- datos de identificación;
- estado actual;
- estado del collar simulado;
- última ubicación;
- historial reciente;
- recorridos guardados;
- alerta activa, si existe;
- acciones principales.

#### RF-06. Editar mascota

El usuario deberá poder modificar los datos de la mascota. La edición no deberá eliminar ubicaciones, recorridos, alertas ni avistamientos relacionados.

#### RF-07. Eliminar mascota

El sistema permitirá eliminar una mascota únicamente después de mostrar:

- una advertencia clara;
- el número de ubicaciones, recorridos, alertas y avistamientos asociados;
- una confirmación explícita.

La eliminación deberá realizarse en una sola transacción de IndexedDB para evitar registros huérfanos.

### 10.3 Simulador de collar y ubicación

#### RF-08. Configurar estado del collar simulado

El usuario podrá indicar:

- conectado o desconectado;
- nivel de batería entre 0 y 100 %;
- calidad de señal: alta, media, baja o sin señal;
- fecha y hora de la última comunicación.

La aplicación mostrará siempre la etiqueta `Simulación` junto a estos valores.

#### RF-09. Registrar coordenada manual

El sistema deberá permitir ingresar:

- latitud;
- longitud;
- fecha y hora;
- precisión simulada en metros;
- origen del dato;
- nota opcional.

**Validaciones:**

- Latitud entre -90 y 90.
- Longitud entre -180 y 180.
- Precisión mayor que cero cuando se ingrese.
- Fecha no inválida.
- La mascota debe existir.

#### RF-10. Generar coordenada de prueba

El usuario podrá generar una coordenada cercana al último punto mediante una variación controlada. Si no existe un punto previo, se utilizará una ubicación inicial de demostración claramente identificada.

#### RF-11. Consultar última ubicación

La aplicación deberá mostrar:

- coordenadas;
- fecha y hora;
- antigüedad del dato;
- precisión simulada;
- origen: manual, recorrido simulado, avistamiento o integración futura;
- estado: reciente, antigua o sin datos;
- advertencia de que no es ubicación en tiempo real.

La antigüedad podrá clasificarse, de manera configurable, así:

- reciente: menos de 15 minutos;
- intermedia: entre 15 y 60 minutos;
- antigua: más de 60 minutos.

#### RF-12. Consultar historial de ubicaciones

El usuario podrá ver los puntos ordenados del más reciente al más antiguo y filtrar por:

- mascota;
- fecha;
- origen;
- recorrido;
- alerta asociada.

#### RF-13. Eliminar una ubicación simulada

Se podrá eliminar un punto después de una confirmación. Si el punto eliminado era la última ubicación, el sistema recalculará cuál es el punto válido más reciente.

### 10.4 Recorridos simulados

#### RF-14. Crear recorrido

El usuario podrá crear un recorrido con:

- nombre;
- mascota;
- descripción opcional;
- fecha de inicio simulada;
- intervalo entre puntos;
- lista ordenada de dos o más coordenadas.

#### RF-15. Editar recorrido

Se podrán agregar, mover, editar o eliminar puntos antes de ejecutar el recorrido. El orden deberá quedar explícito.

#### RF-16. Reproducir recorrido

La aplicación deberá recorrer los puntos en orden, actualizando visualmente:

- punto actual;
- progreso;
- hora simulada;
- última ubicación;
- estado del recorrido.

La reproducción incluirá controles para iniciar, pausar, continuar, avanzar un punto y detener.

#### RF-17. Finalizar recorrido

Al finalizar, el sistema deberá:

- marcar el recorrido como completado;
- conservar los puntos generados;
- dejar el último punto como última ubicación disponible;
- crear un aviso interno de finalización.

### 10.5 Alertas de extravío

#### RF-18. Crear alerta de extravío

El usuario podrá reportar una mascota como extraviada. La alerta deberá incluir:

- mascota;
- fecha y hora del extravío;
- última ubicación disponible;
- lugar o referencia textual;
- circunstancias;
- mensaje de búsqueda;
- datos de contacto que se desean mostrar;
- nivel de visibilidad simulado;
- estado de la alerta.

**Criterios de aceptación:**

- Solo puede existir una alerta activa por mascota.
- El sistema advierte si no existe una ubicación previa.
- Al confirmar, el estado de la mascota cambia a `extraviada`.
- Se crea un aviso interno.
- La alerta indica que no se difundió realmente a terceros.

#### RF-19. Consultar alerta activa

La pantalla deberá mostrar:

- fotografía y descripción de la mascota;
- tiempo transcurrido desde el reporte;
- última ubicación;
- número de avistamientos;
- estado del caso;
- acciones disponibles.

#### RF-20. Editar alerta activa

Se podrán actualizar la descripción, referencia, mensaje y datos de contacto. La identidad de la mascota y el historial de eventos no deberán perderse.

#### RF-21. Cambiar estado de la alerta

Estados permitidos:

- `borrador`;
- `activa`;
- `pausada`;
- `resuelta`;
- `cancelada`.

No se podrá registrar un nuevo avistamiento en una alerta resuelta o cancelada, salvo que primero se reactive.

#### RF-22. Marcar mascota como encontrada

Al cerrar exitosamente el caso, el usuario deberá indicar:

- fecha y hora del hallazgo;
- lugar del hallazgo;
- si un avistamiento contribuyó;
- nota opcional.

El sistema cambiará la mascota a `segura`, la alerta a `resuelta` y generará un aviso interno.

### 10.6 Avistamientos

#### RF-23. Registrar avistamiento

Para una alerta activa se podrá registrar:

- fecha y hora;
- coordenadas;
- referencia del lugar;
- descripción;
- nivel de confianza: bajo, medio o alto;
- nombre o alias del informante simulado;
- teléfono opcional;
- fotografía opcional;
- estado de revisión.

#### RF-24. Listar avistamientos

Los avistamientos se mostrarán por fecha y podrán filtrarse por confianza y estado.

#### RF-25. Revisar avistamiento

Estados permitidos:

- `nuevo`;
- `en_revision`;
- `relevante`;
- `descartado`.

El propietario podrá agregar una nota de revisión. Un avistamiento relevante deberá destacarse en la vista del caso.

#### RF-26. Comparar con última ubicación

Cuando existan coordenadas válidas, el sistema calculará una distancia aproximada entre el avistamiento y la última ubicación conocida. El resultado se presentará como referencia y no como confirmación de que se trata de la mascota.

Para el cálculo puede utilizarse la fórmula de Haversine.

### 10.7 Avisos internos

#### RF-27. Generar avisos internos

El sistema generará avisos cuando ocurra alguno de estos eventos:

- mascota registrada;
- ubicación añadida;
- ubicación antigua;
- batería simulada baja;
- collar simulado desconectado;
- recorrido iniciado, pausado o finalizado;
- alerta activada;
- avistamiento registrado;
- avistamiento marcado como relevante;
- mascota encontrada;
- importación o exportación completada;
- error de almacenamiento.

#### RF-28. Consultar centro de avisos

Cada aviso contendrá:

- tipo;
- título;
- mensaje;
- fecha y hora;
- prioridad;
- estado leído/no leído;
- referencia a la entidad relacionada;
- acción opcional.

#### RF-29. Gestionar avisos

El usuario podrá:

- marcar un aviso como leído;
- marcar todos como leídos;
- filtrar por prioridad o estado;
- eliminar avisos individuales;
- configurar qué avisos no críticos desea ver.

### 10.8 Respaldo y configuración

#### RF-30. Exportar datos

La aplicación deberá generar un archivo JSON con:

- versión del esquema;
- fecha de exportación;
- perfil;
- mascotas;
- ubicaciones;
- recorridos;
- alertas;
- avistamientos;
- avisos;
- preferencias.

#### RF-31. Importar datos

Antes de importar, el sistema deberá:

- validar la estructura;
- comprobar la versión;
- contar los registros;
- mostrar si reemplazará o combinará información;
- solicitar confirmación;
- ejecutar la operación en una transacción controlada.

#### RF-32. Restaurar datos de demostración

El usuario podrá cargar un conjunto de prueba con una mascota, ubicaciones, un recorrido y una alerta simulada. Esta función deberá indicar que puede reemplazar datos existentes y requerirá confirmación.

#### RF-33. Borrar todos los datos

La aplicación permitirá borrar la base local solo después de una advertencia, confirmación explícita y recomendación de exportar un respaldo.

---

## 11. Reglas de negocio

| Código | Regla |
|---|---|
| RN-01 | Una mascota solo puede tener una alerta activa a la vez. |
| RN-02 | Una ubicación siempre pertenece a una mascota existente. |
| RN-03 | Un avistamiento siempre pertenece a una alerta existente. |
| RN-04 | Una alerta resuelta o cancelada no admite nuevos avistamientos. |
| RN-05 | El estado `extraviada` debe corresponder a una alerta activa o pausada. |
| RN-06 | Cerrar una alerta como resuelta cambia la mascota a `segura`. |
| RN-07 | La última ubicación es el punto válido con la fecha más reciente, no necesariamente el último insertado. |
| RN-08 | Todo dato de ubicación debe mostrar su origen. |
| RN-09 | Los datos simulados deben estar identificados visualmente. |
| RN-10 | Ninguna alerta local deberá presentarse como difundida realmente. |
| RN-11 | Las coordenadas fuera de rango serán rechazadas. |
| RN-12 | Los tiempos se guardarán en formato ISO 8601. |
| RN-13 | Las fechas se mostrarán en la zona horaria local del dispositivo. |
| RN-14 | El teléfono y correo son opcionales, pero debe existir al menos un medio de contacto si se prepara una ficha pública futura. |
| RN-15 | Una fotografía nunca sustituye la descripción física textual. |
| RN-16 | El nivel de confianza de un avistamiento no confirma la identidad de la mascota. |
| RN-17 | Los registros históricos no se modificarán silenciosamente. |
| RN-18 | Los cambios críticos deberán generar un registro de evento o aviso. |

---

## 12. Requerimientos no funcionales

### RNF-01. Usabilidad

- Las acciones principales deberán comprenderse sin capacitación.
- El flujo para activar una alerta deberá completarse en un máximo recomendado de tres pantallas.
- Los formularios deberán incluir etiquetas visibles, ayuda contextual y errores específicos.
- Las acciones destructivas deberán diferenciarse de las acciones normales.

### RNF-02. Diseño responsive

- El diseño se iniciará para pantallas desde 320 px de ancho.
- No deberá existir desplazamiento horizontal en el contenido principal.
- La navegación se adaptará a teléfono, tableta y escritorio.
- En móvil se utilizará una barra inferior; en escritorio podrá convertirse en barra lateral.

### RNF-03. Accesibilidad

- Se utilizará HTML semántico.
- Todos los controles deberán poder operarse con teclado.
- El foco visible no deberá eliminarse.
- Las imágenes tendrán texto alternativo.
- El contraste deberá cumplir WCAG 2.1 AA cuando sea posible.
- Los estados no dependerán únicamente del color.
- Los mensajes dinámicos importantes usarán regiones `aria-live`.

### RNF-04. Rendimiento

- La interfaz inicial deberá mostrarse en menos de 3 segundos en un dispositivo medio, sin contar descargas externas futuras.
- Las operaciones normales de lectura y escritura local deberán responder en menos de 500 ms para el volumen esperado del prototipo.
- Las listas extensas se paginarán o renderizarán por bloques.
- Las imágenes se redimensionarán y comprimirán antes de guardarse.

### RNF-05. Compatibilidad

Se dará soporte a las dos versiones estables más recientes de:

- Chrome;
- Edge;
- Firefox;
- Safari móvil y de escritorio, sujeto a las capacidades de IndexedDB.

### RNF-06. Mantenibilidad

- El código JavaScript se organizará en módulos ES.
- La interfaz, lógica de aplicación y persistencia estarán separadas.
- Los nombres de funciones y variables serán descriptivos.
- No se accederá a IndexedDB directamente desde los componentes visuales.
- Las constantes y enumeraciones se centralizarán.

### RNF-07. Integridad de datos

- Las operaciones relacionadas deberán usar transacciones.
- Toda importación deberá validarse antes de escribir.
- Las migraciones del esquema deberán ser versionadas.
- Los errores no deberán dejar registros parcialmente creados.

### RNF-08. Privacidad

- Los datos permanecerán en el navegador durante el MVP.
- La aplicación deberá explicar dónde se guardan y cómo se eliminan.
- Se recopilará solo la información necesaria.
- Los datos sensibles opcionales no se mostrarán en vistas públicas futuras por defecto.

### RNF-09. Seguridad

- Todo texto proporcionado por el usuario se renderizará con `textContent` o técnicas equivalentes seguras.
- No se insertará HTML sin sanitización.
- La importación rechazará estructuras inesperadas.
- Las fotografías se validarán por tipo y tamaño.
- No se guardarán contraseñas, tokens ni secretos en IndexedDB.

### RNF-10. Confiabilidad y recuperación

- La aplicación deberá detectar fallos de IndexedDB y mostrar una acción de reintento.
- Se recomendará exportar respaldos periódicos.
- Si una vista falla, el resto de la navegación deberá continuar disponible cuando sea posible.

### RNF-11. Operación local

- Las funciones que no usan servicios externos deberán funcionar sin conexión una vez cargados los archivos.
- La instalación PWA y el cacheo formal se implementarán en una fase posterior.

### RNF-12. Trazabilidad

- Cada requisito funcional deberá relacionarse con al menos un caso de prueba.
- Los registros principales deberán incluir `createdAt` y `updatedAt`.
- Las alertas deberán conservar un historial de cambios de estado.

---

## 13. Arquitectura de software

### 13.1 Estilo arquitectónico

Se utilizará una aplicación web del lado del cliente organizada en capas. Puede implementarse como una SPA ligera con enrutamiento por hash, por ejemplo:

```text
/#/inicio
/#/mascotas
/#/mascotas/:id
/#/simulador
/#/alertas
/#/alertas/:id
/#/avisos
/#/configuracion
```

No se requiere un framework. La aplicación utilizará módulos ES nativos y componentes construidos con funciones JavaScript, plantillas HTML o elementos `<template>`.

### 13.2 Capas

#### Capa de presentación

Responsable de:

- renderizar pantallas y componentes;
- capturar eventos del usuario;
- mostrar validaciones;
- mantener el estado visual;
- adaptar la navegación al tamaño de pantalla.

#### Capa de aplicación

Responsable de los casos de uso:

- registrar mascota;
- agregar ubicación;
- ejecutar recorrido;
- activar alerta;
- registrar avistamiento;
- cerrar caso;
- exportar e importar.

#### Capa de dominio

Contiene:

- entidades;
- reglas de negocio;
- validadores;
- cálculos de estado;
- transiciones permitidas;
- cálculo de distancia.

#### Capa de infraestructura

Contiene:

- acceso a IndexedDB;
- repositorios;
- migraciones;
- almacenamiento y compresión de imágenes;
- exportación e importación;
- reloj y generación de identificadores;
- adaptadores para integraciones futuras.

### 13.3 Flujo entre capas

```text
Pantalla o componente
        ↓ evento
Caso de uso / servicio de aplicación
        ↓ valida reglas
Entidad o servicio de dominio
        ↓ solicita persistencia
Repositorio
        ↓
IndexedDB
        ↓ resultado
Actualización del estado y renderizado
```

La capa visual nunca deberá ejecutar operaciones directas sobre `indexedDB.open()`.

### 13.4 Patrón de repositorio

Se recomienda definir interfaces lógicas como:

```js
petRepository.create(pet)
petRepository.getById(id)
petRepository.list(filters)
petRepository.update(id, changes)
petRepository.deleteCascade(id)

locationRepository.add(location)
locationRepository.getLatestByPet(petId)
locationRepository.listByPet(petId, filters)

alertRepository.create(alert)
alertRepository.getActiveByPet(petId)
alertRepository.changeStatus(alertId, status, metadata)
```

Esto permitirá sustituir IndexedDB por una API remota sin reescribir todas las pantallas.

### 13.5 Estado de interfaz

El estado transitorio no se guardará automáticamente en la base de datos. Se separarán:

- estado persistente: mascotas, ubicaciones, alertas, preferencias;
- estado de sesión: ruta actual, filtros, modal abierto, paso del formulario;
- estado temporal del simulador: temporizador, punto actual y velocidad.

---

## 14. Estructura propuesta del proyecto

```text
petguard/
├── index.html
├── README.md
├── assets/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── css/
│   ├── reset.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── utilities.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── config.js
│   ├── constants.js
│   ├── db/
│   │   ├── database.js
│   │   ├── migrations.js
│   │   └── repositories/
│   │       ├── owner.repository.js
│   │       ├── pet.repository.js
│   │       ├── location.repository.js
│   │       ├── route.repository.js
│   │       ├── alert.repository.js
│   │       ├── sighting.repository.js
│   │       └── notification.repository.js
│   ├── domain/
│   │   ├── validators.js
│   │   ├── transitions.js
│   │   ├── location-status.js
│   │   └── distance.js
│   ├── services/
│   │   ├── pet.service.js
│   │   ├── location.service.js
│   │   ├── route-simulator.service.js
│   │   ├── lost-alert.service.js
│   │   ├── sighting.service.js
│   │   ├── notification.service.js
│   │   ├── backup.service.js
│   │   └── image.service.js
│   ├── components/
│   │   ├── app-header.js
│   │   ├── bottom-nav.js
│   │   ├── pet-card.js
│   │   ├── status-badge.js
│   │   ├── location-card.js
│   │   ├── map-grid.js
│   │   ├── notification-item.js
│   │   ├── modal.js
│   │   └── toast.js
│   ├── pages/
│   │   ├── onboarding.page.js
│   │   ├── home.page.js
│   │   ├── pets.page.js
│   │   ├── pet-form.page.js
│   │   ├── pet-detail.page.js
│   │   ├── simulator.page.js
│   │   ├── routes.page.js
│   │   ├── alerts.page.js
│   │   ├── alert-detail.page.js
│   │   ├── sighting-form.page.js
│   │   ├── notifications.page.js
│   │   └── settings.page.js
│   └── utils/
│       ├── dates.js
│       ├── ids.js
│       ├── dom.js
│       ├── formatters.js
│       └── errors.js
└── tests/
    ├── unit/
    ├── integration/
    ├── ui/
    └── fixtures/
```

---

## 15. Diseño de IndexedDB

### 15.1 Base de datos

**Nombre recomendado:** `petguard_db`
**Versión inicial:** `1`

La apertura de la base deberá centralizarse en un único módulo. El evento `onupgradeneeded` ejecutará migraciones por versión.

### 15.2 Almacenes de objetos

#### 15.2.1 `owners`

Guarda el perfil local.

```js
{
  id: "owner_local",
  displayName: "Julio",
  phone: "+51...",
  email: "correo@ejemplo.com",
  district: "Lima",
  alternateContact: {
    name: "Contacto",
    phone: "+51..."
  },
  acceptedLocalStorageNotice: true,
  createdAt: "2026-10-23T15:00:00.000Z",
  updatedAt: "2026-10-23T15:00:00.000Z"
}
```

**Clave primaria:** `id`

#### 15.2.2 `pets`

```js
{
  id: "pet_uuid",
  ownerId: "owner_local",
  name: "Luna",
  species: "dog",
  sex: "female",
  breed: "Mestiza",
  primaryColor: "Marrón",
  secondaryColors: ["Blanco"],
  size: "medium",
  birthDateApprox: "2021-06-01",
  weightKg: 12.5,
  distinctiveFeatures: "Pecho blanco y oreja izquierda caída",
  behavior: "Tímida con desconocidos",
  medicalNotes: "",
  approachInstructions: "Acercarse lentamente y llamarla por su nombre",
  photo: {
    blob: null,
    mimeType: "image/webp",
    width: 720,
    height: 720
  },
  simulatedCollarId: "PG-0001",
  localCardCode: "PG-LUNA-0001",
  status: "safe",
  createdAt: "2026-10-23T15:00:00.000Z",
  updatedAt: "2026-10-23T15:00:00.000Z"
}
```

**Clave primaria:** `id`
**Índices:** `ownerId`, `name`, `species`, `status`, `updatedAt`

#### 15.2.3 `collarStates`

```js
{
  id: "collar_state_uuid",
  petId: "pet_uuid",
  connected: true,
  batteryPercent: 74,
  signalQuality: "medium",
  simulated: true,
  recordedAt: "2026-10-23T15:05:00.000Z"
}
```

**Índices:** `petId`, `recordedAt`, índice compuesto lógico `petId + recordedAt`

#### 15.2.4 `locations`

```js
{
  id: "location_uuid",
  petId: "pet_uuid",
  routeId: null,
  alertId: null,
  latitude: -12.046374,
  longitude: -77.042793,
  accuracyMeters: 20,
  source: "manual",
  simulated: true,
  note: "Punto inicial de prueba",
  recordedAt: "2026-10-23T15:10:00.000Z",
  createdAt: "2026-10-23T15:10:03.000Z"
}
```

**Índices:** `petId`, `routeId`, `alertId`, `source`, `recordedAt`

#### 15.2.5 `routes`

```js
{
  id: "route_uuid",
  petId: "pet_uuid",
  name: "Recorrido de prueba 1",
  description: "Simulación posterior a un sismo",
  status: "draft",
  intervalSeconds: 3,
  startedAt: null,
  completedAt: null,
  createdAt: "2026-10-23T15:15:00.000Z",
  updatedAt: "2026-10-23T15:15:00.000Z"
}
```

Estados: `draft`, `running`, `paused`, `completed`, `stopped`.

#### 15.2.6 `routePoints`

```js
{
  id: "route_point_uuid",
  routeId: "route_uuid",
  sequence: 1,
  latitude: -12.046374,
  longitude: -77.042793,
  accuracyMeters: 15,
  offsetSeconds: 0,
  note: "Inicio"
}
```

**Índices:** `routeId`, `sequence`

#### 15.2.7 `lostAlerts`

```js
{
  id: "alert_uuid",
  petId: "pet_uuid",
  status: "active",
  lostAt: "2026-10-23T15:20:00.000Z",
  activatedAt: "2026-10-23T15:25:00.000Z",
  resolvedAt: null,
  lastKnownLocationId: "location_uuid",
  placeReference: "Cerca del parque principal",
  circumstances: "Se asustó por un ruido fuerte",
  searchMessage: "Luna es tímida; no correr detrás de ella",
  contactSnapshot: {
    displayName: "Julio",
    phone: "+51...",
    email: ""
  },
  visibility: "local_simulation",
  resolution: null,
  createdAt: "2026-10-23T15:25:00.000Z",
  updatedAt: "2026-10-23T15:25:00.000Z"
}
```

**Índices:** `petId`, `status`, `lostAt`, `updatedAt`

#### 15.2.8 `alertEvents`

Registra la trazabilidad del caso.

```js
{
  id: "event_uuid",
  alertId: "alert_uuid",
  type: "status_changed",
  fromStatus: "draft",
  toStatus: "active",
  note: "Alerta activada por el propietario",
  occurredAt: "2026-10-23T15:25:00.000Z"
}
```

**Índices:** `alertId`, `type`, `occurredAt`

#### 15.2.9 `sightings`

```js
{
  id: "sighting_uuid",
  alertId: "alert_uuid",
  latitude: -12.0459,
  longitude: -77.0418,
  seenAt: "2026-10-23T15:40:00.000Z",
  placeReference: "Entrada del parque",
  description: "Mascota similar caminando hacia el norte",
  confidence: "medium",
  reporter: {
    alias: "Vecino 1",
    phone: ""
  },
  photo: null,
  reviewStatus: "new",
  reviewNote: "",
  distanceFromLastKnownMeters: 132,
  simulated: true,
  createdAt: "2026-10-23T15:42:00.000Z",
  updatedAt: "2026-10-23T15:42:00.000Z"
}
```

**Índices:** `alertId`, `seenAt`, `confidence`, `reviewStatus`

#### 15.2.10 `notifications`

```js
{
  id: "notification_uuid",
  type: "sighting_created",
  title: "Nuevo avistamiento simulado",
  message: "Se registró un posible avistamiento de Luna.",
  priority: "high",
  read: false,
  entityType: "sighting",
  entityId: "sighting_uuid",
  actionRoute: "/#/alertas/alert_uuid",
  createdAt: "2026-10-23T15:42:00.000Z"
}
```

**Índices:** `read`, `priority`, `type`, `createdAt`

#### 15.2.11 `settings`

```js
{
  key: "app_preferences",
  theme: "system",
  language: "es",
  staleLocationMinutes: 60,
  lowBatteryThreshold: 20,
  notificationPreferences: {
    locationAdded: true,
    routeFinished: true,
    lowBattery: true,
    disconnected: true
  },
  updatedAt: "2026-10-23T15:00:00.000Z"
}
```

**Clave primaria:** `key`

### 15.3 Relaciones

```text
Owner 1 ─── N Pets
Pet   1 ─── N CollarStates
Pet   1 ─── N Locations
Pet   1 ─── N Routes
Route 1 ─── N RoutePoints
Pet   1 ─── N LostAlerts
LostAlert 1 ─── N AlertEvents
LostAlert 1 ─── N Sightings
Notification ─── 0..1 Entidad relacionada
```

IndexedDB no aplica claves foráneas automáticamente. La capa de servicios deberá validar las relaciones y ejecutar eliminaciones en cascada de manera explícita.

### 15.4 Versionado y migraciones

Cada cambio estructural incrementará la versión de la base. Ejemplo:

```js
switch (event.oldVersion) {
  case 0:
    createVersion1Stores(db);
    break;
  case 1:
    migrateV1ToV2(db, transaction);
    break;
}
```

Las migraciones deberán ser:

- deterministas;
- idempotentes cuando sea posible;
- probadas con datos anteriores;
- capaces de informar un error sin ocultarlo.

---

## 16. Módulos funcionales

### 16.1 Onboarding y perfil

Responsabilidades:

- explicar el alcance local del prototipo;
- crear el perfil inicial;
- solicitar solo datos necesarios;
- ofrecer datos de demostración;
- dirigir al inicio.

### 16.2 Gestión de mascotas

Responsabilidades:

- CRUD de mascotas;
- validación de formularios;
- compresión de fotografías;
- visualización de estado;
- coordinación de eliminación en cascada.

### 16.3 Localización

Responsabilidades:

- validar coordenadas;
- guardar puntos;
- obtener la última ubicación;
- calcular antigüedad;
- clasificar estado de actualización;
- preparar datos para visualización.

### 16.4 Simulador de recorridos

Responsabilidades:

- administrar puntos ordenados;
- controlar reproducción y pausa;
- crear ubicaciones a medida que avanza el recorrido;
- actualizar el progreso;
- finalizar sin duplicar puntos.

El temporizador deberá detenerse al salir de la pantalla o cerrar el recorrido. No deberá haber más de una ejecución activa para la misma mascota.

### 16.5 Alertas de extravío

Responsabilidades:

- comprobar si existe otra alerta activa;
- generar una instantánea de datos de contacto;
- relacionar la última ubicación;
- cambiar el estado de la mascota;
- mantener el historial del caso;
- resolver o cancelar la alerta.

### 16.6 Avistamientos

Responsabilidades:

- registrar avistamientos simulados;
- validar coordenadas y fechas;
- calcular distancia aproximada;
- permitir clasificación y descarte;
- generar avisos.

### 16.7 Centro de avisos

Responsabilidades:

- generar avisos consistentes;
- contar no leídos;
- filtrar y ordenar;
- enlazar con la pantalla relacionada;
- respetar preferencias.

### 16.8 Respaldo y restauración

Responsabilidades:

- serializar datos;
- convertir imágenes cuando sea necesario;
- validar archivos importados;
- mostrar un resumen previo;
- importar de forma transaccional;
- impedir duplicados por identificador.

---

## 17. Flujos principales

### 17.1 Primer ingreso

1. El usuario abre PetGuard.
2. La aplicación comprueba IndexedDB.
3. Si no existe perfil, muestra el onboarding.
4. El usuario conoce el alcance local y simulado.
5. Registra su nombre o alias y datos opcionales.
6. Decide si desea cargar datos de demostración.
7. El sistema guarda el perfil.
8. Se muestra la pantalla de inicio.

### 17.2 Registro de mascota

1. El usuario selecciona `Agregar mascota`.
2. Completa los datos básicos.
3. Selecciona una fotografía opcional.
4. La aplicación valida y comprime la imagen.
5. Se revisan los datos.
6. El usuario confirma.
7. El sistema guarda la mascota con estado segura.
8. Se genera un aviso interno.
9. Se abre el detalle de la mascota.

### 17.3 Registro de ubicación manual

1. El usuario abre el simulador.
2. Selecciona la mascota.
3. Ingresa latitud, longitud, fecha, precisión y nota.
4. La aplicación valida rangos y formato.
5. Se muestra una vista previa del punto.
6. El usuario guarda.
7. El punto se añade al historial.
8. Se recalcula la última ubicación.
9. La tarjeta de la mascota se actualiza.

### 17.4 Creación y reproducción de recorrido

1. El usuario crea un recorrido.
2. Asigna nombre, mascota e intervalo.
3. Agrega al menos dos puntos.
4. Ordena y revisa los puntos.
5. Guarda el borrador.
6. Inicia la simulación.
7. El sistema genera una ubicación por punto.
8. El usuario puede pausar, continuar o avanzar manualmente.
9. Al llegar al último punto, el recorrido se completa.
10. La última ubicación de la mascota queda actualizada.
11. Se genera un aviso de finalización.

### 17.5 Activación de alerta de extravío

1. El usuario abre la mascota.
2. Selecciona `Reportar como extraviada`.
3. La aplicación muestra la última ubicación y su antigüedad.
4. Si no existe ubicación, se muestra una advertencia y se permite continuar.
5. El usuario completa las circunstancias y el mensaje.
6. Selecciona qué datos de contacto incluir.
7. Revisa el resumen.
8. Confirma la activación.
9. La mascota cambia a estado extraviada.
10. Se crea la alerta y su primer evento.
11. Se genera un aviso interno.
12. La pantalla aclara que la difusión es simulada.

### 17.6 Registro de avistamiento

1. El usuario abre una alerta activa.
2. Selecciona `Simular avistamiento`.
3. Ingresa fecha, lugar, coordenadas y descripción.
4. Selecciona un nivel de confianza.
5. Guarda el reporte.
6. El sistema calcula la distancia aproximada al último punto.
7. El avistamiento aparece como nuevo.
8. Se genera un aviso interno de prioridad alta.

### 17.7 Resolución del caso

1. El usuario selecciona `Mascota encontrada`.
2. Registra fecha, lugar y nota.
3. Puede vincular un avistamiento relevante.
4. Revisa el cambio de estado.
5. Confirma.
6. La alerta se marca como resuelta.
7. La mascota cambia a segura.
8. Se agrega un evento de cierre.
9. Se muestra un mensaje de confirmación.

### 17.8 Exportación e importación

**Exportación:**

1. El usuario abre Configuración.
2. Selecciona `Exportar respaldo`.
3. El sistema recopila los almacenes.
4. Genera un JSON versionado.
5. Inicia la descarga.
6. Crea un aviso de éxito o error.

**Importación:**

1. El usuario selecciona un archivo JSON.
2. El sistema lo analiza sin modificar la base.
3. Valida formato, versión y referencias.
4. Muestra un resumen.
5. El usuario elige combinar o reemplazar.
6. Confirma la operación.
7. El sistema importa dentro de una transacción.
8. Se recarga el estado de la aplicación.

---

## 18. Pantallas y contenido

### 18.1 Onboarding

Contenido:

- logotipo y nombre PetGuard;
- explicación breve del propósito;
- aviso de que la ubicación será simulada;
- aviso de almacenamiento local;
- formulario del propietario;
- opción de cargar datos de demostración;
- botón `Comenzar`.

### 18.2 Inicio

Contenido:

- saludo;
- resumen de mascotas;
- alerta activa destacada;
- tarjeta de última ubicación;
- estado del collar simulado;
- avisos recientes;
- acciones rápidas: agregar ubicación, iniciar recorrido y reportar extravío.

### 18.3 Lista de mascotas

Contenido:

- título y contador;
- buscador;
- filtros por especie y estado;
- tarjetas de mascotas;
- botón flotante o principal para agregar;
- estado vacío con llamada a la acción.

### 18.4 Formulario de mascota

Secciones:

1. información básica;
2. apariencia;
3. comportamiento y salud;
4. fotografía;
5. collar simulado;
6. revisión.

En móvil se recomienda un formulario por pasos para reducir carga visual.

### 18.5 Detalle de mascota

Contenido:

- cabecera con foto, nombre y estado;
- datos identificativos;
- última ubicación;
- collar simulado;
- historial reciente;
- recorridos;
- alerta activa;
- acciones editar, simular ubicación y reportar extravío.

### 18.6 Simulador de ubicación

Contenido:

- selector de mascota;
- campos de latitud y longitud;
- fecha y hora;
- precisión;
- nota;
- botón para generar coordenada cercana;
- cuadrícula o plano esquemático;
- vista previa;
- historial de puntos.

La cuadrícula no deberá presentarse como mapa cartográfico real. Mostrará ejes, puntos y trayectoria para validar el comportamiento de la interfaz.

### 18.7 Editor de recorrido

Contenido:

- nombre y descripción;
- mascota;
- intervalo;
- lista ordenada de puntos;
- controles para agregar, editar, reordenar y eliminar;
- vista previa de trayectoria;
- guardar e iniciar.

### 18.8 Reproductor de recorrido

Contenido:

- nombre del recorrido;
- progreso;
- punto actual;
- hora simulada;
- plano con trayectoria;
- controles iniciar, pausar, continuar, siguiente y detener;
- registro de eventos.

### 18.9 Lista de alertas

Contenido:

- pestañas activas, resueltas y canceladas;
- tarjetas con mascota, estado, tiempo transcurrido y avistamientos;
- filtros;
- mensaje vacío.

### 18.10 Crear alerta

Pasos:

1. confirmar mascota;
2. revisar última ubicación;
3. describir extravío;
4. seleccionar contacto;
5. revisar y activar.

### 18.11 Detalle de alerta

Contenido:

- estado del caso;
- ficha resumida de la mascota;
- última ubicación;
- línea de tiempo;
- avistamientos;
- acciones editar, pausar, simular avistamiento y marcar encontrada;
- aviso permanente de simulación local.

### 18.12 Formulario de avistamiento

Contenido:

- fecha y hora;
- coordenadas;
- referencia del lugar;
- descripción;
- confianza;
- informante simulado;
- fotografía opcional;
- vista previa y guardar.

### 18.13 Centro de avisos

Contenido:

- número de no leídos;
- filtros;
- lista por fecha;
- prioridad;
- acción contextual;
- marcar todos como leídos.

### 18.14 Configuración

Contenido:

- perfil local;
- apariencia;
- umbrales de ubicación y batería;
- preferencias de avisos;
- exportar;
- importar;
- datos de demostración;
- borrar datos;
- información de versión y alcance.

---

## 19. Navegación

### 19.1 Navegación móvil

Barra inferior con un máximo recomendado de cinco destinos:

1. Inicio;
2. Mascotas;
3. Simulador;
4. Alertas;
5. Avisos.

Configuración se abrirá desde el menú de perfil.

### 19.2 Navegación de escritorio

La barra inferior se transformará en una barra lateral. El contenido principal tendrá un ancho máximo para evitar líneas demasiado extensas.

### 19.3 Navegación contextual

Las acciones relacionadas con una mascota permanecerán dentro de su detalle. Las acciones de una alerta permanecerán dentro del caso. Esto evita mezclar contextos y reduce errores.

---

## 20. Diseño visual y experiencia de usuario

### 20.1 Principios

- Priorizar rapidez y claridad durante una situación de estrés.
- Mostrar una sola acción principal por pantalla cuando sea posible.
- Utilizar lenguaje directo y no técnico.
- Diferenciar claramente datos reales introducidos por el usuario y simulaciones.
- Evitar mensajes que prometan recuperación o localización en tiempo real.
- Mantener información crítica visible: estado, hora y última ubicación.

### 20.2 Sistema visual sugerido

```css
:root {
  --color-primary: #176b5b;
  --color-primary-strong: #0f5145;
  --color-secondary: #f2a93b;
  --color-danger: #c73535;
  --color-warning: #b76a00;
  --color-success: #287d3c;
  --color-info: #2563a6;
  --color-bg: #f5f7f6;
  --color-surface: #ffffff;
  --color-text: #1e2927;
  --color-muted: #60706c;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-card: 0 8px 24px rgba(19, 49, 43, 0.08);
}
```

Los valores son una base y deberán validarse con contraste real.

### 20.3 Estados visuales

- Segura: verde más texto e icono.
- Extraviada: rojo más texto e icono.
- Encontrada/resuelta: azul o verde más texto.
- Ubicación antigua: ámbar y marca de tiempo visible.
- Sin datos: gris y acción para añadir ubicación.
- Simulación: etiqueta visible y consistente.

### 20.4 Componentes reutilizables

- botón primario, secundario, textual y peligro;
- tarjeta de mascota;
- tarjeta de ubicación;
- insignia de estado;
- campo con error;
- modal de confirmación;
- toast;
- aviso en línea;
- lista vacía;
- esqueleto de carga;
- línea de tiempo;
- barra de progreso;
- indicador de batería y señal.

---

## 21. Validaciones y manejo de errores

### 21.1 Validación de formularios

- Validar al salir del campo y al enviar.
- Conservar los datos si hay error.
- Colocar el mensaje junto al campo.
- Mover el foco al primer error al enviar.
- No depender solo de un borde rojo.

### 21.2 Errores de IndexedDB

Casos mínimos:

- navegador incompatible;
- acceso bloqueado;
- cuota agotada;
- transacción abortada;
- base corrupta o migración fallida.

Respuesta esperada:

- mensaje en lenguaje simple;
- detalle técnico solo en consola durante desarrollo;
- opción de reintento;
- opción de exportar si todavía es posible;
- no ocultar silenciosamente el fallo.

### 21.3 Errores del simulador

- recorrido con menos de dos puntos;
- coordenada inválida;
- recorrido ya activo;
- mascota eliminada durante una sesión;
- temporizador interrumpido;
- pestaña suspendida por el navegador.

El simulador deberá recalcular su estado al recuperar el foco y nunca crear puntos duplicados por reanudación.

### 21.4 Estados vacíos

Cada lista deberá explicar:

- qué contenido aparecerá;
- por qué todavía no existe;
- cuál es la acción siguiente.

---

## 22. Seguridad y privacidad

### 22.1 Riesgos principales

- inyección de HTML o JavaScript en notas y descripciones;
- importación de archivos manipulados;
- exposición accidental de datos de contacto;
- almacenamiento excesivo de fotografías;
- pérdida de datos por limpieza del navegador;
- interpretación errónea de datos simulados como reales.

### 22.2 Controles obligatorios

1. Renderizar texto del usuario con APIs seguras.
2. Validar tipos, longitudes y enumeraciones.
3. Limitar el tamaño de imágenes antes de procesarlas.
4. Aceptar únicamente formatos definidos, como JPEG, PNG o WebP.
5. Eliminar metadatos innecesarios al recomprimir imágenes cuando sea posible.
6. Validar por esquema los JSON importados.
7. Ignorar propiedades desconocidas o rechazar el archivo según severidad.
8. No ejecutar contenido importado.
9. Solicitar confirmación antes de reemplazar datos.
10. Mostrar solo los datos de contacto elegidos por el propietario.
11. Identificar de forma permanente toda simulación.
12. Informar que IndexedDB no sustituye un respaldo.

### 22.3 Límites de seguridad del MVP

Al no existir cuentas ni servidor, no se puede garantizar separación entre personas que usan el mismo perfil del navegador. Cualquier persona con acceso al navegador y al perfil local podría abrir PetGuard y consultar sus datos. Esta limitación debe aparecer en Configuración y en la documentación del prototipo.

---

## 23. Estrategia de pruebas

### 23.1 Pruebas unitarias

Se probarán funciones puras y reglas de negocio:

- validación de latitud y longitud;
- cálculo de antigüedad;
- clasificación reciente/intermedia/antigua;
- fórmula de Haversine;
- transiciones de alerta;
- validación de mascota;
- validación de importación;
- ordenamiento de puntos;
- formato de fechas;
- generación de identificadores.

### 23.2 Pruebas de integración

Se comprobará:

- creación y lectura de mascotas en IndexedDB;
- actualización sin pérdida de relaciones;
- eliminación en cascada;
- creación de ubicación y recálculo de última ubicación;
- recorrido que genera puntos;
- alerta que cambia el estado de la mascota;
- cierre de alerta que devuelve la mascota a estado segura;
- avistamiento que genera aviso;
- exportación e importación completas;
- migraciones entre versiones.

### 23.3 Pruebas funcionales manuales

| Caso | Acción | Resultado esperado |
|---|---|---|
| PF-01 | Crear perfil | Se guarda y se abre Inicio. |
| PF-02 | Registrar mascota válida | Aparece en la lista con estado segura. |
| PF-03 | Registrar mascota incompleta | Se muestran errores y no se guarda. |
| PF-04 | Agregar coordenada válida | Se actualiza la última ubicación. |
| PF-05 | Usar latitud 100 | El sistema rechaza el valor. |
| PF-06 | Crear recorrido de un punto | No permite iniciarlo. |
| PF-07 | Ejecutar recorrido completo | Se crean los puntos una sola vez. |
| PF-08 | Activar alerta | Mascota pasa a extraviada. |
| PF-09 | Activar segunda alerta | Se impide mientras exista otra activa. |
| PF-10 | Registrar avistamiento | Aparece en el caso y genera aviso. |
| PF-11 | Resolver alerta | Mascota vuelve a segura. |
| PF-12 | Recargar página | Los datos permanecen. |
| PF-13 | Exportar datos | Se descarga JSON válido. |
| PF-14 | Importar archivo inválido | No se modifica la base. |
| PF-15 | Borrar datos | Solo ocurre después de confirmar. |

### 23.4 Pruebas responsive

Resoluciones mínimas sugeridas:

- 320 × 568;
- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1366 × 768;
- 1920 × 1080.

Verificar:

- ausencia de desplazamiento horizontal;
- tamaño táctil mínimo recomendado de 44 × 44 px;
- navegación visible;
- modales dentro del viewport;
- formularios utilizables con teclado virtual;
- imágenes sin deformación;
- tablas convertidas en tarjetas o con desplazamiento controlado.

### 23.5 Pruebas de accesibilidad

- navegación completa con teclado;
- orden lógico de foco;
- lectura correcta con lector de pantalla;
- etiquetas de formulario;
- texto alternativo;
- contraste;
- zoom al 200 %;
- reducción de movimiento mediante `prefers-reduced-motion`;
- mensajes dinámicos anunciados.

### 23.6 Pruebas de rendimiento

- carga inicial;
- renderizado de 100 mascotas simuladas;
- historial de 1000 ubicaciones;
- importación de respaldo grande;
- compresión de fotografía;
- reproducción de recorrido de 200 puntos;
- uso de memoria después de iniciar y detener varios recorridos.

### 23.7 Pruebas de usabilidad

#### Participantes

Propietarios de perros o gatos del público objetivo. Para una primera validación se recomienda entre 5 y 8 participantes.

#### Tareas

1. Registrar una mascota.
2. Consultar su última ubicación.
3. Crear un recorrido simulado.
4. Reportarla como extraviada.
5. Registrar un avistamiento.
6. Marcar la mascota como encontrada.

#### Métricas

- porcentaje de tareas completadas;
- tiempo por tarea;
- número de errores;
- solicitudes de ayuda;
- retrocesos innecesarios;
- comprensión de la etiqueta `Simulación`;
- satisfacción de 1 a 5;
- System Usability Scale, si el curso lo requiere.

#### Criterios iniciales de aceptación

- Al menos 80 % completa las tareas críticas sin intervención.
- Ningún participante interpreta la ubicación como GPS real después de leer la pantalla.
- El promedio de errores críticos es menor a uno por participante.
- La activación de alerta se completa en menos de dos minutos en condiciones de prueba.
- La satisfacción promedio es al menos 4 de 5.

---

## 24. Matriz de trazabilidad resumida

| Requisito | Módulo | Pantalla principal | Prueba mínima |
|---|---|---|---|
| RF-03 | Mascotas | Formulario de mascota | PF-02, PF-03 |
| RF-09 | Localización | Simulador | PF-04, PF-05 |
| RF-14 a RF-17 | Recorridos | Editor/Reproductor | PF-06, PF-07 |
| RF-18 a RF-22 | Alertas | Crear/Detalle de alerta | PF-08, PF-09, PF-11 |
| RF-23 a RF-26 | Avistamientos | Formulario/Detalle | PF-10 |
| RF-27 a RF-29 | Avisos | Centro de avisos | Integración de eventos |
| RF-30 y RF-31 | Respaldo | Configuración | PF-13, PF-14 |
| RF-33 | Configuración | Configuración | PF-15 |

La matriz completa deberá ampliarse durante el desarrollo para incluir cada criterio de aceptación.

---

## 25. Fases de desarrollo

### Fase 0. Preparación

**Objetivo:** dejar listo el entorno y las decisiones base.

Tareas:

- crear repositorio y estructura de carpetas;
- configurar servidor local de desarrollo;
- definir convenciones de código;
- crear tokens de diseño;
- preparar datos de prueba;
- definir Definition of Done.

**Entregable:** proyecto vacío navegable y documentación inicial.

### Fase 1. Base visual y navegación

Tareas:

- layout mobile-first;
- encabezado y navegación inferior;
- router por hash;
- componentes básicos;
- estados vacío, carga y error;
- páginas iniciales sin lógica completa.

**Entregable:** prototipo navegable responsive.

### Fase 2. IndexedDB y perfil local

Tareas:

- crear base y almacenes;
- implementar repositorios;
- onboarding;
- perfil local;
- manejo global de errores;
- pruebas de persistencia.

**Entregable:** datos locales persistentes y perfil funcional.

### Fase 3. Mascotas

Tareas:

- formulario;
- lista y detalle;
- edición;
- fotografía comprimida;
- eliminación controlada;
- validaciones y pruebas.

**Entregable:** CRUD completo de mascotas.

### Fase 4. Ubicaciones y collar simulado

Tareas:

- formulario de coordenadas;
- estado del collar;
- historial;
- última ubicación;
- clasificación por antigüedad;
- cuadrícula visual.

**Entregable:** localización manual totalmente funcional.

### Fase 5. Recorridos

Tareas:

- editor de puntos;
- almacenamiento de recorridos;
- temporizador y reproducción;
- pausa, continuación y cierre;
- control de duplicados;
- pruebas de suspensión de pestaña.

**Entregable:** simulador de recorridos.

### Fase 6. Alertas y avistamientos

Tareas:

- creación de alerta;
- transición de estados;
- línea de tiempo;
- formulario de avistamiento;
- cálculo de distancia;
- resolución del caso.

**Entregable:** flujo completo de extravío y recuperación.

### Fase 7. Avisos y respaldo

Tareas:

- centro de avisos;
- preferencias;
- exportación;
- importación;
- datos de demostración;
- borrado seguro.

**Entregable:** operación local completa y recuperable.

### Fase 8. Calidad y validación

Tareas:

- pruebas unitarias e integración;
- revisión responsive;
- accesibilidad;
- rendimiento;
- pruebas con usuarios;
- corrección de hallazgos;
- documentación de limitaciones.

**Entregable:** versión evaluable del MVP.

### Fase 9. Conversión a PWA

Tareas futuras:

- `manifest.webmanifest`;
- iconos instalables;
- service worker;
- estrategia de caché;
- página offline;
- actualización controlada;
- pruebas de instalación.

**Entregable:** aplicación instalable y con recursos básicos disponibles sin conexión.

---

## 26. Plan de iteraciones sugerido

| Iteración | Resultado demostrable |
|---|---|
| 1 | Navegación responsive y diseño base |
| 2 | Perfil local y CRUD de mascotas |
| 3 | Coordenadas, historial y collar simulado |
| 4 | Creación y reproducción de recorridos |
| 5 | Alertas de extravío y cambio de estados |
| 6 | Avistamientos, distancia y línea de tiempo |
| 7 | Avisos, respaldo e importación |
| 8 | Pruebas, accesibilidad y validación con usuarios |

Cada iteración debe terminar con una versión ejecutable, no únicamente con pantallas estáticas.

---

## 27. Definition of Done

Una función se considera terminada cuando:

- cumple sus criterios de aceptación;
- funciona en móvil y escritorio;
- incluye validaciones y errores;
- persiste correctamente si corresponde;
- no rompe otras funciones;
- cuenta con prueba unitaria o funcional proporcional al riesgo;
- es accesible por teclado;
- no muestra datos simulados como reales;
- está documentada cuando introduce una decisión técnica;
- fue revisada en al menos un navegador Chromium y uno alternativo.

---

## 28. Integraciones futuras

### 28.1 Progressive Web App

Permitirá:

- instalación en el dispositivo;
- apertura en modo independiente;
- caché de recursos;
- experiencia offline controlada;
- actualización de versiones.

IndexedDB se conservará como almacenamiento local y caché.

### 28.2 Backend y API

El backend permitirá:

- cuentas reales;
- sincronización entre dispositivos;
- recuperación de datos;
- alertas comunitarias;
- control de acceso;
- auditoría;
- moderación;
- almacenamiento de imágenes.

API orientativa:

```text
POST   /auth/register
POST   /auth/login
GET    /pets
POST   /pets
GET    /pets/:id
PATCH  /pets/:id
POST   /pets/:id/locations
GET    /pets/:id/locations
POST   /lost-alerts
GET    /lost-alerts/:id
PATCH  /lost-alerts/:id/status
POST   /lost-alerts/:id/sightings
GET    /lost-alerts/:id/sightings
```

### 28.3 Collar GPS real

La arquitectura deberá incorporar un adaptador que transforme datos del dispositivo al modelo interno:

```js
{
  petId,
  latitude,
  longitude,
  accuracyMeters,
  batteryPercent,
  signalQuality,
  source: "gps_device",
  simulated: false,
  recordedAt
}
```

Aspectos por definir:

- tecnología de comunicación;
- frecuencia de transmisión;
- autonomía;
- cobertura;
- almacenamiento sin conexión;
- cifrado;
- autenticación del dispositivo;
- tolerancia a mensajes duplicados;
- comodidad, peso y resistencia del collar.

### 28.4 Mapas

Se podrá integrar Leaflet con OpenStreetMap u otro proveedor. La capa visual deberá consumir una interfaz común para que el simulador y el mapa real compartan puntos y rutas.

### 28.5 Notificaciones push

Con PWA y backend se podrán incorporar:

- Push API;
- Web Notifications;
- avisos de nuevo avistamiento;
- desconexión del collar;
- batería baja;
- ubicación disponible.

Las notificaciones requerirán consentimiento explícito y preferencias configurables.

### 28.6 Código QR y ficha pública

El QR del collar podrá dirigir a una ficha pública con:

- nombre de la mascota;
- fotografía;
- descripción;
- instrucciones de aproximación;
- botón de contacto protegido;
- opción para reportar avistamiento.

No deberá mostrar dirección, historial de ubicación ni información privada innecesaria.

### 28.7 Comunidad y geolocalización de alertas

Con backend se podrá:

- difundir alertas por radio geográfico;
- recibir avistamientos de terceros;
- moderar contenido;
- bloquear abuso;
- limitar exposición de teléfonos;
- cerrar alertas globalmente.

### 28.8 Analítica de producto

Solo con consentimiento y anonimización se podrían medir:

- tareas completadas;
- errores frecuentes;
- tiempos de flujo;
- rendimiento;
- adopción de funciones.

No se enviarán coordenadas ni datos personales a analítica sin una base legítima y consentimiento adecuado.

---

## 29. Estrategia de evolución de almacenamiento local a servidor

Para evitar reescribir la aplicación:

1. las pantallas consumirán servicios, no IndexedDB directamente;
2. los servicios dependerán de repositorios;
3. se implementará un repositorio local en el MVP;
4. en el futuro se añadirá un repositorio remoto;
5. un servicio de sincronización coordinará ambos;
6. cada registro incorporará versión y fecha de actualización;
7. se definirá una estrategia de conflictos.

Modelo futuro:

```text
Pantalla
   ↓
Servicio de aplicación
   ↓
Repositorio unificado
   ├── IndexedDB: caché y trabajo offline
   └── API: fuente sincronizada
```

---

## 30. Riesgos del proyecto y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Confundir simulación con GPS real | Alto | Etiquetas permanentes, mensajes y pruebas de comprensión |
| Pérdida de datos del navegador | Alto | Exportación, advertencias y futura sincronización |
| Fotografías consumen demasiado espacio | Medio | Compresión, límites y WebP |
| Código JavaScript difícil de mantener | Alto | Capas, módulos ES y repositorios |
| Recorridos duplican puntos | Medio | Identificadores, estado de ejecución y pruebas |
| Alertas inconsistentes con estado de mascota | Alto | Transacciones y servicio único de alertas |
| Uso poco claro durante estrés | Alto | Flujos cortos y pruebas con usuarios |
| Datos personales expuestos | Alto | Minimización y selección explícita de contacto |
| Incompatibilidad de IndexedDB | Medio | Detección temprana y navegadores compatibles |
| Alcance excesivo | Alto | MVP definido y backlog futuro separado |

---

## 31. Criterios de aceptación del MVP

El MVP se considerará completo cuando un usuario pueda, sin backend:

1. crear su perfil local;
2. registrar al menos una mascota;
3. cerrar y volver a abrir la aplicación sin perder los datos;
4. ingresar una ubicación válida;
5. distinguir si la ubicación es reciente o antigua;
6. crear y reproducir un recorrido de varios puntos;
7. activar una alerta de extravío;
8. registrar un avistamiento;
9. revisar la línea de tiempo del caso;
10. marcar la mascota como encontrada;
11. consultar avisos internos;
12. exportar un respaldo;
13. importar un respaldo válido;
14. usar las funciones principales desde un teléfono y una computadora;
15. comprender que ubicaciones, collar, avisos comunitarios y avistamientos son simulados.

---

## 32. Backlog posterior al MVP

### Prioridad alta

- PWA instalable;
- mapa real;
- backend y cuentas;
- sincronización;
- ficha pública por QR;
- recepción de ubicaciones desde un dispositivo.

### Prioridad media

- notificaciones push;
- comunidad cercana;
- carga de fotografías de avistamientos al servidor;
- múltiples propietarios por mascota;
- historial de batería y conectividad;
- exportación de ficha de búsqueda.

### Prioridad baja o experimental

- zonas seguras y geocercas;
- detección automática de salida;
- predicción de recorrido;
- integración con municipalidades o refugios;
- panel de moderación;
- analítica avanzada;
- integración con microchip o registros veterinarios.

---

## 33. Convenciones técnicas

### 33.1 Identificadores

Usar `crypto.randomUUID()` cuando esté disponible. Incorporar un respaldo compatible para navegadores de prueba.

### 33.2 Fechas

- Guardar en UTC con ISO 8601.
- Mostrar en hora local.
- Evitar guardar fechas formateadas como texto de interfaz.

### 33.3 Enumeraciones

Centralizar valores como:

```js
export const PET_STATUS = Object.freeze({
  SAFE: "safe",
  LOST: "lost",
  FOUND: "found"
});

export const ALERT_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  RESOLVED: "resolved",
  CANCELLED: "cancelled"
});
```

### 33.4 Errores

Definir errores controlados como:

- `ValidationError`;
- `NotFoundError`;
- `ConflictError`;
- `StorageError`;
- `ImportError`.

La interfaz traducirá cada error a un mensaje comprensible.

### 33.5 Registros de desarrollo

En desarrollo se permitirá `console.error` con contexto técnico. En producción no se imprimirán datos personales completos ni imágenes.

---

## 34. Ejemplo de caso completo de demostración

1. El usuario registra a Luna, una perrita mediana de color marrón y pecho blanco.
2. Configura el collar simulado con 74 % de batería y señal media.
3. Ingresa un punto inicial en Lima.
4. Crea un recorrido de cinco puntos con intervalos de tres segundos.
5. Reproduce el recorrido y observa cómo cambia la última ubicación.
6. Simula una desconexión del collar y recibe un aviso interno.
7. Reporta a Luna como extraviada después de un ruido fuerte.
8. Revisa la última ubicación, marcada con su antigüedad.
9. Registra un avistamiento a 132 metros del último punto.
10. Clasifica el avistamiento como relevante.
11. Marca a Luna como encontrada.
12. Revisa la línea de tiempo completa.
13. Exporta el respaldo JSON.

Este caso deberá formar parte de la demostración académica y de las pruebas de aceptación.

---

## 35. Limitaciones que deben comunicarse al usuario

La aplicación deberá presentar un aviso similar al siguiente:

> PetGuard es un prototipo académico. En esta versión, las ubicaciones, recorridos, estados del collar, alertas comunitarias y avistamientos son simulados y se almacenan únicamente en este navegador. La aplicación no recibe información GPS real, no difunde alertas a terceros y no garantiza la recuperación de una mascota.

Este aviso deberá aparecer:

- en el onboarding;
- en el simulador;
- al activar una alerta;
- en Configuración;
- en la documentación de la entrega.

---

## 36. Resultado esperado

Al completar esta especificación, PetGuard contará con una base funcional y verificable para demostrar el flujo completo de identificación, localización simulada, extravío, avistamiento y recuperación de una mascota. La solución será suficientemente simple para desarrollarse con HTML, CSS y JavaScript, pero estará organizada de forma que las futuras integraciones no obliguen a rehacer la aplicación desde cero.

La prioridad de la primera versión es validar la utilidad y comprensión del sistema. El GPS real, la comunidad conectada y las notificaciones externas se incorporarán únicamente después de comprobar que los flujos principales responden a las necesidades del usuario.

---

## 37. Lista de verificación para comenzar el desarrollo

- [x] Crear la estructura de carpetas.
- [x] Implementar el router por hash.
- [x] Definir tokens de diseño y layout mobile-first.
- [x] Crear la base IndexedDB versión 2.
- [x] Implementar la capa de persistencia.
- [x] Construir onboarding y perfil.
- [x] Implementar registro, edición y eliminación de mascotas.
- [x] Implementar ubicaciones conocidas e historial.
- [ ] Implementar el simulador de recorridos (fuera del alcance actual).
- [x] Implementar alertas y eventos.
- [x] Implementar avistamientos.
- [x] Implementar avisos internos.
- [x] Implementar exportación e importación.
- [ ] Agregar datos de demostración (fuera del alcance actual).
- [x] Ejecutar pruebas funcionales y automatizadas.
- [x] Validar responsive y accesibilidad técnica.
- [ ] Realizar pruebas con usuarios.
- [x] Documentar resultados y limitaciones.
- [ ] Planificar la fase PWA.
