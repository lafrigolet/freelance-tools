# 📌 MVP Roadmap for Veri*Factu App

This document describes the **minimum viable product (MVP)** for a Veri*Factu-compliant invoicing application using **React, Vite, Firebase, Material UI, and Git**.  
Tasks are organized by module and can be tracked using GitHub’s markdown checkboxes.

---

## ✅ 1. Project Setup
- [x] Create GitHub repository and initialize project structure
- [x] Initialize Vite + React + TypeScript project
- [x] Install and configure Material UI (theme, typography, styles)
- [x] Connect project to Firebase (Auth, Firestore, Functions, Storage)
- [x] Define folder structure (`components/`, `pages/`, `services/`, `utils/`, `hooks/`)

---

## ✅ 2. User Management & Security
- [x] Implement Firebase Authentication (email/password, OAuth optional)
- [ ] Define user roles (admin, issuer, client)
- [ ] Create route protection middleware for role-based access

---

## ✅ 3. Invoice Issuance
- [x] Create invoice form (issuer, client, items, taxes)
- [x] Add validation for fiscal data (NIF, VAT, dates)
- [x] Save invoice to Firestore with status `emitida`

---

## ✅ 4. RFE (Registro de Facturación Estándar)
- [ ] Create Firebase Cloud Function to generate RFE
- [ ] Calculate SHA-256 hash + chained hash from previous record
- [ ] Save RFE in Firestore collection `registrosFacturacion`
- [ ] Add timestamp and digital signature placeholder
- [ ] Ensure immutability (append-only, no overwrite)

---

## ✅ 5. QR Code & Invoice Legend
- [ ] Generate QR code with `qrcode.react` containing invoice ID + verification URL
- [ ] Insert QR + mandatory AEAT legend into invoice
- [ ] Implement PDF generation (`react-pdf` or `pdfmake`)

---

## ✅ 6. Event Logging
- [ ] Create Firestore collection for system events
- [ ] Log: user login/logout, invoice creation, updates, app version changes
- [ ] Add timestamp, user, action, and integrity hash for each event
- [ ] Secure Firestore rules to prevent modification/deletion of events

---

## ✅ 7. AEAT Export
- [ ] Implement Firebase Cloud Function to export RFE in AEAT XML format
- [ ] Package XML export into ZIP file
- [ ] Add frontend button “Exportar registros AEAT” to download

---

## ✅ 8. Preparation for Real-Time AEAT Submission (Phase 2)
- [ ] Design pending queue in Firestore for AEAT submissions
- [ ] Prepare Firebase Function endpoint to send records to AEAT (sandbox/test)
- [ ] Implement communication log (sent, accepted, rejected)

---

# 🎯 Deliverables
- Web app with login and user roles  
- Invoice form with fiscal data validation  
- PDF invoice with QR code + mandatory legend  
- RFE with chained hash stored in Firestore  
- Immutable event logs  
- AEAT export in XML/ZIP format  

---

# 📅 Next Steps
- [ ] Implement Phase 2: real-time AEAT submission  
- [ ] Add dashboards for invoice/reporting  
- [ ] Extend to integrations (bank, accounting)  


# Checklist de requisitos Verifactu para software de facturación

## 1. Integridad e inalterabilidad
- [ ] Cada factura debe generar un Registro de Facturación Electrónico (RFE).  
- [ ] El RFE debe incluir un hash encadenado con el registro anterior.  
- [ ] Si se emite una factura rectificativa, debe quedar vinculada a la original.  
- [ ] El sistema no debe permitir la eliminación de facturas.  

## 2. Autenticidad y trazabilidad
- [ ] El RFE debe llevar fecha y hora exactas de generación.  
- [ ] Cada registro debe firmarse digitalmente o incluir un código de autenticidad.  
- [ ] El software debe demostrar que la factura se emitió en el momento registrado.  

## 3. Contenido mínimo del RFE
Debe incluir al menos:  
- [ ] NIF emisor  
- [ ] NIF destinatario (si aplica)  
- [ ] Número de factura  
- [ ] Fecha de expedición  
- [ ] Base imponible, tipo de IVA, cuota de IVA  
- [ ] Total factura  
- [ ] Régimen aplicable (general, simplificado, RECC, intracomunitaria, etc.)  
- [ ] Hash encadenado  

## 4. Modo Verifactu (opcional, pero recomendable)
- [ ] Implementar opción para enviar automáticamente los RFE a la AEAT.  
- [ ] Usar los esquemas XML oficiales que publicará Hacienda.  
- [ ] Si no se activa el envío, el software debe almacenar localmente todos los registros.  

## 5. Conservación y acceso
- [ ] Guardar facturas y RFE durante al menos 6 años.  
- [ ] Mantener un formato legible y exportable (XML, CSV, PDF).  
- [ ] Garantizar accesibilidad inmediata para contribuyente y AEAT.  

## 6. Documentación obligatoria
- [ ] Manual de uso del software.  
- [ ] Manual técnico de generación de RFE y encadenamiento.  
- [ ] Ejemplos de RFE válidos.  
- [ ] Declaración responsable de cumplimiento de Verifactu.  

## 7. Sanciones a evitar
- No usar software homologado → multa hasta 50.000 euros.  
- Alterar o borrar registros → multa entre 1.000 y 150.000 euros.  
