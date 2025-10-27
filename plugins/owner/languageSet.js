export default {
  name: "lang",
  category: "owner",
  command: ["lang", "setlang", "language"],
  settings: {
    owner: true
  },
  run: async (conn, m) => {
    if (!m.text) return m.reply("Enter the language ID (en, id, es, fr, de, jp, pt)");
    
    try {
      global.lang.setLanguage(m.text);
      
      if (global.lang.defaultLang === m.text) {
        m.reply(`✅ Language successfully changed to: ${m.text}`);
      } else {
        m.reply(`❌ Language '${m.text}' not found. Available: en, id, es, fr, de, jp, pt`);
      }
    } catch (e) {
      m.reply(`❌ Error: ${String(e)}`);
    }
  }
};