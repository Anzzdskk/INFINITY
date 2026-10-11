import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['dep', 'deposit', 'd'],
  category: 'rpg',
  run: async ({ msg, sock, args }) => {
    const sender = cleanJid(msg.sender)
    const chatData = await db.getChat(msg.chat)
    const user = await db.getChatUser(msg.chat, sender)
    const idBot = cleanJid(sock.user?.id || '')
    const settings = await db.getSettings(idBot)
    const monedas = settings?.currency || 'monedas'

    if (chatData?.adminonly || !chatData?.rpg)
      return msg.reply(mess.comandooff)

    if (!args[0]) {
      return msg.reply(
        `《✤》 Ingresa la cantidad de *${monedas}* que quieras *depositar*.`,
      )
    }

    if (args[0] < 1 && args[0].toLowerCase() !== 'all') {
      return msg.reply('✐ Ingresa una cantidad *válida* para depositar')
    }

    if (args[0].toLowerCase() === 'all') {
      if ((user.coins || 0) <= 0) return msg.reply(`✎ No tienes *${monedas}* para depositar en tu *banco*`)

      const count = user.coins
      user.coins = 0
      user.bank = (user.bank || 0) + count

      await db.updateChatUser(msg.chat, sender, 'coins', user.coins)
      await db.updateChatUser(msg.chat, sender, 'bank', user.bank)

      await msg.reply(`「✎」 Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco`)
      return true
    }

    if (!Number(args[0]) || parseInt(args[0]) < 1) {
      return msg.reply('✐ Ingresa una cantidad *válida* para depositar')
    }

    const count = parseInt(args[0])
    if ((user.coins || 0) <= 0 || user.coins < count) {
      return msg.reply(`✎ No tienes suficientes *${monedas}* para depositar`)
    }

    user.coins -= count
    user.bank = (user.bank || 0) + count

    await db.updateChatUser(msg.chat, sender, 'coins', user.coins)
    await db.updateChatUser(msg.chat, sender, 'bank', user.bank)
    await msg.reply(`「✿」 Has depositado *¥${count.toLocaleString()} ${monedas}* en tu Banco`)
  },
};