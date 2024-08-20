const { makeid } = require('./id');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const pino = require('pino');

module.exports = async (req, res) => {
    const id = makeid();
    const number = req.query.number;

    const { state, saveCreds } = await useMultiFileAuthState(`./${id}`);
    
    const socket = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
    });

    socket.ev.on('connection.update', async (update) => {
        const { qr, connection } = update;
        if (qr) {
            const qrBuffer = await QRCode.toBuffer(qr);
            res.setHeader('Content-Type', 'image/png');
            res.send(qrBuffer);
        } else if (connection === 'open') {
            // Send session connected message
            const sessionMessage = `Hi, your session is connected.\nSession ID: ${id}`;
            await socket.sendMessage(number + '@s.whatsapp.net', { text: sessionMessage });
            
            socket.ev.on('creds.update', saveCreds);
            socket.ws.close();
        }
    });
};
