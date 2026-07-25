import QRCode from "qrcode";
import { generateQRValue } from "../lib/qrGenerator.js";

/**
 * Serverless API to generate a QR Code image on the fly.
 * Endpoint: /api/generate
 * Query parameters:
 *  - type: url, text, phone, email, whatsapp, sms, telegram, facebook, instagram, wifi
 *  - data: the content for the QR code
 *  - ssid, password, encryption: (for wifi only)
 *  - margin: padding quiet zone (default: 4)
 *  - size: pixel width/height (default: 512)
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { 
      type = "text", 
      data = "", 
      ssid = "", 
      password = "", 
      encryption = "WPA",
      margin = 4,
      size = 512
    } = req.query;

    // Resolve final string value using the shared library
    let qrValue = "";
    if (type === "wifi") {
      qrValue = generateQRValue("wifi", { ssid, password, encryption });
    } else {
      qrValue = generateQRValue(type, data);
    }

    if (!qrValue) {
      res.status(400).json({ error: "Missing or invalid QR content data" });
      return;
    }

    // Generate QR code PNG buffer
    const qrBuffer = await QRCode.toBuffer(qrValue, {
      type: "png",
      margin: parseInt(margin),
      width: parseInt(size),
      color: {
        dark: "#630D16", // StyMetics Primary Color
        light: "#FFFFFF" // White background
      },
      errorCorrectionLevel: "H" // High error correction
    });

    // Return PNG image headers and body
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.status(200).send(qrBuffer);
  } catch (err) {
    console.error("Error generating QR code:", err);
    res.status(500).json({ error: "Failed to generate QR Code image" });
  }
}
