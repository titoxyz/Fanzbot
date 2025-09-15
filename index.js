import('./config.js')

import makeWASocket, {
    Browsers,
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} from 'baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import pino from 'pino';

import color from './lib/color.js';
import PluginsLoad from './lib/loadPlugins.js';
import serialize, { Client } from './lib/serialize.js';

const loader = new PluginsLoad('./plugins');

async function startWA() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');

    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
        },
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
    });

    await Client(conn)

    await loader.load();
    conn.plugins = loader.plugins;

    if (!conn.chats) conn.chats = {}

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await conn.requestPairingCode(PAIRING_NUMBER, 'ESEMPEMD');
                console.log(color.green(`Kode Pairing: ${code}`))
            } catch (err) {
                console.log(color.red('[+] Gagal mengambil pairing code:'), err)
            }
        }, 3000);
    }

    conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection) console.log(color.yellow(`[+] Connection Status : ${connection}`))
        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (statusCode) {
                case 408:
                    console.log(color.red('[+] Connection timed out. restarting...'))
                    await startWA()
                    break
                case 503:
                    console.log(color.red('[+] Unavailable service. restarting...'))
                    await startWA()
                    break
                case 428:
                    console.log(color.cyan('[+] Connection closed, restarting...'))
                    await startWA()
                    break
                case 515:
                    console.log(color.cyan('[+] Need to restart, restarting...'))
                    await startWA()
                    break
                case 401:
                    console.log(color.cyan('[+] Session Logged Out.. Recreate session...'))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break
                case 403:
                    console.log(color.red(`[+] Your WhatsApp Has Been Baned :D`))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break

                case 405:
                    console.log(color.cyan('[+] Session Not Logged In.. Recreate session...'))
                    fs.rmSync('./sessions', { recursive: true, force: true })
                    await startWA()
                    break
                default:
                    console.log("Unhandled connection issue.", statusCode);
                    return process.exit(1);
            }
        }

        if (connection === 'open') {
            console.log(color.green('[+] Bot Connected.'))
            conn.insertAllGroup();
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!id) return
        if (id === 'status@broadcast') return
        if (!(id in conn.chats)) conn.chats[id] = { id }
        let chats = conn.chats[id]
        chats.isChats = true
        const groupMetadata = await conn.groupMetadata(id).catch(_ => null)
        if (!groupMetadata) return
        chats.subject = groupMetadata.subject
        chats.metadata = groupMetadata
    });

    conn.ev.on('groups.update', async (groupsUpdates) => {
        try {
            for (const update of groupsUpdates) {
                const id = update.id
                if (!id || id === 'status@broadcast') continue
                const isGroup = id.endsWith('@g.us')
                if (!isGroup) continue
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                chats.isChats = true
                const metadata = await conn.groupMetadata(id).catch(_ => null)
                if (metadata) chats.metadata = metadata
                if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject
            }
        } catch (e) {
            console.error(e)
        }
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages[0]) return;

        let m = await serialize(conn, messages[0]);

        if (m.chat.endsWith('@broadcast') || m.chat.endsWith('@newsletter')) return;
        if (m.message && !m.isBot) {
            console.log(color.cyan(' - FROM'), color.cyan(conn.chats[m.chat]?.subject), color.blueBright(m.chat));
            console.log(color.yellowBright(' - CHAT'), color.yellowBright(m.isGroup ? `Grup (${m.sender} : ${m.pushname})` : 'Pribadi'));
            console.log(color.greenBright(' - PESAN'), color.greenBright(m.body || m.type));
            console.log(color.magentaBright('-'.repeat(40)))
        }

        await (await import(`./handler.js?v=${Date.now()}`)).default(conn, m);
    });

}

startWA();
//process.on('uncaughtException', console.error);