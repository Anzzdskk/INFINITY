import db from "#db";

export default {
  command: ['owner', 'dueño'],
  category: 'info',
  run: async ({ msg, sock, args }) => {
    // Si el usuario presiona un botón o escribe una opción directa
    if (args && args.length > 0) {
      const action = args[0].toLowerCase();
      if (action === 'paypal') {
        await sock.sendMessage(msg.chat, { text: 'https://paypal.me/Anzzdsk' }, { quoted: msg });
        return;
      }
      if (action === 'banco') {
        await sock.sendMessage(msg.chat, { 
          text: 'CI :: 33.132.088\nBanco :: Venezuela\ntlf :: 04268955896' 
        }, { quoted: msg });
        return;
      }
    }

    // Configuración de imagen y textos según el formato proporcionado
    const ownerImageUrl = 'https://files.catbox.moe/pml3t0.jpg';
    const captionText = 'I N F I N I T Y - W A - B O T\n\nDeveloper : Anzz\nTLF : +58 426 895 5896\n\nSi gustas En Apoyar el Proyecto y asi Mejorar las descargas puedes Donar ^ ^';

    const buttonsMessage = {
      image: { url: ownerImageUrl },
      caption: captionText,
      footer: '',
      buttons: [
        {
          buttonId: '.owner paypal',
          buttonText: { displayText: 'Paypal' },
          type: 1
        },
        {
          buttonId: '.owner banco',
          buttonText: { displayText: 'Banco Venezuela' },
          type: 1
        }
      ],
      headerType: 4
    };

    await sock.sendMessage(msg.chat, buttonsMessage, { quoted: msg });
  },
};