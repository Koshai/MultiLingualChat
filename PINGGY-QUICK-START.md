# Pinggy Tunnel - Quick Start Guide

**Pinggy** is a simple tunneling service that creates public URLs for your localhost - **no account required!**

---

## 🎯 What is Pinggy?

- ✅ **No signup required** for basic use
- ✅ Creates both HTTP and HTTPS URLs
- ✅ Uses SSH (built into Windows/Mac/Linux)
- ✅ **Free tier available**
- ✅ More reliable than ngrok for HTTP connections
- ✅ Automatic reconnection

---

## 📋 Prerequisites

### **Windows Users:**

**Option 1: OpenSSH (Built into Windows 10/11)**
1. Go to **Settings** → **Apps** → **Optional Features**
2. Click **"Add a feature"**
3. Find and install **"OpenSSH Client"**
4. Restart your terminal

**Option 2: Use Git Bash**
- Git Bash includes SSH by default
- Just use Git Bash instead of CMD

**To verify SSH is installed:**
```bash
ssh -V
```

Should show: `OpenSSH_X.X` or similar

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Run the Start Script**

Simply double-click:
```
START-PINGGY.bat
```

This will:
1. ✅ Start all 5 services (Translation, STT, TTS, Chat, Frontend)
2. ✅ Create a Pinggy tunnel to your frontend (port 5173)

### **Step 2: Get Your Public URL**

After running the script, you'll see output like:

```
You can access local server via following URL(s):
http://xyzabc-12345.a.pinggy.online
https://xyzabc-12345.a.pinggy.online
```

### **Step 3: Share the HTTP URL**

**Copy the HTTP URL** (the one starting with `http://`)

Example:
```
http://xyzabc-12345.a.pinggy.online
```

**Share this with your client!** They can access your app from anywhere.

---

## 💡 Why Use HTTP Instead of HTTPS?

Just like with ngrok:
- ✅ HTTP works immediately - no SSL issues
- ✅ HTTPS might have certificate warnings
- ✅ For demos, HTTP is perfectly fine
- ✅ Pinggy's HTTP URLs work reliably

---

## 🔧 Manual Setup (If you prefer)

### **Start Services Separately:**

**1. Start all backend services:**
```bash
cd backend/services/translation-service
python main.py

cd backend/services/stt-service
python main.py

cd backend/services/tts-service
python main.py

cd backend/services/chat-service
npm run dev
```

**2. Start frontend:**
```bash
cd frontend
npm run dev
```

**3. Start Pinggy tunnel:**
```bash
ssh -p 443 -R0:localhost:5173 a.pinggy.io
```

That's it! Pinggy will show you the public URLs.

---

## 🎛️ Pinggy Advanced Options

### **Custom Subdomain (Requires free account):**
```bash
ssh -p 443 -R0:localhost:5173 yourname@a.pinggy.io
```

### **TCP Tunneling:**
```bash
ssh -p 443 -R0:localhost:3001 a.pinggy.io tcp
```

### **Keep tunnel alive with specific region:**
```bash
ssh -p 443 -R0:localhost:5173 a.pinggy.io -t us
```

### **Persistent connection with autossh:**
```bash
autossh -M 0 -p 443 -R0:localhost:5173 a.pinggy.io
```

---

## 🆚 Pinggy vs Ngrok

| Feature | Pinggy | Ngrok |
|---------|--------|-------|
| **Account Required** | ❌ No | ✅ Yes |
| **HTTP URLs** | ✅ Yes | ⚠️ V3 issues |
| **HTTPS URLs** | ✅ Yes | ✅ Yes |
| **Custom Subdomain** | ✅ Free account | 💰 Paid |
| **Installation** | ❌ Uses SSH | ✅ Standalone |
| **Ease of Use** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Reliability** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**TL;DR:** Pinggy is great when you don't want to create an account!

---

## 📊 How It Works

```
Your Computer                 Pinggy Server              Internet
┌─────────────────┐          ┌──────────────┐         ┌──────────┐
│                 │          │              │         │          │
│ localhost:5173  │◄────SSH──│  Pinggy.io   │◄───HTTP──│  Client  │
│   (Frontend)    │  Tunnel  │              │  Public │ Browser  │
│                 │          │              │   URL   │          │
└─────────────────┘          └──────────────┘         └──────────┘
```

1. **SSH tunnel** connects your localhost to Pinggy's server
2. **Pinggy creates** a public URL
3. **Users access** the public URL
4. **Pinggy forwards** traffic through SSH tunnel to your localhost

---

## 🔒 Security Notes

- ✅ Connection between you and Pinggy is encrypted (SSH)
- ✅ Safe for demos and testing
- ⚠️ Don't expose sensitive data on public URLs
- ⚠️ Anyone with the URL can access your app
- ✅ URL changes each time (privacy by default)

---

## 🛠️ Troubleshooting

### **"ssh: command not found"**
- **Windows:** Install OpenSSH Client (see Prerequisites)
- **Or:** Use Git Bash instead of CMD

### **"Connection refused"**
- Check if frontend is running: `netstat -an | findstr 5173`
- Make sure port 5173 is not blocked by firewall

### **"Connection timed out"**
- Check your internet connection
- Try again - sometimes server is busy
- Try different Pinggy server: `-t eu` or `-t asia`

### **Public URL not working**
- Make sure you're using the **HTTP** URL (not HTTPS)
- Check if all services are running (5 windows should be open)
- Check browser console (F12) for errors

### **Tunnel keeps disconnecting**
- Normal for free tier after inactivity
- Use `autossh` for automatic reconnection
- Or use a paid Pinggy account

---

## ⚙️ Configuration

Your app is already configured to work with Pinggy!

**Backend CORS** (`backend/services/chat-service/src/index.ts`):
```typescript
// Accepts connections from any origin (including Pinggy URLs)
const corsOrigin = process.env.CORS_ORIGIN === "*" ? "*" : [...]
```

**Socket.IO** (`frontend/src/stores/meeting-store.ts`):
```typescript
// Uses polling first for tunnel compatibility
transports: ['polling', 'websocket']
```

**Vite** (`frontend/vite.config.ts`):
```typescript
// Accepts connections from any domain
server: {
  host: '0.0.0.0',
  allowedHosts: true
}
```

---

## 📝 Quick Reference

**Start everything:**
```bash
START-PINGGY.bat
```

**Stop everything:**
```bash
stop-all.bat
```

**Restart services:**
```bash
stop-all.bat
START-PINGGY.bat
```

**Check if services are running:**
```bash
# Windows CMD
netstat -an | findstr "5173 3001 3003 3004 3005"

# Git Bash / WSL
netstat -an | grep "5173\|3001\|3003\|3004\|3005"
```

---

## 🎉 That's It!

**Three simple steps:**
1. Run `START-PINGGY.bat`
2. Copy the HTTP URL
3. Share with your client!

**No account. No configuration. Just works!** ✨

---

## 🔗 Useful Links

- **Pinggy Website:** https://pinggy.io
- **Pinggy Docs:** https://pinggy.io/docs/
- **Alternative Commands:** https://pinggy.io/docs/guide/
- **Pricing:** https://pinggy.io/pricing/ (Free tier available)

---

## 💡 Pro Tips

1. **Bookmark the URL** - You can reuse it if you restart quickly
2. **Use HTTP for demos** - Faster and no SSL issues
3. **Keep tunnel window open** - Don't close it during demo
4. **Test before client** - Always test the public URL yourself first
5. **Have backup** - Keep `START-NGROK.bat` as fallback

---

**Happy tunneling! 🚀**
