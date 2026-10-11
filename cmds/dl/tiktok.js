import fetch from 'node-fetch'

const masha = 'https://sm.alycore.xyz'
const alya = 'https://salya.alycore.xyz'
const masachika = 'https://sm2.alycore.xyz'

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: async ({ msg, sock, args, command, prefix }) => {
    const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || '') : ''
    const fullText = `${args.join(' ')} ${quotedText}`.trim()
    const url = args?.[0] || fullText

    if (!url || !url.includes('tiktok.com')) {
      return msg.reply(`✿ Ingresa un enlace válido de TikTok.\n\nEjemplo:\n${prefix || '.'}${command} https://www.tiktok.com/@usuario/video/...`)
    }

    const servers = [
      { name: 'Server Masha', url: masha },
      { name: 'Server Alya', url: alya },
      { name: 'Server Masachika', url: masachika }
    ]

    const shuffledServers = [...servers].sort(() => Math.random() - 0.5)

    let success = false
    let lastError = ''

    for (const server of shuffledServers) {
      const endpoint = `${server.url}/Tiktok_videodl?url=${encodeURIComponent(url)}`

      try {
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`Respuesta inválida (${res.status})`)

        const json = await res.json()
        if (!json.video_url) throw new Error(`El servidor no devolvió un video válido`)

        await sock.sendMessage(msg.chat, {
          video: { url: json.video_url },
          mimetype: 'video/mp4',
          caption: `✅ *Descarga exitosa*\n🎬 Aquí tienes tu video de TikTok\n\n💫 Procesado por: *${server.name}*`
        }, { quoted: msg })

        success = true
        break

      } catch (err) {
        lastError = `❌ Falló ${server.name}: ${err.message || err}`
        console.log(lastError)
      }
    }

    if (!success) {
      await msg.reply(`🚫 No se pudo descargar el video desde ninguno de los servidores disponibles.\n\n${lastError}`)
    }
  }
}