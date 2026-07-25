/**
 * Shared QR data normalization helper.
 * Used by both React Frontend and Vercel Serverless Functions.
 */
export function generateQRValue(type, value) {
  if (!value) return "";

  switch (type) {
    case "url": {
      const val = typeof value === "string" ? value.trim() : "";
      if (!val) return "";
      if (/^(https?:\/\/)/i.test(val)) {
        return val;
      }
      return `https://${val}`;
    }
    case "text":
      return value;
    case "phone": {
      const cleaned = typeof value === "string" ? value.replace(/[\s()-]/g, "") : "";
      return `tel:${cleaned}`;
    }
    case "email": {
      const val = typeof value === "string" ? value.trim() : "";
      return `mailto:${val}`;
    }
    case "whatsapp": {
      const val = typeof value === "string" ? value : "";
      let cleaned = val.replace(/\D/g, ""); // Extract digits
      // BD Number check: e.g. starts with '01' (017, 018, 019, 016, 015, 013, 014) and is 11 digits
      if (cleaned.length === 11 && cleaned.startsWith("01")) {
        const prefix = cleaned.substring(0, 3);
        if (["017", "018", "019", "016", "015", "013", "014"].includes(prefix)) {
          cleaned = "88" + cleaned;
        }
      } else if (cleaned.length === 10 && cleaned.startsWith("1")) {
        cleaned = "880" + cleaned;
      }
      return `https://wa.me/${cleaned}`;
    }
    case "sms": {
      const cleaned = typeof value === "string" ? value.replace(/[\s()-]/g, "") : "";
      return `sms:${cleaned}`;
    }
    case "telegram": {
      const cleanUsername = typeof value === "string" ? value.trim().replace(/^@/, "") : "";
      return `https://t.me/${cleanUsername}`;
    }
    case "facebook": {
      const cleanUsername = typeof value === "string" ? value.trim() : "";
      return `https://facebook.com/${cleanUsername}`;
    }
    case "instagram": {
      const cleanUsername = typeof value === "string" ? value.trim().replace(/^@/, "") : "";
      return `https://instagram.com/${cleanUsername}`;
    }
    case "wifi": {
      const { ssid = "", password = "", encryption = "WPA" } = value;
      const cleanSsid = ssid.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
      const cleanPassword = password.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
      
      if (encryption === "none") {
        return `WIFI:T:nopass;S:${cleanSsid};;`;
      }
      return `WIFI:T:${encryption};S:${cleanSsid};P:${cleanPassword};;`;
    }
    default:
      return value;
  }
}
