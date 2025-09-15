import axios from 'axios';
import { jidNormalizedUser } from 'baileys';
import util from 'util';
import cp from 'child_process';

import Api from './lib/api.js';
import Func from './lib/function.js';

export default async function Command(conn, m) {
  let quoted = m.isQuoted ? m.quoted : m;
  let downloadM = async (filename) => await conn.downloadMediaMessage(quoted, filename);
  let isCommand = m.prefix && m.body.startsWith(m.prefix) || false;
  const isOwner = m.fromMe || ownerNumber.includes(m.sender.split('@')[0]);

  if (m.isBot) return;
  if (!mode && !isOwner) return;
  // === LOOPING PLUGINS ===
    for (const plugin of Object.values(conn.plugins)) {
        // EVENT LISTENER
        if (typeof plugin.on === "function") {
            try {
                const handled = await plugin.on.call(conn, m, conn, {
                    Api,
                    Func,
                    quoted,
                    downloadM,
                    isOwner
                });
                if (handled) continue;
            } catch (e) {
                console.error(`[PLUGIN EVENT ERROR] ${plugin.name}`, e);
            }
        }

        // COMMAND HANDLER
        if (isCommand) {
            const command = m.command?.toLowerCase();
            const isCmd = plugin?.command?.includes(command) || (plugin?.alias && plugin.alias.includes(command));

            try {
                if (isCmd) {

                    const metadata = m.isGroup ? (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null) : {}
                    const groupAdmins = m.isGroup && (metadata.participants.reduce((memberAdmin, memberNow) => (memberNow.admin ? memberAdmin.push({ jid: memberNow.jid, admin: memberNow.admin }) : [...memberAdmin]) && memberAdmin, []))
                    const isAdmin = m.isGroup && !!groupAdmins.find((member) => member.jid === m.sender)
                    const isBotAdmin = m.isGroup && !!groupAdmins.find((member) => member.jid === jidNormalizedUser(conn.user.id))

                    if (plugin.settings?.owner && !isOwner) {
                        m.reply(mess.owner);
                        continue;
                    }
                    if (plugin.settings?.private && m.isGroup) {
                        m.reply(mess.private);
                        continue;
                    }
                    if (plugin.settings?.group && !m.isGroup) {
                        m.reply(mess.group);
                        continue;
                    }
                    if (plugin.settings?.admin && !isAdmin) {
                        m.reply(mess.admin);
                        continue;
                    }
                    if (plugin.settings?.botAdmin && !isBotAdmin) {
                        m.reply(mess.botAdmin);
                        continue;
                    }

                    plugin.run(conn, m, {
                        Api,
                        Func,
                        downloadM,
                        quoted,
                        metadata,
                        isOwner
                    });
                }
            } catch (e) {
                console.error(`[PLUGIN ERROR] ${plugin.name}`, e);
                await m.reply("Terjadi error saat menjalankan command.");
            }
        }
    };
  
  if ([">", "=>"].some(a => m.body?.toLowerCase().startsWith(a)) && isOwner) {
    let evalCmd = ""
    try {
      evalCmd = /await/i.test(m.text)
        ? eval("(async() => { " + m.text + " })()")
        : eval(m.text)
    } catch (e) {
      evalCmd = e
    }
    new Promise(async (resolve, reject) => {
      try { resolve(evalCmd) } catch (err) { reject(err) }
    })
    ?.then((res) => m.reply(util.format(res)))
    ?.catch((err) => m.reply(util.format(err)))
  }

  if (m.body?.startsWith('$') && isOwner) {
    const exec = util.promisify(cp.exec).bind(cp)
    let o
    try {
      o = await exec(m.text)
    } catch (e) {
      o = e
    } finally {
      let { stdout, stderr } = o
      if (stdout.trim()) m.reply(stdout)
      if (stderr.trim()) m.reply(stderr)
    }
  }
};