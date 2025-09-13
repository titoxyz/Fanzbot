import axios from 'axios';
import { toBuffer } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';

class Function {
    isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
    }

    pickRandom = (list) => {
        return list[Math.floor(Math.random() * list.length)];
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
    }

    runtime = function(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor((seconds % (3600 * 24)) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    };

    fetchJson = async (url, options) => {
        try {
            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
                },
                ...options,
            });
            return res.data;
        } catch (err) {
            throw err;
        }
    };

    fetchBuffer = async (url, options = {}) => {
        try {
            const response = await axios.request({
                method: options.method || 'get',
                url,
                headers: {
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
                    ...(options.headers ? options.headers : {}),
                },
                responseType: 'stream',
                data: options.data || null,
                ...options,
            });

            const buffer = await toBuffer(response.data);
            const position = response.headers['content-disposition']?.match(/filename=(?:(?:"|')(.*?)(?:"|')|([^"'\s]+))/);
            const filename = decodeURIComponent(position?.[1] || position?.[2]) || null;
            const filetype = await fileTypeFromBuffer(buffer)
            const mimetype = filetype.mime || 'application/octet-stream';
            const ext = filetype.ext || 'bin';

            return { data: buffer, filename, mimetype, ext };
        } catch (error) {
            throw error;
        }
    };

    getBuffer = async (url, options) => {
        try {
            const res = await axios({
                method: "get",
                url,
                headers: {
                    DNT: 1,
                    "Upgrade-Insecure-Request": 1,
                },
                ...options,
                responseType: "arraybuffer",
            });
            return res.data;
        } catch (e) {
            throw e;
        }
    };

}

export default new Function();