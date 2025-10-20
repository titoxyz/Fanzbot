export default {
    name: "quoted",
    category: "tools",
    command: ["quoted", "q"],
    run: async (conn, m) => {
        let msg = conn.messages.get(m.chat).find(n => n.key.id == m?.quoted?.id);
        if (!msg.isQuoted) return m.reply("Pesan quoted gaada");
        m.reply({ forward: msg.quoted, force: true });
    }
};