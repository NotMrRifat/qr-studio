/**
 * Helper serverless API endpoint to register the Telegram webhook.
 * Endpoint: GET /api/setWebhook
 */
export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEBSITE_URL = process.env.WEBSITE_URL;

  if (!BOT_TOKEN) {
    res.status(500).json({ error: "BOT_TOKEN environment variable is not defined" });
    return;
  }

  const queryUrl = req.query.url;
  const baseUrl = queryUrl || WEBSITE_URL;

  if (!baseUrl) {
    res.status(500).json({ error: "WEBSITE_URL environment variable is not defined, and no ?url= parameter was provided" });
    return;
  }

  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram`;
  const registerUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    const telegramRes = await fetch(registerUrl);
    const result = await telegramRes.json();

    if (result.ok) {
      res.status(200).json({
        success: true,
        message: "Webhook registered successfully!",
        webhook_url: webhookUrl,
        telegram_response: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to register webhook.",
        telegram_response: result
      });
    }
  } catch (err) {
    console.error("Webhook registration error:", err);
    res.status(500).json({ error: "Exception while registering webhook: " + err.message });
  }
}
