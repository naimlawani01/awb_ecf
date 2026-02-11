import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  
  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
      }
      
      setIsLoading(false)
    }
    
    loadUser()
  }, [])
  
  const login = useCallback(async (username, password) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(username, password)
      
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      
      navigate('/dashboard')
      
      return response
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [navigate])
  
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }, [navigate])
  
  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])
  
  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff' || user?.role === 'admin'
  
  const value = {
    user,
    isLoading,
    isAdmin,
    isStaff,
    login,
    logout,
    updateUser,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

