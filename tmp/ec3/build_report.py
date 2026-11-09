from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT

ROOT = Path(__file__).resolve().parents[2]
TMP = ROOT / 'tmp/ec3'
OUT = ROOT / 'output/docs'
OUT.mkdir(parents=True, exist_ok=True)
d = Document()
s = d.sections[0]
s.page_width, s.page_height = Cm(21), Cm(29.7)
s.top_margin = s.bottom_margin = Cm(2)
s.left_margin = s.right_margin = Cm(2.2)
s.footer_distance = Cm(1)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3', 'Caption']:
 st = d.styles[name]
 st.font.name = 'Arial'
 st.font.color.rgb = RGBColor(0,0,0)
 st.paragraph_format.space_after = Pt(7)
d.styles['Normal'].font.size = Pt(10.5)
d.styles['Normal'].paragraph_format.line_spacing = 1.12
for name, size in [('Title',19),('Heading 1',15),('Heading 2',12),('Heading 3',11)]:
 d.styles[name].font.size = Pt(size)
 d.styles[name].font.bold = True
 d.styles[name].paragraph_format.space_before = Pt(10)
 d.styles[name].paragraph_format.keep_with_next = True
d.styles['Title'].paragraph_format.space_before = Pt(0)
d.styles['Caption'].font.size = Pt(9)
d.styles['Caption'].font.italic = False
footer = s.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run(); fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); r._r.addnext(fld)

def p(t, style=None): return d.add_paragraph(t, style)
def h(t, level=1): return d.add_heading(re.sub(r'^\d \d ', '', t) if level==2 else t,level)
def page(): d.add_page_break()
def table(headers, rows, widths):
 t=d.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
 for c,w,txt in zip(t.rows[0].cells,widths,headers): c.width=Cm(w); c.text=txt
 rep=OxmlElement('w:tblHeader'); t.rows[0]._tr.get_or_add_trPr().append(rep)
 for row in rows:
  for c,w,txt in zip(t.add_row().cells,widths,row): c.width=Cm(w); c.text=txt
 for ri,row in enumerate(t.rows):
  pr=row._tr.get_or_add_trPr(); ns=OxmlElement('w:cantSplit'); pr.append(ns)
  for c in row.cells:
   c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   tcpr=c._tc.get_or_add_tcPr()
   borders=OxmlElement('w:tcBorders')
   for edge in ['top','left','bottom','right']:
    e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
   tcpr.append(borders)
   mar=OxmlElement('w:tcMar')
   for edge in ['top','left','bottom','right']:
    e=OxmlElement('w:'+edge);e.set(qn('w:w'),'85');e.set(qn('w:type'),'dxa');mar.append(e)
   tcpr.append(mar)
   if ri==0 or ri%2==0:
    sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E7EDF2' if ri==0 else 'F5F7F9');tcpr.append(sh)
   for para in c.paragraphs:
    para.paragraph_format.space_after=Pt(2);para.paragraph_format.line_spacing=1.02
    for run in para.runs:run.font.size=Pt(9);run.bold=(ri==0)
 p('')
 return t

# 1
d.add_heading('Informe del avance del Proyecto',0)
p('Fase de experimentación EC3', 'Subtitle')
p('PetGuard\nPlataforma web para la identificación y organización de la búsqueda de mascotas')
p('En esta fase desarrollamos y evaluamos un MVP web de PetGuard con tres propietarios de mascotas. Las pruebas presenciales permitieron identificar dificultades en la interpretación de las ubicaciones y necesidades relacionadas con los avisos, las fotografías y la lectura del mapa. A partir de estos hallazgos ajustamos la experiencia de uso y definimos la continuidad del proyecto exclusivamente como plataforma web.')
h('1 Diseño y desarrollo del prototipo o MVP')
h('1 1 Necesidad y propósito del producto',2)
p('PetGuard responde a la dificultad de organizar información útil cuando una mascota se extravía o queda fuera del alcance de su propietario. El informe previo identificó esta necesidad mediante un sondeo exploratorio a 52 personas y una entrevista semiestructurada. Estos antecedentes orientaron el diseño inicial y se mantienen como investigación del problema; las pruebas de esta fase se realizaron directamente con el MVP (Equipo PetGuard, s. f.).')
p('El propósito del MVP es permitir que el propietario registre una ficha identificable, consulte ubicaciones conocidas, active una alerta y organice posibles avistamientos. Su valor en esta etapa consiste en reunir estos datos y acciones en un flujo de búsqueda comprensible.')
h('1 2 Alcance actualizado del proyecto',2)
p('Como equipo decidimos concentrar todo el proyecto en la página web. La propuesta inicial de integrar un collar electrónico se retiró del alcance para reducir la complejidad y priorizar las funciones digitales que podemos desarrollar y evaluar. Esta decisión modifica el medio de solución y exige ajustar los objetivos del informe anterior.')
table(['Incluido en el MVP','Fuera del alcance actual'],[
 ('Ficha de mascota con datos y fotografía','Collar electrónico y pruebas físicas con animales'),
 ('Ubicaciones conocidas registradas manualmente','Rastreo GPS de la mascota y transmisión automática'),
 ('Alertas, avistamientos y consulta en mapa','Difusión automática a terceros y comunidad conectada'),
 ('Avisos internos y respaldo de datos locales','Sincronización en la nube y autenticación remota')],[8.3,8.3])

