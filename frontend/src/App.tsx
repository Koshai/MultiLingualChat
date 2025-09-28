import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'

// Components
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/components/auth/LoginPage'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { RoomList } from '@/components/rooms/RoomList'
import { HomePage } from '@/components/home/HomePage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const { initializeSocket, cleanup } = useChatStore()

  useEffect(() => {
    // Check authentication status on app start
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Initialize socket connection when authenticated
    if (isAuthenticated) {
      initializeSocket()
    } else {
      cleanup()
    }

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [isAuthenticated, initializeSocket, cleanup])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/room/:roomId" element={<ChatRoom />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

export default App