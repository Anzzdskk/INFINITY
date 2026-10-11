import { normalizeJid, resolveParticipantJid, resolveJidSync, deleteCachedMeta, getCachedMeta, setCachedMeta } from '#serialize';
import db from "#db";
import chalk from 'chalk';
import moment from 'moment-timezone';

function getGroupAdmins(participants) {
  return (participants ?? []).filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id).filter(Boolean);
}

function resolveEventParticipant(p, sock) {
  if (typeof p === 'string') return resolveJidSync(p, sock) || p;
  return resolveParticipantJid(p, sock) || normalizeJid(p.id || p.phoneNumber || p.jid || p.lid || '') || '';
}

function formatTemplateText(templateText, phone, metadata, memberCount, tiempo, tiempo2) {
  return (templateText || '')
    .replace(/@user/g, `@${phone}`)
    .replace(/@group/g, metadata?.subject || '')
    .replace(/@desc/g, metadata?.desc || 'Sin descripción')
    .replace(/@members/g, memberCount)
    .replace(/@time/g, `${tiempo} ${tiempo2}`);
}

async function sendCustomEventMessage(sock, chatId, eventConfig, defaultText, contextBase) {
  const data = eventConfig.data;
  const legacyMsg = eventConfig.legacyMessage;

  // Verificar si existe alguna configuración personalizada guardada (multimedia o texto)
  const hasCustomConfig = Boolean(
    (data && (data.media || (data.text !== undefined && data.text !== null))) ||
    (legacyMsg && legacyMsg.trim() !== '')
  );

  // Si se estableció una personalizada, desactivar el texto predeterminado por completo
  let rawText = '';
  if (hasCustomConfig) {
    rawText = data ? (data.text ?? '') : (legacyMsg ?? '');
  } else {
    rawText = defaultText;
  }

  const captionText = rawText ? formatTemplateText(
    rawText,
    eventConfig.phone,
    eventConfig.metadata,
    eventConfig.memberCount,
    eventConfig.tiempo,
    eventConfig.tiempo2
  ).trim() : '';

  if (data && data.media && data.type) {
    const buffer = Buffer.from(data.media, 'base64');

    if (data.type === 'sticker') {
      await sock.sendMessage(chatId, { sticker: buffer }, { quoted: null });
      if (captionText) {
        await sock.sendMessage(chatId, { text: captionText, contextInfo: contextBase }, { quoted: null });
      }
      return;
    }

    if (data.type === 'image') {
      await sock.sendMessage(chatId, {
        image: buffer,
        caption: captionText || undefined,
        contextInfo: contextBase
      }, { quoted: null });
      return;
    }

    if (data.type === 'video') {
      await sock.sendMessage(chatId, {
        video: buffer,
        gifPlayback: true,
        caption: captionText || undefined,
        mimetype: data.mimetype || 'video/mp4',
        contextInfo: contextBase
      }, { quoted: null });
      return;
    }
  }

  if (captionText) {
    await sock.sendMessage(chatId, {
      text: captionText,
      contextInfo: contextBase
    }, { quoted: null });
  }
}

export default async (sock, msg) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (['add', 'remove', 'leave', 'promote', 'demote'].includes(anu.action)) {
        deleteCachedMeta(anu.id);
      }

      const metadata = await (async () => {
        const cached = getCachedMeta(anu.id);
        if (cached) return cached;
        for (let i = 0; i < 3; i++) {
          const m = await sock.groupMetadata(anu.id).catch(() => null);
          if (m) { setCachedMeta(anu.id, m); return m; }
          await new Promise(r => setTimeout(r, 1500));
        }
        return null;
      })();

      const groupAdmins = metadata ? getGroupAdmins(metadata.participants) : [];
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      const chat = await db.getChat(anu.id);
      const botSettings = await db.getSettings(botId);

      const primaryBotId = chat?.primaryBot;
      const isSelf = (botSettings?.self ?? 0) || (chat?.isMute ?? false);

      if (isSelf) return;

      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');
      const memberCount = metadata?.participants?.length || 0;

      const isWelcomeEnabled = Number(chat?.welcome) === 1;
      const isGoodbyeEnabled = Number(chat?.goodbye) === 1;

      for (const p of anu.participants) {
        const jid = resolveEventParticipant(p, sock);
        if (!jid) continue;

        const phone = jid.split('@')[0];

        const contextBase = {
          mentionedJid: [jid].filter(Boolean),
          isForwarded: false
        };

        if (anu.action === 'add' && isWelcomeEnabled && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          const defaultWelcomeText = `
𓇬⋆ ﾟ꩜‧˚𑁍ܓ   ֹ  \`𝖡𝗂𝖾ɳ𝗏𝖾𝗇𝗂𝖽@ 𝖺\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ     ⑅ ׄ     .˙ Disfruta tu estadía

  ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/menu\` para ver la lista de comandos.
`;

          await sendCustomEventMessage(sock, anu.id, {
            data: chat?.welcomeData,
            legacyMessage: chat?.welcomeMessage,
            phone,
            metadata,
            memberCount,
            tiempo,
            tiempo2
          }, defaultWelcomeText, contextBase);
        }

        if ((anu.action === 'remove' || anu.action === 'leave') && isGoodbyeEnabled && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          const defaultGoodbyeText = `
𓇬⋆ ﾟ꩜‧˚𑁍ܓ  \`𝙷𝚊𝚜𝚝𝚊 𝚕𝚞𝚎𝚐𝚘\`

*ֹ  ᦕ   ׄ                      _@${phone}_*

🍁  ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.
`;

          await sendCustomEventMessage(sock, anu.id, {
            data: chat?.goodbyeData,
            legacyMessage: chat?.byeMessage,
            phone,
            metadata,
            memberCount,
            tiempo,
            tiempo2
          }, defaultGoodbyeText, contextBase);
        }

        if (anu.action === 'remove' || anu.action === 'leave') {
          const user = chat?.users?.[jid];
          if (user && typeof user.afk === 'number' && user.afk > -1) {
             if(chat && chat.users && chat.users[jid]) {
                chat.users[jid].afk = -1;
                chat.users[jid].afkReason = '';
             }
          }
        }

        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `·˚ ༘₊· ͟͟͞͞꒰✎ *@${phone}* ha sido promovido a Administrador por *@${authorJid.split('@')[0]}. ⋆. 𐙚 ˚`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }

        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `·˚ ༘₊· ͟͟͞͞꒰✎ *@${phone}* ha sido degradado de Administrador por *@${authorJid.split('@')[0]}.* ⋆. 𐙚 ˚`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT ERROR ] → ${err}`));
    }
  });
};