import fs from "fs";
import path from "path";

// In-memory fallback cache (used if no DB env vars are defined)
let memoryStore = {
  users: {},
  states: {}
};

// Local JSON path for testing (on Vercel serverless, /tmp is writable)
const FILE_PATH = path.join("/tmp", "elite_qr_users.json");

// Helper to load/save JSON database in local testing environments
function loadLocalData() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf8");
      const parsed = JSON.parse(data);
      memoryStore.users = parsed.users || {};
      memoryStore.states = parsed.states || {};
    }
  } catch (err) {
    console.warn("Failed to load local user database:", err.message);
  }
}

function saveLocalData() {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(memoryStore, null, 2), "utf8");
  } catch (err) {
    console.warn("Failed to write to local user database:", err.message);
  }
}

// Initialize
loadLocalData();

/**
 * Swappable user database store.
 * You can easily plug in Redis, Supabase, Vercel KV or MongoDB here.
 */
export const userStore = {
  /**
   * Adds a user to the database
   * @param {string|number} userId - Telegram User ID
   * @param {string} username - Telegram Username
   */
  async addUser(userId, username) {
    const id = String(userId);
    if (memoryStore.users[id]) return memoryStore.users[id];

    const newUser = {
      telegram_user_id: id,
      username: username || "",
      join_date: new Date().toISOString()
    };

    memoryStore.users[id] = newUser;
    saveLocalData();

    // To add Vercel KV, Redis, or PostgreSQL support, swap here:
    // await kv.hset(`user:${id}`, newUser);
    
    return newUser;
  },

  /**
   * Retrieves user details
   * @param {string|number} userId
   */
  async getUser(userId) {
    const id = String(userId);
    return memoryStore.users[id] || null;
  },

  /**
   * Get all users (useful for broadcast)
   */
  async getAllUsers() {
    return Object.values(memoryStore.users);
  },

  /**
   * Set user conversational session state
   */
  async setUserState(userId, state) {
    const id = String(userId);
    memoryStore.states[id] = state;
    saveLocalData();
  },

  /**
   * Get user conversational session state
   */
  async getUserState(userId) {
    const id = String(userId);
    return memoryStore.states[id] || null;
  },

  /**
   * Clear user conversational session state
   */
  async clearUserState(userId) {
    const id = String(userId);
    delete memoryStore.states[id];
    saveLocalData();
  }
};
