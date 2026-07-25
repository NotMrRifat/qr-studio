/**
 * Diagnostic endpoint to check configuration presence (without exposing secrets).
 * GET /api/debug
 */
export default function handler(req, res) {
  res.status(200).json({
    BOT_TOKEN_exists: !!process.env.BOT_TOKEN,
    ADMIN_ID_exists: !!process.env.ADMIN_ID,
    WEBSITE_URL_exists: !!process.env.WEBSITE_URL,
    WEBSITE_URL_value: process.env.WEBSITE_URL || "not configured (defaults to https://eliteqrgenerator.vercel.app)",
    ADMIN_ID_value_preview: process.env.ADMIN_ID 
      ? `${process.env.ADMIN_ID.slice(0, 3)}***${process.env.ADMIN_ID.slice(-2)}` 
      : "not configured"
  });
}
