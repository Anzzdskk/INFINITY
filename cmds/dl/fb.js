import fetch from 'node-fetch'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async ({ sock, msg, args, command }) => {
    const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || '') : ''
    const fullText = `${args.join(' ')} ${quotedText}`.trim()
    const url = fullText || args?.[0]

    if (!url) {
      return msg.reply(`*Uso correcto:* .${command} <enlace de Facebook>`)
    }

    try {
      const res = await fetch(`https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('Error al contactar con la API')

      const json = await res.json()

      if (!json.status || !json.data || !json.data.length) {
        throw new Error('No se pudo obtener el video.')
      }

      const video = json.data[0].url

      await sock.sendMessage(msg.chat, {
        video: { url: video },
        mimetype: 'video/mp4',
        fileName: 'fb.mp4',
        caption: '✅ *Aquí tienes tu video de Facebook*'
      }, { quoted: msg })

    } catch (e) {
      await msg.reply(`❌ ${e.message || e}`)
    }
  }
}