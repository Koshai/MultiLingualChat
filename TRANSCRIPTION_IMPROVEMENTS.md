# Live Transcription - Issues & Improvements

## Bugs Fixed

### 1. ✅ Repeated Transcription Display
**Issue**: Transcriptions persist when leaving and rejoining meetings, causing the same transcription to appear multiple times.

**Fix**: Clear transcriptions array when leaving a meeting.

**Location**: `frontend/src/stores/meeting-store.ts` - `leaveMeeting()`

### 2. ✅ Silent Audio Chunks Being Sent
**Issue**: Every 3 seconds, audio chunks are sent even when there's only silence, causing unnecessary STT API calls and errors.

**Fix**: Added RMS (Root Mean Square) audio detection to skip silent chunks.

**Location**: `frontend/src/services/audio-recorder.ts` - `detectAudio()`

## Current Limitations & Recommended Improvements

### 1. Transcription Accuracy

**Issues**:
- Whisper's `base` model has limited accuracy
- Short 3-second chunks don't provide enough context
- Background noise affects accuracy

**Improvements**:
```markdown
Priority: HIGH

Options:
1. Use larger Whisper model (`small` or `medium`)
   - Edit: `backend/services/stt-service/app/core/config.py`
   - Change: `WHISPER_MODEL = "small"` or `"medium"`
   - Trade-off: Better accuracy, slower processing

2. Increase chunk duration to 5-10 seconds
   - Edit: `frontend/src/services/audio-recorder.ts`
   - Change: `chunkDurationMs: 5000` or `10000`
   - Trade-off: Better context, more latency

3. Add noise reduction
   - Use library like `noisereduce` or `webrtcvad`
   - Pre-process audio before sending to Whisper
```

### 2. Language Detection

**Issues**:
- Currently hardcoded to English (`language: 'en'`)
- Doesn't auto-detect user's language
- No per-user language preferences

**Improvements**:
```markdown
Priority: MEDIUM

1. Auto-detect language per transcription
   - Remove `language` parameter in Whisper call
   - Let Whisper auto-detect (slower but more accurate)

2. Use user's preferred language
   - Get from user.preferredLanguage
   - Edit: `backend/services/chat-service/src/handlers/socket-handler.ts`
   - Change: `language: user.preferredLanguage`

3. Add language selector in UI
   - Add dropdown in meeting controls
   - Override auto-detection when needed
```

### 3. Real-time Translation Integration

**Issues**:
- Transcriptions show original language only
- No automatic translation to participants' languages
- Translation service exists but not connected

**Improvements**:
```markdown
Priority: HIGH

Implementation:
1. After transcription, request translation
   - For each participant, translate to their preferredLanguage
   - Use existing translation service

2. Display translations alongside original
   - Already supported in UI (transcription.translations)
   - Need to trigger translation after transcription

3. Add translation toggle
   - Let users show/hide translations
   - Save preference per user
```

### 4. Performance Optimization

**Issues**:
- Whisper runs on CPU (slow)
- No caching of transcriptions
- Every chunk processed independently

**Improvements**:
```markdown
Priority: MEDIUM

1. GPU Acceleration
   - Install CUDA/cuDNN if available
   - Whisper will auto-use GPU
   - 10-20x faster processing

2. Caching
   - Cache audio fingerprints to avoid re-transcribing
   - Useful for repeated phrases

3. Batch Processing
   - Process multiple chunks together
   - Better for GPU utilization
```

### 5. UI/UX Enhancements

**Current Issues**:
- Transcriptions scroll constantly
- No visual feedback when speaking
- Can't search/filter transcriptions
- No timestamps relative to meeting start

**Improvements**:
```markdown
Priority: MEDIUM

1. Auto-scroll control
   - Add "Pin to bottom" button
   - Stop auto-scroll when user scrolls up

2. Speaking indicator
   - Show mic icon when audio detected
   - Visual feedback before transcription appears

3. Search functionality
   - Filter transcriptions by text
   - Jump to specific timestamp

4. Export transcriptions
   - Download as TXT/SRT/VTT
   - Include timestamps and translations

5. Highlight keywords
   - Auto-highlight mentioned names
   - User-defined keyword highlighting
```