# 2
page();h('1 3 Formato y funcionalidad demostrable',2)
p('El producto es una aplicación web que funciona en el navegador. Utiliza HTML, CSS y JavaScript, conserva los datos localmente mediante IndexedDB y consulta servicios cartográficos para mostrar los mapas. El acceso al mapa requiere conexión; la información guardada corresponde al navegador y dispositivo utilizados. La versión actual no constituye un servicio público con datos sincronizados entre personas (Equipo PetGuard, 2026).')
p('El flujo demostrable comienza con el registro de una mascota y su fotografía. Luego permite añadir una ubicación conocida, declarar un extravío, registrar posibles avistamientos y revisar el caso hasta marcar a la mascota como encontrada. La interfaz dispone de un centro de avisos y de opciones para exportar e importar un respaldo.')
p('La ubicación de la mascota se incorpora de forma manual. Puede representar una referencia de pérdida o un lugar donde fue observada; su fecha ayuda a interpretar la antigüedad del dato. Ninguno de estos registros demuestra dónde se encuentra actualmente la mascota. Esta distinción es central para comunicar el alcance del producto.')
h('1 4 Diseño y ejecución de la primera ronda',2)
p('La primera ronda tuvo un enfoque exploratorio y cualitativo. Participaron presencialmente tres propietarios: dos de perros y uno de gato. El objetivo fue conocer si el flujo principal resultaba comprensible y qué información o funciones necesitaban al utilizarlo. El tamaño de este grupo permitió recoger observaciones iniciales; no permite representar a todos los propietarios del público objetivo.')
table(['Actividad de la prueba','Aspecto evaluado'],[
 ('Registrar una mascota','Claridad del formulario y datos necesarios para identificarla'),
 ('Consultar una ubicación','Comprensión del origen y significado de la referencia geográfica'),
 ('Activar una alerta de pérdida','Comprensión del inicio de un caso de búsqueda'),
 ('Registrar un avistamiento','Facilidad para añadir información útil a la búsqueda')],[7,9.6])
p('Los participantes utilizaron estas funciones y comunicaron sus dificultades y necesidades durante la experiencia presencial. El equipo reunió los comentarios por tema y los relacionó con cambios de interfaz y funcionalidad. No se dispone de registros individuales de tiempos, errores o asistencia, por lo que el análisis se centra en los hallazgos cualitativos comunicados por el equipo.')
p('Los recursos empleados fueron el MVP web, un dispositivo con navegador y la participación de los propietarios. Para una siguiente aplicación formal se establecen en el Anexo D una ficha de observación y preguntas que permitirán conservar evidencia comparable.')

# 3
page();h('2 Validación de la solución pruebas y análisis de resultados')
h('2 1 Resultados de la primera ronda',2)
p('La interacción de los tres participantes permitió reconocer cuatro temas relevantes para la experiencia de uso. La siguiente síntesis presenta los comentarios de forma agregada: no se asignan a una persona específica ni se atribuye una frecuencia que no fue registrada.')
table(['Hallazgo reportado','Interpretación para el diseño'],[
 ('Dificultad para comprender la ubicación al ser manual y no provenir de GPS.','La interfaz debía explicar el origen del dato y diferenciar una referencia conocida del seguimiento automático.'),
 ('Avisos considerados innecesarios que podían llenar la página.','Era necesario facilitar su gestión y revisar qué eventos merecen generar un aviso persistente.'),
 ('Necesidad de subir fotografías de las mascotas.','La identificación visual debía complementar los datos escritos de la ficha.'),
 ('Solicitud de mostrar las alertas con otro color en el mapa.','Los puntos de pérdida y de avistamiento requerían una distinción visual clara.')],[8,8.6])
