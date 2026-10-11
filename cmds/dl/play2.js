import fetch from 'node-fetch'

const masha = 'https://sm.alycore.xyz'
const alya = 'https://salya.alycore.xyz'
const masachika = 'https://sm2.alycore.xyz'

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: masha },
  { name: 'Servidor Alya', baseUrl: alya },
  { name: 'Servidor Masachika', baseUrl: masachika }
]

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

async function tryServers(servers, endpoint, queryParam) {
  const shuffled = shuffleArray(servers)

  for (const server of shuffled) {
    try {
      const url = `${server.baseUrl}${endpoint}${encodeURIComponent(queryParam)}`
      const res = await fetch(url)

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

      const json = await res.json()
      if (!json || Object.keys(json).length === 0) throw new Error('Respuesta vacía')

      return { json, server: server.name }

    } catch (err) {
      console.error(`❌ ${server.name} falló:`, err.message || err)
      continue
    }
  }

  throw new Error('❌ Todos los servidores fallaron. Intenta más tarde.')
}

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || '') : ''
      const text = `${args.join(' ')} ${quotedText}`.trim()

      if (!text) {
        return msg.reply('《✧》 Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const { json: searchJson, server: searchServer } =
        await tryServers(SERVERS, '/search_youtube?query=', text)

      if (!searchJson.results?.length) {
        return msg.reply('《✧》 No se encontró información del video.')
      }

      const video = searchJson.results[0]
      const thumb = video.thumbnails.find(t => t.width === 720)?.url || video.thumbnails[0]?.url
      const videoTitle = video.title
      const videoUrl = video.url
      const duration = Math.floor(video.duration) || 0
      const canal = video.channel || 'Desconocido'

      const caption = `
> ˚₊· ͟͟͞͞➳ *ᴛɪ́ᴛᴜʟᴏ ::* ${videoTitle}
> ⸙ *ᴄᴀɴᴀʟ ::* ${canal}
> 🜸 *ᴅᴜʀᴀᴄɪ́ᴏ́ɴ ::* ${duration}s
> 〄 *ʟ ɪ ɴ ᴋ ::*
${videoUrl}
`.trim()

      await sock.sendMessage(msg.chat, {
        image: { url: thumb },
        caption: caption
      }, { quoted: msg })

      let downloadJson

      try {
        const { json } = await tryServers(SERVERS, '/download_video?url=', videoUrl)
        downloadJson = json
      } catch {
        console.error('⚠️ Endpoint principal falló, usando respaldo...')
        const { json } = await tryServers(SERVERS, '/download_videoV2?url=', videoUrl)
        downloadJson = json
      }

      if (!downloadJson?.file_url) {
        return msg.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

      await sock.sendMessage(msg.chat, {
        video: { url: downloadJson.file_url },
        fileName: `${downloadJson.title || videoTitle}.mp4`,
        mimetype: 'video/mp4'
      }, { quoted: msg })

    } catch (e) {
      console.error(e)
      await msg.reply('《✧》 Ocurrió un error inesperado al procesar la solicitud.')
    }
  }
}