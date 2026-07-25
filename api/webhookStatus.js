/**
 * Diagnostic endpoint to check webhook config details on Telegram.
 * GET /api/webhookStatus
 */
export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;

  if (!BOT_TOKEN) {
    res.status(500).json({ error: "BOT_TOKEN environment variable is not defined" });
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;

  try {
    const telegramRes = await fetch(telegramUrl);
    const result = await telegramRes.json();

    if (result.ok) {
      const info = result.result;
      res.status(200).json({
        webhook_status: "configured",
        webhook_url: info.url || "none",
        pending_update_count: info.pending_update_count,
        last_error_date: info.last_error_date 
          ? new Date(info.last_error_date * 1000).toISOString() 
          : null,
        last_error_message: info.last_error_message || null,
        has_custom_certificate: info.has_custom_certificate,
        max_connections: info.max_connections,
        allowed_updates: info.allowed_updates || [],
        raw_response: result
      });
    } else {
      res.status(400).json({
        webhook_status: "failed_to_retrieve",
        raw_response: result
      });
    }
  } catch (err) {
    console.error("Webhook status error:", err);
    res.status(500).json({ error: "Exception while fetching webhook info: " + err.message });
  }
}
