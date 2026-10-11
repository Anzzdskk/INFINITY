import { getCachedMeta } from '#serialize';

const welcomeTexts = {
  1: `𓇬⋆ ﾟ꩜‧˚𑁍ܓ   ֹ  𝖡𝗂𝖾ɳ𝗏𝖾𝗇𝗂𝖽@ 𝖺\n                 @group  ꒱꒱ㅤㅤㅤ\n\n*ֹ  ᦕ   ׄ                      _@user_*\n\n         ׅ     ⑅ ׄ     .˙ Disfruta tu estadía\n\n  ۟  ─ _Ahora somos *@members* miembros_\n\n> Puedes usar #menu para ver la lista de comandos.`,
  
  2: `ᅟㅤ 𓈒    |꛱ ᷼ |꛱ ᷼ |ㅤֵㅤ  ̄ 𐇽  *WELCOME*ㅤ࣫ㅤ|꛱ ᷼ |꛱ ᷼ |ㅤ 𓈒\n\n𖫨𖫨🪷⃨᪲  *@group*\n𖫨𖫨🪷⃨᪲  @user\n\n𐴲੭  ˙ 𓂃  🍥  𓂃  ˙\n\nᅟㅤ 𓈒    |꛱ ᷼ |꛱ ᷼ |ㅤֵㅤ  ̄ 𐇽 🍓 ㅤ࣫ㅤ|꛱ ᷼ |꛱ ᷼ |ㅤ 𓈒`,
  
  3: `╭┈──̇─̇─̇────̇─̇─̇──◯◝\n┊「 *Bienvenido/a)* 」\n┊︶︶︶︶︶︶︶︶︶︶︶\n┊  *Nombre ›* @user\n┊  *Grupo ›* @group\n┊┈─────̇─̇─̇─────◯◝\n┊» *Usa : #menu\n> para ver mi lista de comandos\n┊» *Ahora somos : @members miembros\n┊ ︿︿︿︿︿︿︿︿︿︿︿\n╰─────────────────╯`
};

let handler = async ({ msg, sock, args, command, usedPrefix, isAdmins }) => {
  const m = msg;
  const chatId = m.chat;
  const isGroup = m.isGroup;
  
  if (!isGroup) {
    return sock.sendMessage(chatId, { text: '⚠️ Este comando solo se puede usar en grupos.' }, { quoted: m });
  }

  if (!isAdmins) {
    return sock.sendMessage(chatId, { text: '⚠️ Este comando solo puede ser utilizado por administradores del grupo.' }, { quoted: m });
  }

  const subCommand = args[0] ? args[0].toLowerCase() : '';
  const option = parseInt(subCommand);

  if (option >= 1 && option <= 3) {
    let textToSend = welcomeTexts[option];

    return sock.sendMessage(chatId, {
      text: textToSend
    }, { quoted: m });
  }

  const menuText = `Copias y lo pegas junto a la Bienvenida que deseas establecer\n:`;

  const buttons = [
    {
      buttonId: `${usedPrefix}${command} 1`,
      buttonText: { displayText: '✨ Bienvenida 1' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}${command} 2`,
      buttonText: { displayText: '🍓 Bienvenida 2' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}${command} 3`,
      buttonText: { displayText: '📜 Bienvenida 3' },
      type: 1
    }
  ];

  try {
    return await sock.sendMessage(chatId, {
      text: menuText,
      buttons: buttons,
      headerType: 1
    }, { quoted: m });
  } catch (err) {
    console.error('Error enviando botones de bienvenida:', err);
    return sock.sendMessage(chatId, { text: menuText }, { quoted: m });
  }
};

handler.help = ['welcometext [1-3]', 'testwelcome', 'bienvenidas'];
handler.tags = ['group'];
handler.command = ['welcometext', 'testwelcome', 'bienvenidas'];
handler.group = true;
handler.admin = true;

if (!global.comandos) global.comandos = new Map();
global.comandos.set('welcometext', {
  run: handler,
  pluginKey: 'welcometext',
  group: true,
  admin: true
});
global.comandos.set('testwelcome', {
  run: handler,
  pluginKey: 'welcometext',
  group: true,
  admin: true
});
global.comandos.set('bienvenidas', {
  run: handler,
  pluginKey: 'welcometext',
  group: true,
  admin: true
});

export default handler;