import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import log from "#lib/logger.js";
import { LanguageManager } from "#lib/LanguageManager.js";

// === General Configuration ===

// Pairing number (used for QR/Pairing code scanning)
global.PAIRING_NUMBER = 6282381978401;
// global.PAIRING_NUMBER = 62882003353414;

// Main and backup owner numbers
global.ownerNumber = ["6287701656619", "6287782304364", "62882005514880"];

// Bot mode: false = self mode (owner only), true = public (accessible to everyone)
global.public = true;

// === WhatsApp Status Reader Settings ===
global.readsw = {
  active: true,
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
global.stickpack = "Created By";
global.stickauth = "ESEMPE-MD";

global.title = "ESEMPE-MD";
global.body = "Apcb";
global.thumbnailUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaK3_60MiEWpItg8BbrvcF4Be_vgIDd8Ggj13AYkPqGdUosLSmCMCtGSY&s=10";

// === Hot Reload for config.js ===
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  log.info("✅ config.js reloaded successfully.");
  import(`${file}?update=${Date.now()}`);
});