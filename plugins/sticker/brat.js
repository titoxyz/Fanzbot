export default {
    name: "brat",
    category: "sticker",
    command: ["brat", "bratvid", "bratvideo"],
    run: async (conn, m, { Api }) => {
        if (!m.text) return m.reply('Masukkan teks yang valid!')

        try {
            let end = '/api/brat?text='
            if (/vid|video/i.test(m.command)) {
                end = '/api/bratvid?text='
            }

            let res = Api.request('brat', end + encodeURIComponent(m.text.trim()))
            conn.sendSticker(m.chat, res.URL, m)
        } catch (err) {
            console.error('Error:', err)
            m.reply('Gagal Membuat Sticker')
        }
    }
};