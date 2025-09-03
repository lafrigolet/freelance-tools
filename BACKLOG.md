# Backlog de Épicas y User Stories

## Épica 1: Emisión de facturas

### Creación y estructura de la factura
- [ ] (1) Como autónomo, quiero emitir una factura fácilmente con todos los datos obligatorios, para poder cumplir con la normativa de la AEAT.  
- [ ] (7) Como autónomo, quiero definir diferentes tipos de IVA y retenciones (IRPF, recargo de equivalencia, etc.), para que las facturas se ajusten a cada cliente y régimen.  
- [ ] Como usuario, quiero poder añadir varios ítems en la factura (descripción, cantidad, precio unitario, tipo de IVA) para reflejar los servicios/productos vendidos.  
- [ ] Como usuario, quiero que el sistema calcule automáticamente subtotal, IVA y total de la factura para evitar errores manuales.  
- [ ] Como usuario, quiero definir diferentes tipos de IVA por ítem (21%, 10%, 4%) para cumplir con las reglas fiscales.  
- [ ] Como usuario, quiero poder marcar si una factura está exenta de IVA e incluir el motivo legal (ej. exportación, operación intracomunitaria).  
- [ ] Como usuario, quiero que el número de factura se genere automáticamente de forma secuencial para cumplir normativa.  

### Datos del emisor y del receptor
- [ ] Como usuario, quiero guardar mis datos fiscales como emisor (NIF, dirección, razón social) para que se rellenen automáticamente en cada factura.  
- [ ] Como usuario, quiero poder registrar clientes con sus datos fiscales y seleccionarlos al crear la factura para ahorrar tiempo.  
- [ ] Como usuario, quiero que el sistema valide automáticamente el NIF intracomunitario (VIES) para operaciones UE.  

### Gestión de estados
- [ ] Como usuario, quiero que al emitir una factura quede marcada con estado emitida para diferenciarla de borradores.  
- [ ] Como usuario, quiero poder guardar una factura en estado borrador para revisarla antes de emitirla.  
- [ ] Como usuario, quiero poder cancelar un borrador, pero no una factura ya emitida, para cumplir la normativa de inmutabilidad.  

### Formatos y salidas
- [ ] Como usuario, quiero generar un PDF de la factura con diseño profesional para enviarlo a mis clientes.  
- [ ] Como usuario, quiero exportar la factura en formato FacturaE (XML) para clientes que lo requieran (Administración Pública, grandes empresas).  
- [ ] Como usuario, quiero poder enviar la factura por email directamente desde la aplicación con un clic.  

### Enlaces con cumplimiento y RFE
- [ ] (9) Como autónomo, quiero emitir facturas rectificativas o anulaciones, para poder corregir errores y recuperar el IVA de facturas incobrables.  
- [ ] (16) Como autónomo, quiero configurar diferentes series de facturación (ordinarias, rectificativas, simplificadas), para cumplir con la normativa y separar mis documentos.  
- [ ] (22) Como autónomo, quiero generar facturas recurrentes automáticamente para clientes fijos, para no tener que rehacerlas cada mes.  
- [ ] Como sistema, quiero generar el RFE automáticamente en el momento en que una factura pase de borrador a emitida.  
- [ ] Como sistema, quiero bloquear cualquier modificación en facturas emitidas para garantizar integridad.  
- [ ] Como usuario, quiero poder generar facturas rectificativas vinculadas a originales para cumplir con la normativa.  

### Usabilidad y experiencia
- [ ] Como usuario, quiero clonar una factura ya emitida como base para una nueva, para no repetir datos.  
- [ ] Como usuario, quiero que los campos de fecha de expedición y vencimiento se autocompleten con valores por defecto configurables.  
- [ ] Como usuario, quiero poder añadir notas libres o condiciones de pago visibles en la factura.  

