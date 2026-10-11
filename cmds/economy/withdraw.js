import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['withdraw', 'with'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    const sender = cleanJid(msg.sender)
    const chatId = msg.chat
    const botId = cleanJid(sock.user?.id || '')
    const botSettings = await db.getSettings(botId)
    const chatData = await db.getChat(chatId)

    if (chatData?.adminonly || !chatData?.rpg)
      return msg.reply(mess.comandooff)

    const user = await db.getChatUser(chatId, sender)
    const currency = botSettings?.currency || 'monedas'

    if (!args[0]) return msg.reply(`《✤》 Ingresa la cantidad de *${currency}* que quieras retirar.`)

    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0)
        return msg.reply(`✐ No tienes *${currency}* para retirar de tu Banco.`)

      const amount = user.bank
      user.bank = 0
      user.coins = (user.coins || 0) + amount

      await db.updateChatUser(chatId, sender, 'bank', user.bank)
      await db.updateChatUser(chatId, sender, 'coins', user.coins)

      return msg.reply(`✐ Has retirado *¥${amount.toLocaleString()} ${currency}* de tu Banco.`)
    }

    const count = parseInt(args[0])
    if (isNaN(count) || count < 1) return msg.reply(`✎ Ingresa una cantidad válida para retirar.`)

    if ((user.bank || 0) < count)
      return msg.reply(
        `✐ No tienes suficientes *${currency}* en tu banco para retirar esa cantidad.`,
      )

    user.bank -= count
    user.coins = (user.coins || 0) + count

    await db.updateChatUser(chatId, sender, 'bank', user.bank)
    await db.updateChatUser(chatId, sender, 'coins', user.coins)

    await msg.reply(`✐ Has retirado *¥${count.toLocaleString()} ${currency}* de tu Banco.`)
  },
}