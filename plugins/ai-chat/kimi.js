import deepseek from '#scrape/deepinfra.js';

export default {
    name: "kimi",
    category: "ai-chat",
    command: ["kimi"],
    run: async (conn, m) => {
        const input = m.isQuoted ? m.quoted.text : m.text;
        if (!input) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        if (!conn.kimi) conn.kimi = {};
        if (!conn.kimi[m.sender]) conn.kimi[m.sender] = [];
        conn.kimi[m.sender].push({ role: 'user', content: input });

        try {
            const res = await deepseek('moonshotai/Kimi-K2-Instruct-0905', conn.kimi[m.sender]);
            conn.kimi[m.sender].push({ role: 'assistant', content: res });
            m.reply(res)
        } catch (err) {
            m.reply('Terjadi Kesalahan')
            console.error(err);
        }
    }
};
