export default {
  name: "menu",
  category: "utility",
  command: ["menu"],
  run: async (conn, m) => {
    let grouped = {}
    for (let plugin of Object.values(conn.plugins)) {
      if (!grouped[plugin.category]) grouped[plugin.category] = []
      grouped[plugin.category].push(plugin)
    }

    let menu = "List Fitur ESEMPE-MD\n" + 
      Object.entries(grouped).map(([category, items]) => {
        console.log(items)
        return `┌─「 ${category.toUpperCase()} 」\n` +
        items.map(p => `│❒ ${m.prefix}${p.name}`).join("\n") +
        "\n└────"
      }).join("\n")

    m.reply(menu)
  }
}
