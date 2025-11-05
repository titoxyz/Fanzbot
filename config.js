import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import log from "#lib/logger.js";
import { LanguageManager } from "#lib/LanguageManager.js";

// === General Configuration ===

// Pairing number (used for QR/Pairing code scanning)
global.PAIRING_NUMBER = 6285607290187;
// global.PAIRING_NUMBER = 62882003353414;

// Main and backup owner numbers
global.ownerNumber = ["6283149181309", "6285607290187"];

// Bot mode: false = self mode (owner only), true = public (accessible to everyone)
global.IS_PUBLIC = true;

// === WhatsApp Status Reader Settings ===
global.readsw = {
  active: false,
  react: false,
  emoji: ["🔥", "💀", "☠️", "🥀", "🥶"],
};

// === Multi-Language System ===

// Initialize LanguageManager (default language: 'id')
const langManager = new LanguageManager("id");

// Set the active language (change to 'en' for English)
langManager.setLanguage("id");

// Shortcut for easier global access
global.lang = langManager;

// Helper messages for the active language
global.mess = {
  wait: lang.get("mess.wait"),
  owner: lang.get("mess.owner"),
  group: lang.get("mess.group"),
  admin: lang.get("mess.admin"),
  botAdmin: lang.get("mess.botAdmin"),
  private: lang.get("mess.private"),
};

// === Watermark & UI Defaults ===
global.stickpack = "Made On Earth";
global.stickauth = "By Tito";

global.title = "Aphrodite";
global.body = "whatsapp bot";
global.thumbnailUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE10ysQ1SAjvRU2nAnOP8fWfPoqXw8XREZqz97wsGXzOTbMnOMKmgfHBc&s=10";

// === Hot Reload for config.js ===
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  log.info("✅ config.js reloaded successfully.");
  import(`${file}?update=${Date.now()}`);
});