### Cumplimiento y seguridad
- [ ] Como sistema, quiero registrar un historial de cambios en cada factura (quién la creó, cuándo se emitió, si hubo rectificación), para garantizar trazabilidad ante inspecciones.  
- [ ] Como sistema, quiero validar automáticamente que la numeración de facturas sea correlativa sin saltos, para cumplir con la normativa.  
- [ ] Como usuario, quiero poder firmar electrónicamente mis facturas con certificado digital, para reforzar su validez legal.  

### Internacionalización
- [ ] Como usuario, quiero poder emitir facturas en distintos idiomas y monedas, para trabajar con clientes extranjeros.  
- [ ] Como sistema, quiero calcular el IVA intracomunitario o aplicar inversión del sujeto pasivo en operaciones internacionales, para cumplir la normativa europea.  

### Integraciones
- [ ] Como usuario, quiero poder enviar automáticamente mis facturas a mi gestoría (por ejemplo exportación directa a Contaplus, A3, etc.), para ahorrar trabajo administrativo.  

---

## Épica 2: Gestión de cobros y pagos
- [ ] Como autónomo, quiero marcar las facturas como pagadas o impagadas, para controlar mi tesorería y saber qué clientes me deben dinero.  
- [ ] Como autónomo, quiero disponer de un panel con facturas vencidas y pendientes de pago, para priorizar mis reclamaciones de cobro.  
- [ ] Como autónomo, quiero que el sistema me avise si una factura lleva más de X días sin pagar, para poder reclamarla a tiempo.  
- [ ] Como autónomo, quiero configurar recordatorios automáticos de pago para mis clientes, para mejorar la probabilidad de cobro sin tener que perseguirlos manualmente.  
- [ ] Como autónomo, quiero integrar el sistema con mi banco, para conciliar automáticamente cobros y pagos con las facturas.  

---

## Épica 3: Control fiscal y cumplimiento normativo
- [ ] Como autónomo, quiero ver un resumen trimestral de bases e IVA (repercutido y soportado), para saber cuánto tendré que ingresar en el 303.  
- [ ] Como autónomo, quiero que el sistema detecte automáticamente errores comunes en mis facturas (ej. NIF incorrecto, tipo de IVA mal aplicado), para evitar sanciones de la AEAT.  
- [ ] Como autónomo, quiero registrar las facturas recibidas (gastos), para poder deducir el IVA soportado en el modelo 303.  
- [ ] Como autónomo, quiero poder clasificar mis gastos y facturas recibidas por categorías (ej. suministros, material, transporte), para controlar mejor mi contabilidad y deducciones.  

---

## Épica 4: Exportación y acceso a la información
- [ ] Como autónomo, quiero exportar mis facturas y registros a Excel, CSV y PDF, para poder analizarlos o compartirlos con mi gestor.  
- [ ] Como autónomo, quiero consultar estadísticas de facturación por cliente, servicio o periodo, para entender mejor de dónde vienen mis ingresos.  
- [ ] Como autónomo, quiero tener acceso móvil a todas mis facturas y libros de IVA, para poder consultarlos y emitir facturas en cualquier momento.  

---

## Épica 5: Comunicación y documentación
- [ ] Como autónomo, quiero enviar automáticamente las facturas por correo electrónico al cliente, para ahorrar tiempo en la gestión.  
- [ ] Como autónomo, quiero adjuntar justificantes o documentos relacionados a cada factura (presupuestos, albaranes, contratos), para tener todo en un solo lugar.  

# Product Backlog de User Stories sobre facturación de autónomos




| ID | User Story |
|----|------------|



