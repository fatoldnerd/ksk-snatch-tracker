import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      console.log('🔐 Starting signup process for:', email)
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('✅ Signup successful:', result.user)
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName })
        console.log('✅ Display name updated:', displayName)
      }
      
      return result
    } catch (error) {
      console.error('❌ Signup error:', error)
      setError(error.message)
      throw error
    }
  }

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      console.log('🔐 Starting login process for:', email)
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful:', result.user)
      return result
    } catch (error) {
      console.error('❌ Login error:', error)
      setError(error.message)
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google sign-in process')
      setError(null)
      const result = await signInWithPopup(auth, googleProvider)
      console.log('✅ Google sign-in successful:', result.user)
      return result
    } catch (error) {
      console.error('❌ Google sign-in error:', error)
      setError(error.message)
      throw error
    }
  }

  // Sign out
  const logout = async () => {
    try {
      setError(null)
      return await signOut(auth)
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    console.log('🔐 Setting up auth state listener')
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user')
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    signInWithGoogle,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}