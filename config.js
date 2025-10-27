import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import log from "#lib/logger.js";
import { LanguageManager } from "#lib/LanguageManager.js";

// === Konfigurasi umum ===

// Nomor pairing (untuk scan QR/Pairing code)
global.PAIRING_NUMBER = 62882003353414;

// Nomor owner utama + cadangan
global.ownerNumber = ["6287701656619", "6287782304364", "62882005514880"];

// Mode bot: false = self mode (hanya owner), true = public (semua user)
global.pubelik = true;

// Konfigurasi baca status WA
global.readsw = {
  active: true,
  react: false,
  emoji: ["🔥", "💀", "☠️", "🥀", "🥶"],
};

// === Sistem Multi-Language ===

// Inisialisasi LanguageManager
const langManager = new LanguageManager("id"); // ubah default ke 'en' jika mau English

// Set bahasa aktif (bisa diubah sesuai kebutuhan)
langManager.setLanguage("id");

// Shortcut agar mudah digunakan di mana pun
global.lang = langManager; 

// Fungsi helper untuk ambil pesan bahasa aktif
global.mess = {
  wait: () => langManager.t("mess.wait"),
  owner: () => langManager.t("mess.owner"),
  group: () => langManager.t("mess.group"),
  admin: () => langManager.t("mess.admin"),
  botAdmin: () => langManager.t("mess.botAdmin"),
  private: () => langManager.t("mess.private"),
};

// === Watermark & UI Defaults ===
global.stickpack = "Created By";
global.stickauth = "ESEMPE-MD";

global.title = "ESEMPE-MD";
global.body = "Apcb";
global.thumbnailUrl =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaK3_60MiEWpItg8BbrvcF4Be_vgIDd8Ggj13AYkPqGdUosLSmCMCtGSY&s=10";

// === Hot reload config.js ===
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  log.info("✅ config.js berhasil direload.");
  import(`${file}?update=${Date.now()}`);
});