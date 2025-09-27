export default {
  name: "menu",
  category: "utility",
  command: ["menu"],
  run: async (conn, m) => {
    let grouped = {}
    for (let plugin of Object.values(plugins)) {
      if (!grouped[plugin.category]) grouped[plugin.category] = []
      grouped[plugin.category].push(plugin)
    }

    let uptime = process.uptime()
    let hours = Math.floor(uptime / 3600)
    let minutes = Math.floor((uptime % 3600) / 60)
    let seconds = Math.floor(uptime % 60)
    let uptimeStr = `${hours}h ${minutes}m ${seconds}s`

    let now = new Date()
    let timeStr = now.toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    let header = `
━━━ 〔 𝐌𝐄𝐍𝐔 𝐄𝐒𝐄𝐌𝐏𝐄 - 𝐌𝐃 〕 ━━━

📡 Status : Online
⏱️ Aktif  : ${uptimeStr}
🕒 Waktu  : ${timeStr}
`

    let body = Object.entries(grouped).map(([category, items]) => {
      return (
        `\n▸ ${category.toUpperCase()}\n` +
        items.map(p => `  • ${m.prefix}${p.name}`).join("\n")
      )
    }).join("\n")

    let footer = `\n━━━━━━━━━━━━━━━━━━━━━━\nTotal Kategori: ${Object.keys(grouped).length} | Total Fitur: ${Object.values(grouped).flat().length}`

    let menu = header + body + footer
    m.reply(menu)
  }
}