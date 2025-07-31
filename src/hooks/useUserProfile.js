import { useState, useEffect, useCallback } from 'react'
import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

// Hook for managing user profile data in Firestore
export const useUserProfile = () => {
  const { currentUser } = useAuth()
  
  const [profile, setProfile] = useState({
    displayName: '',
    age: '',
    experience: 'not_specified',
    bio: '',
    trainingGoals: '',
    otherActivities: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalProfile, setOriginalProfile] = useState(null)

  // Load profile data
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        console.log('📥 Loading user profile for:', currentUser.uid)
        const profileRef = doc(db, 'users', currentUser.uid, 'profile', 'data')
        const profileDoc = await getDoc(profileRef)
        
        if (profileDoc.exists()) {
          const data = profileDoc.data()
          console.log('✅ Profile loaded:', data)
          const loadedProfile = {
            displayName: data.displayName || '',
            age: data.age || '',
            experience: data.experience || 'not_specified',
            bio: data.bio || '',
            trainingGoals: data.trainingGoals || '',
            otherActivities: data.otherActivities || ''
          }
          setProfile(loadedProfile)
          setOriginalProfile(loadedProfile)
        } else {
          console.log('📄 No profile found, using defaults')
          setOriginalProfile(profile)
        }
        
        setError(null)
      } catch (error) {
        console.error('❌ Error loading profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [currentUser])

  // Update local profile state
  const updateProfile = useCallback((field, value) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value }
      // Check if there are changes
      const changed = JSON.stringify(updated) !== JSON.stringify(originalProfile)
      setHasChanges(changed)
      return updated
    })
  }, [originalProfile])

  // Save profile to Firestore
  const saveProfile = useCallback(async () => {
    if (!currentUser || !hasChanges) return

    setSaving(true)
    setError(null)

    try {
      console.log('💾 Saving profile for:', currentUser.uid)
      const profileRef = doc(db, 'users', currentUser.uid, 'profile', 'data')
      
      // Prepare data for Firestore
      const profileData = {
        displayName: profile.displayName || null,
        age: profile.age ? parseInt(profile.age) : null,
        experience: profile.experience,
        bio: profile.bio || null,
        trainingGoals: profile.trainingGoals || null,
        otherActivities: profile.otherActivities || null,
        updatedAt: serverTimestamp()
      }

      // Add createdAt if this is the first save
      if (!originalProfile || Object.keys(originalProfile).every(key => !originalProfile[key])) {
        profileData.createdAt = serverTimestamp()
      }

      await setDoc(profileRef, profileData, { merge: true })
      
      console.log('✅ Profile saved successfully')
      setOriginalProfile(profile)
      setHasChanges(false)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setError('Failed to save profile')
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }, [currentUser, profile, hasChanges, originalProfile])

  // Cancel changes
  const cancelChanges = useCallback(() => {
    if (originalProfile) {
      setProfile(originalProfile)
      setHasChanges(false)
      setError(null)
    }
  }, [originalProfile])

  // Validate profile data
  const validateProfile = useCallback(() => {
    const errors = []
    
    if (profile.displayName && profile.displayName.length > 50) {
      errors.push('Display name must be 50 characters or less')
    }
    
    if (profile.age) {
      const age = parseInt(profile.age)
      if (isNaN(age) || age < 13 || age > 120) {
        errors.push('Age must be between 13 and 120')
      }
    }
    
    if (profile.bio && profile.bio.length > 200) {
      errors.push('Bio must be 200 characters or less')
    }
    
    if (profile.trainingGoals && profile.trainingGoals.length > 300) {
      errors.push('Training goals must be 300 characters or less')
    }
    
    if (profile.otherActivities && profile.otherActivities.length > 200) {
      errors.push('Other activities must be 200 characters or less')
    }
    
    return errors
  }, [profile])

  return {
    profile,
    updateProfile,
    saveProfile,
    cancelChanges,
    validateProfile,
    loading,
    saving,
    error,
    hasChanges,
    clearError: () => setError(null)
  }
}