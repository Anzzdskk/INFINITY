import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || "") : ""
    const fullText = `${args.join(" ")} ${quotedText}`.trim()

    if (!fullText) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrls = fullText.match(urlRegex) || []
    const urls = foundUrls.filter(u => /instagram\.com\/(p|reel|share|tv)\//.test(u))

    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*.")
    }

    for (const url of urls.slice(0, 5)) {
      try {
        const res = await axios.get(`https://eliasar-yt-api.vercel.app/api/igdl?link=${encodeURIComponent(url)}`)
        const data = res.data

        if (!data || !data.status) {
          await msg.reply("✿ No se pudo obtener el contenido de Instagram.")
          continue
        }

        const dl = data.data?.[0]?.url || data.result?.[0]?.url || data.url
        if (!dl) {
          await msg.reply("✿ No se encontró enlace de descarga.")
          continue
        }

        await sock.sendMessage(
          msg.chat,
          {
            video: { url: dl },
            mimetype: "video/mp4",
            fileName: "instagram.mp4",
          },
          { quoted: msg }
        )
      } catch (e) {
        console.log("IG-ERROR:", e?.message || e)
        await msg.reply("✿ Ocurrió un problema al procesar el enlace de Instagram.")
      }
    }
  }
}