# User Management with Firebase

This branch handles firebase setup. It is intented to keep all the logic
for switching between firebase or emulator deploying.

## Deploy to emulators
1. npm install
2. firebase init
3. firebase init functions (just in case you want to add functions)
4. firebase emulators:start 
5. npm run dev

---
## Deploy to Firebase

---
## Files
src/
 ├─ firebase.js
 └─ firebase-emulators.js

# Gestión de RFEs y Eventos según Verifactu

## 1. Registros de Facturación Electrónica (RFEs)

- **Qué son**: cada factura emitida (o su anulación) genera un RFE.  
- **Encadenamiento**:  
  - Cada RFE incluye un `hash` propio calculado sobre sus datos + el `prevHash` del RFE anterior.  
  - Esto garantiza integridad e inmutabilidad de la secuencia.  
- **Cadena**:  
  - Se construye **por usuario (obligado tributario)**.  
  - El primer RFE de cada usuario tiene `prevHash = null`.  
  - El último hash válido de cada usuario se guarda en `users/{userId}.rfes.lastHash`.  
- **Envío a la AEAT**:  
  - Solo la cadena de RFEs (altas y anulaciones) es la que se envía a la AEAT.  
  - La AEAT valida que cada nuevo RFE tenga un `prevHash` que coincide con el último aceptado.  
  - Si falta un RFE (hueco), la AEAT rechaza ese y todos los posteriores hasta que se regularice.  
- **Duplicados**:  
  - Si un RFE se envía dos veces con el mismo contenido y hash, la AEAT responde “duplicado”.  
  - Se debe marcar igualmente como enviado (no reintentar más).  

---

## 2. Eventos

- **Qué son**: registros especiales que documentan incidencias en el sistema (fallos de transmisión, actualizaciones, errores internos, etc.).  
- **Encadenamiento**:  
  - Los eventos forman su **propia cadena separada** con `hash` y `prevHash`.  
  - También es **por usuario**: cada obligado tributario tiene su secuencia de eventos.  
  - El último hash de esta cadena se guarda en `users/{userId}.eventos.lastHash`.  
- **Alcance**:  
  - Los eventos **no se envían a la AEAT**.  
  - Sirven para trazabilidad y cumplimiento legal en inspecciones.  
- **Finalidad**:  
  - Demostrar que, aunque hubiera fallos de comunicación con la AEAT, el sistema registró y encadenó todo lo ocurrido.  
  - Mantener la cadena local íntegra y auditable.  

---

## 3. Gestión de incidencias y reintentos

- **Reintentos automáticos**:  
  - El sistema debe intentar reenviar los RFEs hasta que la AEAT los acepte.  
  - La norma no fija un número concreto, pero sí exige que se intente de manera razonable.  
- **Cuando no se consigue enviar**:  
  - El RFE se conserva en la base de datos local.  
  - Se genera un **evento de incidencia** encadenado en la cadena de eventos.  
  - El usuario debe ser notificado y, llegado el caso, regularizar la situación manualmente.  
- **No romper la cadena**:  
  - Aunque un RFE no haya sido aceptado por la AEAT, la cadena local sigue creciendo.  
  - La AEAT no aceptará los siguientes hasta que falte el hueco, por lo que el sistema debe controlar el orden de envío.  

---

## 4. Arquitectura en Firestore (ejemplo)

- `rfes/{userId}/{rfeId}`  
  - Cada RFE encadenado (altas y anulaciones).  
  - Contiene `prevHash`, `hash`, `createdAt`.  

- `eventos/{userId}/{eventoId}`  
  - Cada evento de incidencia encadenado.  
  - Contiene `prevHash`, `hash`, `tipo`, `descripcion`, `createdAt`.  

- `users/{userId}`  
  - `rfes.lastHash`: último hash de la cadena de RFEs.  
  - `eventos.lastHash`: último hash de la cadena de eventos.  

- `emit/queue/{rfeId}`  
  - Cola global de RFEs pendientes de enviar a la AEAT.  
  - Cada documento indica `userId`, `queuedAt`, `status`.  
  - El consumidor los procesa en orden por usuario, eliminando los enviados y dejando los fallidos para reintento.  

---

## 5. En resumen

- Existen **dos cadenas de hash paralelas** por usuario:  
  - **RFEs** (facturación, para la AEAT).  
  - **Eventos** (incidencias, solo local).  
- La **cadena de RFEs** debe llegar íntegra y sin huecos a la AEAT.  
- La **cadena de eventos** se guarda en local para trazabilidad.  
- El sistema debe manejar reintentos, detectar duplicados y registrar incidencias.  
- Firestore actúa como la fuente de verdad, la AEAT solo recibe la copia de los RFEs.  


