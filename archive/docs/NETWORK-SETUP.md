# 🌐 Network Setup Guide - Multi-Computer Demo

**How to demo with TWO computers on the same network**

---

## 🎯 The Difference

### **Localhost Mode** (START-HERE.bat)
- ✅ Best for: Testing on one computer
- ✅ URLs: `http://localhost:5173`
- ❌ Can't connect from other computers

### **Network Mode** (START-NETWORK.bat)
- ✅ Best for: Client demos with multiple computers
- ✅ URLs: `http://192.168.1.X:5173` (your network IP)
- ✅ Other computers can connect!

---

## 🚀 Quick Start (Network Mode)

### **Step 1: Run on YOUR Computer (Host)**

```bash
# Just double-click:
START-NETWORK.bat
```

The script will:
1. Detect your network IP automatically (e.g., 192.168.1.100)
2. Start all 5 services
3. Open browser
4. Show connection URL for other computers

### **Step 2: Connect from OTHER Computer (Client)**

On the other computer:
1. Open any web browser
2. Go to: `http://192.168.1.X:5173` (IP shown by START-NETWORK.bat)
3. Create account / Login
4. Join the same meeting!

---

## 📋 Detailed Instructions

### **On Host Computer (Where Services Run)**

1. **Check both computers are on same network**
   - Same Wi-Fi network
   - Or same wired network

2. **Run the network startup script**
   ```bash
   START-NETWORK.bat
   ```

3. **Note the IP address shown**
   ```
   Your computer's network IP address: 192.168.1.100
   ```

4. **Give this URL to the client**
   ```
   http://192.168.1.100:5173
   ```

5. **Login and create a meeting**
   - Username: `host-user`
   - Create meeting: "Network Demo"

### **On Client Computer (Connects to Host)**

1. **Open web browser** (Chrome, Edge, Firefox)

2. **Go to the URL provided by host**
   ```
   http://192.168.1.100:5173
   ```
   (Replace with actual IP from host computer)

3. **Create different account**
   - Username: `client-user` (must be different!)
   - Password: anything

4. **Join the same meeting**
   - Look for "Network Demo" meeting
   - Click Join

5. **Now you're in the same meeting!**
   - Both can see/hear each other
   - Both can enable TTS translation

---

## 🔥 Firewall Configuration

### **Windows Firewall (Host Computer)**

If the client can't connect, you need to allow connections:

**Option 1: Quick Allow (Recommended for Demo)**

When you run `START-NETWORK.bat`, Windows may show firewall prompts:
- ✅ Check "Private networks"
- ✅ Click "Allow access"
- Do this for: Python, Node.js

**Option 2: Manual Firewall Rules**

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Allow these ports:
   - TCP 3001 (Chat Service)
   - TCP 3003 (Translation)
   - TCP 3004 (STT)
   - TCP 3005 (TTS)
   - TCP 5173 (Frontend)

---

## 🧪 Testing Network Connection

### **From Client Computer:**

**Test 1: Can you ping the host?**
```bash
ping 192.168.1.100
```
Should see replies. If not, network issue!

**Test 2: Can you access the frontend?**
```
Open browser: http://192.168.1.100:5173
```
Should see login page. If not, firewall blocking!

**Test 3: Can you access the API?**
```
Open browser: http://192.168.1.100:3001/health
```
Should see JSON. If not, services not running!

---

## 🎬 Demo Flow (Two Computers)

### **Setup (5 minutes)**

**Host Computer:**
1. Run `START-NETWORK.bat`
2. Note IP address: `192.168.1.100`
3. Login as `presenter`
4. Create meeting: "TTS Demo"

**Client Computer:**
1. Open browser to `http://192.168.1.100:5173`
2. Login as `attendee`
3. Join "TTS Demo" meeting

### **Demo TTS (5 minutes)**

**Host Computer (Presenter):**
1. Enable transcription (📝)
2. Speak in Spanish: "Hola, mi nombre es Juan"
3. Both computers see Spanish + English text

**Client Computer (Attendee):**
1. Click audio settings (🔊)
2. Select "Translated" mode
3. **Hear English TTS voice!**

**Host Computer:**
- Can keep Original mode (hears own voice)
- Or switch to Translated mode too

**Client Computer:**
- Hears English translation in real-time
- ~1-2 second delay

---

## ⚠️ Common Issues

### **Issue 1: Client can't connect**

**Symptom:** Browser shows "Can't reach this page"

**Solutions:**
1. Check both computers on same network
2. Check firewall on host computer
3. Verify IP address is correct
4. Try ping from client to host
5. Restart START-NETWORK.bat

### **Issue 2: Services not accessible**

**Symptom:** Frontend loads but can't login

