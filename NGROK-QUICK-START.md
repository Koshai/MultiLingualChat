# ⚡ Ngrok Quick Start - 5 Minutes to Demo

**Situation**: Client is on a different network and needs internet-accessible URL.

---

## 🚀 One-Time Setup (5 minutes)

### **Step 1: Install Ngrok**

**Option A: Using Chocolatey (Recommended)**
```bash
choco install ngrok
```

**Option B: Manual Download**
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract `ngrok.exe` anywhere
4. Add to PATH or remember the location

### **Step 2: Create Ngrok Account (Free)**

1. Go to https://ngrok.com/signup
2. Sign up (email + password)
3. Copy your authtoken from dashboard
4. Run once:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**That's it!** You only do this once.

---

## 🎯 Every Demo (2 minutes)

### **Method 1: Automated Script (EASIEST)**

**Just double-click:**
```
START-NGROK.bat
```

**What it does:**
1. Stops old services
2. Starts all 5 services
3. Starts Ngrok tunnel
4. Shows you the public URL
5. Opens Ngrok dashboard

**Copy the URL** from the Ngrok window and send to client!

### **Method 2: Manual Steps**

**Terminal 1 - Start services:**
```bash
START-HERE.bat
```

**Terminal 2 - Start Ngrok:**
```bash
ngrok http 5173
```

**Copy the HTTPS URL** that appears (e.g., `https://abc123xyz.ngrok-free.app`)

---

## 📱 Send to Client

**Copy/paste this message:**

```
Hey! Join the demo at:
https://YOUR-NGROK-URL.ngrok-free.app

Instructions:
1. Open the link
2. Click "Visit Site" (Ngrok page)
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
   - OR the Ngrok URL (same experience)

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

1. **Open Ngrok URL** (you sent them)

2. **Click "Visit Site"** (Ngrok free tier page)

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

### **Issue: "ngrok: command not found"**

**Fix:**
```bash
# Install it
choco install ngrok

# Or add to PATH manually
```

### **Issue: "Tunnel Not Found" Error**

**Cause:** Services not running yet

**Fix:**
```bash
# Make sure services are running first
START-HERE.bat

# Wait 20 seconds

# Then start ngrok
ngrok http 5173
```

### **Issue: Client sees "Service Unavailable"**

**Fix:**
1. Check all 5 service windows are open
2. Try http://localhost:5173 yourself first
3. Stop and restart everything:
```bash
stop-all.bat
START-NGROK.bat
```

### **Issue: URL Changes Every Time**

**This is normal for free Ngrok!**

**Options:**
1. Send new URL each time (takes 10 seconds)
2. Upgrade to Ngrok paid ($10/month) for persistent URL

### **Issue: Session Timeout (2 hours)**

**Free Ngrok limits sessions to 2 hours**

**Fix:**
- Just restart Ngrok (takes 10 seconds)
- Or upgrade to paid plan

---

## 💡 Pro Tips

### **Tip 1: Keep Ngrok Dashboard Open**

**Open:** http://127.0.0.1:4040

**Shows:**
- Your public URL (easy to copy)
- Live requests from client
- Debugging info

### **Tip 2: Test Before Client Joins**

**Open Ngrok URL in incognito window:**
1. Verify login works
2. Create test account
3. Join test meeting
4. Confirm everything loads

**Then:** Invite client with confidence!

### **Tip 3: Focus on TTS Feature**

**What works through Ngrok:**
- ✅ Text transcription
- ✅ Translation
- ✅ TTS voice (THE STAR!)

**What doesn't work:**
- ❌ Video streaming (needs STUN/TURN)
- ❌ Audio streaming (needs STUN/TURN)

**Strategy:** Make TTS the hero of the demo!

### **Tip 4: Have Backup Plan**

**If Ngrok fails:**
1. Show screen share instead (Zoom/Teams)
2. Use local demo (same computer, two windows)
3. Record video ahead of time

**But Ngrok usually works!**

---

## 📊 What You'll See

### **Your Console (Ngrok Window):**
```
Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.5.0
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              2       0       0.00    0.00    1.23    2.45
```

**Copy this URL:** `https://abc123xyz.ngrok-free.app`

### **Client's First Visit (Free Tier):**

They'll see:
```
┌─────────────────────────────────┐
│   You are about to visit:       │
│   abc123xyz.ngrok-free.app      │
│                                 │
│   [Visit Site]                  │
└─────────────────────────────────┘
```

**Tell them:** "Just click Visit Site"

After that, they'll see your login page! ✅

---

## ✅ Success Checklist

Before the demo:
- [ ] Ngrok installed (`ngrok --version`)
- [ ] Ngrok authenticated (`ngrok config add-authtoken ...`)
- [ ] Run `START-NGROK.bat`
- [ ] See 5 service windows open
- [ ] See Ngrok tunnel window with HTTPS URL
- [ ] Copy public URL
- [ ] Test URL yourself (incognito window)
- [ ] Send URL to client

During the demo:
- [ ] Client opens Ngrok URL
- [ ] Client clicks "Visit Site"
- [ ] Client sees login page
- [ ] Client creates account
- [ ] Client joins your meeting
- [ ] Client enables "Translated" mode
- [ ] You speak in native language
- [ ] Client hears English voice 🎉

---

## 🎯 Bottom Line

**Time to demo:** 2 minutes after running `START-NGROK.bat`

**What client needs:** Just a web browser

**What you need:** Ngrok installed (one-time, 5 minutes)

**Does it work?** Yes! ✅

**Ready to impress?** Let's go! 🚀

---

## 📞 Quick Reference Commands

```bash
# Start everything (easiest)
START-NGROK.bat

# Or manual:
START-HERE.bat          # Terminal 1: Start services
ngrok http 5173         # Terminal 2: Start tunnel

# Stop everything
stop-all.bat            # Stops services + ngrok

# Check ngrok version
ngrok --version

# View ngrok dashboard
# Open: http://127.0.0.1:4040
```

---

**You're ready for the demo! 🎉**
