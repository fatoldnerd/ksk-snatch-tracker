import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

// Keys used in localStorage that need to be migrated
const STORAGE_KEYS = {
  showLandingPage: 'ksk-show-landing',
  selectedProgram: 'ksk-selected-program',
  maxReps: 'ksk-max-reps',
  currentPhase: 'ksk-current-phase',
  currentWeek: 'ksk-current-week',
  currentDay: 'ksk-current-day',
  activeTab: 'ksk-active-tab',
  workoutHistory: 'ksk-workout-history',
  targetSnatches: 'ksk-target-snatches'
}

export const migrateLocalStorageToFirestore = async (userId) => {
  if (!userId) {
    console.error('No user ID provided for migration')
    return
  }

  try {
    // Check if migration has already been performed
    const migrationKey = 'ksk-migrated-to-firestore'
    const alreadyMigrated = localStorage.getItem(migrationKey)
    
    if (alreadyMigrated) {
      console.log('Data already migrated, skipping migration')
      return
    }

    console.log('Starting localStorage to Firestore migration...')
    
    // Collect all localStorage data
    const localData = {}
    let hasData = false
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const value = localStorage.getItem(storageKey)
      if (value !== null) {
        try {
          localData[key] = JSON.parse(value)
          hasData = true
        } catch (error) {
          console.warn(`Failed to parse localStorage key ${storageKey}:`, error)
        }
      }
    })

    if (!hasData) {
      console.log('No localStorage data found to migrate')
      // Mark as migrated to prevent future attempts
      localStorage.setItem(migrationKey, 'true')
      return
    }

    // Migrate settings (excluding workout history)
    const { workoutHistory, showLandingPage, ...settings } = localData
    
    if (Object.keys(settings).length > 0) {
      const settingsRef = doc(db, 'users', userId, 'settings', 'app')
      await setDoc(settingsRef, settings, { merge: true })
      console.log('Settings migrated successfully')
    }

    // Migrate workout history
    if (workoutHistory && Array.isArray(workoutHistory) && workoutHistory.length > 0) {
      const workoutsRef = collection(db, 'users', userId, 'workouts')
      
      for (const workout of workoutHistory) {
        try {
          await addDoc(workoutsRef, {
            ...workout,
            date: workout.date ? new Date(workout.date) : new Date(),
            userId: userId,
            migratedFromLocalStorage: true
          })
        } catch (error) {
          console.error('Failed to migrate workout:', error)
        }
      }
      console.log(`Migrated ${workoutHistory.length} workouts successfully`)
    }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true')
    console.log('Migration completed successfully')

    // Optionally clear old localStorage data (uncomment if desired)
    // clearLocalStorageData()

    return true
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Function to clear localStorage data after successful migration
export const clearLocalStorageData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  console.log('localStorage data cleared')
}

// Function to check if user has data to migrate
export const hasLocalStorageData = () => {
  return Object.values(STORAGE_KEYS).some(key => {
    return localStorage.getItem(key) !== null
  })
}

// Function to get a preview of what will be migrated
export const getLocalStoragePreview = () => {
  const preview = {}
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey)
    if (value !== null) {
      try {
        preview[key] = JSON.parse(value)
      } catch (error) {
        preview[key] = value
      }
    }
  })
  return preview
}