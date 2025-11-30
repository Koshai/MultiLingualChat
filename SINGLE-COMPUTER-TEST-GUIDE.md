# 🧪 Single Computer Testing Guide

**How to Test TTS with One Computer**

---

## 🎯 The Problem

When testing on one computer:
- ✅ You can open multiple browser windows
- ❌ Only ONE window can access the microphone (OS limitation)
- ❌ WebRTC peer connections don't work well on localhost

**Solution**: Use a **Speaker + Listener** setup

---

## ✅ **Test Setup: Speaker + Listener**

### **Window 1: The Speaker (Has Microphone)**
- **Browser**: Normal Chrome/Edge window
- **User**: `user1` or `koshai`
- **Role**: Speaks and broadcasts
- **Can do**:
  - ✅ Speak (has microphone access)
  - ✅ See own transcription
  - ✅ See own translation
  - ✅ Hear own TTS (optional)

### **Window 2: The Listener (Watches)**
- **Browser**: Incognito/Private window
- **User**: `user2` or `demo-user`
- **Role**: Listens and receives
- **Can do**:
  - ✅ See Speaker's transcription
  - ✅ See Speaker's translation
  - ✅ **HEAR Speaker's TTS voice** (if Translated mode enabled)
  - ❌ Cannot speak (no microphone access)

---

## 📋 **Step-by-Step Test Procedure**

### **Preparation (5 minutes)**

1. **Start all services**
   ```bash
   START-HERE.bat
   ```
   Wait 20 seconds

2. **Open Window 1 (Speaker)**
   - Open Chrome: http://localhost:5173
   - Login as `user1`
   - Create meeting: "TTS Test Meeting"
   - Join the meeting
   - **Allow microphone** when prompted ✅

3. **Open Window 2 (Listener)**
   - Open **Incognito** Chrome: http://localhost:5173
   - Login as `user2` (different account!)
   - Join the SAME meeting
   - **Block or ignore microphone** prompt ❌

---

### **Test 1: Basic Transcription (No TTS)**

**Goal**: Verify transcription and translation work

**Window 1 (Speaker):**
1. Click 📝 button (enable transcription)
2. Speak in English: "Hello, this is a test"
3. You should see:
   - ✅ "Hello, this is a test" in transcription panel
   - ✅ No translation (already English)

**Window 2 (Listener):**
1. You should see:
   - ✅ "Hello, this is a test" in transcription panel
   - ✅ Username: `user1`

**✅ If this works**: STT and Socket.IO are working!

---

### **Test 2: Translation (Text Only)**

**Goal**: Verify translation appears

**Window 1 (Speaker):**
1. Keep transcription enabled (📝)
2. Speak in Spanish: **"Hola, ¿cómo estás?"**
3. Wait 2-3 seconds
4. You should see in transcription panel:
   - ✅ Original: "Hola, ¿cómo estás?" (ES)
   - ✅ Translation: "Hello, how are you?" (EN)

**Window 2 (Listener):**
1. You should see in transcription panel:
   - ✅ Original: "Hola, ¿cómo estás?" (ES)
   - ✅ Translation: "Hello, how are you?" (EN)
   - ✅ Username: `user1`

**✅ If this works**: Translation service is working!

---

### **Test 3: TTS (Voice Translation)** ⭐

**Goal**: Verify TTS audio plays

**Window 2 (Listener) - THE IMPORTANT ONE:**
1. Click 🔊 button (audio settings)
2. Select **"🔊 Translated"** mode
3. Ensure volume slider is at 80-100%
4. **Put on headphones** or turn up speakers

**Window 1 (Speaker):**
1. Keep transcription enabled (📝)
2. Speak in Spanish: **"Me llamo Juan. Estoy muy feliz."**
3. Wait 2-3 seconds

**Window 2 (Listener) - LISTEN:**
1. You should:
   - ✅ SEE: "Me llamo Juan. Estoy muy feliz." (Spanish text)
   - ✅ SEE: "My name is Juan. I am very happy." (English text)
   - ✅ **HEAR: English AI voice saying**: "My name is Juan. I am very happy."

**✅ If this works**: TTS is fully functional! 🎉

