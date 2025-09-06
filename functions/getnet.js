import { onCall } from "firebase-functions/v2/https";
import crypto from "crypto";

// Configure your merchant values
// firebase functions:config:set getnet.merchant_id="YOUR_MERCHANT_ID" getnet.terminal="1" getnet.secret="YOUR_SECRET_KEY" getnet.url="https://sis-t.redsys.es:25443/sis/realizarPago"

// const MERCHANT_ID = functions.config().getnet.merchant_id;
// const TERMINAL = functions.config().getnet.terminal;
// const SECRET = functions.config().getnet.secret;
// const TPV_URL = functions.config().getnet.url;

const MERCHANT_ID = "";
const TERMINAL = "";
const SECRET = "";
const TPV_URL = "";

export const createOrderBak = onCall({ region: "europe-west1" }, async (request) => {
  try {
    const { amount, orderId } = request.data;

    // Redsys requires amount in cents
    const amountInCents = Math.round(Number(amount) * 100).toString();

    // Order number must be 4–12 digits
    const order = orderId || Date.now().toString().slice(-12);

    // Merchant parameters
    const merchantParams = {
      DS_MERCHANT_AMOUNT: amountInCents,
      DS_MERCHANT_ORDER: order,
      DS_MERCHANT_MERCHANTCODE: MERCHANT_ID,
      DS_MERCHANT_CURRENCY: "978", // EUR
      DS_MERCHANT_TRANSACTIONTYPE: "0", // standard payment
      DS_MERCHANT_TERMINAL: TERMINAL,
      DS_MERCHANT_MERCHANTURL: "https://yourapp.com/api/payment-callback",
      DS_MERCHANT_URLOK: "https://yourapp.com/payment/success",
      DS_MERCHANT_URLKO: "https://yourapp.com/payment/failure",
      DS_MERCHANT_CONSUMERLANGUAGE: "001"
    };

    // Encode merchant params
    const merchantParamsB64 = Buffer.from(
      JSON.stringify(merchantParams)
    ).toString("base64");

    // Signature calculation
    const key = Buffer.from(SECRET, "base64");
    const iv = crypto.createHash("sha256").update(order).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv.slice(0, 16));
    const macKey = Buffer.concat([
      cipher.update(Buffer.alloc(0)),
      cipher.final()
    ]);
    const signature = crypto
          .createHmac("sha256", macKey)
          .update(merchantParamsB64)
          .digest("base64");

    return {
      redirectUrl: TPV_URL,
      merchantParams: merchantParamsB64,
      signature,
      signatureVersion: "HMAC_SHA256_V1"
    };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating Getnet TPV order"
    );
  }
}
                                    );
export const createOrder = onCall({ region: "europe-west1" }, async (request) => {
  console.log("createOrder called...");
  return;
});
