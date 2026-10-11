import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['mf', 'mediafire'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      const quotedText = msg.quoted ? (msg.quoted.text || msg.quoted.body || msg.quoted.caption || "") : ""
      const fullText = `${args.join(' ')} ${quotedText}`.trim()

      if (!fullText) return msg.reply('✐ Ingresa una URL de Mediafire.');

      const match = fullText.match(/https?:\/\/(www\.)?mediafire\.com\/[^\s]+/)
      if (!match) {
        return msg.reply('✦ Solo se aceptan enlaces de Mediafire.');
      }

      const text = match[0]

      const apiUrl = `${api.url}/dl/mediafire?url=${encodeURIComponent(text)}&key=${api.key}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status) return msg.reply('✦ No se pudo obtener el archivo.');

      const { filename, filetype, filesize, uploaded, download } = json.result;

      let info = `˚ʚ♡ɞ₊ *MEDIAFIRE - DL* ෆ╹ .̮ ╹ෆ\n\n`;
      info += `➩ Descargando › *${filename}*\n`;
      info += `> ❖ Tipo › *${filetype}*\n`;
      info += `> ❖ Tamaño › *${filesize}*\n`;
      info += `> ❖ Subido › *${uploaded}*\n\n`;
      info += `⇢ Descargando y enviando archivo...`;

      await msg.reply(info)

      await sock.sendMessage(
        msg.chat,
        {
          document: { url: download },
          mimetype: 'application/octet-stream',
          fileName: filename,
        },
        { quoted: msg }
      );
    } catch (e) {
      console.error(e);
      msg.reply(msgglobal);
    }
  },
};