h('2 2 Análisis de los hallazgos',2)
p('La confusión sobre las ubicaciones evidenció una diferencia entre la expectativa de rastreo y la función que el MVP realmente ofrece. Aclarar que se consultan registros conocidos permite interpretar el mapa con mayor precisión. Sin embargo, esa aclaración no satisface por sí misma la necesidad de localización automática: debemos comprobar si los propietarios encuentran útil la propuesta web con este alcance.')
p('La petición de fotografías y de colores diferenciados muestra la importancia de reconocer rápidamente a la mascota y comprender los puntos del mapa. La observación sobre los avisos indica que añadir información puede perjudicar la experiencia cuando no existe una jerarquía o una forma sencilla de gestionarla. Los cambios deben facilitar las acciones principales y conservar visible la información relevante.')
h('2 3 Seguimiento posterior y límites de la validación',2)
p('Después de introducir las mejoras, los participantes continuaron utilizando la web y, al momento de este informe, no han comunicado nuevas observaciones. Este seguimiento constituye una señal inicial favorable. No se aplicó todavía una segunda ronda con instrumentos y criterios definidos que permita demostrar una mejora medible.')
p('La evidencia disponible es cualitativa y corresponde a tres personas. No se calcularon tasas de éxito, satisfacción ni reducción de tiempos, y no se evaluó la recuperación de una mascota en una emergencia real. Los resultados permiten orientar decisiones de diseño, pero todavía no confirman la aceptación general del producto ni su eficacia para localizar mascotas.')

# 4
page();h('3 Propuesta de mejora')
h('3 1 Evolución de la experiencia de uso',2)
p('Priorizamos las mejoras que respondían directamente a los comentarios de la primera ronda. La versión actual permite observar cambios en las fichas, la presentación de las ubicaciones, el mapa y el centro de avisos. Las capturas de los anexos B y C muestran el diseño vigente con datos de demostración; no son registros de las sesiones con participantes.')
table(['Necesidad detectada','Respuesta en la versión actual','Verificación pendiente'],[
 ('Comprender la ubicación','Se presenta como ubicación conocida, con antigüedad y aclaración de que no indica una posición en tiempo real.','Comprobar que el propietario comprende el alcance sin explicación del equipo.'),
 ('Incorporar fotos','La ficha permite elegir una imagen, previsualizarla y guardarla con los datos de la mascota.','Comprobar la facilidad de carga y edición en distintos dispositivos.'),
 ('Distinguir puntos del mapa','Los puntos de pérdida se muestran en rojo y los avistamientos en verde, acompañados de una leyenda.','Verificar que los participantes distinguen ambas referencias.'),
 ('Controlar la acumulación de avisos','El centro de avisos permite marcar como leídos, marcar todos y eliminar registros.','Revisar si sigue habiendo eventos innecesarios y definir reglas para reducirlos.')],[3.6,6.6,6.4])
h('3 2 Detalles funcionales relevantes',2)
p('La ficha con fotografía fortalece la identificación visual y permite mantener la información de cada mascota en un mismo lugar. El formulario distingue los datos principales de la información opcional para que el propietario pueda completar primero lo indispensable y ampliar la ficha cuando lo necesite.')
p('En el mapa, la diferencia entre puntos de pérdida y avistamiento ayuda a interpretar la búsqueda. La leyenda acompaña los colores para explicar su significado. Un avistamiento conserva su carácter de reporte por revisar; su registro no confirma que la mascota haya sido encontrada.')
p('En los avisos, las opciones de lectura y eliminación dan control sobre la información acumulada. Este cambio aborda su gestión, pero no demuestra que se haya eliminado la causa de la saturación. La reducción de eventos repetitivos o poco útiles se mantiene como mejora prioritaria para la siguiente iteración.')
h('3 3 Criterio para conservar o ajustar el diseño',2)
p('Conservaremos las funciones que los participantes comprendan y utilicen en las tareas de búsqueda. Si una persona sigue interpretando las ubicaciones como rastreo automático, revisaremos el texto, la ubicación de las aclaraciones y la forma de presentar el mapa. Si el alcance manual reduce el interés por la web, reconsideraremos la propuesta de valor antes de ampliar funciones.')

