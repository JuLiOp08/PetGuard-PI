# 02 — Preparar y abrir mensajes de WhatsApp

**What to build:** Tras activar la alerta, el propietario revisa el mensaje para cada destinatario elegido, abre cada chat de WhatsApp mediante una acción explícita y puede retomar los pendientes desde el caso.

**Blocked by:** 01 — Elegir a quién avisar al activar una alerta.

**Status:** ready-for-agent

- [ ] El mensaje contiene nombre de mascota, fecha y hora, referencia, teléfono de contacto disponible y enlace directo al punto del mapa.
- [ ] El propietario ve el texto antes de abrir WhatsApp y puede abrir cada destinatario por separado.
- [ ] La interfaz indica que `922 165667` es la cuenta esperada y pide comprobar la sesión activa; no afirma controlar la cuenta remitente.
- [ ] La interfaz distingue pendiente de chat abierto y nunca afirma envío o entrega.
- [ ] El progreso local persiste y se puede retomar desde el caso.
- [ ] Si falla o se cancela la apertura de WhatsApp, la alerta sigue activa y el destinatario continúa pendiente.
- [ ] Los enlaces hacia contactos reales están normalizados con prefijo peruano; los números ficticios no generan enlaces operativos.
