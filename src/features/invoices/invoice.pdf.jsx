import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
  },
  line: {
    marginBottom: 4,
  },
});

// PDF Component
const InvoicePDF = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Factura #{invoice.numeroFactura}</Text>
        <Text>Fecha: {invoice.fecha}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Emisor</Text>
        <Text>{invoice.emisorNombre}</Text>
        <Text>NIF: {invoice.emisorNIF}</Text>
        <Text>{invoice.emisorDomicilio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Receptor</Text>
        <Text>{invoice.receptorNombre}</Text>
        <Text>NIF: {invoice.receptorNIF}</Text>
        <Text>{invoice.receptorDomicilio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Líneas</Text>
        {invoice.lineas.map((item, i) => {
          const base = item.cantidad * item.precio;
          const iva = (base * item.tipoIVA) / 100;
          const total = base + iva;
          return (
            <Text key={i} style={styles.line}>
              {item.descripcion} — {item.cantidad} x {item.precio}€ (IVA {item.tipoIVA}%)
              = {total.toFixed(2)}€
            </Text>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Forma de Pago</Text>
        <Text>{invoice.formaPago}</Text>
        {invoice.iban && <Text>IBAN: {invoice.iban}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>
          TOTAL:{" "}
          {invoice.lineas
            .reduce((sum, item) => {
              const base = item.cantidad * item.precio;
              const iva = (base * item.tipoIVA) / 100;
              return sum + base + iva;
            }, 0)
            .toFixed(2)}€
        </Text>
      </View>

      <View style={styles.section}>
        <Text>QR Factura AEAT:</Text>
        {qrDataUrl ? <Image src={qrDataUrl} style={styles.qr} /> : <Text>Generando QR...</Text>}
      </View>
    </Page>
  </Document>
);

// Usage in React
export default function InvoicePDFButton({ formData }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={formData} />}
      fileName={`factura-${formData.numeroFactura}.pdf`}
    >
      {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
    </PDFDownloadLink>
  );
}
