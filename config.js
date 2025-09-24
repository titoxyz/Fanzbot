import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'
import color from './lib/color.js';


global.PAIRING_NUMBER = 6285760188757
global.ownerNumber = ['6287701656619', '6287782304364']

global.mode = false //self

// bantu isi, males gw jier
global.mess = {
    wait: 'Harap Tunggu sebentar',
    owner: 'Fitur Ini Khusus Owner',
    group: 'Fitur Ini Khusus Group',
    admin: 'Fitur Ini Khusus Admin Group',
    botAdmin: 'Bot Harus Menjadi Admin Group',
    private: 'Fitur Ini Khusus Private'
}

global.stickpack = 'Croted By'
global.stickauth = 'ESEMPE-MD'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(color.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
