import { Socket } from 'socket.io-client'

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
}

export interface PeerConnection {
  userId: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

export class WebRTCService {
  private socket: Socket
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private config: WebRTCConfig
  private onRemoteStreamCallback?: (userId: string, stream: MediaStream) => void
  private onPeerDisconnectedCallback?: (userId: string) => void

  constructor(socket: Socket, config?: WebRTCConfig) {
    this.socket = socket
    this.config = config || {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }

    this.setupSocketHandlers()
  }

  private setupSocketHandlers(): void {
    // Handle incoming WebRTC offer
    this.socket.on('webrtc:offer', async ({ userId, offer }) => {
      console.log('📥 Received offer from:', userId)
      await this.handleOffer(userId, offer)
    })

    // Handle incoming WebRTC answer
    this.socket.on('webrtc:answer', async ({ userId, answer }) => {
      console.log('📥 Received answer from:', userId)
      await this.handleAnswer(userId, answer)
    })

    // Handle incoming ICE candidate
    this.socket.on('webrtc:ice-candidate', async ({ userId, candidate }) => {
      console.log('📥 Received ICE candidate from:', userId)
      await this.handleIceCandidate(userId, candidate)
    })

    // Handle peer disconnection
    this.socket.on('participant_left', ({ userId }) => {
      console.log('👋 Participant left:', userId)
      this.removePeerConnection(userId)
    })
  }

  /**
   * Initialize local media stream (camera + microphone)
   */
  async initializeLocalStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      )

      console.log('✅ Local stream initialized:', this.localStream.getTracks())
      return this.localStream
    } catch (error) {
      console.error('❌ Failed to get local stream:', error)
      throw new Error('Failed to access camera/microphone. Please grant permissions.')
    }
  }

  /**
   * Get screen sharing stream
   */
  async getScreenShareStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      console.log('🖥️ Screen share stream initialized')
      return stream
    } catch (error) {
      console.error('❌ Failed to get screen share:', error)
      throw new Error('Failed to start screen sharing')
    }
  }

  /**
   * Create peer connection for a specific user
   */
  private createPeerConnection(userId: string): RTCPeerConnection {
    console.log(`🆕 Creating peer connection for user: ${userId}`)
    const peerConnection = new RTCPeerConnection(this.config)

    // Add local stream tracks to peer connection
    if (this.localStream) {
      const tracks = this.localStream.getTracks()
      console.log(`➕ Adding ${tracks.length} local tracks:`, tracks.map(t => `${t.kind}:enabled=${t.enabled}`))
      tracks.forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
        console.log(`  ✅ Added ${track.kind} track: ${track.id}`)
      })
    } else {
      console.error('❌ No local stream when creating peer connection!')
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', userId, `type:${event.candidate.type}`)
        this.socket.emit('webrtc:ice-candidate', {
          targetUserId: userId,
          candidate: event.candidate
        })
      } else {
        console.log('🧊 ICE gathering complete for:', userId)
      }
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote track from:', userId, {
        kind: event.track.kind,
        enabled: event.track.enabled,
        readyState: event.track.readyState,
        streams: event.streams.length
      })
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0]
        console.log(`  📹 Stream has ${stream.getTracks().length} tracks:`,
          stream.getTracks().map(t => `${t.kind}:${t.readyState}`))
        this.onRemoteStreamCallback?.(userId, stream)
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      console.log(`🔗 Connection state with ${userId}:`, state)

      if (state === 'connected') {
        console.log(`✅ Successfully connected to ${userId}`)
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.warn(`⚠️ Connection ${state} with ${userId}`)
        this.onPeerDisconnectedCallback?.(userId)
      }
    }

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE state with ${userId}:`, peerConnection.iceConnectionState)
    }

    this.peerConnections.set(userId, peerConnection)
    console.log(`✅ Peer connection stored for ${userId}`)
    return peerConnection
  }

  /**
   * Create and send offer to peer
   */
  async createOffer(userId: string): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(userId)
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      console.log('📤 Sending offer to:', userId)
      this.socket.emit('webrtc:offer', {
        targetUserId: userId,
        offer: offer
      })
    } catch (error) {
      console.error('❌ Failed to create offer:', error)
      throw error
    }
  }

  /**
   * Handle incoming offer from peer
   */
  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(userId)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      console.log('📤 Sending answer to:', userId)
      this.socket.emit('webrtc:answer', {
        targetUserId: userId,
        answer: answer
      })
    } catch (error) {
      console.error('❌ Failed to handle offer:', error)
      throw error
    }
  }

  /**
   * Handle incoming answer from peer
   */
  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId)
      if (!peerConnection) {
        console.error('No peer connection found for:', userId)
        return
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('✅ Answer processed for:', userId)
    } catch (error) {
      console.error('❌ Failed to handle answer:', error)
      throw error
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId)
      if (!peerConnection) {
        console.error('No peer connection found for:', userId)
        return
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('✅ ICE candidate added for:', userId)
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error)
    }
  }

  /**
   * Remove peer connection
   */
  private removePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(userId)
      console.log('🗑️ Removed peer connection for:', userId)
      this.onPeerDisconnectedCallback?.(userId)
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled
      })
      console.log('🎤 Audio:', enabled ? 'enabled' : 'disabled')
    }
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled
      })
      console.log('📹 Video:', enabled ? 'enabled' : 'disabled')
    }
  }

  /**
   * Replace video track with screen share
   */
  async replaceVideoTrack(stream: MediaStream): Promise<void> {
    const videoTrack = stream.getVideoTracks()[0]

    if (!videoTrack) {
      throw new Error('No video track found in stream')
    }

    // Replace track in all peer connections
    for (const [userId, peerConnection] of this.peerConnections.entries()) {
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
      if (sender) {
        await sender.replaceTrack(videoTrack)
        console.log('🔄 Replaced video track for:', userId)
      }
    }
  }

  /**
   * Set callback for remote streams
   */
  onRemoteStream(callback: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback
  }

  /**
   * Set callback for peer disconnection
   */
  onPeerDisconnected(callback: (userId: string) => void): void {
    this.onPeerDisconnectedCallback = callback
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get all peer connections
   */
  getPeerConnections(): Map<string, RTCPeerConnection> {
    return this.peerConnections
  }

  /**
   * Cleanup all connections and streams
   */
  cleanup(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close all peer connections
    this.peerConnections.forEach((connection, userId) => {
      connection.close()
      console.log('🗑️ Closed connection for:', userId)
    })
    this.peerConnections.clear()

    console.log('🧹 WebRTC cleanup completed')
  }
}
