import { initializeApp } from "firebase-admin/app";

initializeApp();

// Users API 
export * from "./users.js";

// Invoices API
export * from "./invoices.js";

// Nordigen API
export * from "./nordigen.js";

