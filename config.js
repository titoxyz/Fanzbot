import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'
import color from './lib/color.js';


global.PAIRING_NUMBER = 6287701656619
global.ownerNumber = ["6287701656619", "6287782304364"]

global.mode = false //self

global.stickpack = 'Croted By'
global.stickauth = 'ESEMPE-MD'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(color.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
