# Ngrok HTTPS SSL Fix - Testing Guide

## What Was Fixed

### 1. **Vite Configuration** (`frontend/vite.config.ts`)
- ✅ Set `host: '0.0.0.0'` to accept external connections
- ✅ Enabled CORS to allow ngrok domains
- ✅ Configured HMR (Hot Module Replacement) to use WSS on port 443
- ✅ Added X-Forwarded-Proto headers for proxied requests
- ✅ Enhanced Socket.IO proxy configuration

### 2. **Socket.IO Configuration** (`frontend/src/stores/meeting-store.ts`)
- ✅ Changed transports from `['websocket']` to `['polling', 'websocket']`
- ✅ Polling works perfectly through HTTPS → HTTP proxying
- ✅ Automatically upgrades to WebSocket when possible

### 3. **Backend CORS** (All services)
- ✅ Chat service accepts `CORS_ORIGIN=*`
- ✅ STT service accepts `CORS_ORIGIN=*`
- ✅ Translation service accepts `CORS_ORIGIN=*`
- ✅ TTS service already had `allow_origins=["*"]`

## How to Test

### Step 1: Stop All Running Services

```bash
stop-all.bat
```

**Important:** Make sure ALL service windows are closed!

### Step 2: Start Services with Ngrok

```bash
START-NGROK.bat
```

This will:
1. Stop any existing services
2. Start all 5 services (Translation, STT, TTS, Chat, Frontend)
3. Start ngrok tunnel
4. Open ngrok dashboard

### Step 3: Get Your HTTPS URL

Look at the **Ngrok Tunnel** window for a line like:

```
Forwarding  https://jellylike-selene-nebuly.ngrok-free.dev -> http://localhost:5173
```

**Copy the HTTPS URL:** `https://jellylike-selene-nebuly.ngrok-free.dev`

### Step 4: Test the URL

**Open in your browser:**
```
https://YOUR-NGROK-URL.ngrok-free.dev
```

**What you should see:**
1. ✅ Ngrok interstitial page ("You are about to visit...")
2. ✅ Click "Visit Site"
3. ✅ Your app loads **without SSL errors**
4. ✅ Login page appears
5. ✅ No "SSL Protocol Error" or certificate warnings

### Step 5: Test Socket.IO Connection

**Open browser developer console (F12)** and look for:

```
🔗 Connected to meeting server
```

**Check the Network tab:**
- Look for requests to `/socket.io/?EIO=4&transport=polling`
- Should see status **200 OK**
- May later upgrade to WebSocket (that's fine!)

### Step 6: Full Feature Test

1. **Login** with any username/password
2. **Create a meeting**
3. **Check for errors** in console
4. **Enable transcription** (📝 button)
5. **Test TTS** (🔊 button → "Translated" mode)

## Troubleshooting

### Issue: Still Getting SSL Protocol Error

**Possible causes:**

1. **Old frontend still running**
   ```bash
   # Kill all Node processes
   taskkill /F /IM node.exe

   # Restart
   START-NGROK.bat
   ```

2. **Browser cache**
   - Open in **Incognito/Private window**
   - Or clear browser cache (Ctrl+Shift+Delete)

3. **Check Vite is using new config**
   - Look at the "Frontend" window
   - Should see: `VITE vite vX.X.X dev server running at:`
   - Should show `Network: use --host to expose`

4. **Verify ngrok is running**
   - Check the "Ngrok Tunnel" window
   - Should show: `Session Status: online`
   - Should show your forwarding URL

### Issue: "ERR_NGROK_108" or Authentication Failed

**Fix:**
```bash
# Get token from: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_ACTUAL_TOKEN_HERE
```

### Issue: WebSocket Connection Failed (but page loads)

**This is OK!** The app uses polling first:
- ✅ Polling works perfectly over HTTPS
- ✅ App functionality is not affected
- WebSocket upgrade might fail through ngrok (that's normal)

### Issue: Hot Module Replacement (HMR) Not Working

**This is expected with ngrok:**
- The app works fine
- Just refresh the page manually after code changes
- Or use localhost for development

## What Should Work

### ✅ Works Through Ngrok HTTPS:
- Page loading
- Authentication (login/register)
- Creating/joining meetings
- Sending messages
- Real-time Socket.IO (via polling)
- Text transcription
- Translation
- Text-to-Speech (TTS)
- API calls

### ❌ May Not Work (Need TURN server):
- WebRTC video streaming
- WebRTC audio streaming
- Screen sharing

**For the demo, focus on TTS translation!** That's your star feature.

## Verify the Fix

### Check 1: Network Tab (F12)

**Look for these successful requests:**

```
✅ GET https://YOUR-URL.ngrok-free.dev/
✅ GET https://YOUR-URL.ngrok-free.dev/socket.io/?EIO=4&transport=polling
✅ POST https://YOUR-URL.ngrok-free.dev/api/auth/login
✅ GET https://YOUR-URL.ngrok-free.dev/api/meetings
```

All should return **200 OK** or **101 Switching Protocols**.

### Check 2: Console Logs (F12)

**Should see:**
```
🔗 Connected to meeting server
🔊 TTS player initialized
```

**Should NOT see:**
```
❌ SSL Protocol Error
❌ net::ERR_SSL_PROTOCOL_ERROR
❌ Connection error
```

### Check 3: Ngrok Dashboard

**Open:** http://127.0.0.1:4040

**Should see:**
- Requests from your browser to ngrok URL
- Status: 200, 101, 304 (all good)
- No 502, 503, 504 errors

## Success Criteria

✅ **The fix is working if:**

1. HTTPS ngrok URL opens without SSL errors
2. You can log in successfully
3. Console shows "Connected to meeting server"
4. You can create/join meetings
5. Real-time features work (messages, transcription)

## Still Having Issues?

**Check these files were updated:**

```bash
# 1. Frontend Socket.IO config
cat frontend/src/stores/meeting-store.ts | grep -A 3 "transports:"
# Should show: transports: ['polling', 'websocket'],

# 2. Vite config
cat frontend/vite.config.ts | grep -A 5 "server:"
# Should show: host: '0.0.0.0', cors: true, hmr: {...}

# 3. Environment variable
cat .env | grep CORS_ORIGIN
# Should show: CORS_ORIGIN=*
```

## Contact for Help

If still not working, provide:
1. The exact error message
2. Browser console logs (F12 → Console)
3. Network tab screenshot (F12 → Network)
4. Your ngrok URL
5. Which step failed

---

**You should be good to go!** 🚀
