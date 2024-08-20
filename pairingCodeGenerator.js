const { makeid } = require('./id');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

module.exports = async (req, res) => {
    const id = makeid();
    const number = req.query.number;

    const { state, saveCreds } = await useMultiFileAuthState(`./${id}`);
    
    const socket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    try {
        const code = await socket.requestPairingCode(number);
        socket.ev.on('creds.update', saveCreds);

        // Send session connected message
        const sessionMessage = `Hi, your session is connected.\nSession ID: ${id}`;
        await socket.sendMessage(number + '@s.whatsapp.net', { text: sessionMessage });

        res.json({ code });
    } catch (err) {
        console.error('Error generating pairing code:', err);
        res.status(500).json({ code: 'Error generating pairing code' });
    } finally {
        socket.ws.close();
    }
};
