# Phase 3: TTS, Recording & Polish

**Branch:** `fix/translation-video-chat-issues`
**Timeline:** 3-4 weeks
**Goal:** Continue hardening the meetings-only platform with TTS quality, recording capabilities, and production-ready polish

**Status Note:** The codebase has already completed a meetings-only simplification pass. This document now acts as a forward-looking enhancement backlog.

## Baseline Runtime Reference

- Frontend: `5173`
- Meeting service: `3001`
- Translation service: `3003`
- STT service: `3004`
- TTS service: `3005`
- Windows startup: `START-HERE.bat`
- Bash startup: `source scripts/claude-helpers.sh && cc-start`

---

## 🎯 Phase 3 Objectives

### Core Features
1. **Text-to-Speech (TTS)** - Translate audio in real-time (hear English when someone speaks Bengali)
2. **Meeting Recording** - Record meetings with multilingual captions
3. **Screen Sharing Polish** - Refine and test screen sharing functionality
4. **Performance & Stability** - Load testing and optimization
5. **Mobile Responsive** - Ensure UI works on tablets and phones

---

## 📋 Detailed Task Breakdown

### **Milestone 1: Text-to-Speech (TTS) Implementation** (Week 1)

#### 1.1 TTS Service Setup
- [ ] Research TTS providers (Azure TTS, Google TTS, ElevenLabs, Piper)
- [ ] Choose provider: Azure Cognitive Services TTS (matches existing Azure Speech STT)
- [ ] Create TTS service structure (`backend/services/tts-service/`)
- [ ] Implement multi-provider architecture (Azure primary, Piper fallback)
- [ ] Add TTS API endpoints (`/api/v1/synthesize`)
- [ ] Configure environment variables for Azure TTS

**Files to create:**
```
backend/services/tts-service/
├── main.py
├── requirements.txt
├── app/
│   ├── api/routes/synthesis.py
│   ├── providers/
│   │   ├── azure_tts.py
│   │   ├── piper.py
│   │   └── base.py
│   └── services/tts_service.py
```

#### 1.2 TTS Integration with Translation Pipeline
- [ ] Update socket handler to request TTS after translation
- [ ] Implement audio stream caching to avoid re-synthesizing
- [ ] Add TTS quality settings (voice selection, speed, pitch)
- [ ] Handle multiple simultaneous TTS requests efficiently

#### 1.3 Frontend Audio Playback
- [ ] Create audio player component for translated speech
- [ ] Implement audio mixing (original + translated audio options)
- [ ] Add user preference: "Hear original" vs "Hear translated"
- [ ] UI controls for TTS volume and playback
- [ ] Handle audio synchronization with video

**Acceptance Criteria:**
- User speaks Bengali → Others hear English audio (if preferred)
- Less than 2-3 second latency for TTS
- Clear audio quality (no robotic/distorted sound)
- User can toggle between original and translated audio

---

### **Milestone 2: Meeting Recording** (Week 2)

#### 2.1 Recording Service Architecture
- [ ] Design recording service structure
- [ ] Choose recording approach: Server-side (MediaRecorder API + FFmpeg)
- [ ] Create recording service (`backend/services/recording-service/`)
- [ ] Implement video/audio stream capture
- [ ] Add storage integration (local filesystem initially, S3 later)

**Files to create:**
```
backend/services/recording-service/
├── main.py
├── requirements.txt
├── app/
│   ├── api/routes/recording.py
│   ├── services/
│   │   ├── recorder.py
│   │   ├── video_processor.py
│   │   └── caption_overlay.py
│   └── storage/
│       ├── local.py
│       └── s3.py (future)
```

#### 2.2 Recording Features
- [ ] Start/stop recording controls (host only)
- [ ] Record video grid + audio tracks
- [ ] Embed multilingual captions into video (burn-in subtitles)
- [ ] Generate transcript file (SRT/VTT format)
- [ ] Compress and optimize recorded files

#### 2.3 Recording Playback & Management
- [ ] Create recording library UI
- [ ] List all meeting recordings with metadata
- [ ] Video player with caption selection
- [ ] Download recording + transcript
- [ ] Delete recording (host/admin only)

**Acceptance Criteria:**
- Host can start/stop recording during meeting
- Recorded video includes all participants in grid layout
- Captions overlay shows translations in real-time
- Recordings are accessible after meeting ends
- Downloadable in MP4 format with embedded captions

---

### **Milestone 3: Screen Sharing Polish & Testing** (Week 2-3)

#### 3.1 Screen Sharing Audit
- [ ] Test current screen sharing implementation
- [ ] Verify screen share starts/stops correctly
- [ ] Check video track replacement logic
- [ ] Test multiple users sharing simultaneously
- [ ] Verify screen share indicator visibility

#### 3.2 Screen Sharing Improvements
- [ ] Add "presenter mode" - full screen for shared content
- [ ] Implement screen share permissions (host approval?)
- [ ] Add annotation tools (optional - can be Phase 4)
- [ ] Improve screen share quality settings
- [ ] Handle screen share when user leaves meeting

#### 3.3 Screen Sharing UI/UX
- [ ] Visual indicator showing who is sharing
- [ ] "Stop viewing" option for participants
- [ ] Minimize own video when viewing screen share
- [ ] Keyboard shortcuts for screen share
- [ ] Toast notifications for screen share events

**Acceptance Criteria:**
- User can share screen reliably
- Screen share displays in high quality (readable text)
- Other participants see screen share immediately
- Screen share stops cleanly without errors
- UI clearly indicates screen sharing status

---

### **Milestone 4: Mobile Responsive Design** (Week 3)

