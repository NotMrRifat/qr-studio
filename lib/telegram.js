/**
 * Telegram Bot API client helpers.
 * Interacts with Telegram Bot API endpoints using native fetch.
 */

// Dynamically resolve configuration on each invocation to avoid caching/race conditions
function getTelegramConfig() {
  const token = process.env.BOT_TOKEN;
  return {
    token,
    apiUrl: token ? `https://api.telegram.org/bot${token}` : null
  };
}

/**
 * Send a text message to a user
 * @param {string|number} chatId
 * @param {string} text
 * @param {object} extraOptions - markup, parse_mode, etc.
 */
export async function sendMessage(chatId, text, extraOptions = {}) {
  const { token, apiUrl } = getTelegramConfig();

  if (!token) {
    console.error("TELEGRAM ERROR: BOT_TOKEN is not defined in environment variables");
    return null;
  }

  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    ...extraOptions
  };

  try {
    const res = await fetch(`${apiUrl}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!data.ok) {
      console.warn("Telegram sendMessage failed:", data.description);
    }
    return data;
  } catch (err) {
    console.error("Error sending Telegram message:", err);
    return null;
  }
}

/**
 * Send a photo (buffer or URL) to a user
 * @param {string|number} chatId
 * @param {Buffer|string} photo - URL string or binary buffer
 * @param {string} caption
 * @param {object} extraOptions
 */
export async function sendPhoto(chatId, photo, caption = "", extraOptions = {}) {
  const { token, apiUrl } = getTelegramConfig();

  if (!token) {
    console.error("TELEGRAM ERROR: BOT_TOKEN is not defined in environment variables");
    return null;
  }

  try {
    // If photo is a string, it represents a URL or file_id
    if (typeof photo === "string") {
      const payload = {
        chat_id: chatId,
        photo: photo,
        caption: caption,
        parse_mode: "HTML",
        ...extraOptions
      };

      const res = await fetch(`${apiUrl}/sendPhoto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      return await res.json();
    }

    // Otherwise, photo is a Buffer - we must send it as multipart/form-data
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    
    // Convert Buffer to a Blob
    const blob = new Blob([photo], { type: "image/png" });
    formData.append("photo", blob, "qr-code.png");

    if (extraOptions.reply_markup) {
      formData.append("reply_markup", JSON.stringify(extraOptions.reply_markup));
    }

    const res = await fetch(`${apiUrl}/sendPhoto`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn("Telegram sendPhoto upload failed:", data.description);
    }
    return data;
  } catch (err) {
    console.error("Error uploading Telegram photo:", err);
    return null;
  }
}

/**
 * Answer a callback query to dismiss loading states on buttons
 */
export async function answerCallbackQuery(callbackQueryId, text = "") {
  const { token, apiUrl } = getTelegramConfig();

  if (!token) return;

  try {
    await fetch(`${apiUrl}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text
      })
    });
  } catch (err) {
    console.error("Error answering callback query:", err);
  }
}

/**
 * Edit a text message to update content (e.g. progress count)
 */
export async function editMessageText(chatId, messageId, text, extraOptions = {}) {
  const { token, apiUrl } = getTelegramConfig();

  if (!token) return null;

  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML",
    ...extraOptions
  };

  try {
    const res = await fetch(`${apiUrl}/editMessageText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error editing Telegram message:", err);
    return null;
  }
}
