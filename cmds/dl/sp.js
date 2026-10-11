import db from "#db"
import fetch from 'node-fetch'
import { getBuffer } from "#serialize"

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || "") : ""
      const text = `${args.join(' ')} ${quotedText}`.trim()

      if (!text) {
        return msg.reply('✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify')
      }

      const spotifyMatch = text.match(/https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/)
      let url, songInfo

      if (spotifyMatch) {
        url = spotifyMatch[0]
        const resInfo = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
        const resultInfo = await resInfo.json()
        if (!resultInfo.status) return msg.reply('❖ No se pudo procesar el enlace de Spotify.')
        songInfo = resultInfo.data
      } else {
        const search = await fetch(`${api.url}/search/spotify?query=${encodeURIComponent(text)}&key=${api.key}`)
        const data = await search.json()
        if (!data.status || !data.data.length) {
          return msg.reply('❖ No se encontraron resultados en Spotify')
        }
        songInfo = data.data[0]
        url = songInfo.url
      }

      const duracion = (!songInfo.duration || songInfo.duration.includes('NaN'))
        ? 'Desconocida'
        : songInfo.duration || ""

      const caption = `➪ Descargando › ${songInfo.title || songInfo.name}

> ✿⃘࣪◌ ֪ Artista › ${songInfo.artist || ""}
> ✿⃘࣪◌ ֪ Álbum › ${songInfo.album || ""}
> ✿⃘࣪◌ ֪ Fecha › ${songInfo.publish || songInfo.year}
> ✿⃘࣪◌ ֪ Duración › ${duracion || ""}
> ✿⃘࣪◌ ֪ Enlace › ${url || ""}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      let yi = songInfo.image || songInfo.cover

      await sock.sendMessage(msg.chat, { image: { url: yi }, caption }, { quoted: msg })

      const resAudio = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
      const resultAudio = await resAudio.json()
      if (!resultAudio.status || !resultAudio.data?.dl) {
        return msg.reply('❖ No se pudo descargar el audio de Spotify.')
      }

      const audioRes = await fetch(resultAudio.data.dl)
      if (!audioRes.ok) {
        return msg.reply('❖ Error al obtener el archivo de audio.')
      }
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

      const mensaje = {
        document: audioBuffer, 
        mimetype: "audio/mpeg", 
        fileName: `${resultAudio.data.title || 'music'}.mp3` 
      };

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg });

    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}