#### 4.1 Mobile UI Audit
- [ ] Test current UI on mobile devices (Chrome DevTools)
- [ ] Identify broken layouts and interactions
- [ ] Test touch interactions (buttons, controls)
- [ ] Check video grid responsiveness

#### 4.2 Mobile Optimizations
- [ ] Implement responsive video grid (1 video on mobile, 2-4 on tablet)
- [ ] Touch-friendly controls (larger buttons)
- [ ] Swipe gestures for side panels
- [ ] Mobile-optimized transcription panel
- [ ] Handle device rotation (portrait/landscape)

#### 4.3 Mobile-Specific Features
- [ ] Add mobile WebRTC optimizations (lower bandwidth)
- [ ] Implement "speaker view" mode for mobile
- [ ] Add mobile-friendly language selector
- [ ] Test on actual devices (iOS Safari, Android Chrome)

**Acceptance Criteria:**
- App works smoothly on tablets (iPad, Android tablets)
- Basic functionality on phones (iPhone, Android)
- Video grid adapts to screen size
- Controls are touch-friendly (min 44x44px tap targets)
- Text is readable on small screens

---

### **Milestone 5: Performance & Production Polish** (Week 4)

#### 5.1 Performance Testing
- [ ] Load test with 10+ participants in one meeting
- [ ] Measure STT/Translation/TTS latency
- [ ] Profile frontend bundle size
- [ ] Identify and fix memory leaks
- [ ] Optimize WebRTC peer connection handling

#### 5.2 Error Handling & Resilience
- [ ] Add retry logic for failed API calls
- [ ] Implement graceful degradation (TTS fails → show captions only)
- [ ] Handle network disconnections gracefully
- [ ] Add error boundaries in React components
- [ ] Improve error messages for users

#### 5.3 Logging & Monitoring
- [ ] Implement structured logging across all services
- [ ] Add performance metrics (Prometheus/Grafana)
- [ ] Set up health check endpoints for all services
- [ ] Create monitoring dashboard
- [ ] Add alerting for service failures

#### 5.4 Security & Compliance
- [ ] Implement meeting passwords/access codes
- [ ] Add waiting room feature (host admits participants)
- [ ] Encrypt recordings at rest
- [ ] Add rate limiting to all API endpoints
- [ ] Security audit of WebRTC implementation

#### 5.5 Documentation
- [ ] Update README with Phase 3 features
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Write deployment guide
- [ ] Create user guide with screenshots
- [ ] Document TTS/Recording configuration

**Acceptance Criteria:**
- System handles 10+ concurrent participants smoothly
- All services have <1% error rate under normal load
- Comprehensive logging for debugging
- Security best practices implemented
- Complete documentation for users and developers

---

## 🛠️ Technical Stack Additions

### New Dependencies

**TTS Service:**
- `azure-cognitiveservices-speech` - Azure TTS SDK
- `piper-tts` - Local TTS fallback (optional)
- `pydub` - Audio processing

**Recording Service:**
- `ffmpeg-python` - Video/audio processing
- `opencv-python` - Video frame manipulation
- `boto3` - AWS S3 integration (future)

**Frontend:**
- `react-device-detect` - Mobile detection
- `@radix-ui/react-dialog` - Modal improvements
- Web Audio API - Audio mixing/playback

---

## 📊 Success Metrics

### Performance Targets
- **STT Latency:** < 1.5 seconds (current ✅)
- **Translation Latency:** < 500ms (current ✅)
- **TTS Latency:** < 2 seconds (new target)
- **End-to-end Latency:** < 3.5 seconds (speech → translated audio)
- **Meeting Capacity:** 20+ participants per meeting
- **Recording Quality:** 1080p video, 192kbps audio

### User Experience Targets
- **Mobile usability score:** 80+ (Lighthouse)
- **Desktop usability score:** 95+ (Lighthouse)
- **Error rate:** < 0.5%
- **User satisfaction:** 4.5/5 stars

---

## 🔄 Testing Strategy

### Unit Tests
- TTS service provider tests
- Recording service tests
- Audio processing pipeline tests

### Integration Tests
- Full STT → Translation → TTS pipeline
- Recording with live captions
- Screen sharing workflow
- Multi-participant scenarios

### E2E Tests
- Complete meeting flow (join → speak → record → leave)
- Mobile device testing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### Load Tests
- 50+ concurrent meetings
- 20+ participants per meeting
- Extended meeting duration (1+ hours)
- Recording storage stress test

---

## 🚀 Deployment Checklist

Before merging to production:

- [ ] All tests passing (unit + integration + E2E)
- [ ] Load tested with realistic scenarios
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Feature flags configured
- [ ] Monitoring and alerting set up
- [ ] Rollback plan documented
- [ ] Staging environment testing completed

---

## 📝 Notes

### Optional Features (Can defer to Phase 4)
- Background blur/replacement
- Virtual backgrounds
- Advanced sub-meeting controls
- Polls and reactions
- Meeting analytics

### Known Limitations
- TTS voices may not perfectly match speaker emotion/tone
- Recording storage will need cloud solution for production (S3/GCS)
- Mobile experience best on tablets, phones are secondary
- Max recommended participants: 20 (WebRTC mesh limitation)

---

## 👥 Resources Needed

### Development
- Azure Cognitive Services account (TTS quota)
- FFmpeg installed on server
- Storage solution for recordings (500GB+ recommended)
- Mobile test devices (iOS + Android)

### Testing
- Load testing tools (k6, Artillery)
- Mobile device lab or BrowserStack
- Beta testers for user feedback

---

**Let's build an amazing multilingual video conferencing platform! 🚀**
