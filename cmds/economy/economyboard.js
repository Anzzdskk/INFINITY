import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['economyboard', 'eboard', 'baltop'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat
    const botId = cleanJid(sock.user?.id || '')
    const botSettings = await db.getSettings(botId)
    const monedas = botSettings?.currency || 'monedas'

    const chatData = await db.getChat(chatId)
    const chatDataa = await db.getChatUser(chatId)
    if (chatData?.adminonly || !chatData?.rpg)
      return msg.reply(mess.comandooff)

    try {
      const users = []
      for (const data of chatDataa || []) {
        const total = (data.coins || 0) + (data.bank || 0)
        if (total >= 1000) {
          const userJid = cleanJid(data.user_id)
          const user = await db.getUser(userJid) || {}
          const name = user.name || userJid.split('@')[0] || 'Usuario' 
          users.push({ ...data, jid: userJid, name })
        }
      }

      if (users.length === 0)
        return msg.reply(`ꕥ No hay usuarios en el grupo con más de 1,000 ${monedas}.`)

      const sorted = users.sort(
        (a, b) => (b.coins || 0) + (b.bank || 0) - ((a.coins || 0) + (a.bank || 0))
      )

      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages)
        return msg.reply(`《✧》 La página *${page}* no existe. Hay *${totalPages}* páginas.`)

      const start = (page - 1) * pageSize
      const end = start + pageSize

      let boardText = `*✩ EconomyBoard (✿◡‿◡)*\n\n`
      boardText += sorted
        .slice(start, end)
        .map(({ name, coins, bank }, i) => {
          const total = (coins || 0) + (bank || 0)
          return `✩ ${start + i + 1} › *${name}*\n     Total → *¥${total.toLocaleString()} ${monedas}*`
        })
        .join('\n')

      boardText += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
      if (page < totalPages)
        boardText += `\n> Para ver la siguiente página › *${prefix + command} ${page + 1}*`

      await msg.reply(boardText)
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}