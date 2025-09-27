export default {
    name: "hidetag",
    category: "group",
    command: ["hidetag"],
    settings: {
        group: true,
        admin: true
    },
    run: async (conn, m, { metadata }) => {
        const text = m.isQuoted ? m.quoted.text : m.text;
        if (!text) return m.reply('Masukkan teks atau balas pesan lalu ketik ' + m.cmd)
        const mentions = metadata.participants.map(a => conn.getJid(a.id))
        m.reply({ text, mentions })
    }
}