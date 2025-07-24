"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    refreshToken().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email, // API expects username field
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setUser(data.user)
    setAccessToken(data.accessToken)
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear refresh token
      await fetch('/api/auth/refresh', {
        method: 'DELETE',
        credentials: "include",
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear in-memory state regardless of API call result
      setUser(null)
      setAccessToken(null)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAccessToken(data.accessToken)
      } else {
        // Clear state if refresh fails
        setUser(null)
        setAccessToken(null)
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      setUser(null)
      setAccessToken(null)
    }
  }

  // Auto-refresh token before it expires (every 10 minutes for 15-minute tokens)
  useEffect(() => {
    if (accessToken) {
      const interval = setInterval(() => {
        refreshToken()
      }, 10 * 60 * 1000) // 10 minutes

      return () => clearInterval(interval)
    }
  }, [accessToken])

  const value: AuthContextType = {
    user,
    accessToken,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility function to get auth headers for API requests
export function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
} 