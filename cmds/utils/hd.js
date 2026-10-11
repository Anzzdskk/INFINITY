import db from "#db"
import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['hd', 'upscale'],
  category: 'utils',
    run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      const q = msg.quoted || msg
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) return msg.reply(`> ❀ _Envía una *imagen* junto al *comando* ${prefix + command}_`)
      if (!/image\/(jpe?g|png)/.test(mime)) {
        return msg.reply(`> ❀ _El formato *${mime}* no es compatible_`)
      }

     // await msg.reply(mess.wait)

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer)
      if (!uploadedUrl) {
        return msg.reply('> ❀ _No se pudo subir la imagen_')
      }

      const enhancedBuffer = await getEnhancedBuffer(uploadedUrl)
      if (!enhancedBuffer) {
        return msg.reply('> ❀ _No se pudo *obtener* la imagen mejorada_')
      }

      await sock.sendMessage(msg.chat, { image: enhancedBuffer, caption: null }, { quoted: msg })
    } catch (err) {
      console.error(err)
      await msg.reply(msgglobal)
    }
  },
};

async function uploadToUguu(buffer) {
  const body = new FormData()
  body.append('files[]', buffer, 'image.jpg')

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
  })

  const json = await res.json()
  return json.files?.[0]?.url
}

async function getEnhancedBuffer(url) {
  const res = await fetch(`${api.url}/tools/upscale?url=${url}&key=${api.key}`)
  if (!res.ok) return null

  return Buffer.from(await res.arrayBuffer())
}
