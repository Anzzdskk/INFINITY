import db from "#db"

/**
 * Normalizes WhatsApp JIDs by removing device suffixes (:xx)
 * @param {string} jid 
 * @returns {string} Cleaned JID
 */
const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    try {
      const sender = cleanJid(msg.sender)
      const chatId = msg.chat
      const botId = cleanJid(sock.user?.id || '')
      const botSettings = await db.getSettings(botId)
      const monedas = botSettings?.currency || 'monedas'
      const chatData = await db.getChat(chatId)

      if (chatData?.adminonly || !chatData?.rpg)
        return msg.reply(mess.comandooff)

      const [cantidadInputRaw] = args
      const mentioned = (msg.mentionedJid || []).map(cleanJid)
      const rawWho = mentioned[0] || args.find(arg => arg.includes('@s.whatsapp.net'))
      const who = cleanJid(rawWho)

      if (!who) return msg.reply(`《✤》 Debes mencionar a quien quieras transferir *${monedas}*.`)

      const senderData = await db.getChatUser(chatId, sender)
      const targetData = await db.getChatUser(chatId, who)

      if (!targetData) return msg.reply(`「✿」 El usuario mencionado no está registrado en el bot.`)

      const cantidadInput = cantidadInputRaw?.toLowerCase()
      const cantidad = cantidadInput === 'all'
        ? (senderData.coins || 0)
        : parseInt(cantidadInput)

      if (!cantidadInput || isNaN(cantidad) || cantidad <= 0)
        return msg.reply(`ꕥ Ingresa una cantidad válida de *${monedas}* para transferir.`)

      if ((senderData.coins || 0) < cantidad)
        return msg.reply(`ꕥ No tienes suficientes *${monedas}* para transferir ${cantidad.toLocaleString()}.`)

      senderData.coins = (senderData.coins || 0) - cantidad
      targetData.coins = (targetData.coins || 0) + cantidad

      await db.updateChatUser(chatId, sender, 'coins', senderData.coins)
      await db.updateChatUser(chatId, who, 'coins', targetData.coins)

      const cantidadFormatted = cantidad.toLocaleString()
      const textoTransferencia = `*¥${cantidadFormatted} ${monedas}*`

      await sock.reply(
        chatId,
        `「✿」 Transferiste ${textoTransferencia} a *@${who.split('@')[0]}*.`,
        msg,
        { mentions: [who] }
      )
    } catch (e) {
      await msg.reply(msgglobal + e)
    }
  }
};