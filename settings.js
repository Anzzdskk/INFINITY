import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['584268955896']



global.api = {
  url: 'https://api.alyacore.xyz',
  key: 'LUFFY-FIX67'
}

global.msgglobal = '> ✿⸝꙳.˖ Ocurrió un problema, contacte al creador 🍁\n\nwa.me/584268955896'
global.dev = `> ·˚ ༘₊· ͟͟͞͞꒰ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀɴᴢᴢ˚₊·—̳͟͞͞♡`

global.mess = {
  socket: '> _Este comando solo puede ser ejecutado por un Socket 🍁_',
  admin: '> _Este comando solo puede ser ejecutado por los Administradores del Grupo 🍁_',
  botAdmin: '> _Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo 🍁_',
  nsfw: '> _Los comandos de *NSFW* están desactivados en este grupo 🍁_',
  comandooff: '> _Estos comandos estan desactivados en este grupo 🍁_'
}

global.my = {
ch: "120363410963443689@newsletter" // Oficial
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