# 5
page();h('4 Toma de decisiones y plan de acción')
h('4 1 Decisión sobre la continuidad del proyecto',2)
p('La continuidad se orientará a PetGuard como plataforma web para identificar mascotas y organizar su búsqueda mediante información registrada por las personas. El collar y su integración electrónica se excluyen del proyecto. La web deberá demostrar su utilidad por la claridad de las fichas, la consulta de referencias de ubicación y la gestión de alertas y avistamientos.')
p('El objetivo general actualizado es desarrollar y validar una plataforma web que permita a propietarios de perros y gatos organizar la identificación y búsqueda de sus mascotas mediante fichas con fotografía, ubicaciones conocidas, alertas y reportes de avistamiento.')
p('Los objetivos específicos son mejorar la claridad de las fichas y mapas; facilitar el registro y seguimiento de casos; gestionar avisos relevantes; y evaluar la comprensión, facilidad de uso y utilidad percibida con propietarios del público objetivo. Esta reformulación sustituye los objetivos de construcción y transmisión de datos del collar planteados en el informe anterior.')
h('4 2 Plan de la segunda ronda',2)
p('Proponemos una segunda ronda presencial con cinco propietarios de perros o gatos: los tres participantes iniciales y, si la disponibilidad lo permite, dos personas nuevas. Esta composición permitiría comparar percepciones y observar el primer uso sin familiaridad previa. La convocatoria y ejecución quedan programadas para después de la entrega de la EC3.')
p('Cada sesión durará aproximadamente 20 a 25 minutos. Se explicará que la prueba evalúa la web y se utilizarán datos ficticios. Primero se solicitará registrar una mascota con foto, consultar una ubicación y explicar su significado, activar una alerta, registrar un avistamiento e interpretar los colores del mapa. Finalmente se pedirá gestionar avisos y responder una breve entrevista. El moderador registrará la ayuda ofrecida y evitará resolver anticipadamente las tareas.')
p('Como metas propuestas, al menos cuatro de cinco participantes deberán completar sin ayuda cada tarea principal y distinguir correctamente la referencia de pérdida del avistamiento. Todos deberán comprender que la web no rastrea a la mascota por GPS. Se recogerán puntuaciones de claridad y utilidad de 1 a 5, con una meta de mediana igual o superior a 4. Estos valores son criterios para la próxima prueba, no resultados obtenidos.')
table(['Momento propuesto','Acción y responsable por función','Resultado esperado'],[
 ('Antes de entregar el 10 de noviembre de 2026','Equipo de documentación y desarrollo revisa alcance, capturas y coherencia del informe.','EC3 consistente con el MVP demostrado.'),
 ('Días 1 y 2 tras la entrega','Desarrollo revisa generación de avisos; validación prepara participantes e instrumentos.','Versión de prueba e instrumentos listos.'),
 ('Días 3 y 4','Responsable de validación realiza sesiones; observador registra evidencia.','Fichas por participante y comentarios.'),
 ('Día 5','El equipo consolida resultados y prioriza cambios.','Decisiones vinculadas a evidencia y nueva lista de mejoras.')],[3.5,8.1,5])

# 6
page();h('5 Referencias')
p('Equipo PetGuard. (s. f.). Sistema inteligente para la identificación, localización y recuperación de mascotas ante emergencias [Informe previo del proyecto, documento de trabajo]. Universidad de Ingeniería y Tecnología.')
p('Equipo PetGuard. (2026). PetGuard MVP [Aplicación web y documentación del proyecto: README, matriz de requisitos y código de la versión revisada el 9 de noviembre de 2026].')
p('Volodina, L. (s. f.). Proyectos Interdisciplinarios 3 sesión 13 tareas EC3 y P2 [Diapositivas del curso]. Universidad de Ingeniería y Tecnología.')
h('6 Anexos')
h('Anexo A Síntesis de la primera ronda',2)
p('Este registro consolida la información comunicada por el equipo sobre las pruebas realizadas. Resume los hallazgos disponibles y no sustituye fichas individuales ni transcripciones de las sesiones.')
table(['Campo','Registro disponible'],[
 ('Modalidad y participantes','Prueba presencial con tres propietarios: dos de perros y uno de gato.'),
 ('Actividades','Registro de mascota, consulta de ubicación, activación de alerta y registro de avistamiento.'),
 ('Observaciones','Confusión sobre ubicación manual; acumulación de avisos; solicitud de fotos y colores distintos para alertas en el mapa.'),
 ('Respuesta del equipo','Mejoras de información, fotografías, diferenciación del mapa y gestión de avisos.'),
 ('Seguimiento','Uso posterior sin nuevas observaciones comunicadas al equipo al momento del informe.'),
 ('Datos no registrados','Fecha exacta de las sesiones, tiempos por tarea, errores, ayudas y comentarios individuales.')],[4.2,12.4])
