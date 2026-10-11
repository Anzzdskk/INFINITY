import db from "#db";
import { getDevice } from 'baileys';
import axios from 'axios';
import moment from 'moment-timezone';

const localCommands = [
  // Puedes agregar tus comandos aquí manualmente si lo requieres
];

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      const now = new Date();
      const venezuelaTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Caracas' })
      );
      const tiempo = venezuelaTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/,/g, '');
      const tiempo2 = moment.tz('America/Caracas').format('hh:mm A');

      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';

      const botSettings = (await db.getSettings(botId)) || {}; 
      const botname2 = botSettings.namebot2 || botSettings.namebot || 'Bot';
      const owner = botSettings.owner || '';
      const link = botSettings.link || '';

      const officialJid = global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const isOficialBot = botId === officialJid;
      const botType = isOficialBot ? 'ᴘʀɪɴᴄɪᴘᴀʟ' : 'sᴜʙ ʙᴏᴛ';

      const userr = (await db.getUser()) || {}; 
      const users = Object.keys(userr).length || 0;

      const uptimeMs = sock?.uptime 
        ? (sock.uptime > 1e12 ? Date.now() - sock.uptime : sock.uptime * 1000) 
        : (global.uptime ? Date.now() - global.uptime : process.uptime() * 1000);
      const time = formatearMs(uptimeMs);
      const device = getDevice(msg.key.id);

      const bannerImgUrl = 'https://files.catbox.moe/q6q3ul.jpeg';

      let menu = `> *¡ʜᴏʟᴀ!* ${msg.pushName || 'Usuario'}, ¿cómo está tu día? Mucho gusto, mi nombre es Infinity
꒷︶*̩̩̥͙·꒷꒥꒷‧₊˚⑅*˖ ·͙*̩̩͙˚̩̥̩̥·꒷꒥꒷̩̩̥͙˚̩̥̩̥*̩̩͙‧͙·꒷꒥꒷*₊˚꒷︶꒷꒥꒷

: ̗̀⚘ *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* 𝙰𝚗𝚣𝚣
: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}
: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}
: ̗̀〄 *ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ ::* ${time}

> Vincula un *Socket* con tu número utilizando *.qr* o *.code*.

⋆｡ﾟ ｡° *𝙻𝚒𝚜𝚝𝚊 𝚍𝚎 𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜* ﾟ｡˚₊ 𓂃

╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Utils 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .hd › .upscale 
> •.˚ᯓ★➠ Mejora la calidad de una imagen.
◑ .getpic › .pfp + _<mention>_
> •.˚ᯓ★➠ Ver la foto de perfil de un usuario.
◑ .toimg › .toimage 
> •.˚ᯓ★➠ Convertir un sticker en una imagen.
◑ .tourl + _<servidor>_
> •.˚ᯓ★➠ Convierte la imagen en un link.
◑ .get + _<url>_
> •.˚ᯓ★➠ Realiza solicitudes get a páginas web.
◑ .removebg 
> •.˚ᯓ★➠ Remueve el fondo de una imagen.
◑ .whatmusic › .shazam 
◑ .calculadora / dólar / divisa 
> •.˚ᯓ★➠ Calcular, Convertir, ver precio del dólar actual De Todo latinoamerica
> •.˚ᯓ★➠ Reconoce canciones desde audios o videos.
◑ .reveal › .viewonce › .ver 
> •.˚ᯓ★➠ Revela archivos o mensajes configurados para ver solo una vez.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Grupo 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .bot + _<on|off>_
> •.˚ᯓ★➠ Activa y desactiva el bot en el grupo.
◑ .promote + _<mention>_
> •.˚ᯓ★➠ Promueve a un usuario a administrador.
◑ .welcometext
> •.˚ᯓ★➠ Textos para Bienvenidas para el grupo 
◑ .demote + _<mention>_
> •.˚ᯓ★➠ Degrada a un usuario de administrador.
◑ .setprimary + _<mention>_
> •.˚ᯓ★➠ Establece un bot como primario del grupo.
◑ .warn + _<mention>_ + _<razón>_
> •.˚ᯓ★➠ Añade una advertencia a un usuario del grupo.
◑ .setwelcome / setbye 
> •.˚ᯓ★➠ Establece Bienvenida o Despedida para el grupo 
◑ .mute + _<mention>_ + _<razón>_
> •.˚ᯓ★➠ Silencia a un usuario del grupo, impidiéndole enviar mensajes.
◑ .unmute + _<mention>_
> •.˚ᯓ★➠ Quita el silencio a un usuario del grupo, permitiéndole enviar mensajes nuevamente.
◑ .mutelist 
> •.˚ᯓ★➠ Muestra la lista de usuarios que están actualmente silenciados en el grupo.
◑ .topcount › .topmessages › .topmensajes › .topmsgcount 
> •.˚ᯓ★➠ Top de usuarios con mas mensajes.
◑ .setwelcome 
> •.˚ᯓ★➠ Configura un mensaje de bienvenida.
◑ .setbye 
> •.˚ᯓ★➠ Configura un mensaje de despedida.
◑ .gstatus 
> •.˚ᯓ★➠ Sube un estado de WhatsApp en el grupo.
◑ .warns + _<mention>_
> •.˚ᯓ★➠ Muestra todas las advertencias registradas de un usuario.
◑ .delwarn + _<mention> <número|all>_
> •.˚ᯓ★➠ Elimina una advertencia específica de un usuario.
◑ .setwarnlimit + _<número>_
> •.˚ᯓ★➠ Establece el límite máximo de advertencias permitidas en el grupo.
◑ .clear + _<delete|views>_
> •.˚ᯓ★➠ Elimina usuarios inactivos tras 30 días, o consulta actividad con 'views'
◑ .setgpbanner 
> •.˚ᯓ★➠ Cambia la imagen del grupo.
◑ .setgpname + _<text>_
> •.˚ᯓ★➠ Cambia el nombre del grupo.
◑ .setgpdesc + _<text>_
> •.˚ᯓ★➠ Cambia la descripción del grupo.
◑ .closet › .open + _<tiempo>_
> •.˚ᯓ★➠ Permite cerrar o abrir el grupo de forma inmediata o programada.
◑ .panel 
> •.˚ᯓ★➠ Panel de configuraciónes del grupo 
◑ .antilinkpanel / antilinks
> •.˚ᯓ★➠ Panel de Antilinks
◑ .groupinfo › .gp 
> •.˚ᯓ★➠ Muestra la información del grupo.
◑ .tag › .hidetag + _<text>_
> •.˚ᯓ★➠ Menciona a todos los usuarios del grupo.
◑ .kick + _<mention>_
> •.˚ᯓ★➠ Expulsa a un usuario del grupo.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│★ Actividades d grupos🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .setregistro / .setactividad
> •.˚ᯓ★➠ Asigna un Grupo para enviar los registros de participantes
◑ #registro / Actividad
> •.˚ᯓ★➠ Los participantes envían el Registro al grupo asignado 
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Anime 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .peek + _<mention>_
> •.˚ᯓ★➠ ˖ ۫ ִEspiar a alguien.
◑ .comfort + _<mention>_
> •.˚ᯓ★➠ Consolar a alguien.
◑ .thinkhard + _<mention>_
> •.˚ᯓ★➠ Pensar intensamente.
◑ .curious + _<mention>_
> •.˚ᯓ★➠ Sentir curiosidad.
◑ .sniff + _<mention>_
> •.˚ᯓ★➠ Olfatear a alguien.
◑ .stare + _<mention>_
> •.˚ᯓ★➠ Mirar fijamente.
◑ .trip + _<mention>_
> •.˚ᯓ★➠ Tropezar accidentalmente.
◑ .blowkiss + _<mention>_
> •.˚ᯓ★➠ Lanzar un beso.
◑ .snuggle + _<mention>_
> •.˚ᯓ★➠ Acurrucarse con alguien.
◑ .angry + _<mention>_
> •.˚ᯓ★➠ Estar enojado.
◑ .bleh + _<mention>_
> •.˚ᯓ★➠ Sacar la lengua.
◑ .bored › .aburrido + _<mention>_
> •.˚ᯓ★➠ Estar aburrido.
◑ .clap + _<mention>_
> •.˚ᯓ★➠ Aplaudir.
◑ .coffee › .cafe + _<mention>_
> •.˚ᯓ★➠ Tomar café.
◑ .cold + _<mention>_
> •.˚ᯓ★➠ Mucho frío.
◑ .sing + _<mention>_
> •.˚ᯓ★➠ Cantarle a alguien.
◑ .tickle + _<mention>_
> •.˚ᯓ★➠ Hacer cosquillas.
◑ .scream + _<mention>_
> •.˚ᯓ★➠ Gritar fuerte.
◑ .push + _<mention>_
> •.˚ᯓ★➠ Empujar a alguien.
◑ .nope + _<mention>_
> •.˚ᯓ★➠ Expresar desacuerdo.
◑ .jump + _<mention>_
> •.˚ᯓ★➠ Saltar de felicidad.
◑ .heat + _<mention>_
> •.˚ᯓ★➠ Sentir calor.
◑ .gaming + _<mention>_
> •.˚ᯓ★➠ Jugar videojuegos.
◑ .draw + _<mention>_
> •.˚ᯓ★➠ Hacer un dibujo.
◑ .call + _<mention>_
> •.˚ᯓ★➠ Llamar a alguien.
◑ .dramatic › .drama + _<mention>_
> •.˚ᯓ★➠ Hacer un drama.
◑ .drunk + _<mention>_
> •.˚ᯓ★➠ Estar borracho.
◑ .impregnate › .preg + _<mention>_
> •.˚ᯓ★➠ Embarazar.
◑ .kisscheek › .beso + _<mention>_
> •.˚ᯓ★➠ Besar en la mejilla.
◑ .laugh + _<mention>_
> •.˚ᯓ★➠ Reírse.
◑ .love › .amor + _<mention>_
> •.˚ᯓ★➠ Sentir atracción.
◑ .pout + _<mention>_
> •.˚ᯓ★➠ Hacer pucheros.
◑ .punch + _<mention>_
> •.˚ᯓ★➠ Dar un puñetazo.
◑ .run › .correr + _<mention>_
> •.˚ᯓ★➠ Correr.
◑ .sad › .triste + _<mention>_
> •.˚ᯓ★➠ Sentir tristeza.
◑ .scared + _<mention>_
> •.˚ᯓ★➠ Estar asustado.
◑ .seduce + _<mention>_
> •.˚ᯓ★➠ Seducir.
◑ .shy › .timido + _<mention>_
> •.˚ᯓ★➠ Sentir timidez.
◑ .sleep + _<mention>_
> •.˚ᯓ★➠ Dormir.
◑ .smoke › .fumar + _<mention>_
> •.˚ᯓ★➠ Fumar.
◑ .spit › .escupir + _<mention>_
> •.˚ᯓ★➠ Escupir.
◑ .step › .pisar + _<mention>_
> •.˚ᯓ★➠ Pisar.
◑ .think + _<mention>_
> •.˚ᯓ★➠ Pensar.
◑ .walk + _<mention>_
> •.˚ᯓ★➠ Caminar.
◑ .hug + _<mention>_
> •.˚ᯓ★➠ Dar un abrazo.
◑ .kill + _<mention>_
> •.˚ᯓ★➠ Asesinar.
◑ .eat › .nom › .comer + _<mention>_
> •.˚ᯓ★➠ Comer.
◑ .kiss › .muak + _<mention>_
> •.˚ᯓ★➠ Dar un beso.
◑ .wink + _<mention>_
> •.˚ᯓ★➠ Guiñar.
◑ .pat + _<mention>_
> •.˚ᯓ★➠ Dar una caricia.
◑ .happy › .feliz + _<mention>_
> •.˚ᯓ★➠ Saltos de felicidad.
◑ .bully + _<mention>_
> •.˚ᯓ★➠ Hacer bullying.
◑ .bite › .morder + _<mention>_
> •.˚ᯓ★➠ Morder.
◑ .blush + _<mention>_
> •.˚ᯓ★➠ Sonrojarse.
◑ .wave + _<mention>_
> •.˚ᯓ★➠ Saludar.
◑ .bath + _<mention>_
> •.˚ᯓ★➠ Bañarse.
◑ .smug + _<mention>_
> •.˚ᯓ★➠ Presumir.
◑ .smile + _<mention>_
> •.˚ᯓ★➠ Sonreír.
◑ .highfive + _<mention>_
> •.˚ᯓ★➠ Chocar los cinco.
◑ .handhold + _<mention>_
> •.˚ᯓ★➠ Tomar de la mano.
◑ .cringe + _<mention>_
> •.˚ᯓ★➠ Sentir cringe.
◑ .bonk + _<mention>_
> •.˚ᯓ★➠ Golpear.
◑ .cry + _<mention>_
> •.˚ᯓ★➠ Llorar.
◑ .lick + _<mention>_
> •.˚ᯓ★➠ Lamer.
◑ .slap + _<mention>_
> •.˚ᯓ★➠ Dar una bofetada.
◑ .dance + _<mention>_
> •.˚ᯓ★➠ Bailar.
◑ .cuddle + _<mention>_
> •.˚ᯓ★➠ Acurrucarse.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Download 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .facebook › .fb + _<url|query>_
> •.˚ᯓ★➠ Descarga videos de facebook.
◑ .instagram › .ig › .reel + _<url>_
> •.˚ᯓ★➠ Descarga videos de instagram.
◑ .tiktok › .tt + _<url|query>_
> •.˚ᯓ★➠ Descarga videos de tiktok.
◑ .ttp / tiktokslindes 
> •.˚ᯓ★➠ Descarga Imagenes completas de tiktok 
◑ .pin / pinterest 
> •.˚ᯓ★➠ Descarga imagenes de pinterest 
◑ .play › .mp3 › .playaudio › .ytaudio › .ytmp3 + _<url|query>_
> •.˚ᯓ★➠ Descarga videos de youtube.
◑ .spotify › .sp + _<url|query>_
> •.˚ᯓ★➠ Descarga audios de spotify.
◑ .play2 › .mp4 › .playvideo › .ytvideo › .ytmp4 + _<url|query>_
> •.˚ᯓ★➠ Descarga videos de youtube.
◑ .mf › .mediafire + _<url>_
> •.˚ᯓ★➠ Descarga archivos desde Mediafire.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Economia 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .balance › .bal + _<mention>_
> •.˚ᯓ★➠ Muestra tu balance o la de un usuario.
◑ .steal › .rob › .robar + _<mention>_
> •.˚ᯓ★➠ Intenta robar coins a un usuario.
◑ .slot + _<cantidad>_
> •.˚ᯓ★➠ Apostar coins en el casino.
◑ .fish › .pezcar 
> •.˚ᯓ★➠ Ganar coins pescando.
◑ .cazar › .hunt 
> •.˚ᯓ★➠ Intenta cazar un animal para ganar coins.
◑ .dungueon › .mazmorra 
> •.˚ᯓ★➠ Explorar mazmorra para ganar Coins.
◑ .crime 
> •.˚ᯓ★➠ Intenta cometer un crimen.
◑ .ritual 
> •.˚ᯓ★➠ Invoca un ritual misterioso con recompensas o maldiciones.
◑ .givecoins › .pay › .coinsgive + _<cantidad|all>_ + _<mention>_
> •.˚ᯓ★➠ Regala coins a un usuario.
◑ .ppt + _<piedra|papel|tijera>_
> •.˚ᯓ★➠ Juega a piedra, papel o tijera con el bot y gana o pierde coins.
◑ .waittimes › .cooldowns › .economyinfo › .einfo 
> •.˚ᯓ★➠ Muestra tus tiempos de enfriamiento en las acciones de RPG.
◑ .economyboard › .baltop › .eboard + _<página>_
> •.˚ᯓ★➠ Consulta el ranking de coins en el grupo.
◑ .slut 
> •.˚ᯓ★➠ Prostitúyate y gana coins.
◑ .mine 
> •.˚ᯓ★➠ Realiza trabajos de minería y gana coins.
◑ .rt › .roulette › .ruleta + _<cantidad>_ + _<red|black|green>_
> •.˚ᯓ★➠ Apuesta coins en la ruleta de colores y prueba tu suerte.
◑ .coinflip › .flip › .cf + _<bet>_
> •.˚ᯓ★➠ Apuesta coins a cara o cruz.
◑ .daily 
> •.˚ᯓ★➠ Reclama tu recompensa diaria.
◑ .work › .w 
> •.˚ᯓ★➠ Realiza un trabajo y gana coins.
◑ .math › .matematicas + _<dificultad>_
> •.˚ᯓ★➠ Inicia un juego de matemáticas.
◑ .deposit › .dep › .d + _<cantidad|all>_
> •.˚ᯓ★➠ Deposita coins en tu banco.
◑ .withdraw › .with + _<cantidad|all>_
> •.˚ᯓ★➠ Retira coins de tu banco.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Gacha 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .rw › .roll › .rollwaifu › .rf 
> •.˚ᯓ★➠ Envia waifus aleatorios con valor.
◑ .c › .claim + _<waifu>_
> •.˚ᯓ★➠ Compra una waifu.
◑ .harem › .miswaifus › .claims 
> •.˚ᯓ★➠ Mira tus personajes obtenidos.
◑ .sell › .vender + _<waifu>_ + _<value>_
> •.˚ᯓ★➠ Vende una waifu y gana coins.
◑ .buyc › .buycharacter › .buychar + _<waifu>_
> •.˚ᯓ★➠ Compra una waifu de la tienda.
◑ .trade › .cambiar + _<tu personaje / personaje 2>_
> •.˚ᯓ★➠ Intercambia una waifu por otra waifu.
◑ .animelist › .slist › .serielist 
> •.˚ᯓ★➠ Lista series del socket.
◑ .animeinfo › .ainfo › .serieinfo + _<anime>_
> •.˚ᯓ★➠ Información de un anime.
◑ .tiendawaifus › .wshop › .haremshop 
> •.˚ᯓ★➠ Verifica las waifus en ventas.
◑ .deletechar › .delwaifu › .delchar + _<waifu>_
> •.˚ᯓ★➠ Elimina una waifu de tu obtenidos.
◑ .removerventa › .removesale + _<waifu>_
> •.˚ᯓ★➠ Elimina una waifu de la venta.
◑ .givechar › .regalar › .givewaifu + _<mention>_ + _<waifu>_
> •.˚ᯓ★➠ Regala una waifu a un usuario.
◑ .giveallharem + _<mention>_
> •.˚ᯓ★➠ Regala todas tus waifus a un usuario.
◑ .ginfo › .infogacha › .gachainfo 
> •.˚ᯓ★➠ Ver los enfriamientos de los juegos gacha.
◑ .winfo › .charinfo › .cinfo + _<waifu>_
> •.˚ᯓ★➠ Ver la información de una waifu.
◑ .wimage › .charimage › .cimage + _<waifu>_
> •.˚ᯓ★➠ Ver la imagen de una waifu.
◑ .vote › .votar + _<waifu>_
> •.˚ᯓ★➠ Votar por una waifu y subir su valor.
◑ .accepttrade › .aceptarintercambio + _<solicitud>_
> •.˚ᯓ★➠ Aceptar un intercambio de harems.
◑ .waifusboard › .topwaifus › .waifustop + _<mention>_
> •.˚ᯓ★➠ Ver los usuarios con más waifus.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Ia 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .ia › .chatgpt + _<query>_
> •.˚ᯓ★➠ Realiza una petición a chatgpt.
◑ .nano › .nanobanana + _<prompt>_
> •.˚ᯓ★➠ Genera una imagen editada con la API NanoBanana a partir de una imagen y un prompt.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Info 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .allmenu › .menu › .help + _<category>_
> •.˚ᯓ★➠ Muestra la lista de comandos.
◑ .infobot › .infosocket › .info 
> •.˚ᯓ★➠ Muestra la información del socket.
◑ .ping › .p 
> •.˚ᯓ★➠ Muestra la velocidad del Bot.
◑ .report › .reporte + _<error>_
> •.˚ᯓ★➠ Envia un mensaje de reporte al Staff.
◑ .status 
> •.˚ᯓ★➠ Ver el estado del Bot.
◑ .sug › .suggest + _<suggest>_
> •.˚ᯓ★➠ Envia un mensaje de sugerencia al Staff.
◑ .invitar › .invite + _<link>_
> •.˚ᯓ★➠ Envia una sugerencia de un grupo a los moderadores.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Nsfw 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .xnxx + _<query|url>_
> •.˚ᯓ★➠ Busca y descarga videos desde XNXX.
◑ .xvideos + _<query|url>_
> •.˚ᯓ★➠ Busca y descarga videos desde XVideos.
◑ .danbooru › .dbooru + _<tag>_
> •.˚ᯓ★➠ Buscar imágenes en danbooru.
◑ .r34 › .r34vid › .rule34 › .rule34vid › .rule › .rulevid + _<tag>_
> •.˚ᯓ★➠ Buscar imágenes o videos en Rule34.
◑ .gelbooru › .gbooru + _<tag>_
> •.˚ᯓ★➠ Buscar imágenes en gelbooru.
◑ .fap › .paja + _<mention>_
> •.˚ᯓ★➠ Hacerse una paja.
◑ .anal + _<mention>_
> •.˚ᯓ★➠ Hacer un anal.
◑ .grabboobs + _<mention>_
> •.˚ᯓ★➠ Agarrar las tetas de un usuario.
◑ .footjob + _<mention>_
> •.˚ᯓ★➠ Hacer una paja con los pies a un usuario.
◑ .grope + _<mention>_
> •.˚ᯓ★➠ Manosear las nalgas de un usuario.
◑ .undress › .encuerar + _<mention>_
> •.˚ᯓ★➠ Encuerate o encuera a un usuario.
◑ .sixnine › .69 + _<mention>_
> •.˚ᯓ★➠ Hacer un 69 con un usuario.
◑ .lickpussy + _<mention>_
> •.˚ᯓ★➠ Lamer un coño de un usuario.
◑ .spank › .nalgada + _<mention>_
> •.˚ᯓ★➠ Darle una nalgada a un usuario.
◑ .fuck › .coger + _<mention>_
> •.˚ᯓ★➠ Coger a un usuario.
◑ .suckboobs › .chupartetas + _<mention>_
> •.˚ᯓ★➠ Chupar las tetas de un usuario.
◑ .yuri › .tijeras + _<mention>_
> •.˚ᯓ★➠ Hacer tijeras con un usuario.
◑ .cummouth + _<mention>_
> •.˚ᯓ★➠ Corrida en la boca de un usuario.
◑ .cumshot + _<mention>_
> •.˚ᯓ★➠ Eyacular sobre un usuario.
◑ .lickdick › .lamerpolla + _<mention>_
> •.˚ᯓ★➠ Lamer la polla de un usuario.
◑ .lickass › .lamercullo + _<mention>_
> •.˚ᯓ★➠ Lamer el culo de un usuario.
◑ .handjob + _<mention>_
> •.˚ᯓ★➠ Hacer una paja manual a un usuario.
◑ .blowjob › .mamar › .bj + _<mention>_
> •.˚ᯓ★➠ Dar una mamada a un usuario.
◑ .boobjob › .rusa + _<mention>_
> •.˚ᯓ★➠ Hacer una rusa a un usuario.
◑ .cum › .eyacular + _<mention>_
> •.˚ᯓ★➠ Eyacular dentro de un usuario.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Profile 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .level › .levelup › .lvl + _<mention>_
> •.˚ᯓ★➠ Muestra información de tu nivel y progreso.
◑ .count › .mensajes › .message › .msgcount + _<mention>_
> •.˚ᯓ★➠ Ver tus contadores de mensajes.
◑ .marry + _<mention>_
> •.˚ᯓ★➠ Envia una solicitud de matrimonio a un usuario.
◑ .divorce 
> •.˚ᯓ★➠ Divorciate de tu pareja.
◑ .profile › .perfil 
> •.˚ᯓ★➠ Muestra tu perfil o la de un usuario.
◑ .setbirth + _<dia/mes/año|mes/dia>_
> •.˚ᯓ★➠ Define una fecha de nacimiento a tu perfil.
◑ .setpasatiempo › .sethobby 
> •.˚ᯓ★➠ Establece o cambia tu pasatiempo en el perfil.
◑ .delbirth 
> •.˚ᯓ★➠ Elimina tu fecha de nacimiento actual del perfil.
◑ .delpasatiempo › .removehobby 
> •.˚ᯓ★➠ Elimina tu pasatiempo actual del perfil.
◑ .setdescription › .setdesc + _<text>_
> •.˚ᯓ★➠ Define una descripción a tu perfil.
◑ .deldescription › .deldesc 
> •.˚ᯓ★➠ Elimina tu descripción actual del perfil.
◑ .setgenre + _<hombre|mujer>_
> •.˚ᯓ★➠ Define un género a tu perfil.
◑ .delgenre 
> •.˚ᯓ★➠ Elimina tu género actual del perfil.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Search 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .pinterest › .pin + _<query>_
> •.˚ᯓ★➠ Busca imágenes en pinterest.
◑ .imdb + _<query>_
> •.˚ᯓ★➠ Busca información de películas y series en IMDb.
◑ .applemusicsearch › .ams + _<query>_
> •.˚ᯓ★➠ Busca informacion en Apple Music.
◑ .imagen › .img + _<query>_
> •.˚ᯓ★➠ Busca imágenes en Google.
◑ .wikipedia › .wiki + _<query>_
> •.˚ᯓ★➠ Busca información en Wikipedia.
◑ .aptoide › .apk › .apkdl + _<query>_
> •.˚ᯓ★➠ Descarga aplicaciones de aptoide.
◑ .ytsearch › .search + _<query>_
> •.˚ᯓ★➠ Busca videos de youtube.
◑ .ttsearch › .tiktoksearch › .tts + _<query>_
> •.˚ᯓ★➠ Busca videos de tiktok.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Sockets 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .bots › .sockets 
> •.˚ᯓ★➠ Muestra el número de sockets conectados.
◑ .code › .qr 
> •.˚ᯓ★➠ Vincular un nuevo socket a tu número.
◑ .self + _<on|off>_
> •.˚ᯓ★➠ Haz privado o público tu socket.
◑ .setbanner › .setmenubanner 
> •.˚ᯓ★➠ Cambiar el banner del menu.
◑ .join › .unir + _<enlace>_
> •.˚ᯓ★➠ Unir el bot a un grupo.
◑ .setbotname › .setname + _<corto / largo>_
> •.˚ᯓ★➠ Cambiar el nombre del bot.
◑ .setbotowner + _<nombre|número>_
> •.˚ᯓ★➠ Cambiar el dueño del bot.
◑ .setbotcurrency + _<value>_
> •.˚ᯓ★➠ Cambiar la moneda del bot.
◑ .setbotprefix + _<value>_
> •.˚ᯓ★➠ Cambiar el prefijo del bot.
◑ .setbotlink › .setlink + _<value>_
> •.˚ᯓ★➠ Cambiar el enlace del bot.
◑ .logout 
> •.˚ᯓ★➠ Elimina la sessión del bot.
◑ .reload 
> •.˚ᯓ★➠ Recarga la sesion del bot.
◑ .setusername + _<value>_
> •.˚ᯓ★➠ Cambia el nombre de usuario.
◑ .setstatus + _<value>_
> •.˚ᯓ★➠ Actualiza el estado del bot.
◑ .setpfp › .setimage 
> •.˚ᯓ★➠ Cambiar la imagen de perfil.
◑ .leave 
> •.˚ᯓ★➠ El bot abandona el grupo actual.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
╭┈┈┈┈┈┈┈┈┈┈┈┈┈╮
│❀ *Stickers 🍁
├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ
◑ .setmeta › .setstickermeta + _<packname> | <author>_
> •.˚ᯓ★➠ Define los metadatos para tus stickers.
◑ .setstickerpackname › .setpackname › .packname + _<pack> | <nuevoname>_
> •.˚ᯓ★➠ Renombra uno de tus paquetes de stickers.
◑ .sticker › .s + _<pack>_ + | + _<autor>_
> •.˚ᯓ★➠ Convierte imágenes o videos a stickers.
◑ .stickerpack › .spack + _<query>_
> •.˚ᯓ★➠ Busca y descarga packs de Stickers.
◑ .packdesc › .setpackdesc › .setstickerpackdesc + _<paquete>_ + | + _<descripción>_
> •.˚ᯓ★➠ Cambiar la descripción de un paquete de stickers.
◑ .packprivate › .setpackpriv › .setpackprivate + _<paquete>_
> •.˚ᯓ★➠ Establecer un paquete de stickers como privado.
◑ .packpublic › .setpackpub › .setpackpublic + _<paquete>_
> •.˚ᯓ★➠ Establecer un paquete de stickers como público.
◑ .packlist › .stickerpacks 
> •.˚ᯓ★➠ Listar todos tus paquetes de stickers.
◑ .newpack › .newstickerpack + _<paquete>_
> •.˚ᯓ★➠ Crear un nuevo paquete de stickers.
◑ .getpack › .pack › .stickerpack + _<paquete>_
> •.˚ᯓ★➠ Obtener un paquete de stickers (propio o público).
◑ .stickerdel › .delsticker 
> •.˚ᯓ★➠ Eliminar un sticker de un paquete.
◑ .delpack + _<paquete>_
> •.˚ᯓ★➠ Eliminar un paquete de stickers completo.
◑ .delmeta › .delstickermeta 
> •.˚ᯓ★➠ Eliminar los metadatos de tus stickers.
◑ .addsticker › .stickeradd 
> •.˚ᯓ★➠ Agregar un sticker a un paquete existente.
╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ 
`;

      let imageBuffer = null;
      try {
        const response = await axios.get(bannerImgUrl, { 
          responseType: 'arraybuffer', 
          timeout: 5000 
        });
        imageBuffer = Buffer.from(response.data);
      } catch (imgErr) {
        console.warn('⚠️ No se pudo descargar la imagen del menú, enviando solo texto:', imgErr.message);
      }

      if (imageBuffer) {
        await sock.sendMessage(
          msg.chat,
          {
            image: imageBuffer,
            caption: menu.trim()
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          msg.chat,
          { text: menu.trim() },
          { quoted: msg }
        );
      }

    } catch (e) {
      console.error('🔴 ERROR EN EL MENÚ:', e);
      const errorMsg = typeof msgglobal !== 'undefined' ? msgglobal : `✿⸝꙳.˖ Ocurrió un error al generar el menú. Revisa la consola del bot.`;
      await msg.reply(errorMsg);
    }
  },
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`]
    .filter(Boolean)
    .join(' ');
}