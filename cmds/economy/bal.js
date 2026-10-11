import db from "#db"

/**
 * Normaliza cualquier JID de WhatsApp (LID, número de teléfono, sufijos de dispositivo :xx)
 * @param {string} jid 
 * @returns {string} JID sanitizado
 */
const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['balance', 'bal'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const chatData = await db.getChat(chatId)
    const rawBotId = sock.user?.id || ''
    const botId = cleanJid(rawBotId)
    const botSettings = await db.getSettings(botId)
    const monedas = botSettings?.currency || 'monedas'

    if (chatData?.adminonly || !chatData?.rpg)
      return msg.reply(mess.comandooff)

    const mentioned = (msg.mentionedJid || []).map(cleanJid)
    const rawWho = mentioned.length > 0 
      ? mentioned[0] 
      : (msg.quoted ? msg.quoted.sender : msg.sender)
    const who = cleanJid(rawWho)

    const user = await db.getChatUser(chatId, who)
    const user2 = await db.getUser(who)
    if (!user)
      return msg.reply(`「✿」 El usuario mencionado no está registrado en el bot.`)

    const total = (user.coins || 0) + (user.bank || 0)
    const displayName = user2?.name || msg.pushName || who.split('@')[0]

    const bal = `*ꕥ Balance de ›* ${displayName}

\t➠ *${monedas}* : *¥${(user.coins || 0).toLocaleString()}*
\t➠ *Banco* : *¥${(user.bank || 0).toLocaleString()}*
\t➠ *Total* : *¥${total.toLocaleString()}*

> Para proteger tus *${monedas}*, depósitalas en el banco usando *${prefix}dep*`

    await sock.reply(chatId, bal, msg)
  }
};