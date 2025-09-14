import axios from 'axios';

import util from 'util'
import cp from 'child_process'

import Api from './lib/api.js';
import Func from './lib/function.js';

export default async function Command(conn, m) {
  let quoted = m.isQuoted ? m.quoted : m;
  let downloadM = async (filename) => await conn.downloadMediaMessage(quoted, filename);
  let isCommand = m.prefix && m.body.startsWith(m.prefix) || false;
  const isOwner = m.fromMe || ownerNumber.includes(m.sender.split('@')[0]);

  if (!mode && !isOwner) return;

  // === LOOPING PLUGINS ===
  for (const anu of Object.values(conn.plugins)) {
    // EVENT LISTENER
    if (typeof anu.on === "function") {
      try {
        const handled = await anu.on.call(conn, m, conn, {
          Api, Func, quoted, downloadM, isOwner
        });
        if (handled) continue;
      } catch (e) {
        console.error(`[PLUGIN EVENT ERROR] ${anu.name}`, e);
      }
    }

    // COMMAND HANDLER
    if (isCommand) {
      const command = m.command?.toLowerCase();
      const isCmd =
        anu?.command?.includes(command) ||
        (anu?.alias && anu.alias.includes(command));

      if (isCmd) {
        try {
          await anu.run(conn, m, {
            Api, quoted, downloadM, isOwner
          });
        } catch (e) {
          console.error(`[PLUGIN ERROR] ${anu.name}`, e);
          await m.reply("Terjadi error saat menjalankan command.");
        }
      }
    }
  };
  
  if ([">", "=>"].some(a => m.body.toLowerCase().startsWith(a)) && isOwner) {
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

  if (m.body.startsWith('$') && isOwner) {
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