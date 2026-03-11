import { TTSAudioEvent } from '@/types'

/**
 * TTS Audio Player Service
 *
 * Manages playback of synthesized speech audio from the TTS service.
 * Handles base64-encoded audio, volume control, and audio queueing.
 */

export class TTSPlayer {
  private audioQueue: HTMLAudioElement[] = []
  private isPlaying: boolean = false
  private volume: number = 0.8 // 0.0 - 1.0
  private enabled: boolean = false
  private onPlayingCallback?: (isPlaying: boolean) => void

  constructor() {
    console.log('TTSPlayer initialized')
  }

  /**
   * Enable or disable TTS playback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    console.log('TTS playback enabled:', enabled)

    // Stop current playback if disabling
    if (!enabled) {
      this.stop()
    }
  }

  /**
   * Set playback volume (0-100)
   */
  setVolume(volume: number): void {
    // Convert 0-100 to 0.0-1.0
    this.volume = Math.max(0, Math.min(100, volume)) / 100
    console.log('TTS volume set to:', this.volume)

    // Update volume of currently playing audio
    this.audioQueue.forEach(audio => {
      audio.volume = this.volume
    })
  }

  /**
   * Play TTS audio from event data
   */
  async play(event: TTSAudioEvent): Promise<void> {
    if (!this.enabled) {
      console.log('TTS playback disabled, skipping audio')
      return
    }

    console.log('Playing TTS audio:', {
      transcriptionId: event.transcriptionId,
      format: event.format,
      duration: event.duration,
      provider: event.provider
    })

    try {
      // Create audio element
      const audio = new Audio()
      audio.volume = this.volume

      // Convert base64 to blob URL
      const mimeType = event.format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
      const audioBlob = this.base64ToBlob(event.audioData, mimeType)
      const audioUrl = URL.createObjectURL(audioBlob)

      audio.src = audioUrl

      // Set up event handlers
      audio.onplay = () => {
        this.isPlaying = true
        this.onPlayingCallback?.(true)
        console.log('TTS audio started playing')
      }

      audio.onended = () => {
        this.isPlaying = false
        this.onPlayingCallback?.(false)
        URL.revokeObjectURL(audioUrl) // Clean up blob URL
        this.removeFromQueue(audio)
        console.log('TTS audio finished playing')

        // Play next in queue if any
        this.playNext()
      }

      audio.onerror = (error) => {
        console.error('TTS audio playback error:', error)
        URL.revokeObjectURL(audioUrl)
        this.removeFromQueue(audio)
        this.isPlaying = false
        this.onPlayingCallback?.(false)

        // Try next in queue
        this.playNext()
      }

      // Add to queue
      this.audioQueue.push(audio)

      // Start playing if nothing else is playing
      if (!this.isPlaying) {
        await audio.play()
      }

    } catch (error) {
      console.error('Failed to play TTS audio:', error)
      this.isPlaying = false
      this.onPlayingCallback?.(false)
    }
  }

  /**
   * Stop all TTS audio playback
   */
  stop(): void {
    this.audioQueue.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
      URL.revokeObjectURL(audio.src)
    })
    this.audioQueue = []
    this.isPlaying = false
    this.onPlayingCallback?.(false)
    console.log('TTS playback stopped')
  }

  /**
   * Play next audio in queue
   */
  private async playNext(): Promise<void> {
    if (this.audioQueue.length > 0) {
      const nextAudio = this.audioQueue[0]
      try {
        await nextAudio.play()
      } catch (error) {
        console.error('Failed to play next TTS audio:', error)
        this.removeFromQueue(nextAudio)
        this.playNext() // Try next one
      }
    }
  }

  /**
   * Remove audio from queue
   */
  private removeFromQueue(audio: HTMLAudioElement): void {
    const index = this.audioQueue.indexOf(audio)
    if (index !== -1) {
      this.audioQueue.splice(index, 1)
    }
  }

  /**
   * Convert base64 string to Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:[^;]+;base64,/, '')

    // Decode base64
    const byteCharacters = atob(base64Data)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  /**
   * Set callback for playing state changes
   */
  onPlayingStateChange(callback: (isPlaying: boolean) => void): void {
    this.onPlayingCallback = callback
  }

  /**
   * Get current playing state
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.audioQueue.length
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stop()
    this.onPlayingCallback = undefined
    console.log('TTSPlayer cleaned up')
  }
}