# Tipos de Eventos

## 1. Eventos técnicos (incidencias de transmisión o sistema)

Documentan fallos en la operación normal:

- **Fallo en transmisión a la AEAT**  
  - Intento de envío fallido (error de red, rechazo de servidor, timeout).  
- **Fallo de conectividad**  
  - Corte de internet, red caída, imposibilidad de comunicación.  
- **Caída del sistema informático**  
  - Interrupción inesperada del software de facturación.  
- **Reintento de transmisión**  
  - Cada intento de reenvío de un RFE que falló anteriormente.  

---

## 2. Eventos operativos del sistema

Relacionados con la configuración y el uso del software:

- **Alta de sistema informático**  
  - Primer uso de un sistema de facturación registrado.  
- **Cambio de versión del software**  
  - Actualización de la aplicación (ej. nueva release).  
- **Cambio de instalación**  
  - Nuevo número de instalación o traslado a otro servidor/entorno.  
- **Alta de usuario en el sistema**  
  - Cuando un nuevo obligado tributario empieza a emitir con la aplicación.  
- **Baja de usuario en el sistema**  
  - Cuando un usuario deja de utilizar la aplicación para facturar.  

---

## 3. Eventos de trazabilidad y auditoría

Sirven para reforzar la integridad de la cadena:

- **Registro de auditoría interna**  
  - Indicar que se ha realizado una revisión interna de integridad de RFEs.  
- **Regularización posterior**  
  - Evento que documenta la recuperación de un RFE que no pudo enviarse en el momento debido.  
- **Corrección de configuración**  
  - Cambio en parámetros de seguridad, certificados, claves, etc.  

---

## 4. Encadenamiento de eventos

- Igual que los RFEs, cada evento incluye:  
  - `prevHash` → hash del evento anterior.  
  - `hash` → hash propio calculado sobre sus datos.  
- Cada usuario tiene su **propia cadena de eventos** (`users/{userId}.eventos.lastHash`).  
- Estos eventos **no se envían a la AEAT**, solo se guardan localmente como parte de la trazabilidad obligatoria.  

---

## Resumen

- **Eventos técnicos** → fallos y reintentos.  
- **Eventos operativos** → altas, bajas, cambios de sistema.  
- **Eventos de trazabilidad** → auditorías, regularizaciones.  
- Todos encadenados, pero solo en tu sistema.  


# Flujo de gestión de una factura impagada

## 1. Emisión
- Se emite la factura al cliente.
- Se registra en:
  - **Libro de facturas expedidas**.
  - **Cadena de RFEs** (Verifactu).
- Se declara el **IVA repercutido** en el Modelo 303 correspondiente, aunque no esté cobrada.

---

## 2. Impago
- El cliente no paga en la fecha acordada.
- Debes realizar gestiones de cobro:
  - Recordatorios.
  - Burofax o requerimiento notarial.
  - Incluso reclamación judicial.

---

## 3. Plazo legal para rectificar
- Según el art. 80 de la Ley del IVA:
  - Autónomos/empresas con volumen < 6M €: **6 meses** desde el devengo.
  - Empresas grandes: **1 año**.
- Si en ese plazo no se ha cobrado → la factura es **incobrable** a efectos de IVA.

---

## 4. Requisitos para recuperar el IVA
1. Haber reflejado la factura en los **libros registro** y haber declarado el IVA en su día.  
2. Que el cliente figure como **deudor moroso** (insolvencia o impago real).  
3. Haber reclamado el cobro de forma **fehaciente** (judicial, notarial o requerimiento administrativo).  

---

## 5. Emisión de factura rectificativa
- Se expide una **factura rectificativa negativa**, anulando la cuota de IVA repercutida.  
- Debe quedar encadenada en la **cadena de RFEs**.  
- Se anota en el **libro registro de facturas expedidas**.  

---

## 6. Declaración en el Modelo 303
- La factura rectificativa se incluye en el trimestre en que se emite.  
- Se **recupera el IVA** ingresado en su momento.  

---

## 7. Tratamiento contable y fiscal
- En contabilidad, se registra la pérdida por **deterioro de crédito**.  
- En IRPF o IS, la pérdida puede ser deducible si se cumplen los requisitos.  

---

## Resumen
1. Emitir factura → declarar IVA repercutido.  
2. Si no se cobra → reclamar al cliente.  
3. Tras 6 meses/1 año → posibilidad de rectificación.  
4. Emitir factura rectificativa negativa.  
5. Recuperar el IVA en el Modelo 303.  
6. Registrar la pérdida como gasto deducible.  
