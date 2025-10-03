import { Meeting, CreateMeetingRequest, ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  private getHeaders(): HeadersInit {
    const authStorage = localStorage.getItem('auth-storage')
    let token = null

    console.log('📦 Auth storage raw:', authStorage?.substring(0, 100))

    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        token = state?.token
        console.log('🎫 Extracted token:', token ? token.substring(0, 50) + '...' : 'null')
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    } else {
      console.log('❌ No auth-storage found in localStorage')
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    console.log('📤 Sending headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ...' : undefined })

    return headers
  }

  async createMeeting(data: CreateMeetingRequest): Promise<ApiResponse<Meeting>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating meeting:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create meeting'
      }
    }
  }

  async getMeetings(): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meetings:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meetings'
      }
    }
  }

  async getMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meeting:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meeting'
      }
    }
  }

  async joinMeeting(meetingId: string): Promise<ApiResponse<{ meeting: Meeting }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          audioEnabled: true,
          videoEnabled: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error joining meeting:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join meeting'
      }
    }
  }
}

export const apiService = new ApiService()