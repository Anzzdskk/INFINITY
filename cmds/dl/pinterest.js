import fetch from 'node-fetch'

const masha = 'https://sm.alycore.xyz'
const alya = 'https://salya.alycore.xyz'
const masachika = 'https://sm2.alycore.xyz'

export default {
  command: ['pin', 'pinterest'],
  category: 'downloader',
  run: async ({ msg, sock, args, command, prefix }) => {
    const search = args?.join(' ')

    if (!search) {
      return msg.reply(`Ups, parece que olvidaste escribir qué deseas buscar.\n\nEjemplo de uso:\n${prefix || '.'}${command} Alya icons`)
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
      const endpoint = `${server.url}/pinterest?search=${encodeURIComponent(search)}`

      try {
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`Respuesta inválida (${res.status})`)

        const json = await res.json()

        if (!json.status || !json.results?.length) {
          throw new Error('No se encontraron resultados')
        }

        const images = json.results
          .filter(item => item.image)
          .slice(0, 5)

        if (!images.length) {
          throw new Error('No se encontraron imágenes válidas')
        }

        for (let i = 0; i < images.length; i++) {
          await sock.sendMessage(msg.chat, {
            image: { url: images[i].image },
            caption: i === 0
              ? `🖼️ *Resultados de:* ${json.query}\n\n💫 Procesado por: *${server.name}*`
              : undefined
          }, { quoted: i === 0 ? msg : undefined })
        }

        success = true
        break

      } catch (err) {
        lastError = `❌ Falló ${server.name}: ${err.message || err}`
        console.log(lastError)
      }
    }

    if (!success) {
      await msg.reply(`🚫 No se pudieron obtener resultados desde ninguno de los servidores disponibles.\n\n${lastError}`)
    }
  }
}