| 25 | Como autónomo, quiero exportar mis facturas y registros a Excel CSV PDF, para poder analizarlos o compartirlos con mi gestor |
| 1  | Como autónomo, quiero emitir una factura fácilmente con todos los datos obligatorios, para poder cumplir con la normativa de la AEAT |
| 11 | Como autónomo, quiero definir diferentes tipos de IVA y retenciones (IRPF, recargo de equivalencia, etc.), para que las facturas se ajusten a cada cliente y régimen |
| 6  | Como autónomo, quiero ver un resumen trimestral de bases e IVA (repercutido y soportado), para saber cuánto tendré que ingresar en el 303 |
| 7  | Como autónomo, quiero marcar las facturas como pagadas o impagadas, para controlar mi tesorería y saber qué clientes me deben dinero |
| 12 | Como autónomo, quiero disponer de un panel con facturas vencidas y pendientes de pago, para priorizar mis reclamaciones de cobro |
| 8  | Como autónomo, quiero que el sistema me avise si una factura lleva más de X días sin pagar, para poder reclamarla a tiempo |
| 9  | Como autónomo, quiero emitir facturas rectificativas o anulaciones, para poder corregir errores y recuperar el IVA de facturas incobrables |
| 13 | Como autónomo, quiero configurar recordatorios automáticos de pago para mis clientes, para mejorar la probabilidad de cobro sin tener que perseguirlos manualmente |
| 15 | Como autónomo, quiero consultar estadísticas de facturación por cliente, servicio o periodo, para entender mejor de dónde vienen mis ingresos |
| 18 | Como autónomo, quiero que el sistema detecte automáticamente errores comunes en mis facturas (ej. NIF incorrecto, tipo de IVA mal aplicado), para evitar sanciones de la AEAT |
| 19 | Como autónomo, quiero configurar diferentes series de facturación (ej. ordinarias, rectificativas, simplificadas), para cumplir con la normativa y separar mis documentos |
| 22 | Como autónomo, quiero enviar automáticamente las facturas por correo electrónico al cliente, para ahorrar tiempo en la gestión |
| 23 | Como autónomo, quiero tener acceso móvil a todas mis facturas y libros de IVA, para poder consultarlos y emitir facturas en cualquier momento |
| 24 | Como autónomo, quiero adjuntar justificantes o documentos relacionados a cada factura (presupuestos, albaranes, contratos), para tener todo en un solo lugar |
| 27 | Como autónomo, quiero integrar el sistema con mi banco, para conciliar automáticamente cobros y pagos con las facturas |
| 5  | Como autónomo, quiero registrar las facturas recibidas (gastos), para poder deducir el IVA soportado en el Modelo 303 |
| 14 | Como autónomo, quiero generar facturas recurrentes automáticamente para clientes fijos, para no tener que rehacerlas cada mes |
| 29 | Como autónomo, quiero poder clasificar mis gastos y facturas recibidas por categorías (ej. suministros, material, transporte), para controlar mejor mi contabilidad y deducciones |



| 28 | Como autónomo, quiero emitir facturas electrónicas en formato Facturae, para poder trabajar con administraciones públicas o clientes que lo requieran |
| 10 | Como autónomo, quiero tener acceso a los libros registro de IVA generados automáticamente, para estar preparado en caso de inspección de la AEAT |
| 26 | Como autónomo, quiero recibir notificaciones antes de presentar el Modelo 303, para no olvidarme de la obligación trimestral |
| 30 | Como autónomo, quiero cambio de instalación o traslado de entorno sin perder mis datos de facturación, para mantener continuidad en el negocio |
| 2  | Como autónomo, quiero guardar automáticamente cada factura en un registro digital (RFE), para tener trazabilidad y seguridad jurídica |
| 3  | Como autónomo, quiero que el sistema numere mis facturas de forma correlativa por serie, para evitar errores y cumplir el reglamento de facturación |
| 4  | Como autónomo, quiero enviar automáticamente las facturas a la AEAT (Verifactu), para no tener que preocuparme de la transmisión manual |
| 16 | Como autónomo, quiero sincronizar mis facturas con mi gestoría o asesor fiscal, para que ellos puedan presentar impuestos sin que yo tenga que enviarles documentos cada trimestre |
| 17 | Como autónomo, quiero tener un historial de todos los intentos de envío de mis RFEs a la AEAT, para poder demostrar trazabilidad en caso de inspección |
| 20 | Como autónomo, quiero gestionar clientes y proveedores desde el mismo sistema, para evitar repetir datos al emitir o registrar facturas |
| 21 | Como autónomo, quiero generar facturas en varios idiomas y divisas, para poder trabajar con clientes internacionales |