p('La versión ilustrada en los siguientes anexos contiene información de demostración. Las capturas documentan la interfaz actual y su relación con las mejoras descritas; no acreditan por sí mismas la participación de usuarios en la validación.')

def screenshot(name,width,caption):
 f=TMP/name
 if f.exists():
  para=d.add_paragraph();para.alignment=WD_ALIGN_PARAGRAPH.CENTER;para.add_run().add_picture(str(f),width=Inches(width))
  p(caption,'Caption')
 else: raise FileNotFoundError(f)

# 7
page();h('Anexo B Diseño actual del MVP',2)
screenshot('mapa.png',6.3,'Figura 1. Mapa del caso de búsqueda con punto de pérdida en rojo, avistamientos en verde y leyenda. Datos de demostración.')
screenshot('ficha.png',3.7,'Figura 2. Formulario de mascota con opción para elegir fotografía e información complementaria. Datos de demostración.')

# 8
page();h('Anexo C Ubicaciones conocidas y gestión de avisos',2)
screenshot('ubicaciones.png',6.3,'Figura 3. Consulta de ubicaciones conocidas con aclaración sobre la ausencia de seguimiento en tiempo real. Datos de demostración.')
screenshot('avisos.png',6.3,'Figura 4. Centro de avisos con opciones de lectura y eliminación. Datos de demostración.')

# 9
page();h('Anexo D Instrumentos para la segunda ronda',2)
p('Instrumentos propuestos para la siguiente prueba. Deben completarse durante cada sesión; no contienen resultados de la primera ronda.')
h('Ficha de observación',3)
p('Código del participante: __________   Fecha: __________\nMascota a su cuidado: perro / gato / ambos\nDispositivo y navegador: ______________________________\nParticipó en la primera ronda: sí / no')
p('Consigna inicial: imagine que necesita organizar la búsqueda de su mascota. Utilice datos ficticios. La prueba evalúa la página y puede detenerse en cualquier momento. El observador anotará los pasos realizados, las dificultades y cualquier ayuda brindada.')
table(['Tarea','Resultado y ayuda','Tiempo','Observación'],[
 ('Registrar mascota y foto','________','_____','________'),
 ('Consultar ubicación y explicar qué representa','________','_____','________'),
 ('Activar alerta de extravío','________','_____','________'),
 ('Registrar avistamiento e interpretar el mapa','________','_____','________'),
 ('Revisar y eliminar avisos','________','_____','________')],[6.6,4,2,4])
p('Clasificación del resultado: completada sin ayuda, completada con ayuda o no completada. Medir el tiempo en segundos desde la presentación de la tarea hasta su finalización. Conservar el comentario del participante separado de la interpretación del observador.')
h('Preguntas posteriores',3)
for txt in [
 '1. ¿De dónde proviene la ubicación que muestra PetGuard? ¿Permite saber dónde está la mascota en este momento?',
 '2. ¿Qué representa el punto rojo del mapa y qué representa el verde?',
 '3. ¿Qué avisos le resultaron útiles y cuáles eliminaría o evitaría recibir?',
 '4. Del 1 al 5, ¿qué tan clara fue la información? 1 significa nada clara y 5 muy clara.',
 '5. Del 1 al 5, ¿qué tan útil le resultaría esta web para organizar una búsqueda? 1 significa nada útil y 5 muy útil.',
 '6. ¿Utilizaría PetGuard con ubicaciones registradas manualmente? ¿Por qué? ¿Qué cambiaría primero?']:
 p(txt)
h('Consolidación de resultados',3)
p('Calcular por tarea el número de participantes que la completaron sin ayuda y dividirlo entre quienes la intentaron. Presentar también las cantidades absolutas y la mediana de los tiempos y de las valoraciones. Agrupar comentarios por tema y registrar cada decisión con su evidencia: dificultad observada, cambio propuesto, prioridad y responsable. Si alguien espera rastreo GPS, revisar esa expectativa antes de considerar validado el alcance web.')

d.core_properties.title='PetGuard Informe del avance del Proyecto fase de experimentación EC3'
d.core_properties.subject='Diseño validación mejoras y plan de acción del MVP web'
d.core_properties.author='Equipo PetGuard'
dest=OUT/'PetGuard_Informe_EC3.docx';d.save(dest);print(dest)
