import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['ppt'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const sender = cleanJid(msg.sender)
    const chatId = msg.chat
    const botId = cleanJid(sock.user?.id || '')
    const botSettings = await db.getSettings(botId)
    const monedas = botSettings?.currency || 'monedas'
    const chatData = await db.getChat(chatId)

    if (chatData?.adminonly || !chatData?.rpg)
      return msg.reply(mess.comandooff)

    const user = await db.getChatUser(chatId, sender)
    const user2 = await db.getUser(sender)
    const remainingTime = (user.pptCooldown || 0) - Date.now()

    if (remainingTime > 0)
      return msg.reply(`❀ Debes esperar *${msToTime(remainingTime)}* antes de jugar nuevamente.`)

    const options = ['piedra', 'papel', 'tijera']
    const userChoice = args[0]?.trim().toLowerCase()

    if (!options.includes(userChoice))
      return msg.reply(`《✤》 Usa el comando así:\n› *${prefix + command} piedra*, *papel* o *tijera*`)

    const botChoice = options[Math.floor(Math.random() * options.length)]
    const result = determineWinner(userChoice, botChoice)

    const reward = Math.floor(Math.random() * 3000)
    const exp = Math.floor(Math.random() * 1000)
    const loss = Math.floor(Math.random() * 1000)
    const tieReward = Math.floor(Math.random() * 100)
    const tieExp = Math.floor(Math.random() * 100)

    if (result === 'win') {
      user.coins = (user.coins || 0) + reward
      user2.exp = (user2.exp || 0) + exp

      await db.updateChatUser(chatId, sender, 'coins', user.coins)
      await db.updateUser(sender, 'exp', user2.exp)

      await sock.reply(
        chatId,
        `✿ Ganaste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* ¥${reward.toLocaleString()}\n> *Exp ›* ${exp}\n\n${dev}`,
        msg
      )
    } else if (result === 'lose') {
      const total = (user.coins || 0) + (user.bank || 0)
      const actualLoss = Math.min(loss, total)

      if ((user.coins || 0) >= actualLoss) {
        user.coins -= actualLoss
        await db.updateChatUser(chatId, sender, 'coins', user.coins)
      } else {
        const remaining = actualLoss - (user.coins || 0)
        user.coins = 0
        user.bank = Math.max(0, (user.bank || 0) - remaining)

        await db.updateChatUser(chatId, sender, 'coins', user.coins)
        await db.updateChatUser(chatId, sender, 'bank', user.bank)
      }

      await sock.reply(
        chatId,
        `✿ Perdiste.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* -¥${actualLoss.toLocaleString()}\n\n${dev}`,
        msg
      )
    } else {
      user.coins = (user.coins || 0) + tieReward
      user2.exp = (user2.exp || 0) + tieExp

      await db.updateChatUser(chatId, sender, 'coins', user.coins)
      await db.updateUser(sender, 'exp', user2.exp)

      await sock.reply(
        chatId,
        `✿ Empate.\n\n> *Tu elección ›* ${userChoice}\n> *Bot eligió ›* ${botChoice}\n> *${monedas} ›* +¥${tieReward.toLocaleString()}\n> *Exp ›* +${tieExp}\n\n${dev}`,
        msg
      )
    }

    user.pptCooldown = Date.now() + 10 * 60 * 1000
    await db.updateChatUser(chatId, sender, 'pptCooldown', user.pptCooldown)
  },
}

function determineWinner(user, bot) {
  if (user === bot) return 'tie'
  if (
    (user === 'piedra' && bot === 'tijera') ||
    (user === 'papel' && bot === 'piedra') ||
    (user === 'tijera' && bot === 'papel')
  )
    return 'win'
  return 'lose'
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}