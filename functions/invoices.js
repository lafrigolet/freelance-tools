import { onCall, onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto"; // Node built-in

// Simulación envío a AEAT
async function fakeSendToAEAT(rfeData) {
  console.log("Enviando a AEAT:", rfeData);
  // aquí luego implementas el SOAP/REST real
  return { ok: true };
}

// Convert formData → RFE
function convertToRFE(formData) {
  const db = getFirestore();
  
  return {
    Cabecera: {
      Factura: {
        NumeroFactura: formData.numeroFactura,
        FechaExpedicion: formData.fecha,
        FormaPago: formData.formaPago,
        IBAN: formData.iban,
      },
      Emisor: {
        NombreRazon: formData.emisorNombre,
        NIF: formData.emisorNIF,
        Domicilio: formData.emisorDomicilio,
      },
      Receptor: {
        NombreRazon: formData.receptorNombre,
        NIF: formData.receptorNIF,
        Domicilio: formData.receptorDomicilio,
      },
    },
    Lineas: formData.lineas.map(l => ({
      Descripcion: l.descripcion,
      Cantidad: l.cantidad,
      PrecioUnitario: l.precio,
      TipoIVA: l.tipoIVA,
    })),
    Totales: (() => {
      let base = 0, cuota = 0;
      formData.lineas.forEach(l => {
        const lineBase = l.cantidad * l.precio;
        base += lineBase;
        cuota += (lineBase * l.tipoIVA) / 100;
      });
      return {
        BaseImponible: base,
        CuotaIVA: cuota,
        ImporteTotal: base + cuota,
      };
    })(),
  };
}

// inputString='IDEmisorFactura=89890001K&NumSerieFactura=12345679/G34&FechaExpedicionFactura=01-01-2024&TipoFactura=F1&CuotaTotal=12.35&ImporteTotal=123.45&Huella=3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60&FechaHoraHusoGenRegistro=2024-01-01T19:20:35+01:00'

function prepararCadenaRegistroAlta(formData, huellaAnterior = "") {
  // Calcular base imponible
  const base = formData.lineas.reduce((acc, l) => acc + l.cantidad * l.precio, 0);

  // Calcular cuota de IVA total
  const cuotaTotal = formData.lineas.reduce(
    (acc, l) => acc + (l.cantidad * l.precio * l.tipoIVA) / 100,
    0
  );

  // Importe total = base + IVA
  const importeTotal = base + cuotaTotal;

  // Construir cadena en el orden que exige la AEAT
  const cadena =
    `IDEmisorFactura=${formData.emisorNIF}` +
    `&NumSerieFactura=${formData.numeroFactura}` +
    `&FechaExpedicionFactura=${formData.fecha}` +
    `&TipoFactura=F1` + // suponiendo siempre factura completa
    `&CuotaTotal=${cuotaTotal.toFixed(2)}` +
    `&ImporteTotal=${importeTotal.toFixed(2)}` +
    `&Huella=${huellaAnterior}` +
    `&FechaHoraHusoGenRegistro=${new Date().toISOString()}`;

  return cadena;
}

function prepararCadenaRegistroAnulacionFromFormData(formData, huellaAnterior = "") {
  const IDEmisorFacturaAnulada = formData.emisorNIF || "";
  const NumSerieFacturaAnulada = formData.numeroFactura || "";
  const FechaExpedicionFacturaAnulada = formData.fecha || "";
  const FechaHoraHusoGenRegistro = new Date().toISOString();

  const cadena =
    `IDEmisorFacturaAnulada=${IDEmisorFacturaAnulada}` +
    `&NumSerieFacturaAnulada=${NumSerieFacturaAnulada}` +
    `&FechaExpedicionFacturaAnulada=${FechaExpedicionFacturaAnulada}` +
    `&Huella=${huellaAnterior}` +
    `&FechaHoraHusoGenRegistro=${FechaHoraHusoGenRegistro}`;

  return cadena;
}

function prepararCadenaRegistroEvento(formData, huellaEventoAnterior = "") {
  const NIFSistema = formData.emisorNIF || ""; // NIF del sistema
  const IDOtro = formData.idOtro || "";        // ID alternativo si aplica
  const IdSistemaInformatico = formData.idSistema || ""; 
  const Version = formData.version || "1.0";   // versión de tu SIF
  const NumeroInstalacion = formData.numeroInstalacion || "1"; 
  const NIFObligado = formData.emisorNIF || ""; // obligado a emitir (puede coincidir con emisor)
  const TipoEvento = formData.tipoEvento || ""; 
  const FechaHoraHusoGenEvento = new Date().toISOString();

  const cadena =
    `NIF=${NIFSistema}` +
    `&ID=${IDOtro}` +
    `&IdSistemaInformatico=${IdSistemaInformatico}` +
    `&Version=${Version}` +
    `&NumeroInstalacion=${NumeroInstalacion}` +
    `&NIF=${NIFObligado}` +
    `&TipoEvento=${TipoEvento}` +
    `&HuellaEvento=${huellaEventoAnterior}` +
    `&FechaHoraHusoGenEvento=${FechaHoraHusoGenEvento}`;

  return cadena;
}

function calcularHuella(inputString) {
  // Crear el hash SHA-256
  const hash = crypto
    .createHash("sha256")
    .update(inputString, "utf8")
    .digest("hex");

  // Convertir a mayúsculas (formato requerido)
  return hash.toUpperCase();
}

// const cadenaEvento = prepararCadenaRegistroEvento(formData, "");
// const huellaEvento = calcularHuella(cadenaEvento);

// console.log("Cadena Evento:", cadenaEvento);
// console.log("Huella Evento:", huellaEvento);

export const emitInvoice = onCall({ region: "us-central1" }, async ({ auth, data }) => {
  const db = getFirestore();
  const { formData } = data;
  const userId = auth?.uid;

  if (!userId) {
    return { success: false, error: "Usuario no autenticado" };
  }

  try {
    const rfeData = convertToRFE(formData);
    const invoiceId = formData.numeroFactura || Date.now().toString();

    // 1. Get last RFE for user (ordered by createdAt)
    const lastSnap = await db
      .collection("rfes")
      .doc(userId)
      .collection("userRfes")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let prevHash = "GENESIS"; // default for first RFE
    if (!lastSnap.empty) {
      prevHash = lastSnap.docs[0].data().hash || "GENESIS";
    }

    // 2. Compute new hash from RFE + prevHash
    const payloadToHash = JSON.stringify({ ...rfeData, prevHash });
    const hash = crypto.createHash("sha256").update(payloadToHash).digest("hex");

    // 3. Save RFE with hash chain
    await db
      .collection("rfes")
      .doc(userId)
      .collection("userRfes")
      .doc(invoiceId)
      .set({
        ...rfeData,
        prevHash,
        hash,
        createdAt: FieldValue.serverTimestamp(),
      });

    // 4. Send to AEAT (placeholder call)
    const aeatResponse = await fakeSendToAEAT(rfeData);

    if (!aeatResponse.ok) {
      // rollback if AEAT failed
      await db
        .collection("rfes")
        .doc(userId)
        .collection("userRfes")
        .doc(invoiceId)
        .delete();

      return { success: false, error: "Error en AEAT" };
    }

    return { success: true, rfeId: invoiceId, hash };
  } catch (err) {
    console.error("Error en emitInvoice:", err);
    return { success: false, error: err.message };
  }
});
