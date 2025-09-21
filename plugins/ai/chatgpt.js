import axios from 'axios';

export default {
    name: "chatgpt",
    category: "ai",
    command: ["chatgpt", "gpt"],
    settings: {
        loading: true,
    },
    run: async (conn, m) => {
        if (!m.text) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        if (!conn.chatgpt) conn.chatgpt = {};
        if (!conn.chatgpt[m.sender]) conn.chatgpt[m.sender] = [];
        conn.chatgpt[m.sender].push({ role: "user", content: m.text });
        try {
            const res = await gpt(conn.chatgpt[m.sender]);

            conn.chatgpt[m.sender].push({ role: "assistant", content: res });
            m.reply(res)
        } catch (err) {
            console.error(err);
        }
    }
};

async function gpt(history) {
    const res = await axios.post("https://api.openai.com/v1/responses", {
        model: "gpt-5",
        input: history,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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',
        }
    });

    let teks = [];
    for (let out of res.data.output) {
        if (out.content) {
            for (let c of out.content) {
                if (c.type === "output_text") teks.push(c.text);
            }
        }
    }
    return teks.join("\n");
}