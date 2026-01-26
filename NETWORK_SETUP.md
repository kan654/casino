# 🌐 Network Setup Guide

## Udostępnianie aplikacji w sieci lokalnej (LAN)

### 📋 Wymagania:
- Wszyscy użytkownicy muszą być w tej samej sieci WiFi
- Windows Firewall musi zezwalać na porty 3000 i 5000
- Twój komputer musi być włączony z działającymi serwerami

---

## 🔧 Setup dla TWOJEGO komputera (hosta):

### 1. Sprawdź swój IP lokalny:
```powershell
ipconfig | Select-String "IPv4"
```
**Przykład:** `192.168.1.13`

### 2. Uruchom serwery:

**Backend:**
```bash
cd backend
node server.js
```
Backend nasłuchuje na `0.0.0.0:5000` (wszystkie interfejsy)

**Frontend - Opcja A (Development):**
```bash
cd frontend
npx vite --host
```
Dostępny na: `http://TWOJE_IP:3000`

**Frontend - Opcja B (Production Build):**
```bash
cd frontend
npm run build
npx serve -s dist -l 3000
```

### 3. Konfiguracja Windows Firewall:

**Automatycznie (PowerShell jako Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Casino Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Casino Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**LUB Ręcznie:**
1. Otwórz "Windows Defender Firewall"
2. Kliknij "Advanced settings"
3. Wybierz "Inbound Rules" → "New Rule"
4. Port → TCP → Specific local ports: `5000,3000`
5. Allow the connection
6. Apply to all profiles
7. Nazwa: "Casino App"

---

## 👥 Instrukcje dla UŻYTKOWNIKÓW w sieci LAN:

### Otwórz przeglądarkę i wejdź na:
```
http://TWOJE_IP:3000
```

**Przykład:**
```
http://192.168.1.13:3000
```

### ⚠️ Jeśli nie działa:
1. Sprawdź czy jesteś w tej samej sieci WiFi
2. Sprawdź czy firewall jest wyłączony lub skonfigurowany
3. Spróbuj ping hosta:
   ```bash
   ping 192.168.1.13
   ```

---

## 🌍 Udostępnianie w INTERNECIE (publiczne):

### Opcja 1: Ngrok (najłatwiejsze, darmowe)

**1. Zainstaluj Ngrok:**
```bash
# Pobierz z: https://ngrok.com/download
# LUB użyj chocolatey:
choco install ngrok
```

**2. Zarejestruj się i dodaj authtoken:**
```bash
ngrok config add-authtoken YOUR_TOKEN
```

**3. Uruchom tunele:**

**Backend:**
```bash
ngrok http 5000
```
Otrzymasz URL typu: `https://abc123.ngrok.io`

**Frontend (w nowym terminalu):**
```bash
ngrok http 3000
```
Otrzymasz URL typu: `https://xyz789.ngrok.io`

**4. Zaktualizuj frontend .env:**
```env
VITE_API_URL=https://abc123.ngrok.io/api
VITE_SOCKET_URL=https://abc123.ngrok.io
```

**5. Restart frontend:**
```bash
cd frontend
npm run dev
```

**6. Udostępnij użytkownikom URL frontendu:**
```
https://xyz789.ngrok.io
```

⚠️ **UWAGA:** Darmowy Ngrok resetuje URL po każdym restarcie!

---

### Opcja 2: Cloudflare Tunnel (darmowe, stałe URL)

**1. Zainstaluj cloudflared:**
```bash
# Pobierz z: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

**2. Login:**
```bash
cloudflared tunnel login
```

**3. Utwórz tunel:**
```bash
cloudflared tunnel create casino-app
```

**4. Skonfiguruj routing:**
Utwórz `config.yml`:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: C:\Users\YOUR_USER\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: casino-api.twoja-domena.pl
    service: http://localhost:5000
  - hostname: casino.twoja-domena.pl
    service: http://localhost:3000
  - service: http_status:404
```

**5. Uruchom tunel:**
```bash
cloudflared tunnel run casino-app
```

---

### Opcja 3: Deployment na hosting (produkcja)

#### **Frontend:** Vercel / Netlify / GitHub Pages
#### **Backend:** Railway / Render / Heroku / DigitalOcean
#### **Database:** MongoDB Atlas (już używasz!)

**Zobacz:** `README.md` → "Deployment" sekcja

---

## 🔒 Bezpieczeństwo:

### ⚠️ WAŻNE dla produkcji:
1. **Zmień CORS na whitelist** (nie `origin: true`)
2. **Dodaj rate limiting** (już jest w backendzie)
3. **Użyj HTTPS** (Let's Encrypt / Cloudflare)
4. **Zmień JWT_SECRET** na silny losowy string
5. **Włącz MongoDB authentication**
6. **Nie udostępniaj `.env` plików**

### Przykład produkcyjnego CORS (backend/server.js):
```javascript
app.use(cors({
  origin: [
    'https://twoja-domena.pl',
    'https://www.twoja-domena.pl'
  ],
  credentials: true
}));
```

---

## 📊 Monitoring:

### Sprawdź kto jest połączony:
```bash
# Backend logi
tail -f backend/logs/server.log

# Socket.io connections
# Zobacz w konsoli backendu: "New client connected: SOCKET_ID"
```

---

## ❓ Troubleshooting:

### "Cannot connect to server"
- Sprawdź czy backend działa: `curl http://localhost:5000/health`
- Sprawdź firewall
- Sprawdź IP address (może się zmienić po reconnect WiFi)

### "CORS error"
- Sprawdź czy CORS w backendzie ma prawidłowy origin
- Sprawdź czy frontend ma prawidłowy `VITE_API_URL`

### "WebSocket connection failed" (Crash game)
- Sprawdź `VITE_SOCKET_URL` w frontend `.env`
- Sprawdź czy Socket.io CORS ma prawidłowy origin

---

## 🎯 Szybki test:

### Z TWOJEGO komputera:
```bash
curl http://localhost:5000/health
curl http://192.168.1.13:5000/health
```

### Z INNEGO komputera w sieci LAN:
```bash
curl http://192.168.1.13:5000/health
```

Powinno zwrócić:
```json
{"status":"ok","message":"Casino API is running","timestamp":"..."}
```

---

## 📝 Notatki:

- **Port 3000:** Frontend (React/Vite)
- **Port 5000:** Backend (Node.js/Express + WebSocket)
- **Port 27017:** MongoDB (jeśli lokalny, ale używasz Atlas więc nie dotyczy)

**Twój IP może się zmienić!** Jeśli router przeładuje się lub reconnectujesz WiFi, sprawdź IP ponownie i zaktualizuj konfigurację.

---

## 🚀 Production Checklist:

- [ ] Backend na hostingu (Railway/Render)
- [ ] Frontend na hostingu (Vercel/Netlify)
- [ ] MongoDB Atlas (już jest ✅)
- [ ] Environment variables na hostingu
- [ ] HTTPS enabled
- [ ] CORS whitelist (nie `origin: true`)
- [ ] Strong JWT_SECRET
- [ ] Rate limiting enabled (już jest ✅)
- [ ] Error logging (np. Sentry)
- [ ] Monitoring (np. UptimeRobot)