**Check:**
1. All 5 service windows are running on host
2. Chat Service shows "running on 0.0.0.0:3001"
3. Frontend shows "Network: true"

**Fix:**
```bash
# On host computer:
stop-all.bat
START-NETWORK.bat
```

### **Issue 3: WebRTC video/audio doesn't work**

**Symptom:** Can join meeting but no video/audio

**This is normal for network mode!**
- WebRTC requires STUN/TURN servers for network connections
- For demo, focus on TTS feature (which works!)
- Video/audio will work on localhost mode

**Workaround for demo:**
- Show TTS feature (works perfectly on network!)
- Explain video would work with STUN/TURN servers
- Or demo video on localhost mode separately

### **Issue 4: Both computers on different networks**

**Symptom:** Computers on different Wi-Fi networks

**Solution:**
1. Connect both to same Wi-Fi
2. Or use mobile hotspot
3. Or use Ngrok (advanced)

---

## 🔧 Advanced: Using Ngrok (Optional)

**If you need to demo over internet** (not same network):

1. **Install Ngrok**
   ```bash
   choco install ngrok
   ```

2. **Start services normally**
   ```bash
   START-HERE.bat
   ```

3. **Tunnel Frontend**
   ```bash
   ngrok http 5173
   ```

4. **Use Ngrok URL**
   ```
   https://abc123.ngrok.io
   ```

5. **Share URL with client** (works from anywhere!)

**Note:** Free Ngrok has limits. Best for quick demos.

---

## 📊 Network Architecture

```
┌─────────────────────────────────────┐
│  Host Computer (192.168.1.100)      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Translation Service :3003   │   │
│  │ STT Service        :3004    │   │
│  │ TTS Service        :3005    │   │
│  │ Chat Service       :3001    │   │
│  │ Frontend           :5173    │   │
│  └─────────────────────────────┘   │
│            ↓                        │
│    Binds to 0.0.0.0                │
│    (accessible from network)       │
└─────────────────────────────────────┘
            ↓
     Network (Wi-Fi/LAN)
            ↓
┌─────────────────────────────────────┐
│  Client Computer (192.168.1.50)     │
│                                     │
│  Browser → http://192.168.1.100:5173│
│  WebSocket → ws://192.168.1.100:3001│
│                                     │
│  ✅ Can join meetings               │
│  ✅ Can see transcriptions          │
│  ✅ Can hear TTS voice              │
└─────────────────────────────────────┘
```

---

## ✅ Pre-Demo Checklist

**Host Computer:**
- [ ] Both computers on same Wi-Fi
- [ ] Firewall allows Python and Node.js
- [ ] Run `START-NETWORK.bat`
- [ ] All 5 service windows open
- [ ] Note the IP address
- [ ] Browser opens automatically
- [ ] Create test meeting

**Client Computer:**
- [ ] On same Wi-Fi as host
- [ ] Browser opens to `http://HOST_IP:5173`
- [ ] Can see login page
- [ ] Create different user account
- [ ] Join same meeting as host
- [ ] Can see host in participant list

**Test:**
- [ ] Host speaks Spanish → Client sees Spanish text
- [ ] Client sees English translation
- [ ] Client enables Translated mode
- [ ] Host speaks Spanish again
- [ ] Client **hears** English TTS voice ✅

---

## 🎯 Quick Reference

### **URLs for Network Mode**

Replace `192.168.1.100` with your actual IP:

| Service | URL |
|---------|-----|
| Frontend | `http://192.168.1.100:5173` |
| Chat API | `http://192.168.1.100:3001` |
| Translation | `http://192.168.1.100:3003` |
| STT | `http://192.168.1.100:3004` |
| TTS | `http://192.168.1.100:3005` |

### **Commands**

| Action | Command |
|--------|---------|
| Start (Network) | `START-NETWORK.bat` |
| Start (Localhost) | `START-HERE.bat` |
| Stop All | `stop-all.bat` |
| Check IP | `ipconfig` |
| Test Ping | `ping HOST_IP` |

---

## 💡 Tips for Successful Demo

1. **Test before client arrives**
   - Do a dry run with two computers
   - Verify firewall is configured
   - Test TTS feature works

2. **Have backup plan**
   - If network fails, use localhost mode
   - Have Ngrok ready as backup
   - Can demo on same computer if needed

3. **Focus on TTS**
   - This is the wow feature!
   - Video/audio can be secondary
   - Translation + TTS is the star

4. **Prepare client computer**
   - Chrome or Edge browser
   - Microphone permissions allowed
   - Volume turned up for TTS

---

**Network mode makes your demo much more impressive - the client can actually participate, not just watch!** 🌐🚀
