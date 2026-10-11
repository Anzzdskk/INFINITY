import db from "#db";
import { downloadContentFromMessage } from 'baileys';

async function downloadQuotedMedia(quotedMsg) {
  const mediaTypeMap = {
    imageMessage: { type: 'image', streamType: 'image' },
    videoMessage: { type: 'video', streamType: 'video' },
    stickerMessage: { type: 'sticker', streamType: 'sticker' }
  };

  const key = Object.keys(quotedMsg).find(k => mediaTypeMap[k]);
  if (!key) return null;

  const streamInfo = mediaTypeMap[key];
  const stream = await downloadContentFromMessage(quotedMsg[key], streamInfo.streamType);
  let buffer = Buffer.alloc(0);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  return {
    type: streamInfo.type,
    base64: buffer.toString('base64'),
    mimetype: quotedMsg[key]?.mimetype || ''
  };
}

export default {
  command: ['setwelcome', 'setbienvenida'],
  category: 'grupo',
  isAdmin: true,
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chat = await db.getChat(msg.chat);

    if (!args.length && !msg.quoted) {
      return msg.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ *Configuración de Bienvenida* ࣭𑁯ᰍ   ̊ ܃܃

Puedes responder/citar a una *Imagen*, *Video/GIF* o *Sticker* con este comando para establecerlo como bienvenida.

*❒ Variables disponibles:*
𖣣ֶㅤ֯⌗ ✤ ⬭ *@user*    → Mención del usuario que entra
𖣣ֶㅤ֯⌗ ✤ ⬭ *@group*   → Nombre del grupo
𖣣ֶㅤ֯⌗ ✤ ⬭ *@desc*    → Descripción del grupo
𖣣ֶㅤ֯⌗ ✤ ⬭ *@members* → Número de miembros actuales
𖣣ֶㅤ֯⌗ ✤ ⬭ *@time*    → Fecha y hora

*Ejemplos de uso:*
> • Responder a un video/gif con: \`${prefix}${command} ¡Bienvenid@ a @group!\`
> • Responder a un sticker con: \`${prefix}${command}\` (sin texto) o con texto.
> • Poner solo texto: \`${prefix}${command} Hola @user bienvenido a @group\`

✿ Para borrar la bienvenida actual y restablecer a defecto:
\`${prefix}${command} 0\``);
    }

    if (args[0] === '0') {
      await db.updateChat(msg.chat, 'welcomeData', null);
      await db.updateChat(msg.chat, 'welcomeMessage', '');
      return msg.reply('✐ Se ha restablecido y eliminado la bienvenida personalizada del grupo.');
    }

    let mediaData = null;
    const quotedMsg = msg.quoted ? (msg.quoted.message || msg.quoted) : null;

    if (quotedMsg) {
      try {
        mediaData = await downloadQuotedMedia(quotedMsg);
      } catch (e) {
        return msg.reply('❌ Ocurrió un error al procesar el archivo multimedia adjunto.');
      }
    }

    const customText = args.join(' ').trim();

    const welcomePayload = {
      type: mediaData ? mediaData.type : 'text',
      media: mediaData ? mediaData.base64 : null,
      mimetype: mediaData ? mediaData.mimetype : null,
      text: customText
    };

    await db.updateChat(msg.chat, 'welcomeData', welcomePayload);
    await db.updateChat(msg.chat, 'welcomeMessage', customText);

    let tipoStr = 'solo texto';
    if (mediaData?.type === 'video') tipoStr = 'Video/GIF';
    if (mediaData?.type === 'image') tipoStr = 'Imagen';
    if (mediaData?.type === 'sticker') tipoStr = 'Sticker';

    return msg.reply(`✐ ¡Nueva bienvenida configurada con éxito!\n\n> ❖ *Tipo:* ${tipoStr}\n> ❖ *Texto:* ${customText ? customText : '_Sin texto adicional_'}\n\n Recordatorio: Puedes activar o desactivar la bienvenida con \`${prefix}welcome on/off\`.`);
  }
};