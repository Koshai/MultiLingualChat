import { Socket } from 'socket.io-client'

export interface AudioRecorderConfig {
  sampleRate?: number
  channelCount?: number
  chunkDurationMs?: number
  language?: string | null // null = auto-detect
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null
  private scriptProcessor: ScriptProcessorNode | null = null
  private socket: Socket
  private meetingId: string
  private language: string | null
  private isRecording: boolean = false
  private config: Required<Omit<AudioRecorderConfig, 'language'>>
  private audioChunks: Float32Array[] = []
  private chunkTimer: NodeJS.Timeout | null = null

  constructor(socket: Socket, meetingId: string, config?: AudioRecorderConfig) {
    this.socket = socket
    this.meetingId = meetingId
    this.language = config?.language || null
    this.config = {
      sampleRate: config?.sampleRate || 16000,
      channelCount: config?.channelCount || 1,
      chunkDurationMs: config?.chunkDurationMs || 5000 // 5 seconds for better accuracy
    }
  }

  /**
   * Update transcription language (null = auto-detect)
   */
  setLanguage(language: string | null): void {
    this.language = language
  }

  /**
   * Start recording audio from the provided media stream
   */
  async start(stream: MediaStream): Promise<void> {
    if (this.isRecording) {
      console.warn('Audio recording already in progress')
      return
    }

    try {
      // Create audio context with desired sample rate
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate
      })

      // Create source from stream
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream)

      // Create script processor for audio capture (4096 buffer size)
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)

      // Process audio chunks
      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording) return

        const inputData = event.inputBuffer.getChannelData(0)
        const chunk = new Float32Array(inputData)
        this.audioChunks.push(chunk)
      }

      // Connect nodes
      this.mediaStreamSource.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)

      this.isRecording = true

      // Set up periodic chunk sending
      this.chunkTimer = setInterval(() => {
        this.sendAccumulatedChunks()
      }, this.config.chunkDurationMs)

      console.log('Audio recording started with WAV conversion', {
        sampleRate: this.config.sampleRate,
        chunkDuration: this.config.chunkDurationMs
      })

    } catch (error) {
      console.error('Failed to start audio recording:', error)
      throw error
    }
  }

  /**
   * Stop recording audio
   */
  stop(): void {
    if (!this.isRecording) {
      return
    }

    // Send any remaining chunks
    if (this.audioChunks.length > 0) {
      this.sendAccumulatedChunks()
    }

    // Clear timer
    if (this.chunkTimer) {
      clearInterval(this.chunkTimer)
      this.chunkTimer = null
    }

    // Disconnect nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor = null
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect()
      this.mediaStreamSource = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.isRecording = false
    console.log('Audio recording stopped')
  }

  /**
   * Send accumulated audio chunks as WAV
   */
  private async sendAccumulatedChunks(): Promise<void> {
    if (this.audioChunks.length === 0) return

    try {
      // Combine all chunks
      const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combinedAudio = new Float32Array(totalLength)

      let offset = 0
      for (const chunk of this.audioChunks) {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      }

      // Check if audio contains actual speech (not just silence)
      const hasAudio = this.detectAudio(combinedAudio)
      if (!hasAudio) {
        console.log('Skipping silent audio chunk')
        this.audioChunks = []
        return
      }

      // Convert to WAV
      const wavBlob = this.encodeWAV(combinedAudio, this.config.sampleRate)

      // Convert to base64
      const base64Audio = await this.blobToBase64(wavBlob)

      // Send to backend
      this.socket.emit('audio_chunk', {
        meetingId: this.meetingId,
        audioData: base64Audio,
        timestamp: Date.now(),
        format: 'wav',
        language: this.language // null = auto-detect
      })

      console.log('Audio chunk sent', {
        size: wavBlob.size,
        samples: combinedAudio.length,
        meetingId: this.meetingId
      })

      // Clear chunks
      this.audioChunks = []

    } catch (error) {
      console.error('Failed to send audio chunk:', error)
    }
  }

  /**
   * Detect if audio contains actual speech (not silence)
   */
  private detectAudio(samples: Float32Array): boolean {
    // Calculate RMS (Root Mean Square) to detect audio level
    let sum = 0
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i]
    }
    const rms = Math.sqrt(sum / samples.length)

    // Threshold for speech detection (adjust as needed)
    const threshold = 0.01

    return rms > threshold
  }

  /**
   * Encode Float32Array audio data as WAV file
   */
  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(36, 'data')
    view.setUint32(40, samples.length * 2, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      offset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  /**
   * Convert blob to base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Remove data URL prefix (data:audio/wav;base64,)
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Check if recording is active
   */
  isActive(): boolean {
    return this.isRecording
  }
}
