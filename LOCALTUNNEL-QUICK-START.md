# LocalTunnel Quick Start - Free Ngrok Alternative

**Situation**: Ngrok has SSL issues with `.dev` domains. LocalTunnel is a free, simple alternative.

---

## 🚀 One-Time Setup (2 minutes)

### **Step 1: Install LocalTunnel**

```bash
npm install -g localtunnel
```

**That's it!** No account needed, no authentication, just install and use.

---

## 🎯 Every Demo (1 minute)

### **Method 1: Automated Script (EASIEST)**

**Just double-click:**
```
START-LOCALTUNNEL.bat
```

**What it does:**
1. Stops old services
2. Installs localtunnel (if needed)
3. Starts all 5 services
4. Starts LocalTunnel
5. Shows you the public URL

**Copy the URL** from the LocalTunnel window and send to client!

### **Method 2: Manual Steps**

**Terminal 1 - Start services:**
```bash
START-HERE.bat
```

**Terminal 2 - Start LocalTunnel:**
```bash
lt --port 5173
```

**Copy the URL** that appears (e.g., `https://funny-cat-12.loca.lt`)

---

## 📱 Send to Client

**Copy/paste this message:**

```
Hey! Join the demo at:
https://YOUR-URL.loca.lt

Instructions:
1. Open the link
2. Click "Click to Continue" (LocalTunnel warning page)
3. Create an account (any username/password)
4. Join the "Demo Meeting"
5. Click the 🔊 button and select "Translated"

Then I'll speak in [your language] and you'll hear English!
```

---

## 🎬 Demo Steps

### **On Your Computer:**

1. **Open in YOUR browser:**
   - http://localhost:5173 (faster)
   - OR the LocalTunnel URL (same experience)

2. **Login:**
   - Username: `presenter`
   - Password: anything

3. **Create Meeting:**
   - Click "New Meeting"
   - Name: "Client Demo"
   - Click Create

4. **Enable Transcription:**
   - Click 📝 button
   - Should turn blue

### **On Client's Computer:**

1. **Open LocalTunnel URL** (you sent them)

2. **Click "Click to Continue"** (warning page - this is normal)

3. **Create Account:**
   - Username: anything (not "presenter")
   - Password: anything

4. **Join Meeting:**
   - See "Client Demo" in list
   - Click "Join"

5. **Enable Translated Mode:**
   - Click 🔊 button
   - Select "Translated"
   - Volume slider appears

### **Show the Magic:**

1. **You speak in Spanish** (or any language):
   - "Hola, ¿cómo estás?"

2. **Client sees:**
   - Text: "Hello, how are you?"
   - Hears: English AI voice speaking

3. **WOW! 🎉**

---

## 🐛 Troubleshooting

### **Issue: "lt: command not found"**

**Fix:**
```bash
npm install -g localtunnel
```

### **Issue: "Connection refused" or "502 Bad Gateway"**

**Cause:** Services not running yet

**Fix:**
```bash
# Make sure services are running first
START-HERE.bat

# Wait 20 seconds

# Then start localtunnel
lt --port 5173
```

### **Issue: Client sees "Invalid Host header"**

**Cause:** Vite is rejecting the localtunnel domain

**Fix:** This shouldn't happen with our config (host: '0.0.0.0'), but if it does:

Add to `frontend/vite.config.ts`:
```typescript
server: {
  allowedHosts: ['.loca.lt']
}
```

### **Issue: Tunnel keeps disconnecting**

**This is normal for LocalTunnel's free tier!**

**Fix:**
- Just restart localtunnel (takes 10 seconds)
- Get a new URL and send to client
- Or upgrade to a paid solution

### **Issue: Slow connection**

**LocalTunnel can be slower than ngrok**

**Options:**
1. Accept the slower speed (it works, just slower)
2. Try Cloudflare Tunnel instead (faster, but more setup)
3. Use ngrok paid ($10/month) for best performance

---

## 💡 Pro Tips

### **Tip 1: Custom Subdomain**

Instead of random URL like `funny-cat-12.loca.lt`, use your own:

```bash
lt --port 5173 --subdomain mychat
```

**Result:** `https://mychat.loca.lt`

**Note:** Popular names might be taken. Try variations if needed.

### **Tip 2: Keep LocalTunnel Running**

Once started, leave the LocalTunnel terminal open.
- ✅ URL stays the same
- ✅ No need to share new URL
- ❌ If closed, you'll get a new random URL

### **Tip 3: Test Before Client Joins**

**Open LocalTunnel URL in incognito window:**
1. Verify "Click to Continue" page appears
2. Click through it
3. Verify login page loads
4. Create test account

**Then:** Invite client with confidence!

### **Tip 4: LocalTunnel Warning Page**

The "Click to Continue" page is **not an error**!
- This is LocalTunnel's free tier anti-abuse measure
- Every new visitor sees it once
- Just click through and continue
- Your app works normally after that

---

## 📊 LocalTunnel vs Ngrok

| Feature | LocalTunnel | Ngrok Free | Ngrok Paid |
|---------|-------------|------------|------------|
| Cost | Free | Free | $10/month |
| Account Required | No | Yes | Yes |
| SSL Issues | None | Yes (.dev) | No |
| Speed | Medium | Fast | Fast |
| Reliability | Medium | Good | Excellent |
| Custom Subdomain | Yes (free) | No | Yes |
| Warning Page | Yes | Yes | No |

**Bottom line:** LocalTunnel is perfect for demos despite being slightly slower.

---

## ✅ Success Checklist

Before the demo:
- [ ] LocalTunnel installed (`lt --version`)
- [ ] Run `START-LOCALTUNNEL.bat`
- [ ] See 5 service windows open
- [ ] See LocalTunnel terminal with public URL
- [ ] Copy public URL
- [ ] Test URL yourself (incognito window)
- [ ] Send URL to client

During the demo:
- [ ] Client opens LocalTunnel URL
- [ ] Client clicks "Click to Continue"
- [ ] Client sees login page
- [ ] Client creates account
- [ ] Client joins your meeting
- [ ] Client enables "Translated" mode
- [ ] You speak in native language
- [ ] Client hears English voice 🎉

---

## 📞 Quick Reference Commands

```bash
# Install LocalTunnel
npm install -g localtunnel

# Start everything (automated)
START-LOCALTUNNEL.bat

# Or manual:
START-HERE.bat              # Terminal 1: Start services
lt --port 5173              # Terminal 2: Start tunnel

# With custom subdomain
lt --port 5173 --subdomain myapp

# Stop everything
stop-all.bat                # Stops services + localtunnel

# Check LocalTunnel version
lt --version
```

---

## 🎯 Bottom Line

**Time to demo:** 1 minute after running `START-LOCALTUNNEL.bat`

**What client needs:** Just a web browser

**What you need:** Node.js (already have it)

**Does it work?** Yes! ✅

**Ready to impress?** Let's go! 🚀

---

**You're ready for the demo! 🎉**
