# 🚀 Deployment Guide - Casino Online

Instrukcja jak postawić stronę w internecie **za darmo**!

---

## 📋 **Wymagania:**

- ✅ Konto GitHub (darmowe)
- ✅ Konto Render (darmowe)
- ✅ Konto Vercel (darmowe)
- ✅ MongoDB Atlas (już masz!)

---

## 🔧 **KROK 1: Przygotuj kod na GitHub**

### 1. Zainstaluj Git (jeśli nie masz):
https://git-scm.com/download/win

### 2. Stwórz repozytorium:
https://github.com/new
- Name: `casino` (lub dowolny)
- Public lub Private (oba działają)

### 3. Wyślij kod do GitHub:

```bash
cd G:\STAke

# Inicjalizuj git
git init

# Dodaj wszystkie pliki
git add .

# Pierwszy commit
git commit -m "Initial casino commit"

# Dodaj remote (ZAMIEŃ na swój URL!)
git remote add origin https://github.com/TWOJ_USERNAME/casino.git

# Wyślij na GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 **KROK 2: Deploy Backend (Render)**

### 1. Wejdź na: https://render.com/
- Zarejestruj się (GitHub login najszybszy)

### 2. Stwórz Web Service:
- Kliknij **"New +"** → **"Web Service"**
- Połącz GitHub i wybierz repo `casino`

### 3. Ustawienia:

| Pole | Wartość |
|------|---------|
| **Name** | `casino-backend` (lub dowolny) |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### 4. Environment Variables:

Dodaj te zmienne:

```
PORT=5000
MONGODB_URI=mongodb+srv://yseequ:user1234@cluster0.hlyxln2.mongodb.net/casino?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_CHANGE_THIS
NODE_ENV=production
CLIENT_URL=https://TWOJA-NAZWA.vercel.app
```

⚠️ **Zmień:**
- `CLIENT_URL` - po deployu frontendu wpisz tutaj URL z Vercel
- `JWT_SECRET` - zmień na losowy ciąg znaków (np. `casino_secret_key_2026_xyz123`)

### 5. Deploy!
- Kliknij **"Create Web Service"**
- Poczekaj 5-10 minut
- Skopiuj URL (np. `https://casino-backend.onrender.com`)

### 6. Test:
Wejdź na: `https://casino-backend.onrender.com/api/games/slots/config`
- Powinien pokazać JSON z konfiguracją slotów

---

## 💻 **KROK 3: Deploy Frontend (Vercel)**

### 1. Wejdź na: https://vercel.com/
- Zarejestruj się (GitHub login)

### 2. Import projektu:
- Kliknij **"Add New..."** → **"Project"**
- Wybierz repo `casino` z GitHub

### 3. Ustawienia:

| Pole | Wartość |
|------|---------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 4. Environment Variables:

Dodaj zmienną:

```
VITE_API_URL=https://casino-backend.onrender.com/api
```

⚠️ **ZAMIEŃ** `casino-backend.onrender.com` na swój URL z Render!

### 5. Deploy!
- Kliknij **"Deploy"**
- Poczekaj 2-3 minuty
- Gotowe!

### 6. Skopiuj URL:
Twoja strona jest teraz online! (np. `https://casino-abc123.vercel.app`)

---

## 🔄 **KROK 4: Finalizacja**

### 1. Zaktualizuj CLIENT_URL w Render:

Wróć do Render → Twój backend → Environment:
- Zmień `CLIENT_URL` na URL z Vercel
- Zapisz (backend się zrestartuje)

### 2. Dodaj IP do MongoDB Atlas:

https://cloud.mongodb.com/ → Network Access:
- Kliknij **"Add IP Address"**
- Wybierz **"Allow Access from Anywhere"** (0.0.0.0/0)
- Zapisz

### 3. Test całości:

1. Wejdź na swoją stronę (URL z Vercel)
2. Zarejestruj nowe konto
3. Zagraj w grę
4. Sprawdź karty

**Jeśli wszystko działa - GRATULACJE!** 🎉

---

## 🔄 **Aktualizacje strony**

### Jak zaktualizować kod:

```bash
cd G:\STAke

# Wprowadź zmiany w kodzie...

# Wyślij na GitHub
git add .
git commit -m "Update: opis zmian"
git push

# Vercel i Render automatycznie wdrożą nową wersję!
```

---

## ⚠️ **WAŻNE - Render Free Plan:**

- Backend **"zasypia"** po 15 minutach braku użycia
- Pierwsze wejście po śnie trwa **30-60 sekund**
- To normalne na darmowym planie!

**Rozwiązanie:**
1. Upgrade do płatnego ($7/miesiąc) - backend zawsze działa
2. Użyj "keep-alive" bota (ping co 10 min)
3. Zmień na VPS (pełna kontrola)

---

## 💰 **Upgrade do płatnego (opcjonalne)**

### Jeśli chcesz lepszą wydajność:

**Render Starter ($7/miesiąc):**
- Backend nigdy nie zasypia
- Lepsze zasoby (512MB RAM → 2GB RAM)
- Szybsze działanie

**Lub VPS (~$5-10/miesiąc):**
- **Contabo:** €4/miesiąc
- **DigitalOcean:** $6/miesiąc
- **Linode:** $5/miesiąc
- Pełna kontrola, bez limitów

---

## 🐛 **Troubleshooting**

### Problem: Backend zwraca 502/503
**Rozwiązanie:** Backend zasypia na Render. Poczekaj 60s i odśwież.

### Problem: CORS errors
**Rozwiązanie:** Sprawdź `CLIENT_URL` w Environment Variables na Render.

### Problem: MongoDB nie łączy się
**Rozwiązanie:** Dodaj 0.0.0.0/0 do IP whitelist w MongoDB Atlas.

### Problem: Frontend nie widzi API
**Rozwiązanie:** Sprawdź `VITE_API_URL` w Vercel Environment Variables.

---

## 📊 **Koszty (darmowy plan):**

| Usługa | Koszt | Limity |
|--------|-------|--------|
| MongoDB Atlas | **$0** | 512MB storage |
| Render Backend | **$0** | 750h/miesiąc, zasypia po 15 min |
| Vercel Frontend | **$0** | Unlimited (100GB bandwidth) |
| **RAZEM** | **$0/miesiąc** | ✅ |

---

## 🚀 **GOTOWE!**

Twoja strona jest teraz online i dostępna dla wszystkich! 🎰

**URL:** `https://TWOJA-NAZWA.vercel.app`

Share link i zapraszaj znajomych! 🎉
