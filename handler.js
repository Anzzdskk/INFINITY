import db from "#db";
import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import { getCachedMeta, setCachedMeta } from '#serialize';

/**
 * Normaliza un JID eliminando los sufijos de dispositivo (ej. 1234:5@s.whatsapp.net -> 1234@s.whatsapp.net)
 * Soporta @s.whatsapp.net, @lid y cualquier dominio o formato de WhatsApp.
 */
const cleanJid = (jid) => {
  if (!jid || typeof jid !== 'string') return '';
  return jid.replace(/:[0-9]+(?=@)/, '').trim();
};

/**
 * Extrae el ID base (número de teléfono, ID de LID o nombre de usuario) sin dominio ni dispositivo.
 */
const toBaseId = (jid) => {
  if (!jid || typeof jid !== 'string') return '';
  const cleaned = cleanJid(jid);
  return cleaned.split('@')[0] || '';
};

/**
 * Compara dos identificadores para determinar si corresponden al mismo usuario,
 * independientemente del formato (@s.whatsapp.net, @lid, número o username).
 */
const isSameUser = (target, compare) => {
  if (!target || !compare) return false;
  const cleanTarget = cleanJid(target);
  const cleanCompare = cleanJid(compare);
  if (cleanTarget === cleanCompare) return true;
  
  const baseTarget = toBaseId(target);
  const baseCompare = toBaseId(compare);
  return baseTarget.length > 0 && baseTarget === baseCompare;
};

