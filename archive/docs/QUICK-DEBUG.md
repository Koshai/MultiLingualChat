# 🔧 Quick Debug Guide

## Step-by-Step Debugging

### **Step 1: Verify All Services Are Running**

You should have **5 windows open** after running `START-HERE.bat`:

1. **Translation Service** (port 3003)
   - Look for: `✅ Azure Translator set as primary provider`

2. **STT Service** (port 3004)
   - Look for: `Azure Speech Service initialized` OR `Whisper model loaded`

3. **TTS Service** (port 3005)
   - Look for: `✅ Azure TTS Service initialized`

4. **Chat Service** (port 3001)
   - Look for: `Server running on port 3001`

5. **Frontend** (port 5173)
   - Look for: `Local: http://localhost:5173/`

**Action**: If any are missing, run `stop-all.bat` then `START-HERE.bat` again.

---

### **Step 2: Test with Console Logs Open**

**Window 1 (Speaker):**
1. Open browser to http://localhost:5173
2. Press **F12** (open Developer Tools)
3. Click **Console** tab
4. Login as `user1`
5. Create meeting → Join
6. Allow microphone

**Window 2 (Listener):**
1. Open **Incognito** window to http://localhost:5173
2. Press **F12** (open Developer Tools)
3. Click **Console** tab
4. Login as `user2` (different account!)
5. Join the SAME meeting
6. Block/ignore microphone

---

### **Step 3: Enable Transcription and Verify STT**

**Window 1 (Speaker):**
1. Click 📝 button (should turn blue/active)
2. Speak clearly in **English**: "Testing one two three"
3. Wait 2 seconds
4. Check transcription panel - you should see: "Testing one two three"
5. Check **Console** - you should see:
   ```
   🎙️ New transcription: { text: "Testing one two three", language: "en" }
   ```

**Window 2 (Listener):**
1. Check transcription panel - you should also see: "Testing one two three"
2. Check **Console** - you should also see:
   ```
   🎙️ New transcription: { text: "Testing one two three", language: "en" }
   ```

**✅ If you see this**: STT is working! Move to Step 4.
**❌ If you don't see this**: Problem is with STT service. Check Step 1 again.

---

### **Step 4: Test Translation with Spanish**

**Window 1 (Speaker):**
1. Make sure 📝 is still enabled
2. Speak clearly in **Spanish**: "Hola, ¿cómo estás?"
   - **Speak slowly and clearly**
   - **Spanish pronunciation**: "OH-lah, KOH-moh es-TAHSS"
3. Wait 3 seconds
4. Check **Console logs** for:
   ```
   🎙️ New transcription: { text: "Hola, ¿cómo estás?", language: "es" }
   🌐 Transcription translation received: { translatedText: "Hello, how are you?" }
   ```
5. Check **transcription panel** for:
   - Original: "Hola, ¿cómo estás?" (ES)
   - Translation: "Hello, how are you?" (EN) ← Should appear below

**Window 2 (Listener):**
1. Check **Console logs** for:
   ```
   🎙️ New transcription: { text: "Hola, ¿cómo estás?", language: "es" }
   🌐 Transcription translation received: { translatedText: "Hello, how are you?" }
   ```
2. Check **transcription panel** for both Spanish and English text

**✅ If you see translation**: Translation is working! Move to Step 5.
**❌ If you only see Spanish (no English translation)**: Check below ↓

---

### **🔍 Debugging: No Translation Appearing**

**Check Chat Service Window:**

Look for these log messages when you speak Spanish:

**Good logs (translation working):**
```
🔍 Checking if translation needed: language="es"
✅ Translation needed: es → en
🌐 Calling translation service at: http://localhost:3003/api/v1/translate
✅ Translation completed: es → en: "Hello, how are you?"
📤 Broadcasted translation to meeting
```

**Bad logs (translation failing):**
```
⏭️ Skipping translation: language is already English (es)  ← Bug!
```
OR
```
❌ Translation service returned error 500
```
OR
```
🚨 TRANSLATION SERVICE APPEARS TO BE DOWN OR UNREACHABLE!
```

**Fixes:**

**If seeing "Skipping translation":**
- Bug in language detection
- Try speaking more clearly in Spanish
- Try using language selector: Click 🌐 → Select "Spanish"

**If seeing "Translation service down":**
- Check Translation Service window is running
- Restart services: `stop-all.bat` → `START-HERE.bat`

**If seeing error 500:**
- Check `.env` file has `AZURE_TRANSLATOR_KEY`
- Check internet connection

---

### **Step 5: Test TTS Audio**

**Window 2 (Listener) - IMPORTANT:**
1. Click 🔊 button (bottom toolbar)
2. You'll see a settings panel
3. Click **"🔊 Translated"** button (should turn blue)
4. Make sure volume slider is at **80-100%**
5. **Put on headphones or turn up speakers**

