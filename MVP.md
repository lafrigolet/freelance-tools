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
- [x] Create Firebase Cloud Function to generate RFE
- [ ] Calculate SHA-256 hash + chained hash from previous record
- [x] Save RFE in Firestore collection `rfes`
- [x] Add timestamp
- [ ] Add digital signature placeholder
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
