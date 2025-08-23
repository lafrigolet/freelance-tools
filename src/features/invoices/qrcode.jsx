import React, { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

/**
 * Componente QRCode para facturas según AEAT.
 *
 * Props:
 * - nif (string): NIF del emisor
 * - numserie (string): Serie + número de la factura
 * - fecha (string): Fecha de expedición en formato DD-MM-AAAA
 * - importe (number|string): Importe total con punto decimal
 * - verificable (boolean): true = verificable (VERI*FACTU), false = no verificable
 * - produccion (boolean): true = entorno producción, false = entorno pruebas
 */
export default function QRCode({
  nif,
  numserie,
  fecha,
  importe,
  verificable = true,
  produccion = false
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function generarQR() {
      try {
        // Base URL según verificable/no verificable y entorno
        let baseURL;
        if (verificable) {
          baseURL = produccion
            ? "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR"
            : "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR";
        } else {
          baseURL = produccion
            ? "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu"
            : "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu";
        }

        const url = `${baseURL}?nif=${encodeURIComponent(
          nif
        )}&numserie=${encodeURIComponent(
          numserie
        )}&fecha=${encodeURIComponent(fecha)}&importe=${encodeURIComponent(
          importe
        )}`;

        // Generar DataURL del QR
        const dataUrl = await QRCodeLib.toDataURL(url, {
          errorCorrectionLevel: "M",
          width: 300,
          margin: 2
        });

        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Error generando QR:", err);
      }
    }

    generarQR();
  }, [nif, numserie, fecha, importe, verificable, produccion]);

  if (!qrDataUrl) {
    return <p>Generando QR...</p>;
  }

  return <img src={qrDataUrl} alt="Código QR de la factura AEAT" />;
}
