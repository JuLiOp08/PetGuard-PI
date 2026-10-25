# PetGuard

PetGuard organiza la identificación, las ubicaciones conocidas y la búsqueda de mascotas extraviadas. El contexto cubre desde el registro de una mascota hasta el cierre de su caso de búsqueda.

## Personas y animales

**Propietario**:
Persona responsable de una o más mascotas y de gestionar su información y sus casos de búsqueda.
_Avoid_: Usuario, dueño, cliente

**Familiar de confianza**:
Persona cercana al propietario que puede consultar la información compartida de las mascotas y colaborar con avistamientos, pero no administrar sus fichas ni resolver sus casos de búsqueda.
_Avoid_: Propietario secundario, administrador, cuenta familiar

**Círculo de confianza**:
Grupo demostrativo formado por el propietario y hasta cinco familiares de confianza con acceso a las mascotas compartidas.
_Avoid_: Familia, equipo, organización

**Perfil local**:
Identidad y datos de contacto del propietario guardados en un dispositivo; en el prototipo también sirve como origen de los datos compartidos que consulta un familiar de confianza.
_Avoid_: Cuenta, usuario

**Mascota**:
Perro o gato identificado por el propietario y sujeto de ubicaciones y casos de búsqueda.
_Avoid_: Animal, dispositivo

**Ficha de mascota**:
Conjunto de datos principales y opcionales que identifican a una mascota, incluida su fotografía de referencia.
_Avoid_: Perfil de mascota, registro del animal

**Información relevante**:
Datos opcionales que el propietario considera útiles para identificar o cuidar a una mascota y que no pertenecen a sus datos principales.
_Avoid_: Señas particulares, comportamiento, instrucciones de acercamiento

**Condición**:
Dato opcional sobre el estado físico o médico de una mascota que conviene conocer para su cuidado.
_Avoid_: Diagnóstico

## Localización

**Ubicación**:
Punto geográfico conocido de una mascota, acompañado por su momento de registro y el origen del dato.
_Avoid_: Posición en tiempo real

**Última ubicación conocida**:
Ubicación válida más reciente de una mascota; es una referencia para la búsqueda, no una posición actual garantizada.
_Avoid_: Ubicación actual, ubicación en tiempo real

## Búsqueda

**Alerta de extravío**:
Registro que declara a una mascota como extraviada y reúne la información utilizada para buscarla.
_Avoid_: Difusión pública, notificación externa

**Caso de búsqueda**:
Seguimiento de una alerta de extravío desde su activación hasta su resolución o cancelación, incluidos sus avistamientos.
_Avoid_: Incidente, ticket

**Avistamiento**:
Reporte de una posible observación de la mascota asociado a un caso de búsqueda; su nivel de confianza no confirma la identidad.
_Avoid_: Ubicación confirmada, hallazgo

**Hallazgo**:
Confirmación de que la mascota fue encontrada y de que su caso de búsqueda puede resolverse.
_Avoid_: Avistamiento

**Aviso interno**:
Mensaje dentro de PetGuard que informa al propietario sobre un evento relevante.
_Avoid_: Notificación push, alerta de extravío

**Respaldo**:
Copia portable de los datos del propietario utilizada para conservarlos o restaurarlos.
_Avoid_: Sincronización, copia en la nube
