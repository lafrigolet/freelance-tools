import { onCall, onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

//  Function: receive formData, convert → save → send AEAT
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

    // 1. Save into rfes
    await db
      .collection("rfes")
      .doc(userId)
      .collection("userRfes")
      .doc(invoiceId)
      .set({
        ...rfeData,
        prevHash: "hash-previo...", // 🔗 enlace al hash anterior si usas cadena
        createdAt: FieldValue.serverTimestamp(),
      });

    // 2. Send to AEAT (placeholder call)
    const aeatResponse = await fakeSendToAEAT(rfeData);

    if (!aeatResponse.ok) {
      // rollback
      await db
        .collection("rfes")
        .doc(userId)
        .collection("userRfes")
        .doc(invoiceId)
        .delete();

      return { success: false, error: "Error en AEAT" };
    }

    return { success: true, rfeId: invoiceId };
  } catch (err) {
    console.error("Error en emitInvoice:", err);
    return { success: false, error: err.message };
  }
});

// Simulación envío a AEAT
async function fakeSendToAEAT(rfeData) {
  console.log("Enviando a AEAT:", rfeData);
  // aquí luego implementas el SOAP/REST real
  return { ok: true };
}
