import db from "#db";

export default {
  command: [
    'welcome', 'bienvenidas',
    'goodbye', 'despedidas', 'bye',
    'alerts', 'alertas', 'antistatus', 'antiestados',
    'nsfw',
    'antilink', 'antienlaces', 'antilinks', 'antilinkpanel', 'panelantilink',
    'rpg', 'economy', 'economia',
    'gacha',
    'adminonly', 'onlyadmin',
    'panel', 'config', 'settings', 'opciones', 'panelopciones'
  ],
  category: 'grupo',
  isAdmin: true,
  run: async ({ msg, sock, args, command, usedPrefix: prefix }) => {
    const chatData = await db.getChat(msg.chat);
    const subOption = args[0]?.toLowerCase();

    // ==========================================
    // 📝 TODO EL TEXTO Y PANEL (Fácil de editar)
    // ==========================================
    const getText = {
      // Panel general que muestra todas las funciones activas/desactivadas (sin antilinks)
      generalPanel: (status) => 
        `*\`⚙️ PANEL GENERAL DE CONFIGURACIÓN\`*\n\n` +
        `Estado actual de las funciones del grupo:\n\n` +
        `> ${status.welcome ? '🟢' : '🔴'} *Bienvenidas:* ${status.welcome ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.goodbye ? '🟢' : '🔴'} *Despedidas:* ${status.goodbye ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.antistatus ? '🟢' : '🔴'} *Anti-Estados:* ${status.antistatus ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.alerts ? '🟢' : '🔴'} *Alertas:* ${status.alerts ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.nsfw ? '🟢' : '🔴'} *NSFW:* ${status.nsfw ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.rpg ? '🟢' : '🔴'} *RPG / Economía:* ${status.rpg ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.gacha ? '🟢' : '🔴'} *Gacha:* ${status.gacha ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.adminonly ? '🟢' : '🔴'} *Solo Admins:* ${status.adminonly ? 'Activado' : 'Desactivado'}\n\n` +
        `_Nota: Los antilinks tienen su propio panel independiente (*${prefix}antilinkpanel*)._`,

      // Panel independiente para los antilinks
      antilinkPanel: (status) =>
        `*\`⚙️ PANEL DE CONTROL ANTI-LINK\`*\n\n` +
        `Estado actual de las restricciones de enlaces:\n\n` +
        `> ${status.wa ? '🟢' : '🔴'} *WhatsApp:* ${status.wa ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.discord ? '🟢' : '🔴'} *Discord:* ${status.discord ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.telegram ? '🟢' : '🔴'} *Telegram:* ${status.telegram ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.youtube ? '🟢' : '🔴'} *YouTube:* ${status.youtube ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.instagram ? '🟢' : '🔴'} *Instagram:* ${status.instagram ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.x ? '🟢' : '🔴'} *X (Twitter):* ${status.x ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.facebook ? '🟢' : '🔴'} *Facebook:* ${status.facebook ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.tiktok ? '🟢' : '🔴'} *TikTok:* ${status.tiktok ? 'Activado' : 'Desactivado'}\n` +
        `> ${status.all ? '🟢' : '🔴'} *General:* ${status.all ? 'Activado' : 'Desactivado'}\n\n` +
        `_Nota: Al enviar enlaces no permitidos, el mensaje será borrado al instante y el usuario acumulará advertencias (máximo 3)._`,

      // Menú de ayuda para antilink
      antilinkHelp:
        `*\`⚙️ CONTROL ANTI-LINK\`*\n\n` +
        `Usa los siguientes comandos para activar o desactivar cada filtro:\n\n` +
        `> ● *${prefix}antilink wa enable / disable* (WhatsApp)\n` +
        `> ● *${prefix}antilink discord enable / disable* (Discord)\n` +
        `> ● *${prefix}antilink telegram enable / disable* (Telegram)\n` +
        `> ● *${prefix}antilink youtube enable / disable* (YouTube)\n` +
        `> ● *${prefix}antilink instagram enable / disable* (Instagram)\n` +
        `> ● *${prefix}antilink x enable / disable* (X / Twitter)\n` +
        `> ● *${prefix}antilink facebook enable / disable* (Facebook)\n` +
        `> ● *${prefix}antilink tiktok enable / disable* (TikTok)\n` +
        `> ● *${prefix}antilink all enable / disable* (General)\n\n` +
        `_Usa *${prefix}antilinkpanel* para ver el estado de todos los filtros._`,

      // Estado individual de una característica
      featureStatus: (key, current) =>
        `*✩ ${key.toUpperCase()} *\n` +
        `❒ *Estado ›* ${current ? '✓ Activado' : '✗ Desactivado'}\n\n` +
        `ꕥ Activa o desactiva con:\n` +
        `> ● *${prefix}${key} enable*\n` +
        `> ● *${prefix}${key} disable*`,

      // Mensaje de éxito al cambiar estado
      featureToggled: (key, enabled) =>
        `> Has *${enabled ? 'activado' : 'desactivado'}* la función *${key}*.`,

      // Mensajes de error o invalidación
      invalidState: `《✤》 Estado no válido. Usa *enable* o *disable*.`,
      invalidOption: `《✤》 Opción no válida. Usa *${prefix}antilink* para ver la lista de opciones.`
    };

    // ==========================================
    // ⚙️ DEFINICIÓN DE TIPOS ANTI-LINK
    // ==========================================
    const antiLinkTypes = {
      wa: { key: 'antilink_wa', label: 'WhatsApp' },
      discord: { key: 'antilink_discord', label: 'Discord' },
      telegram: { key: 'antilink_telegram', label: 'Telegram' },
      youtube: { key: 'antilink_youtube', label: 'YouTube' },
      instagram: { key: 'antilink_instagram', label: 'Instagram' },
      x: { key: 'antilink_x', label: 'X (Twitter)' },
      facebook: { key: 'antilink_facebook', label: 'Facebook' },
      tiktok: { key: 'antilink_tiktok', label: 'TikTok' },
      all: { key: 'antilink_all', label: 'General' }
    };

    // ==========================================
    // 📊 1. MANEJADOR DE PANEL GENERAL DE CONFIGURACIÓN
    // ==========================================
    if (['panel', 'config', 'settings', 'opciones', 'panelopciones'].includes(command)) {
      const status = {
        welcome: Number(chatData.welcome) === 1,
        goodbye: Number(chatData.goodbye) === 1,
        antistatus: Number(chatData.antistatus) === 1,
        alerts: Number(chatData.alerts) === 1,
        nsfw: Number(chatData.nsfw) === 1,
        rpg: Number(chatData.rpg) === 1,
        gacha: Number(chatData.gacha) === 1,
        adminonly: Number(chatData.adminonly) === 1
      };

      return sock.reply(msg.chat, getText.generalPanel(status), msg);
    }

    // ==========================================
    // 🛡️ 2. MANEJADOR DE PANEL Y SUBOPCIONES ANTI-LINK
    // ==========================================
    if (['antilinkpanel', 'panelantilink'].includes(command) || (['antilink', 'antienlaces', 'antilinks'].includes(command) && subOption === 'panel')) {
      const status = {
        wa: Number(chatData.antilink_wa) === 1,
        discord: Number(chatData.antilink_discord) === 1,
        telegram: Number(chatData.antilink_telegram) === 1,
        youtube: Number(chatData.antilink_youtube) === 1,
        instagram: Number(chatData.antilink_instagram) === 1,
        x: Number(chatData.antilink_x) === 1,
        facebook: Number(chatData.antilink_facebook) === 1,
        tiktok: Number(chatData.antilink_tiktok) === 1,
        all: Number(chatData.antilink_all) === 1
      };

      return sock.reply(msg.chat, getText.antilinkPanel(status), msg);
    }

    if (['antilink', 'antienlaces', 'antilinks'].includes(command)) {
      if (!subOption) {
        return sock.reply(msg.chat, getText.antilinkHelp, msg);
      }

      if (antiLinkTypes[subOption]) {
        const target = antiLinkTypes[subOption];
        const stateAction = args[1]?.toLowerCase();

        if (!stateAction || !['on', 'off', 'enable', 'disable'].includes(stateAction)) {
          const currentVal = Number(chatData[target.key]) === 1;
          return msg.reply(
            `*✩ Anti-Link ${target.label}*\n` +
            `❒ *Estado:* ${currentVal ? '✓ Activado' : '✗ Desactivado'}\n\n` +
            `Activa o desactiva con:\n` +
            `> *${prefix}antilink ${subOption} enable*\n` +
            `> *${prefix}antilink ${subOption} disable*`
          );
        }

        const enable = ['on', 'enable'].includes(stateAction);
        await db.updateChat(msg.chat, target.key, enable ? 1 : 0);
        return msg.reply(`✎ Has *${enable ? 'activado' : 'desactivado'}* el Anti-Link para *${target.label}*.`);
      }

      if (['on', 'off', 'enable', 'disable'].includes(subOption)) {
        const enable = ['on', 'enable'].includes(subOption);
        await db.updateChat(msg.chat, 'antilink_all', enable ? 1 : 0);
        return msg.reply(`✎ Has *${enable ? 'activado' : 'desactivado'}* el Anti-Link *General*.`);
      }

      return msg.reply(getText.invalidOption);
    }

    // ==========================================
    // 🔧 3. MANEJADOR DE CONFIGURACIONES INDIVIDUALES
    // ==========================================
    const mapTerms = {
      antistatus: 'antistatus',
      antiestados: 'antistatus',
      welcome: 'welcome',
      goodbye: 'goodbye',
      despedidas: 'goodbye',
      bye: 'goodbye',
      bienvenidas: 'welcome',
      alerts: 'alerts',
      alertas: 'alerts',
      economy: 'rpg',
      rpg: 'rpg',
      economia: 'rpg',
      adminonly: 'adminonly',
      onlyadmin: 'adminonly',
      nsfw: 'nsfw',
      gacha: 'gacha'
    };

    const normalizedKey = mapTerms[command] || command;
    const current = Number(chatData[normalizedKey]) === 1;
    const validStates = ['on', 'off', 'enable', 'disable'];

    if (!subOption) {
      return sock.reply(msg.chat, getText.featureStatus(normalizedKey, current), msg);
    }

    if (!validStates.includes(subOption)) {
      return msg.reply(`${getText.invalidState}\nEjemplo: ${prefix}${command} enable`);
    }

    const enabled = ['on', 'enable'].includes(subOption);
    await db.updateChat(msg.chat, normalizedKey, enabled ? 1 : 0);

    return msg.reply(getText.featureToggled(normalizedKey, enabled));
  }
};