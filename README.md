# WhatsApp Bridge Server

Bridge server connecting WhatsApp Web to Cloudflare Workers AI.

## Architecture

```
WhatsApp User → whatsapp-web.js (Bridge) → Cloudflare Worker → Workers AI
```

## Deployment (Railway.app)

### Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manual Deploy

1. **Install Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login:**
   ```powershell
   railway login
   ```

3. **Deploy:**
   ```powershell
   cd C:\Users\Egon\.gemini\antigravity\scratch\whatsapp-bridge
   railway init
   railway up
   ```

4. **Set Environment Variable:**
   ```powershell
   railway variables set WORKER_URL=https://openclaw-cloud.openclaw-egon.workers.dev
   ```

## API Endpoints

- `GET /` - Status check
- `GET /qr` - Get QR code for WhatsApp pairing
- `POST /send` - Send message to WhatsApp

## Local Testing

```powershell
cd C:\Users\Egon\.gemini\antigravity\scratch\whatsapp-bridge
npm install
npm start
```

Then scan QR code with WhatsApp!
