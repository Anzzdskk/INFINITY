import db from "#db"

export default {
  command: ['registro', 'actividad', 'reporteact', 'setregistro', 'setregroup', 'enviar'],
  category: 'group',
  admin: false,
  botAdmin: false,
  group: true,

  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      if (command === 'enviar') {
        if (!msg.quoted) {
          return msg.reply('《✤》 Debes *responder / citar* el mensaje de registro con `enviar` para que el bot envíe únicamente el texto de la actividad.')
        }

        const quotedText = msg.quoted.text || ''
        let extractedActivity = ''

        // Extraer exactamente el contenido después de '📝 *Actividad:*'
        if (quotedText.includes('📝 *Actividad:*')) {
          const parts = quotedText.split('📝 *Actividad:*')
          if (parts[1]) {
            let activityPart = parts[1]
            
            // Cortar si incluye alguna variante de la instrucción o cita final
            const stopMarkers = ['> Responde', 'Responde a este', '📌 *Responde', '> *Responde']
            for (const marker of stopMarkers) {
              if (activityPart.includes(marker)) {
                activityPart = activityPart.split(marker)[0]
              }
            }
            
            extractedActivity = activityPart.trim()
          }
        }

        // Si no coincide con la plantilla de 'Actividad', se usa el texto citado original limpiando notas al pie
        if (!extractedActivity) {
          let fallbackText = quotedText
          const stopMarkers = ['> Responde', 'Responde a este', '📌 *Responde', '> *Responde']
          for (const marker of stopMarkers) {
            if (fallbackText.includes(marker)) {
              fallbackText = fallbackText.split(marker)[0]
            }
          }
          extractedActivity = fallbackText.trim()
        }

        if (!extractedActivity) {
          return msg.reply('《✤》 No se pudo extraer el texto del registro citado.')
        }

        // Enviar únicamente el texto original limpio sin citar el mensaje anterior
        return await sock.sendMessage(msg.chat, { text: extractedActivity }, { quoted: null })
      }

      if (command === 'setregistro' || command === 'setregroup') {
        const groupMetadata = await sock.groupMetadata(msg.chat).catch(() => null)
        if (!groupMetadata) {
          return msg.reply('《✤》 Este comando solo se puede usar dentro de un *grupo*.')
        }

        const participants = groupMetadata.participants || []
        const sender = msg.sender
        const senderParticipant = participants.find(p => p.id === sender)
        const isAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
        const isCreator = groupMetadata.owner === sender || (senderParticipant && senderParticipant.admin === 'superadmin')

        if (!isAdmin && !isCreator) {
          return msg.reply('《✤》 Solo los *administradores* o el *creador* del grupo pueden configurar el grupo de destino.')
        }

        let inviteLink = args[0]
        if (!inviteLink && msg.quoted && msg.quoted.text) {
          inviteLink = msg.quoted.text
        }

        if (!inviteLink) {
          return msg.reply(`《✤》 Proporciona el *enlace de invitación* del grupo destino o responde a un mensaje que lo contenga.\n\n*Ejemplo:* \`${prefix}setregistro https://chat.whatsapp.com/...\``)
        }

        const match = inviteLink.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
        if (!match) {
          return msg.reply('《✤》 El enlace proporcionado no es un *enlace de invitación de WhatsApp* válido.')
        }

        const code = match[1]
        let targetGroupJid = ''

        try {
          const inviteInfo = await sock.groupGetInviteInfo(code)
          targetGroupJid = inviteInfo.id
        } catch (err) {
          return msg.reply('《✤》 No se pudo obtener la información del grupo con el enlace. Asegúrate de que el enlace sea válido y el bot tenga permisos.')
        }

        let chatData = await db.getChat ? await db.getChat(msg.chat) : (global.db?.data?.chats?.[msg.chat] || {})
        if (!chatData) chatData = {}
        chatData.targetRegisterGroup = targetGroupJid

        if (db.updateChat) {
          await db.updateChat(msg.chat, 'targetRegisterGroup', targetGroupJid)
        } else if (global.db?.data?.chats) {
          global.db.data.chats[msg.chat] = chatData
        }

        return msg.reply(`✅ *¡Grupo de destino configurado correctamente para este grupo!*\n\nLos registros de aquí se enviarán a: *${targetGroupJid}*`)
      }

      const reportText = args.join(' ').trim()
      if (!reportText) {
        return msg.reply(`《✤》 Debes escribir la *actividad o registro* que deseas reportar.\n\n*Ejemplo:* \`${prefix}${command} Se realizó el mantenimiento del servidor.\``)
      }

      if (reportText.length < 3) {
        return msg.reply('✿ El mensaje es *demasiado corto*. Explica con más detalle la actividad realizada.')
      }

      let chatData = await db.getChat ? await db.getChat(msg.chat) : (global.db?.data?.chats?.[msg.chat] || {})
      const targetGroupJid = chatData?.targetRegisterGroup

      if (!targetGroupJid) {
        return msg.reply(`《✤》 Este grupo no tiene un *grupo de destino* asignado.\n\nUn admin debe configurarlo usando: \`${prefix}setregistro [Enlace de invitación]\``)
      }

      const originGroupMeta = await sock.groupMetadata(msg.chat).catch(() => ({ subject: 'Grupo Desconocido' }))
      const originGroupName = originGroupMeta.subject || 'Grupo Desconocido'

      const displayName = msg.pushName || 'Usuario'
      const senderNumber = msg.sender.split('@')[0]

      // Fecha local (sin la hora)
      const fecha = new Date()
      const fechaLocal = fecha.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

      const mensajeFinal = 
        `👥 *Grupo:* ${originGroupName}\n` +
        `👤 *Usuario:* ${displayName} (@${senderNumber})\n` +
        `📅 *Fecha:* ${fechaLocal}\n\n` +
        `📝 *Actividad:*\n` +
        `${reportText}\n\n` +
        `> Responde a este mensaje con "#enviar" para enviar únicamente el texto del usuario.`

      await sock.sendMessage(targetGroupJid, {
        text: mensajeFinal,
        mentions: [msg.sender]
      })

      return msg.reply('《✤》 Tu registro de actividad ha sido enviado al grupo correspondiente.')

    } catch (e) {
      console.error(e)
      return msg.reply('《✿》 Ocurrió un error al procesar el registro.')
    }
  },
}