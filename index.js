const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WORKER_URL = process.env.WORKER_URL || 'https://openclaw-cloud.openclaw-egon.workers.dev';

// Initialize WhatsApp client with Render-compatible Puppeteer config
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-shm-usage'
        ]
    }
});

let qrCodeData = null;
let isReady = false;

// QR Code generation
client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrCodeData = qr;
    qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isReady = true;
});

// Handle incoming messages
client.on('message', async (message) => {
    console.log(`Message from ${message.from}: ${message.body}`);

    try {
        // Send message to Cloudflare Worker AI
        const response = await fetch(`${WORKER_URL}/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: message.from,
                message: message.body
            })
        });

        const data = await response.json();
        const aiResponse = data.response?.[0]?.response || 'Desculpe, não entendi.';

        // Send AI response back to WhatsApp
        await message.reply(aiResponse);

    } catch (error) {
        console.error('Error processing message:', error);
        await message.reply('Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
});

// Error handling
client.on('auth_failure', (msg) => {
    console.error('Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
    isReady = false;
});

// Initialize client
client.initialize();

// API Endpoints
app.get('/', (req, res) => {
    res.json({
        status: isReady ? 'ready' : 'initializing',
        hasQR: !!qrCodeData
    });
});

app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.json({ qr: qrCodeData });
    } else {
        res.status(404).json({ error: 'QR code not available yet' });
    }
});

app.post('/send', async (req, res) => {
    const { to, message } = req.body;

    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client not ready' });
    }

    try {
        const chatId = to.includes('@') ? to : `${to}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Bridge running on port ${PORT}`);
    console.log(`Worker URL: ${WORKER_URL}`);
});