---

### **Test 4: Audio Mode Toggle**

**Goal**: Verify user can switch modes

**Window 2 (Listener):**

**Test A: Translated Mode**
1. Audio settings → **🔊 Translated**
2. Window 1 speaks Spanish
3. You hear: **English TTS voice**

**Test B: Original Mode**
4. Audio settings → **👂 Original**
5. Window 1 speaks Spanish
6. You hear: **Nothing** (Window 1 has no video/audio stream on localhost)
   - Note: On real network, you'd hear original Spanish

**✅ If toggle works**: Audio mode selection works!

---

### **Test 5: Volume Control**

**Window 2 (Listener):**
1. Audio settings → **🔊 Translated**
2. Set volume to **100%**

**Window 1 (Speaker):**
- Speak Spanish: "Esta es una prueba"

**Window 2 (Listener):**
- Hear TTS at **loud** volume

**Window 2 (Listener):**
3. Set volume to **20%**

**Window 1 (Speaker):**
- Speak Spanish again: "Esta es una prueba"

**Window 2 (Listener):**
- Hear TTS at **quiet** volume

**✅ If volume changes**: Volume control works!

---

## 🔍 **What to Check in Console Logs**

### **Browser Console (F12)**

**Window 1 (Speaker):**
```
🎙️ New transcription: { text: "Hola...", language: "es" }
🌐 Transcription translation received: { translatedText: "Hello..." }
```

**Window 2 (Listener):**
```
🎙️ New transcription: { text: "Hola...", language: "es" }
🌐 Transcription translation received: { translatedText: "Hello..." }
🔊 TTS audio received: { format: "mp3", duration: 1.5 }
▶️ Playing TTS audio (translated mode enabled)
```

### **Chat Service Terminal**
```
🌐 Calling translation service...
✅ Translation completed: es → en: "Hello..."
🎤 Calling TTS service...
✅ TTS synthesis completed: 1.5s audio (azure_tts)
📤 Broadcasted TTS audio to meeting
```

### **TTS Service Terminal**
```
{"event": "Synthesizing speech with Azure TTS", ...}
{"event": "Azure TTS synthesis completed", ...}
```

---

## 🐛 **Troubleshooting**

### **Issue 1: No Translation Text Appears**

**Symptoms**: Only see original Spanish text, no English translation

**Check**:
1. **Translation Service running?**
   ```bash
   # Should see window: "Translation Service"
   # Check for: "Azure Translator set as primary provider"
   ```

2. **Internet connection?** (Azure Translator needs internet)

3. **Check Chat Service logs** for:
   ```
   ✅ Translation needed: es → en
   ✅ Translation completed: es → en: "Hello..."
   ```

**Fix**:
- Restart Translation Service
- Check `.env` has `AZURE_TRANSLATOR_KEY`

---

### **Issue 2: No TTS Audio Plays**

**Symptoms**: See translation text but don't hear voice

**Check**:
1. **TTS mode enabled?**
   - Click 🔊 button
   - Should be **BLUE** when active
   - Should say "🔊 Translated" (selected)

2. **Volume up?**
   - Check slider is above 50%
   - Check computer speakers/headphones

3. **TTS Service running?**
   ```bash
   # Should see window: "TTS Service"
   # Check for: "Azure TTS Service initialized"
   ```

4. **Check Browser Console (F12)**:
   ```javascript
   // Should see:
   🔊 TTS audio received
   ▶️ Playing TTS audio

   // Should NOT see:
   ⏭️ Skipping TTS audio (original audio mode...)
   ```

**Fix**:
- Click 🔊 button, select "Translated"
- Increase volume slider
- Restart TTS Service
- Check `.env` has `AZURE_SPEECH_KEY`

---

### **Issue 3: Translation Delayed**

**Symptoms**: Translation appears 5+ seconds late

**Check**:
- **Internet speed** (Azure services need good connection)
- **All services running** (check all 5 windows open)
- **Azure quota** (check Azure Portal metrics)

**Normal latency**: 1-2 seconds
**Problem latency**: 5+ seconds

---

### **Issue 4: Microphone Access Errors**

