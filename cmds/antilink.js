import db from "#db";

const PATTERNS = {
  antilink_wa: /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}|wa\.me\/[0-9]+)/i,
  antilink_discord: /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9-]+/i,
  antilink_telegram: /(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_+]+/i,
  antilink_youtube: /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/i,
  antilink_instagram: /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i,
  antilink_x: /(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[^\s]+/i,
  antilink_facebook: /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com|fb\.me)\/[^\s]+/i,
  antilink_tiktok: /(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i,
  antilink_all: /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?/i
};

// Comandos de invitación autorizados que no generan sanción
const joinCommands = [
  '/invite', '#invite', '-invite',
  '!invite', '.invite', '+invite'
];

/**
 * Normaliza y verifica si un valor está activado (1 o true)
 */
const isEnabled = (val) => Number(val) === 1 || val === true || val === '1';

export async function before({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins }) {
  if (!msg.isGroup || !msg.text) return;
  if (msg.isBot) return;

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  if (!groupMetadata) return;

  const botSettings = await db.getSettings(botId);
  const isSelf = botSettings?.self ?? 0;
  if (isSelf) return;

  const chat = await db.getChat(msg.chat);
  const primaryBotId = chat?.primaryBot;
  const isPrimary = !primaryBotId || primaryBotId === botId;

  // Si el usuario es admin, el bot no es admin o no es el bot principal, omitir
  if (isAdmins || !isBotAdmins || !isPrimary) return;

  let detectedType = null;

  if (isEnabled(chat?.antilink_wa) && PATTERNS.antilink_wa.test(msg.text)) {
    detectedType = 'WhatsApp';
  } else if (isEnabled(chat?.antilink_discord) && PATTERNS.antilink_discord.test(msg.text)) {
    detectedType = 'Discord';
  } else if (isEnabled(chat?.antilink_telegram) && PATTERNS.antilink_telegram.test(msg.text)) {
    detectedType = 'Telegram';
  } else if (isEnabled(chat?.antilink_youtube) && PATTERNS.antilink_youtube.test(msg.text)) {
    detectedType = 'YouTube';
  } else if (isEnabled(chat?.antilink_instagram) && PATTERNS.antilink_instagram.test(msg.text)) {
    detectedType = 'Instagram';
  } else if (isEnabled(chat?.antilink_x) && PATTERNS.antilink_x.test(msg.text)) {
    detectedType = 'X (Twitter)';
  } else if (isEnabled(chat?.antilink_facebook) && PATTERNS.antilink_facebook.test(msg.text)) {
    detectedType = 'Facebook';
  } else if (isEnabled(chat?.antilink_tiktok) && PATTERNS.antilink_tiktok.test(msg.text)) {
    detectedType = 'TikTok';
  } else if (isEnabled(chat?.antilink_all) && PATTERNS.antilink_all.test(msg.text)) {
    detectedType = 'Enlace General';
  }

  // Si no se detectó ningún enlace prohibido activo, terminar
  if (!detectedType) return;

  const command = msg.text.trim().split(/\s+/)[0].toLowerCase();
  if (joinCommands.includes(command)) return;

  await sock.sendMessage(msg.chat, {
    delete: {
      remoteJid: msg.chat,
      fromMe: false,
      id: msg.key.id,
      participant: msg.key.participant
    }
  }).catch(() => {});

  if (msg.quoted?.key?.id) {
    await sock.sendMessage(msg.chat, {
      delete: {
        remoteJid: msg.chat,
        fromMe: false,
        id: msg.quoted.key.id,
        participant: msg.quoted.key.participant
      }
    }).catch(() => {});
  }

  const chatUser = await db.getChatUser(msg.chat, msg.sender);
  const currentWarns = chatUser?.antilinkWarns || 0;
  const newWarns = currentWarns + 1;

  if (newWarns < 3) {
    await db.updateChatUser(msg.chat, msg.sender, 'antilinkWarns', newWarns);

    const warnText = `⚠️ *[ ANTI-LINK DETECTADO ]*\n\n` +
      `❀ *Usuario:* @${msg.sender.split('@')[0]}\n` +
      `📌 *Tipo:* Enlace de ${detectedType}\n` +
      `🚨 *Advertencias:* [${newWarns}/3]\n\n` +
      `> _Al llegar a 3 advertencias serás expulsado del grupo._`;

    await sock.sendMessage(msg.chat, {
      text: warnText,
      mentions: [msg.sender]
    });
  } else {
    await db.updateChatUser(msg.chat, msg.sender, 'antilinkWarns', 0);

    const kickText = `🚫 *[ SANCIÓN MÁXIMA ]*\n\n` +
      `❀ *Usuario:* @${msg.sender.split('@')[0]}\n` +
      `⛔ *Razón:* Acumular 3 advertencias por enviar enlaces no permitidos.\n\n` +
      `> _Procediendo a expulsar del grupo..._`;

    await sock.sendMessage(msg.chat, {
      text: kickText,
      mentions: [msg.sender]
    });

    setTimeout(async () => {
      try {
        await sock.groupParticipantsUpdate(msg.chat, [msg.sender], 'remove');
      } catch (err) {
        console.error('Error al expulsar en Anti-Link:', err);
      }
    }, 800);
  }
}