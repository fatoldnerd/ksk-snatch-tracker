import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

// Hook for managing user settings in Firestore
export const useUserSettings = (initialSettings = {}) => {
  const { currentUser } = useAuth()
  
  // Memoize initial settings to prevent unnecessary re-renders
  const memoizedInitialSettings = useMemo(() => initialSettings, [JSON.stringify(initialSettings)])
  
  const [settings, setSettings] = useState(memoizedInitialSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setSettings(memoizedInitialSettings)
      setLoading(false)
      return
    }

    const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'app')
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⏱️ useFirestore: Loading timeout - using initial values')
        setSettings(memoizedInitialSettings)
        setLoading(false)
        setError('Loading timeout - using default values')
      }
    }, 5000) // 5 second timeout
    
    const unsubscribe = onSnapshot(settingsRef, 
      (doc) => {
        clearTimeout(loadingTimeout)
        if (doc.exists()) {
          const data = doc.data()
          console.log('📥 useFirestore: Settings loaded from Firestore:', data)
          setSettings({ ...memoizedInitialSettings, ...data })
        } else {
          console.log('📥 useFirestore: No settings found, using initial values')
          setSettings(memoizedInitialSettings)
        }
        setLoading(false)
        setError(null)
      },
      (error) => {
        clearTimeout(loadingTimeout)
        console.error('❌ useFirestore: Error fetching settings:', error)
        setError(error.message)
        setSettings(memoizedInitialSettings) // Use default values on error
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [currentUser, memoizedInitialSettings])

  const updateSettings = useCallback(async (newSettings) => {
    if (!currentUser) {
      console.log('⚠️ useFirestore: No user, skipping settings update')
      return
    }

    try {
      console.log('💾 useFirestore: Updating settings:', newSettings)
      const settingsRef = doc(db, 'users', currentUser.uid, 'settings', 'app')
      await setDoc(settingsRef, newSettings, { merge: true })
      console.log('✅ useFirestore: Settings updated successfully')
      setError(null)
    } catch (error) {
      console.error('❌ useFirestore: Error updating settings:', error)
      setError(error.message)
      throw error
    }
  }, [currentUser])

  return { settings, updateSettings, loading, error }
}

// Hook for managing workout history in Firestore
export const useWorkoutHistory = () => {
  const { currentUser } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setWorkouts([])
      setLoading(false)
      return
    }

    const workoutsRef = collection(db, 'users', currentUser.uid, 'workouts')
    const q = query(workoutsRef, orderBy('date', 'desc'))
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const workoutData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setWorkouts(workoutData)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching workouts:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  const addWorkout = async (workoutData) => {
    if (!currentUser) return

    try {
      const workoutsRef = collection(db, 'users', currentUser.uid, 'workouts')
      const docRef = await addDoc(workoutsRef, {
        ...workoutData,
        date: new Date(),
        userId: currentUser.uid
      })
      setError(null)
      return docRef.id
    } catch (error) {
      console.error('Error adding workout:', error)
      setError(error.message)
      throw error
    }
  }

  const deleteWorkout = async (workoutId) => {
    if (!currentUser) return

    try {
      const workoutRef = doc(db, 'users', currentUser.uid, 'workouts', workoutId)
      await deleteDoc(workoutRef)
      setError(null)
    } catch (error) {
      console.error('Error deleting workout:', error)
      setError(error.message)
      throw error
    }
  }

  return { workouts, addWorkout, deleteWorkout, loading, error }
}

// Hook for a single setting value (similar to useLocalStorage)
export const useFirestoreSetting = (key, initialValue) => {
  const initialSettings = useMemo(() => ({ [key]: initialValue }), [key, initialValue])
  const { settings, updateSettings, loading } = useUserSettings(initialSettings)
  
  const setValue = useCallback(async (value) => {
    const currentValue = settings[key] !== undefined ? settings[key] : initialValue
    const newValue = value instanceof Function ? value(currentValue) : value
    
    console.log(`🔄 useFirestoreSetting: Updating ${key} to:`, newValue)
    
    try {
      // Just update the single key-value pair, not the entire settings object
      await updateSettings({ [key]: newValue })
    } catch (error) {
      console.error(`❌ useFirestoreSetting: Failed to update ${key}:`, error)
      throw error
    }
  }, [key, settings, initialValue, updateSettings])

  const currentValue = settings[key] !== undefined ? settings[key] : initialValue
  return [currentValue, setValue, loading]
}