export default async (sock, msg) => {
  if (msg.fromMe && !msg.key.participant && msg.isBot) return;  
  
  const sender = cleanJid(msg.sender);

  const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId ||
                   msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                   msg.message?.templateButtonReplyMessage?.selectedId ||
                   (() => {
                     try {
                       const json = msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
                       return json ? JSON.parse(json)?.id : null;
                     } catch { 
                       return null; 
                     }
                   })();

  if (buttonId) {
    msg.text = buttonId;
    msg.body = buttonId;
  }

  let body = msg.body || msg.text || '';
  if (typeof msg.text !== 'string') {
    msg.text = body || '';
  }

  const from = msg.key.remoteJid;
  
  // Obtención y limpieza universal del Bot JID
  const rawBotId = sock.user?.id || sock.user?.lid || '';
  const botJid = cleanJid(rawBotId) || (rawBotId.split(':')[0] + '@s.whatsapp.net');

  const chatData = await db.getChat(msg.chat);
  const settings = await db.getSettings(botJid);  

  // Lista de Owners normalizados a cualquier formato (números, LIDs, strings)
  const rawOwners = Array.isArray(global.owner) ? global.owner : [];
  const normalizedOwners = rawOwners.map(o => {
    if (typeof o === 'number') return String(o);
    if (typeof o === 'string') return o.includes('@') ? cleanJid(o) : o;
    return '';
  }).filter(Boolean);

  const isOwner = normalizedOwners.some(ownerId => isSameUser(sender, ownerId));
  const settingsOwner = settings.owner ? [settings.owner] : [];
  const rOwners = [botJid, ...settingsOwner, ...normalizedOwners];
  const isROwner = rOwners.some(ownerId => isSameUser(sender, ownerId));

  let groupMetadata = null;
  let groupName = '';
  if (msg.isGroup) {
    groupMetadata = getCachedMeta(msg.chat);
    if (!groupMetadata) {
      groupMetadata = await sock.groupMetadata(msg.chat).catch(() => null);
      if (groupMetadata) setCachedMeta(msg.chat, groupMetadata);
    }
    groupName = groupMetadata?.subject || '';
  }
  
  const participants = groupMetadata?.participants || [];
  
  // Set de administradores que agrupa JIDs, LIDs y números base
  const adminIdentifiers = new Set();
  participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').forEach(p => {
    if (p.id) {
      adminIdentifiers.add(cleanJid(p.id));
      adminIdentifiers.add(toBaseId(p.id));
    }
    if (p.lid) {
      adminIdentifiers.add(cleanJid(p.lid));
      adminIdentifiers.add(toBaseId(p.lid));
    }
    if (p.phoneNumber) {
      adminIdentifiers.add(cleanJid(p.phoneNumber));
      adminIdentifiers.add(toBaseId(p.phoneNumber));
    }
  });

  const senderClean = cleanJid(sender);
  const senderBase = toBaseId(sender);
  const botClean = cleanJid(botJid);
  const botBase = toBaseId(botJid);

  const isBotAdmins = msg.isGroup ? (adminIdentifiers.has(botClean) || adminIdentifiers.has(botBase)) : false;
  const isAdmins = msg.isGroup ? (adminIdentifiers.has(senderClean) || adminIdentifiers.has(senderBase)) : false;

  Promise.allSettled(
    (global.cmdsExecute ?? [])
      .filter(p => p.type === 'all')
      .map(p => p.fn({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: p.dirname })
      .catch(e => console.error(chalk.gray(`[ ✿ ] Error all-plugin ${p.key}: ${e.message}`))))
  );

  const tf = await db.getChatUser(msg.chat, msg.sender);
  const to = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-'); 

  if (!tf) {
    await db.updateChatUser(msg.chat, msg.sender, { stats: { [to]: { msgs: 0, cmds: 0 } } });
  } else {
    if (!tf.stats) tf.stats = {};
    if (!tf.stats[to]) tf.stats[to] = { msgs: 0, cmds: 0 };
    tf.stats[to].msgs++;
    await db.updateChatUser(msg.chat, msg.sender, 'stats', tf.stats);
  }

  const rawBotname = settings.namebot2 || 'Anzz';
  const tipo = settings.type || 'Sub';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s]/g, '');
  const namebot = cleanBotname || 'Anzz';
  const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), namebot.split(" ")[0].slice(0, 3)];
  const prefixes = shortForms.map(name => `${name}`);
  prefixes.unshift(namebot);
  
  let prefix;
  if (Array.isArray(settings.prefijo) || typeof settings.prefijo === 'string') {
    const prefixArray = Array.isArray(settings.prefijo) ? settings.prefijo : [settings.prefijo];
    prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'i');
  } else if (settings.prefijo === 1) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp('^(' + prefixes.join('|') + ')?', 'i');
  }

  const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let customCmd = null;
  let pluginPrefix = prefix;

  for (const [cmdName, data] of global.comandos) {
    if (!data.customPrefix) continue;
    const cp = data.customPrefix;
    const ms = cp instanceof RegExp 
      ? [[cp.exec(msg.text), cp]] 
      : Array.isArray(cp) 
        ? cp.map(p => { let r = p instanceof RegExp ? p : new RegExp(strRegex(p)); return [r.exec(msg.text), r]; }) 
        : typeof cp === 'string' 
          ? [[new RegExp(strRegex(cp)).exec(msg.text), new RegExp(strRegex(cp))]] 
          : [[null, null]];
    if (ms.find(p => p[0])) { customCmd = cmdName; pluginPrefix = cp; break; }
  }

  let matchs = pluginPrefix instanceof RegExp 
    ? [[pluginPrefix.exec(msg.text), pluginPrefix]] 
    : Array.isArray(pluginPrefix) 
      ? pluginPrefix.map(p => {
          let regex = p instanceof RegExp ? p : new RegExp(strRegex(p));
          return [regex.exec(msg.text), regex];
        }) 
      : typeof pluginPrefix === 'string' 
        ? [[new RegExp(strRegex(pluginPrefix)).exec(msg.text), new RegExp(strRegex(pluginPrefix))]] 
        : [[null, null]];
        
  let match = matchs.find(p => p[0]) || null;

  for (const p of (global.cmdsExecute ?? [])) {
    if (p.type !== 'before') continue;
    try {
      if (await p.fn({ msg, sock, match, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: p.dirname })) continue;
    } catch (e) {
      console.error(chalk.gray(`[ ✿ ] Error before-plugin ${p.key}: ${e.message}`));
    }
  }

  if (!match) return;

  let usedPrefix = (match[0] || [])[0] || '';
  let args = msg.text.slice(usedPrefix.length).trim().split(" ");
  let command = customCmd ?? (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');
  if (!command) return;

  const pushname = msg.pushName || 'Sin nombre';
  const consolePrimary = chatData.primaryBot;

  if (msg.message || !consolePrimary || isSameUser(consolePrimary, botJid)) {
    console.log(`
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄
❚ ▸ ${chalk.cyan('𝐁𝐎𝐓 ❱❱')} ${chalk.bgMagenta(chalk.white.italic(sock.user?.name || 'Bot'))}
❚ ▸ ${chalk.cyan('𝐇𝐎𝐑𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.black.bgWhite(moment().format('DD/MM/YY HH:mm:ss'))}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(pushname)} / ${chalk.bgMagentaBright.bold(msg.isGroup ? 'Grupo' : 'Chat Private')}
❚ ▸ ${chalk.green('𝐂𝐎𝐌𝐀𝐍𝐃𝐎 ❱❱')} ${chalk.magentaBright(command ? command : 'No Command')}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.redBright('𝐓𝐈𝐏𝐎 ❱❱')} ${chalk.greenBright.bold('[Bot Log]')}
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄`.trim());
  }

  const hasPrefix = (settings.prefijo === 1 || settings.prefijo === true) 
    ? true 
    : (Array.isArray(settings.prefijo) ? settings.prefijo : typeof settings.prefijo === 'string' ? [settings.prefijo] : []).some(p => msg.text?.startsWith(p));
  
  const botprimaryId = chatData?.primaryBot;
  if (botprimaryId && !isSameUser(botprimaryId, botJid)) {
    if (hasPrefix) {
      const groupJids = participants.flatMap(p => [p.id, p.lid].filter(Boolean));
      const sessionDirs = ['./Sessions/Subs'];
      function getAllSessionBots() {
        const bots = [];
        for (const dir of sessionDirs) {
          try {
            for (const sub of fs.readdirSync(path.resolve(dir))) {
              if (fs.existsSync(path.resolve(dir, sub, 'creds.json')))
                bots.push(sub);
            }
          } catch {}
        }
        try {
          if (fs.existsSync(path.resolve('./Sessions/Owner/creds.json'))) {
            const ownerId = sock.user?.id ? cleanJid(sock.user.id) : '';
            if (ownerId) bots.push(ownerId);
          }
        } catch {}
        return bots;
      }
      const sessionBots = getAllSessionBots();
      const primaryInGroup = groupJids.some(jid => isSameUser(jid, botprimaryId));
      const isPrimarySelf = isSameUser(botprimaryId, botJid);
      const primaryInSessions = sessionBots.some(bot => isSameUser(bot, botprimaryId));
      
      if (!primaryInSessions || !primaryInGroup) return;
      if ((primaryInSessions && primaryInGroup) || isPrimarySelf) return;
    }
  }

  const isVotOwn = isSameUser(sender, botJid) || normalizedOwners.some(o => isSameUser(sender, o));

  if (settings.self) {
    const owner = settings.owner;
    const modsList = (global.mods || []).map(m => String(m));
    const isMod = modsList.some(modId => isSameUser(sender, modId));
    if (!isSameUser(sender, owner) && !isVotOwn && !isMod) return;
  }

  // Verificación de chat privado (compatible con @s.whatsapp.net, @lid y usernames)
  if (!msg.isGroup) {
    const allowedInPrivateForUsers = [
      'report', 'reporte', 'sug', 'suggest', 'invite', 'invitar', 
      'setusername', 'setpfp', 'setimage', 'setstatus', 'reload', 
      'setname', 'setbotname', 'setmenubanner', 'setbanner', 
      'setbotcurrency', 'code', 'qr', 'setbotowner', 'setlink', 
      'setbotlink', 'setbotprefix'
    ];
    const owners = settings.owner;
    const isOwnerUser = isSameUser(sender, owners) || normalizedOwners.some(o => isSameUser(sender, o));
    
    if (!isOwnerUser && !allowedInPrivateForUsers.includes(command)) return;
  }

  if (chatData?.bannedGrupo && 
      !['#bot on', '/bot on', '.bot on', '!bot on', '-bot on', '+bot on', 'bot on'].includes(body.toLowerCase()) &&
      !normalizedOwners.some(o => isSameUser(sender, o))) return;

  // El creador del bot (isROwner) puede usar comandos incluso si el grupo está en modo adminonly sin ser admin
  if (chatData.adminonly && !isAdmins && !isROwner) return;

  if ((msg.id?.startsWith("3EB0") || (msg.id?.startsWith("BAE5") && msg.id?.length === 16) || (msg.id?.startsWith("B24E") && msg.id?.length === 20))) return;

  const user = await db.getChatUser(msg.chat, msg.sender);
  const today = new Date().toLocaleDateString('es-CO', { 
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-'); 

  if (!user) {
    await db.updateChatUser(msg.chat, msg.sender, { stats: { [today]: { msgs: 0, cmds: 0 } } });
  } else {
    if (!user.stats) user.stats = {};
    if (!user.stats[today]) user.stats[today] = { msgs: 0, cmds: 0 };
  }

  const cmdData = global.comandos.get(command);

  // Función para responder con un botón Quick Reply para abrir el Menú
  const sendNotFoundButton = async () => {
    const textMsg = `✎ El Comando *${command}* No está en mi lista de comandos`;
    
    return sock.sendMessage(msg.chat, {
      text: textMsg,
      buttons: [
        {
          buttonId: `${usedPrefix}help`,
          buttonText: { displayText: '〄 Ver Menú ⚘' },
          type: 1
        }
      ],
      headerType: 1
    }, { quoted: msg });
  };

  // CASO 1: El comando no existe en global.comandos
  if (!cmdData || user.muted === 1 || user.muted === true) {
    if (settings.prefijo === 1 || settings.prefijo === true || user.muted === 1 || user.muted === true) return;
    await sock.readMessages([msg.key]);
    return sendNotFoundButton();
  }

  // CASO 2: El comando es de tipo isOwner y el usuario no es Owner
  if (cmdData.isOwner && !normalizedOwners.some(o => isSameUser(sender, o))) {
    return sendNotFoundButton();
  }

  // El creador del bot (isROwner) puede usar comandos con restricción admin sin ser admin
  if (cmdData.isAdmin && !isAdmins && !isROwner) return sock.reply(msg.chat, mess.admin, msg);
  if (cmdData.botAdmin && !isBotAdmins) return sock.reply(msg.chat, mess.botAdmin, msg);

  try {
    await sock.readMessages([msg.key]);
    const user2 = await db.getUser(msg.sender);

    if (!user2) {
      await db.updateUser(msg.sender, { usedcommands: 1, exp: Math.floor(Math.random() * 100), name: msg.pushName });
    } else {
      user2.usedcommands = (user2.usedcommands || 0) + 1;
      user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100);
      user2.name = msg.pushName;
      await db.updateUser(msg.sender, 'exp', user2.exp);
      await db.updateUser(msg.sender, 'name', user2.name);
      await db.updateUser(msg.sender, 'usedcommands', user2.usedcommands);
    }

    settings.commandsejecut = (settings.commandsejecut || 0) + 1;
    await db.updateSettings(botJid, 'commandsejecut', settings.commandsejecut);

    const userStats = await db.getChatUser(msg.chat, msg.sender);
    if (userStats && userStats.stats && userStats.stats[today]) {
      userStats.stats[today].cmds++;
      await db.updateChatUser(msg.chat, msg.sender, 'stats', userStats.stats);
    }

    await cmdData.run({ msg, sock, args, command, usedPrefix, text, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: global.plugins[cmdData.pluginKey]?.dirname });
  } catch (error) {
    console.log(error);
    return msg.reply(`${error}`);
  }
};