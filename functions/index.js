import { onCall, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  sendMagicLinkEmail,
  magicLinkHandler
} from "./users.js";
import smtpConfig from "./nodemailer-conf.js";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";

// Invoices
import { emitInvoice } from "./invoices.js";

initializeApp();


export {
  listUsers,
  addUser,
  deleteUser,
  setUserRole,
  sendMagicLinkEmail,
  magicLinkHandler
};