**Window 1 (Speaker):**
1. Speak in Spanish: "Me llamo Juan"
2. Wait 3 seconds

**Window 2 (Listener) - LISTEN CAREFULLY:**
1. Check **Console logs** for:
   ```
   🔊 TTS audio received: { format: "mp3", duration: 1.5, provider: "azure_tts" }
   ▶️ Playing TTS audio (translated mode enabled)
   ```
2. **Listen** for English AI voice saying: "My name is Juan"
3. Check **transcription panel** shows translation

**✅ If you hear TTS voice**: Everything works! 🎉
**❌ If you don't hear anything**: Check below ↓

---

### **🔍 Debugging: No TTS Audio Playing**

**Check Window 2 Console Logs:**

**Good logs (TTS playing):**
```
🔊 TTS audio received
▶️ Playing TTS audio (translated mode enabled)
TTS audio started playing
```

**Bad logs (TTS not playing):**
```
🔊 TTS audio received
⏭️ Skipping TTS audio (original audio mode or TTS player not initialized)
```
OR
```
(no TTS logs at all)
```

**Fixes:**

**If seeing "Skipping TTS audio":**
- Audio mode is NOT set to Translated
- Click 🔊 button again
- Make sure **"🔊 Translated"** is selected (blue)
- Button itself should be **blue** when active

**If no TTS logs at all:**
1. Check **Chat Service** window for:
   ```
   🎤 Calling TTS service...
   ✅ TTS synthesis completed: 1.5s audio (azure_tts)
   ```
2. If you see "TTS SERVICE DOWN":
   - Check TTS Service window is open
   - Should show: "Azure TTS Service initialized"
   - If not, restart services

**If hearing nothing but logs look good:**
- Check computer volume (not muted)
- Check browser tab is not muted (right-click tab)
- Try increasing TTS volume slider to 100%
- Try different headphones/speakers

---

### **Step 6: Verify Complete Flow**

**Final test to confirm everything:**

**Setup:**
- Window 1: Transcription enabled (📝 blue)
- Window 2: Translated mode enabled (🔊 blue, volume 80%+)

**Test:**
1. Window 1 speaks Spanish: "Esta tecnología es increíble"
2. Window 2 should:
   - ✅ SEE Spanish text: "Esta tecnología es increíble"
   - ✅ SEE English text: "This technology is incredible"
   - ✅ **HEAR** English voice: "This technology is incredible"

**Timeline:**
- 0s: You speak
- 1s: Spanish text appears
- 2s: English text appears
- 2-3s: English voice plays

**Total latency: 2-3 seconds** ✅

---

## 📊 **Expected Console Output**

### **Window 1 (Speaker) Console:**
```javascript
// After speaking Spanish:
🎙️ New transcription: {
  text: "Hola, ¿cómo estás?",
  language: "es",
  userId: "user1"
}

🌐 Transcription translation received: {
  transcriptionId: "xxx",
  translatedText: "Hello, how are you?",
  targetLanguage: "en"
}
```

### **Window 2 (Listener) Console:**
```javascript
// After Window 1 speaks Spanish:
🎙️ New transcription: {
  text: "Hola, ¿cómo estás?",
  language: "es",
  userId: "user1"
}

🌐 Transcription translation received: {
  transcriptionId: "xxx",
  translatedText: "Hello, how are you?",
  targetLanguage: "en"
}

🔊 TTS audio received: {
  transcriptionId: "xxx",
  audioData: "base64...",
  format: "mp3",
  duration: 1.5,
  provider: "azure_tts"
}

▶️ Playing TTS audio (translated mode enabled)
TTS audio started playing
TTS audio finished playing
```

---

## 🎯 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **No transcription** | Nothing appears when speaking | Check 📝 is enabled, check microphone access |
| **Only original text** | See Spanish, no English | Check Translation Service running, check internet |
| **Translation delayed** | English appears after 5+ seconds | Slow internet or service overloaded, restart |
| **No TTS audio** | See translation but don't hear | Check 🔊 mode is Translated (blue), check volume |
| **Choppy audio** | TTS voice cuts out | Check internet connection, close other apps |
| **Wrong language detected** | Spanish detected as English | Use language selector (🌐 → Spanish) |

---

## ✅ **Success Criteria**

You'll know it's working when:
- ✅ Window 1 speaks Spanish
- ✅ Both windows see Spanish text immediately
- ✅ Both windows see English translation 1-2 sec later
- ✅ Window 2 **hears** English TTS voice 2-3 sec later
- ✅ Audio is clear and understandable

---

## 🚨 **Emergency Reset**

If nothing works:
1. Close ALL browser windows
2. Run `stop-all.bat`
3. Wait 10 seconds
4. Run `START-HERE.bat`
5. Wait 30 seconds for services to fully start
6. Try again from Step 2

---

**Questions? Check service windows for error messages and console logs for details.**
