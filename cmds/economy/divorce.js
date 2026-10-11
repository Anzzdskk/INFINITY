import db from "#db"

const cleanJid = (jid) => (typeof jid === 'string' ? jid.replace(/:\d+@/, '@') : '')

export default {
  command: ['divorce'],
  category: 'rpg',
  run: async ({ msg, sock }) => {
    const sender = cleanJid(msg.sender)
    const user = await db.getUser(sender)
    const partnerId = cleanJid(user?.marry || '')

    if (!partnerId) return msg.reply('ꕥ Tú no estás casado con nadie.')

    const user2 = await db.getUser(partnerId)

    user.marry = ''
    if (user2) user2.marry = ''

    await db.updateUser(sender, 'marry', user.marry)
    await db.updateUser(partnerId, 'marry', '')

    const userName = msg.pushName || user?.name || sender.split('@')[0]
    const partnerName = user2?.name || partnerId.split('@')[0]

    return msg.reply(
      `✐ *${userName}* te has divorciado de *${partnerName}*.`,
    )
  },
};