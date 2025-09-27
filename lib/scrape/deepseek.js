import axios from 'axios';

export default async function(prompt, history) {
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