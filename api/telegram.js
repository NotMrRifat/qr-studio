import QRCode from "qrcode";
import { userStore } from "../lib/userStore.js";
import { sendMessage, sendPhoto, answerCallbackQuery } from "../lib/telegram.js";
import { generateQRValue } from "../lib/qrGenerator.js";

// Configured values
const ADMIN_ID = process.env.ADMIN_ID ? String(process.env.ADMIN_ID).trim() : null;
const WEBSITE_URL = process.env.WEBSITE_URL || "https://eliteqrgenerator.vercel.app";

export default async function handler(req, res) {
  // 1. HTTP Method validation
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed. Only POST is supported." });
    return;
  }

  // 2. Start-up Validation of token env variables
  if (!process.env.BOT_TOKEN) {
    console.error("CRITICAL CONFIGURATION ERROR: BOT_TOKEN is missing in process.env");
    res.status(500).json({ error: "Server Configuration Error: BOT_TOKEN is missing" });
    return;
  }

  const update = req.body;
  
  // 3. Log incoming webhook payload
  console.log("Incoming Telegram Update:", JSON.stringify(update, null, 2));

  if (!update) {
    res.status(400).json({ error: "Invalid payload: body is empty" });
    return;
  }

  let chatId, userId, username, text, callbackQueryId, callbackData;

  try {

    // A. Parse Callback Queries
    if (update.callback_query) {
      const cb = update.callback_query;
      callbackQueryId = cb.id;
      callbackData = cb.data;
      chatId = cb.message.chat.id;
      userId = cb.from.id;
      username = cb.from.username;
      
      console.log(`Parsed Callback Query: ID=${callbackQueryId}, Data=${callbackData}, User=${username || userId}`);
    } 
    // B. Parse Regular Text Messages / Commands
    else if (update.message) {
      const msg = update.message;
      chatId = msg.chat.id;
      userId = msg.from.id;
      username = msg.from.username;
      text = msg.text ? msg.text.trim() : null;

      console.log(`Parsed Message: User=${username || userId}, Text="${text}"`);
    }

    // Skip if there's no actionable user ID
    if (!userId) {
      console.warn("Skipping update: No user ID resolved in payload");
      res.status(200).send("OK");
      return;
    }

    // C. Register user in swappable local store
    await userStore.addUser(userId, username);

    // D. Route Callback Queries
    if (callbackData) {
      await answerCallbackQuery(callbackQueryId);

      if (callbackData.startsWith("flow:")) {
        const flowType = callbackData.substring(5);
        console.log(`Initiating flow: ${flowType} for user ${userId}`);
        
        if (flowType === "wifi") {
          await userStore.setUserState(userId, { step: "wifi_ssid" });
          await sendMessage(chatId, "📶 <b>WiFi QR Flow:</b>\n\nSend the WiFi <b>Network SSID (Name)</b>:");
        } else {
          await userStore.setUserState(userId, { step: `waiting_for_${flowType}` });
          const prompts = {
            url: "🔗 Send the <b>URL</b> (e.g. <i>google.com</i>):",
            text: "📝 Send the <b>text message</b> you want to encode:",
            phone: "📞 Send the <b>Phone Number</b>:",
            email: "📧 Send the <b>Email Address</b>:",
            whatsapp: "💬 Send the phone number for the <b>WhatsApp Chat</b>:\n<i>(Bangladesh numbers are formatted automatically to wa.me/880...)</i>"
          };
          await sendMessage(chatId, prompts[flowType] || "Please send the details:");
        }
      } 
      else if (callbackData === "menu_developer") {
        await sendDeveloperMessage(chatId);
      }
      else if (callbackData === "menu_website") {
        await sendMessage(chatId, `🌐 Visit our premium web application here:\n${WEBSITE_URL}`);
      }

      // Finish webhook successfully
      res.status(200).send("OK");
      return;
    }

    // E. Route Commands & Text Inputs
    if (text) {
      // 1. Process Slash Commands
      if (text.startsWith("/")) {
        await userStore.clearUserState(userId); // Reset session state
        
        const command = text.split(" ")[0].toLowerCase();
        console.log(`Routing command: ${command} from user ${userId}`);

        switch (command) {
          case "/start":
            await sendStartMenu(chatId, username);
            break;
          case "/menu":
            await sendMenuCommand(chatId);
            break;
          case "/help":
            await sendHelpMessage(chatId);
            break;
          case "/features":
            await sendFeaturesMessage(chatId);
            break;
          case "/website":
            await sendWebsiteMessage(chatId);
            break;
          case "/developer":
            await sendDeveloperMessage(chatId);
            break;
          case "/about":
            await sendAboutMessage(chatId);
            break;
          case "/contact":
            await sendContactMessage(chatId);
            break;
          case "/admin":
            await handleAdminCommand(chatId, userId);
            break;
          default:
            await sendMessage(chatId, "❌ Unknown command. Type /help to see available actions.");
        }

        res.status(200).send("OK");
        return;
      }

      // 2. Process Input States (Conversational Flow)
      const state = await userStore.getUserState(userId);
      if (state) {
        console.log(`Processing state: step=${state.step} for user ${userId}`);

        // Broadcast workflow
        if (state.step === "admin_broadcast" && String(userId) === String(ADMIN_ID)) {
          await executeBroadcast(chatId, text);
          res.status(200).send("OK");
          return;
        }

        // WiFi wizard
        if (state.step === "wifi_ssid") {
          await userStore.setUserState(userId, { step: "wifi_password", ssid: text });
          await sendMessage(chatId, `🔑 SSID set to <b>"${text}"</b>.\n\nNow, send the network <b>Password</b> (or send <i>none</i> for open networks):`);
          res.status(200).send("OK");
          return;
        } 
        
        if (state.step === "wifi_password") {
          const ssid = state.ssid;
          const password = text.toLowerCase() === "none" ? "" : text;
          const encryption = password ? "WPA" : "none";

          await sendMessage(chatId, "⏳ Generating WiFi QR Code...");
          const qrVal = generateQRValue("wifi", { ssid, password, encryption });
          await generateAndSendQR(chatId, qrVal, `📶 WiFi Code\nSSID: <b>${ssid}</b>`);
          await userStore.clearUserState(userId);
          
          res.status(200).send("OK");
          return;
        }

        // Regular wizard values
        if (state.step.startsWith("waiting_for_")) {
          const type = state.step.substring(12);
          await sendMessage(chatId, "⏳ Processing and generating QR Code...");
          const qrVal = generateQRValue(type, text);
          await generateAndSendQR(chatId, qrVal, `✅ QR Code generated from input:\n<code>${text}</code>`);
          await userStore.clearUserState(userId);
          
          res.status(200).send("OK");
          return;
        }
      }

      // 3. Fallback: No state and no command, send default menu
      console.log(`Fallback: Sending default menu to user ${userId}`);
      await sendStartMenu(chatId, username);
    }

    res.status(200).send("OK");
  } catch (err) {
    // 4. Robust error handling - Bot must never silently fail, but always return HTTP 200 to Telegram
    console.error("WEBHOOK ERROR DURING EXECUTION:", err);
    
    try {
      await sendMessage(chatId, "❌ An internal server error occurred while processing your QR code. Please try again later.");
    } catch (sendErr) {
      console.error("Failed to notify user about webhook error:", sendErr);
    }
    
    res.status(200).send("OK");
  }
}

