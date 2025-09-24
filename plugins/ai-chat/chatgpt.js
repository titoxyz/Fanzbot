import axios from 'axios';

export default {
    name: "chatgpt",
    category: "ai-chat",
    command: ["chatgpt", "gpt"],
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


async function getApikey() {
    try {
        let { data } = await axios.get("https://overchat.ai/image/ghibli");
        let key = data.match(/sk-proj-[A-Za-z0-9_\-]{80,}/);
        return key ? key[0] : null;
    } catch {
        return null;
    }
}

async function gpt(history) {
    const apikey = await getApikey()
    const res = await axios.post("https://api.openai.com/v1/responses", {
        model: "gpt-5",
        input: JSON.stringify(history),
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apikey
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