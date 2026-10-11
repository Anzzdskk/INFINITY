import db from "#db"
import axios from "axios"
import FormData from "form-data"

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

function generateUniqueFilename(mime) {
  const ext = mime.split("/")[1] || "bin"
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${id}.${ext}`
}

async function uploadCatbox(buffer, mime) {
  const form = new FormData()
  form.append("reqtype", "fileupload")
  form.append("fileToUpload", buffer, generateUniqueFilename(mime))

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  const url = typeof res.data === "string" ? res.data.trim() : res.data?.toString().trim()
  if (!url || !url.startsWith("http")) {
    throw new Error("Respuesta inválida de Catbox: " + JSON.stringify(res.data))
  }
  return url
}

export default {
  command: ["tourl"],
  category: "utils",
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || ""
    if (!mime) {
      return sock.reply(
        msg.chat,
        `✿ Responde a una imagen o video con *${prefix + command}* para convertirlo en URL.`,
        msg
      )
    }

    try {
      const media = await q.download()
      if (!media) return msg.reply("ꕥ No se pudo descargar el archivo.")

      const link = await uploadCatbox(media, mime)
      const userName = msg.pushName || "Usuario"

      const upload = `𖹭 ❀ *Upload To CATBOX*\n\n` +
        `ׅ  ׄ  ✿   ׅ り *Link ›* ${link}\n` +
        `ׅ  ׄ  ✿   ׅ り *Peso ›* ${formatBytes(media.length)}\n` +
        `ׅ  ׄ  ✿   ׅ り *Tipo ›* ${mime.split("/")[1]?.toUpperCase() || "UNKNOWN"}\n` +
        `ׅ  ׄ  ✿   ׅ り *Solicitado por ›* ${userName}\n\n${dev}`

      await msg.reply(upload)
    } catch (e) {
      console.error(e)
      await msg.reply(`${msgglobal}`)
    }
  }
}