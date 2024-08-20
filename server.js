const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pairingCodeGenerator = require('./pairingCodeGenerator');
const qrCodeGenerator = require('./qrCodeGenerator');

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/generate-pairing-code', pairingCodeGenerator);
app.get('/generate-qr-code', qrCodeGenerator);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
