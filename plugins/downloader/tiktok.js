import axios from "axios";

export default {
  name: "tiktok",
  category: "downloader",
  command: ["tt", "tiktok"],
  run: async (conn, m, { Api }) => {
    try {
      const input = m.isQuoted ? m.quoted.text : m.text;
      const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/;

      if (!input) {
        throw (
          `# Cara Penggunaan\n\n` +
          `> Masukkan URL TikTok untuk mengunduh konten\n\n` +
          `# Contoh Penggunaan\n` +
          `> ${m.prefix + m.command[0]} https://vt.tiktok.com/xxxxx`
        );
      }

      const parseUrl = input.match(regex)?.[0];
      if (!parseUrl) {
        throw "URL TikTok tidak valid. Pastikan URL sesuai format yang benar.";
      }

      const Url = Api.createUrl("purr", "/api/v1/tiktok", { url: parseUrl });
      const { data } = await axios.get(Url);
      
      if (!data || !data.media) {
        throw "Tidak dapat mengunduh konten TikTok. Pastikan URL valid.";
      }

      if (Array.isArray(data.media.image_slide) && data.media.image_slide.length > 0) {
        const slides = data.media.image_slide;
        
        if (slides.length === 1) {
          await conn.sendMessage(m.chat, {
            image: { url: slides[0] },
            caption: data.metadata.title || "Tiktok Downloader"
          }, { quoted: m });
        } else {
          const medias = slides.map(url => ({
            image: { url },
            caption: data.metadata.title || "Tiktok Downloader"
          }));
          await conn.sendAlbumMessage(conn, m.chat, medias, { quoted: m, delay: 300 });
        }
        return;
      }
      
      if (data.media.play) {
        return await m.reply({
          video: { url: data.media.play },
          caption: data.metadata?.title || "Tiktok Downloads",
        });
      }

      throw "Tidak dapat memproses konten TikTok. Format tidak dikenali.";

    } catch (err) {
      console.error(err);
      m.reply("Terjadi kesalahan saat memproses permintaan");
    }
  },
};