**Symptoms**: "Microphone not available" or both windows fight for mic

**Solution**:
1. **Close Window 2** (Listener)
2. **In Window 1**: Allow microphone access
3. **Test Window 1** works alone
4. **Then open Window 2** (don't allow microphone!)

---

## 📝 **Testing Checklist**

Use this checklist for systematic testing:

### **Basic Functionality**
- [ ] Can login to both windows
- [ ] Can join same meeting from both windows
- [ ] Window 1 can access microphone
- [ ] Window 1 can enable transcription (📝)

### **Transcription**
- [ ] Window 1 speaks English → Both windows see English text
- [ ] Window 1 speaks Spanish → Both windows see Spanish text

### **Translation**
- [ ] Window 1 speaks Spanish → Both windows see Spanish + English text
- [ ] Translation appears within 2 seconds
- [ ] French/German also work

### **TTS Audio**
- [ ] Window 2 enables Translated mode (🔊 blue)
- [ ] Window 1 speaks Spanish → Window 2 hears English voice
- [ ] TTS audio plays within 2-3 seconds
- [ ] Audio quality is clear (not robotic/choppy)

### **Controls**
- [ ] Audio mode toggle works (Original ↔ Translated)
- [ ] Volume slider changes TTS volume
- [ ] Can mute TTS (volume to 0%)
- [ ] Settings panel opens/closes correctly

---

## 🎯 **Expected Results Summary**

| Test | Window 1 (Speaker) | Window 2 (Listener) |
|------|-------------------|---------------------|
| **English speech** | Sees: English text | Sees: English text |
| | Hears: Nothing | Hears: Nothing |
| **Spanish speech** | Sees: Spanish + English text | Sees: Spanish + English text |
| (Original mode) | Hears: Nothing | Hears: Nothing |
| **Spanish speech** | Sees: Spanish + English text | Sees: Spanish + English text |
| (Translated mode) | Hears: English TTS voice | **Hears: English TTS voice** ✅ |

---

## 💡 **Pro Tips**

1. **Use headphones** on Window 2 to clearly hear TTS
2. **Speak slowly and clearly** for better transcription
3. **Use simple phrases** for testing (not long sentences)
4. **Wait 2-3 seconds** between phrases (let pipeline complete)
5. **Check all 5 service windows** are running with no errors
6. **F12 console** is your friend - check for errors there

---

## 🗣️ **Good Test Phrases**

### **Spanish**
- "Hola" → "Hello"
- "¿Cómo estás?" → "How are you?"
- "Me llamo Juan" → "My name is Juan"
- "Estoy muy feliz" → "I am very happy"
- "Esta tecnología es increíble" → "This technology is incredible"

### **French**
- "Bonjour" → "Hello"
- "Comment allez-vous?" → "How are you?"
- "Je m'appelle Marie" → "My name is Marie"

### **German**
- "Guten Tag" → "Good day"
- "Wie geht es Ihnen?" → "How are you?"
- "Ich bin sehr glücklich" → "I am very happy"

---

## 🎬 **5-Minute Test Demo**

**Quick test to verify everything works:**

1. **Start services** (START-HERE.bat) - 30 sec
2. **Open 2 windows** (normal + incognito) - 30 sec
3. **Login both** → Join same meeting - 1 min
4. **Window 1**: Enable transcription - 10 sec
5. **Window 2**: Enable Translated mode - 10 sec
6. **Window 1**: Say "Hola, ¿cómo estás?" - 5 sec
7. **Window 2**: Listen for English voice - 3 sec
8. **Verify**: See text + hear voice - Success! ✅

**Total time: ~3 minutes**

---

## 📞 **When Testing Fails**

If nothing works after following all steps:

1. **Check all 5 service windows are running**
2. **Run `stop-all.bat`**
3. **Wait 10 seconds**
4. **Run `START-HERE.bat` again**
5. **Try test again**

If still fails:
- Check Azure keys in `.env` files
- Check internet connection
- Check service logs for red errors
- Check browser console (F12) for errors

---

**Good luck testing! 🚀**

The key is: **Window 1 speaks, Window 2 listens and hears TTS voice.**