### 6. Audio Quality Improvements

**Issues**:
- Using 16kHz sample rate (lower quality)
- Mono audio only
- No echo cancellation
- No automatic gain control

**Improvements**:
```markdown
Priority: LOW-MEDIUM

1. Increase sample rate to 44.1kHz or 48kHz
   - Edit: `frontend/src/services/audio-recorder.ts`
   - Change: `sampleRate: 48000`
   - Better quality, larger files

2. Add echo cancellation
   - Use browser's echoCancellation constraint
   - getUserMedia({ audio: { echoCancellation: true } })

3. Automatic Gain Control (AGC)
   - Normalize audio levels across participants
   - Use autoGainControl constraint
```

### 7. Error Handling

**Issues**:
- Failed transcriptions silently fail
- No retry mechanism
- No user notification

**Improvements**:
```markdown
Priority: HIGH

1. Add error notifications
   - Show toast when transcription fails
   - Indicate service status in UI

2. Retry failed chunks
   - Retry up to 3 times
   - Exponential backoff

3. Fallback text
   - Show "[inaudible]" or "[transcription failed]"
   - Let users manually add text
```

### 8. Privacy & Security

**Current Concerns**:
- Audio sent to server unencrypted (local dev)
- Transcriptions stored indefinitely
- No consent UI

**Improvements**:
```markdown
Priority: HIGH (for production)

1. Encryption
   - Use HTTPS/WSS in production
   - End-to-end encryption option

2. Data Retention
   - Auto-delete transcriptions after N days
   - User preference for retention period

3. Consent & Notifications
   - Show "Recording" indicator
   - Require consent before transcribing
   - Allow users to opt-out
```

## Proposed Development Phases

### Phase 1 (Immediate - Bug Fixes)
- ✅ Fix repeated transcription display
- ✅ Add silence detection
- ⬜ Add error notifications
- ⬜ Fix empty transcription handling

### Phase 2 (Short-term - Core Features)
- ⬜ Integrate translation service
- ⬜ Auto-detect or use user's language
- ⬜ Improve transcription accuracy (model/chunk size)
- ⬜ Add speaking indicators

### Phase 3 (Medium-term - UX)
- ⬜ Add search/filter
- ⬜ Export functionality
- ⬜ Auto-scroll controls
- ⬜ Keyword highlighting

### Phase 4 (Long-term - Performance)
- ⬜ GPU acceleration
- ⬜ Batch processing
- ⬜ Caching layer
- ⬜ Audio quality improvements

### Phase 5 (Production - Security)
- ⬜ Encryption (HTTPS/WSS)
- ⬜ Privacy controls
- ⬜ Data retention policies
- ⬜ Consent management

## Quick Wins (Easy to Implement)

1. **Increase chunk duration**: Change one number, better accuracy
2. **Use user's preferred language**: Already in database
3. **Add transcription count**: Show "X transcriptions" in header
4. **Clear transcriptions button**: Let users manually clear
5. **Adjust silence threshold**: Fine-tune the RMS threshold

## Technical Debt

1. ScriptProcessorNode is deprecated
   - Should use AudioWorklet API
   - More complex but better performance

2. No unit tests for audio processing
   - Hard to test audio functionality
   - Need mock MediaStream

3. Hard-coded configuration
   - Move thresholds to env variables
   - Allow runtime configuration

## Performance Metrics to Track

- Transcription latency (time from speech to display)
- Accuracy rate (manual evaluation)
- False positive rate (transcriptions of silence)
- CPU/GPU usage
- Network bandwidth
- Error rate

## Conclusion

The live transcription feature is working but has room for improvement. Priority should be:

1. **Fix critical bugs** (Phase 1) - Done ✅
2. **Add translation integration** (Phase 2) - High impact
3. **Improve accuracy** (Phase 2) - User-facing quality
4. **UX enhancements** (Phase 3) - Better usability

The foundation is solid, and these improvements can be made incrementally.
