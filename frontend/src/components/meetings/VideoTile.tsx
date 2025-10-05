import { useEffect, useRef } from 'react'

interface VideoTileProps {
  stream?: MediaStream
  displayName: string
  isMuted?: boolean
  isVideoOff?: boolean
  isLocal?: boolean
}

export function VideoTile({
  stream,
  displayName,
  isMuted = false,
  isVideoOff = false,
  isLocal = false
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const firstLetter = displayName.charAt(0).toUpperCase()

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isLocal ? 'border-2 border-blue-500' : ''}`}>
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Local video is always muted to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className={`w-16 h-16 ${isLocal ? 'bg-blue-500' : 'bg-gray-500'} rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto`}>
              {firstLetter}
            </div>
            <p className="text-white text-sm">{displayName}</p>
          </div>
        </div>
      )}

      {/* Display name overlay */}
      <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
        {displayName} {isLocal && '(You)'}
      </div>

      {/* Status indicators */}
      {isVideoOff && (
        <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs">
          Video Off
        </div>
      )}
      {isMuted && (
        <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded text-xs">
          Muted
        </div>
      )}
    </div>
  )
}