// BOT RESPONSES AND MENUS

async function sendStartMenu(chatId, username) {
  const name = username ? `@${username}` : "friend";
  const welcomeText = `🤖 <b>Elite QR Generator</b>\n\nHello ${name}! Generate professional QR codes instantly from Telegram.\nSelect a type below to start:`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 URL QR", callback_data: "flow:url" },
        { text: "📝 Text QR", callback_data: "flow:text" },
        { text: "📞 Phone QR", callback_data: "flow:phone" }
      ],
      [
        { text: "📧 Email QR", callback_data: "flow:email" },
        { text: "💬 WhatsApp QR", callback_data: "flow:whatsapp" },
        { text: "📶 WiFi QR", callback_data: "flow:wifi" }
      ],
      [
        { text: "🌐 Website", callback_data: "menu_website" },
        { text: "👨‍💻 Developer", callback_data: "menu_developer" }
      ]
    ]
  };

  await sendMessage(chatId, welcomeText, { reply_markup: keyboard });
}

async function sendMenuCommand(chatId) {
  const menuText = `🏠 <b>Main Menu</b>

Choose a QR type below:

🔗 URL QR

📝 Text QR

📧 Email QR

📞 Phone QR

💬 WhatsApp QR

📶 WiFi QR

🌐 Website

👨‍💻 Developer`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 URL QR", callback_data: "flow:url" },
        { text: "📝 Text QR", callback_data: "flow:text" },
        { text: "📞 Phone QR", callback_data: "flow:phone" }
      ],
      [
        { text: "📧 Email QR", callback_data: "flow:email" },
        { text: "💬 WhatsApp QR", callback_data: "flow:whatsapp" },
        { text: "📶 WiFi QR", callback_data: "flow:wifi" }
      ],
      [
        { text: "🌐 Website", callback_data: "menu_website" },
        { text: "👨‍💻 Developer", callback_data: "menu_developer" }
      ]
    ]
  };

  await sendMessage(chatId, menuText, { reply_markup: keyboard });
}

