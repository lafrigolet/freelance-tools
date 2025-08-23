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


// helper hash
function computeHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

async function processUserQueue(userId) {
  const queueRef = db.collection("emit").doc(userId).collection("queue");
  const snapshot = await queueRef.orderBy("queuedAt").get();

  if (snapshot.empty) return;

  for (const doc of snapshot.docs) {
    const rfe = doc.data();

    try {
      // Simulación de envío a AEAT
      const res = await fakeSendToAEAT(rfe);

      if (!res.ok) {
        console.warn(`Fallo envío RFE ${doc.id} del usuario ${userId}`);
        // dejamos de procesar más RFEs para este usuario
        break;
      }

      // Envío correcto → marcamos como enviado y borramos de la cola
      await doc.ref.delete();

      // Opcional: actualizar en rfes/{userId} → status "sent"
      await db
        .collection("rfes")
        .doc(userId)
        .collection("userRfes")
        .doc(doc.id)
        .update({
          status: "sent",
          sentAt: new Date(),
        });

      console.log(`RFE ${doc.id} enviado correctamente para usuario ${userId}`);
    } catch (err) {
      console.error(`Error procesando RFE ${doc.id} de ${userId}:`, err);
      // no continuar con más RFEs de este usuario
      break;
    }
  }
}

export const emit = onCall({ region: "us-central1" }, async ({ auth, data }) => {
  const db = getFirestore();
  const { formData, tipo } = data; // tipo: "ALTA" | "ANULACION" | "EVENTO"
  const userId = auth?.uid;

  if (!userId) {
    return { success: false, error: "Usuario no autenticado" };
  }

  try {
    const rfeData = convertToRFE(formData, tipo); // función adaptada según tipo
    const rfeId = formData.numeroFactura || Date.now().toString();

    const userRef = db.collection("users").doc(userId);
    const rfesRef = db.collection("rfes").doc(userId).collection("userRfes").doc(rfeId);
    const emitRef = db.collection("emit").doc(userId).collection("queue").doc(rfeId);

    // Ejecutamos todo de forma transaccional
    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const lastHash = userSnap.get("rfes.lastHash") || null;

      // Calcular hash actual encadenado
      const currentHash = computeHash({
        ...rfeData,
        prevHash: lastHash,
        rfeId,
        tipo,
        timestamp: Date.now(),
      });

      const fullRfe = {
        ...rfeData,
        tipo,
        prevHash: lastHash,
        hash: currentHash,
        createdAt: FieldValue.serverTimestamp(),
      };

      // 1. Guardar RFE encadenado en colección oficial
      tx.set(rfesRef, fullRfe);

      // 2. Guardar en la cola de emisión (emit queue)
      tx.set(emitRef, {
        ...fullRfe,
        status: "pending", // pendiente de enviar a AEAT
        queuedAt: FieldValue.serverTimestamp(),
      });

      // 3. Actualizar el lastHash del usuario
      tx.set(
        userRef,
        { rfes: { lastHash: currentHash } },
        { merge: true }
      );
    });

    // Avoid collision if the same user is sending several RFEs
    await processUserQueue(userId);

    return { success: true, rfeId };
  } catch (err) {
    console.error("Error en emit:", err);
    return { success: false, error: err.message };
  }
});

// Simulación envío a AEAT
async function fakeSendToAEAT(rfeData) {
  console.log("Enviando a AEAT:", rfeData);
  // aquí luego implementas el SOAP/REST real
  return { ok: true };
}
