import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['steal', 'rob', 'robar'],
  category: 'rpg',
  run: async ({ msg, sock }) => {
    try {
      const sender = cleanJid(msg.sender)
      const chatId = msg.chat
      const botId = cleanJid(sock.user?.id || '')
      const botSettings = await db.getSettings(botId)
      const monedas = botSettings?.currency || 'monedas'
      const chatData = await db.getChat(chatId)

      if (chatData?.adminonly || !chatData?.rpg)
        return msg.reply(mess.comandooff)

      const mentioned = (msg.mentionedJid || []).map(cleanJid)
      const rawTarget = mentioned[0] || (msg.quoted ? msg.quoted.sender : null)
      const target = cleanJid(rawTarget)

      if (!target || target === sender)
        return msg.reply(`《✤》 Debes mencionar a quien quieras robarle *${monedas}*.`)

      const senderData = await db.getChatUser(chatId, sender)
      const targetData = await db.getChatUser(chatId, target)
      const na = await db.getUser(target)

      if (!targetData) {
        return msg.reply('ꕥ El usuario *mencionado* no está *registrado* en el bot')
      }

      // Intentar obtener el nombre del usuario de múltiples fuentes
      let targetName = na?.name || na?.pushName || targetData?.name

      // Si el mensaje fue respondiendo a alguien, obtener su pushName
      if (!targetName && msg.quoted && cleanJid(msg.quoted.sender) === target) {
        targetName = msg.quoted.pushName
      }

      // Si la función sock.getName está disponible en Baileys, usarla
      if (!targetName && typeof sock?.getName === 'function') {
        try {
          targetName = await sock.getName(target)
        } catch {
          targetName = null
        }
      }

      // Si se encuentra un nombre de usuario real se usa; si no, se usa la mención @número para que WhatsApp lo reemplace dinámicamente con su nombre de contacto
      const targetDisplayName = targetName ? targetName : `@${target.split('@')[0]}`

      const lastActive = targetData.lastSeen || targetData.lastMessage || targetData.usedTime || 0
      const inactiveTime = Date.now() - lastActive
      const ONE_HOUR_MS = 60 * 60 * 1000

      if (inactiveTime < ONE_HOUR_MS) {
        return msg.reply(
          `✎ Solo puedes robar a usuarios que lleven al menos *1 hora inactivos*.`
        )
      }

      if ((targetData.coins || 0) < 50)
        return msg.reply(
          `ꕤ *${targetDisplayName}* no tiene suficiente *${monedas}* para robarle.`,
          { mentions: [target] }
        )

      const remainingTime = (senderData.roboCooldown || 0) - Date.now()
      if (remainingTime > 0)
        return msg.reply(
          `ꕥ Debes esperar *${msToTime(remainingTime)}* antes de intentar robar nuevamente.`,
        )

      senderData.roboCooldown = Date.now() + 30 * 60 * 1000 // Cooldown de 30 minutos
      await db.updateChatUser(chatId, sender, 'roboCooldown', senderData.roboCooldown)

      const cantidadRobada = Math.min(Math.floor(Math.random() * 5000) + 50, targetData.coins || 0)
      senderData.coins = (senderData.coins || 0) + cantidadRobada
      targetData.coins = (targetData.coins || 0) - cantidadRobada

      await db.updateChatUser(chatId, sender, 'coins', senderData.coins)
      await db.updateChatUser(chatId, target, 'coins', targetData.coins)

      await sock.reply(
        chatId,
        `✐ Le robaste *¥${cantidadRobada.toLocaleString()} ${monedas}* a *${targetDisplayName}*.`,
        msg,
        { mentions: [target] }
      )

    } catch (e) {
      await msg.reply(msgglobal)
    }
  },
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}