async function sendHelpMessage(chatId) {
  const helpText = `📚 <b>Elite QR Generator Help</b>

Generate professional QR codes directly from Telegram.

Available QR Types:

🔗 <b>URL QR</b>
Create QR codes for website links.

📝 <b>Text QR</b>
Convert any text into a QR code.

📧 <b>Email QR</b>
Generate QR codes that open email apps instantly.

📞 <b>Phone QR</b>
Generate QR codes that start phone calls instantly.

💬 <b>WhatsApp QR</b>
Generate QR codes for direct WhatsApp chats.

📶 <b>WiFi QR</b>
Generate QR codes for instant WiFi connection.

⚡ Fast
🆓 Free
📱 Easy to Use

🌐 <b>Website:</b>
${WEBSITE_URL}`;
  await sendMessage(chatId, helpText);
}

async function sendFeaturesMessage(chatId) {
  const text = `✨ <b>Elite QR Generator Features</b>

QR Types:

🔗 URL QR
📝 Text QR
📧 Email QR
📞 Phone QR
💬 WhatsApp QR
📶 WiFi QR

Website Features:

🎨 Custom Colors

🖼 Logo Upload

📥 PNG Download

📥 SVG Download

📱 Mobile Friendly

⚡ Fast QR Generation

🌐 <b>Website:</b>
${WEBSITE_URL}`;
  await sendMessage(chatId, text);
}

async function sendWebsiteMessage(chatId) {
  const text = `🌐 <b>Elite QR Generator Website</b>

Create beautiful and customizable QR codes using our web platform.

Features:

🎨 Custom Colors

🖼 Logo Upload

📥 PNG Export

📥 SVG Export

📱 Mobile Friendly

⚡ Fast Generation

Open Website:

${WEBSITE_URL}`;
  await sendMessage(chatId, text);
}

async function sendDeveloperMessage(chatId) {
  const devText = `👨‍💻 <b>Developer Information</b>

Elite QR Generator

A free tool by Elite Pro Gen.

Developed and maintained by:

Rifat Hassan

Founder • Developer • Creator

🌐 <b>Website:</b>
${WEBSITE_URL}

Thank you for using Elite QR Generator.`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🌐 Portfolio Website", url: "https://omarfaruk.eu.cc/" },
        { text: "🛍 StyMetics Boutique", url: "https://stymetics.com" }
      ]
    ]
  };

  await sendMessage(chatId, devText, { reply_markup: keyboard });
}

async function sendAboutMessage(chatId) {
  const text = `ℹ️ <b>About Elite QR Generator</b>

Elite QR Generator is a free QR code generation platform created by Elite Pro Gen.

Generate QR codes instantly for:

🔗 Website URLs

📝 Text

📧 Email

📞 Phone Numbers

💬 WhatsApp

📶 WiFi Networks

Our goal is to provide a simple, fast, and reliable QR code generation experience.

🌐 <b>Website:</b>
${WEBSITE_URL}`;
  await sendMessage(chatId, text);
}

async function sendContactMessage(chatId) {
  const text = `📩 <b>Contact & Support</b>

Need help?

Visit our website:

🌐 ${WEBSITE_URL}

You can also use:

👨‍💻 /developer

to view developer information.`;
  await sendMessage(chatId, text);
}

// ADMIN BROADCAST CONTROLLERS

async function handleAdminCommand(chatId, userId) {
  if (String(userId) !== String(ADMIN_ID)) {
    await sendMessage(chatId, "❌ <b>Access Denied</b>\n\nYou are not authorized to use this command.");
    return;
  }

  await userStore.setUserState(userId, { step: "admin_broadcast" });
  await sendMessage(chatId, "🛠 <b>Admin Broadcast Panel</b>\n\nPlease send the message you want to broadcast.");
}

async function executeBroadcast(chatId, broadcastText) {
  const users = await userStore.getAllUsers();

  let successCount = 0;
  let failedCount = 0;

  for (const user of users) {
    try {
      const res = await sendMessage(user.telegram_user_id, broadcastText);
      if (res && res.ok) {
        successCount++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  await sendMessage(chatId, `✅ <b>Broadcast Complete</b>

📤 Success: ${successCount}

❌ Failed: ${failedCount}`);
}

// QR CODE RENDERER

async function generateAndSendQR(chatId, value, caption) {
  try {
    // Render QR Code to PNG Buffer using pure-js qrcode encoder
    const buffer = await QRCode.toBuffer(value, {
      margin: 4,
      width: 512,
      color: {
        dark: "#630D16", // StyMetics primary
        light: "#FFFFFF"
      },
      errorCorrectionLevel: "H"
    });

    await sendPhoto(chatId, buffer, caption);
  } catch (err) {
    console.error("QR sending failure:", err);
    await sendMessage(chatId, "❌ Failed to generate and send QR code image. Please try again.");
  }
}
