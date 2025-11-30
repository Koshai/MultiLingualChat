# 🌐 Cross-Network Demo Guide - Client on Different Network

**Situation**: You and your client are on **different networks** (different Wi-Fi, different locations, different internet connections).

**Why localhost/network mode won't work**:
- `localhost` only works on same computer
- Local IP (`192.168.x.x`) only works on same LAN/Wi-Fi
- Your client needs **internet-accessible URL**

---

## 🎯 Solution Options (Ranked by Ease)

### **Option 1: Ngrok (RECOMMENDED for Quick Demo)**

**Best for**: Client demos, temporary access, no infrastructure setup

**Pros**:
- ✅ Works in 5 minutes
- ✅ No server/cloud account needed
- ✅ Free tier available
- ✅ HTTPS included (secure)
- ✅ Client can access from anywhere

**Cons**:
- ❌ Free tier has session time limits (2 hours)
- ❌ URL changes each time you restart (unless paid plan)
- ❌ Limited bandwidth on free tier

**Setup Time**: 5 minutes
**Cost**: Free (or $10/month for persistent URL)

---

### **Option 2: Cloud Deployment (AWS/Azure/DigitalOcean)**

**Best for**: Long-term demos, production deployment, multiple client demos

**Pros**:
- ✅ Persistent URL (doesn't change)
- ✅ Professional appearance
- ✅ Better performance
- ✅ No session limits
- ✅ Can use custom domain (yourdemo.com)

**Cons**:
- ❌ Requires cloud account setup
- ❌ Monthly cost ($5-20/month)
- ❌ More complex deployment
- ❌ Need to manage server

**Setup Time**: 1-2 hours
**Cost**: ~$5-10/month for basic server

---

### **Option 3: Port Forwarding (Router Configuration)**

**Best for**: If you have static IP and router access

**Pros**:
- ✅ No monthly cost
- ✅ Full control

**Cons**:
- ❌ Requires router admin access
- ❌ May not work with ISP restrictions
- ❌ Security concerns (exposing home network)
- ❌ Dynamic IP issues (IP changes)
- ❌ Complex firewall setup

**Setup Time**: 30 minutes - 2 hours
**Cost**: Free (but risky)

**⚠️ NOT RECOMMENDED** for demos due to security risks and complexity.

---

## 🚀 Quick Start with Ngrok (RECOMMENDED)

### **Step 1: Install Ngrok**

**Windows (using Chocolatey):**
```bash
choco install ngrok
```

**Or download directly:**
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract `ngrok.exe` to any folder
4. Add to PATH or use full path

### **Step 2: Start Your Services Locally**

```bash
# Run this on YOUR computer
START-HERE.bat
```

Wait for all 5 services to start (about 20 seconds).

### **Step 3: Create Ngrok Tunnel**

**Open a new terminal and run:**

```bash
ngrok http 5173
```

**You'll see output like:**
```
Session Status                online
Account                       Free
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:5173
```

### **Step 4: Share URL with Client**

**Copy the HTTPS URL** (e.g., `https://abc123xyz.ngrok-free.app`)

**Send to your client:**
```
Hey! Join the demo at:
https://abc123xyz.ngrok-free.app

Create an account and join the "Demo Meeting"
```

### **Step 5: Test the Demo**

**On YOUR Computer:**
1. Open http://localhost:5173
2. Login as `presenter`
3. Create meeting: "Client Demo"
4. Enable transcription
5. Speak in your language

**On CLIENT's Computer:**
1. Open https://abc123xyz.ngrok-free.app
2. Create account as `client`
3. Join "Client Demo" meeting
4. Switch audio mode to "Translated"
5. Should hear your voice in translated English!

---

## 🔧 Ngrok Advanced Configuration

### **Problem: URL Changes Every Time**

**Free Tier**: URL changes each restart (e.g., `abc123.ngrok-free.app` becomes `xyz789.ngrok-free.app`)

**Solution 1: Paid Plan ($10/month)**
- Get persistent subdomain (e.g., `yourdemo.ngrok-free.app`)
- URL never changes

**Solution 2: Free Workaround**
- Just send new URL to client each time
- Takes 10 seconds to copy/paste new URL

### **Problem: Ngrok Session Timeout (Free)**

**Free Tier**: 2-hour session limit

**Solution**:
- Restart Ngrok tunnel when session ends
- Use paid plan for unlimited sessions

### **Problem: WebRTC Doesn't Work Through Ngrok**

**Why**: WebRTC peer-to-peer needs STUN/TURN servers for relay

**Impact**:
- ❌ Video/audio streaming won't work
- ✅ TTS (Text-to-Speech) WILL work (uses Socket.IO, not WebRTC)
- ✅ Text transcription will work
- ✅ Translation will work

**For Full Demo**:
Focus on TTS feature - that's the star feature anyway!

---

## 🎬 Demo Script (Using Ngrok)

### **Pre-Demo Setup (10 minutes before)**

**1. Start your services**
```bash
START-HERE.bat
```

**2. Start Ngrok tunnel**
```bash
ngrok http 5173
```

**3. Copy the HTTPS URL**
```
https://abc123xyz.ngrok-free.app
```

**4. Send URL to client**
```
Email/Slack: "Join demo at https://abc123xyz.ngrok-free.app"
```

**5. Test yourself**
- Open the Ngrok URL in your browser
- Verify login works

### **During Demo (5-10 minutes)**

**Your Computer:**
1. Login at http://localhost:5173 (or Ngrok URL)
2. Username: `presenter`
3. Create meeting: "TTS Demo"

**Client Computer:**
1. Open https://abc123xyz.ngrok-free.app
2. Create account: `client-name`
3. Join "TTS Demo" meeting

**Show TTS Feature:**
1. Both enable transcription (📝 button)
2. Client clicks audio settings (🔊)
3. Client selects "Translated" mode
4. **You speak in Spanish**: "Hola, ¿cómo estás?"
5. **Client hears**: English AI voice saying "Hello, how are you?"

**Wow factor**: Real-time voice translation! 🎉

---

## 🐛 Troubleshooting

### **Issue: Client can't access Ngrok URL**

**Check:**
1. Ngrok is running (`ngrok http 5173`)
2. Services are running (check 5 windows)
3. URL is HTTPS (not HTTP)
4. No typos in URL

**Fix:**
- Stop and restart Ngrok
- Verify http://localhost:5173 works first
- Check Ngrok dashboard for errors

### **Issue: "Service Unavailable" Error**

**Cause**: Backend services not running

**Fix:**
```bash
stop-all.bat
START-HERE.bat
# Wait 20 seconds
# Restart Ngrok
```

### **Issue: Video/Audio Doesn't Work**

**This is expected!** WebRTC doesn't work through Ngrok.

**Focus on TTS instead:**
- Text transcription works ✅
- Translation works ✅
- TTS voice works ✅

That's the impressive part anyway!

### **Issue: Ngrok "Tunnel Not Found"**

**Cause**: Free Ngrok accounts require browser verification

**Fix:**
Client will see an interstitial page:
```
Click "Visit Site" to continue
```

This is normal for free Ngrok accounts.

---

## 💰 Cost Comparison

| Option | Setup Time | Monthly Cost | Best For |
|--------|-----------|--------------|----------|
| **Ngrok Free** | 5 min | $0 | Quick demos (1-2 hours) |
| **Ngrok Paid** | 5 min | $10 | Multiple demos, persistent URL |
| **DigitalOcean** | 1-2 hours | $6 | Production, custom domain |
| **AWS EC2** | 1-2 hours | $5-15 | Scalable, professional |
| **Heroku** | 1 hour | $7 | Easy deployment, good for demos |

---

## 🎯 Recommendation for Your Situation

**For Client Demo (Best Option):**

Use **Ngrok Free** for first demo:
1. Zero cost
2. 5-minute setup
3. Works from anywhere
4. Professional HTTPS URL
5. Good enough for 1-2 hour demo

**If client wants to test multiple times:**

Upgrade to **Ngrok Paid** ($10/month):
- Persistent URL (send once, works forever)
- No session limits
- Worth it for ongoing client relationship

**For production/long-term:**

Deploy to **DigitalOcean** or **AWS**:
- Professional appearance
- Custom domain
- Better performance
- One-time setup, works forever

---

## 📋 Pre-Demo Checklist (Ngrok)

**15 minutes before demo:**

- [ ] Install Ngrok (`choco install ngrok`)
- [ ] Run `START-HERE.bat`
- [ ] Verify all 5 service windows are open
- [ ] Run `ngrok http 5173`
- [ ] Copy HTTPS URL
- [ ] Send URL to client
- [ ] Test Ngrok URL yourself
- [ ] Create test meeting
- [ ] Test TTS works locally

**During demo:**

- [ ] Client opens Ngrok URL
- [ ] Client creates account
- [ ] Client joins your meeting
- [ ] Both enable transcription
- [ ] Client switches to "Translated" mode
- [ ] You speak in native language
- [ ] Client hears translated voice ✅

---

## 🚀 Next Steps

1. **Try Ngrok today** (5 minutes)
2. **Test with yourself** (open Ngrok URL in incognito)
3. **Schedule client demo**
4. **Wow them with TTS! 🎉**

**Need help?** See troubleshooting section above.

---

## 📚 Additional Resources

- **Ngrok Docs**: https://ngrok.com/docs
- **Alternative: Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Alternative: Tailscale**: https://tailscale.com (VPN approach)
- **Cloud Deployment Guide**: See `CLOUD-DEPLOYMENT.md` (if needed)

---

**Bottom Line**: Use Ngrok for your client demo. It's the fastest, easiest, and most reliable option for cross-network demos. 🌐
