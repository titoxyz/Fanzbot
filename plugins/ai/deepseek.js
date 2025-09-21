import axios from 'axios';

export default {
    name: "deepseek",
    category: "ai",
    command: ["deepseek", "dipsek"],
    settings: {
        loading: true,
    },
    run: async (conn, m) => {
        if (!m.text) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        if (!conn.deepseek) conn.deepseek = {};
        if (!conn.deepseek[m.sender]) conn.deepseek[m.sender] = [];
        conn.deepseek[m.sender].push({ content: m.text, is_user: true });

        try {
            const res = await deepseek(m.text, conn.deepseek[m.sender]);
            const result = res.replace(/<think>[\s\S]*?<\/think>/gi, '')
                .replace(/&quot;/g, '"')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/&#039;/g, "'")
                .trim();
            conn.deepseek[m.sender].push({ content: res, is_user: false });
            m.reply(result)
        } catch (err) {
            console.error(err);
        }
    }
};

async function deepseek(prompt, history) {
    const response = await axios.post("https://ai-chat-bot.pro/api/deep-seek-chat?streaming=1",
        new URLSearchParams({
            message: prompt,
            last_chat_json: JSON.stringify(history)
        }).toString(), {
            headers: {
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
            }
        }
    );

    if (!response.data || typeof response.data !== "string") {
        throw new Error("Respon AI tidak valid.");
    }

    return response.data
}