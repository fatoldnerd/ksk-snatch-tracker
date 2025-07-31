import { useState, useEffect, useCallback, useMemo } from 'react'
import LandingPage from './components/LandingPage'
import ProgramSelector from './components/ProgramSelector'
import WorkoutDisplay from './components/WorkoutDisplay'
import WorkoutLogger from './components/WorkoutLogger'
import ProgressDashboard from './components/ProgressDashboard'
import UserProfile from './components/UserProfile'
import AuthModal from './components/auth/AuthModal'
import { getTotalRepsForWorkout, calculateKSK3Reps, KSK_PROGRAMS } from './data/kskPrograms'
import { useAuth } from './contexts/AuthContext'
import { useFirestoreSetting, useWorkoutHistory } from './hooks/useFirestore'
import { migrateLocalStorageToFirestore, hasLocalStorageData } from './utils/dataMigration'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  const { currentUser, logout } = useAuth()
  
  // Authentication state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Landing page state (still use localStorage for this)
  const [showLandingPage, setShowLandingPage] = useLocalStorage('ksk-show-landing', true)
  
  // Always use both hooks, but only one will be active based on auth state
  const [selectedProgramFirestore, setSelectedProgramFirestore, loadingSelectedProgram] = useFirestoreSetting('selectedProgram', '')
  const [selectedProgramLocal, setSelectedProgramLocal] = useLocalStorage('ksk-selected-program', '')
  const [maxRepsFirestore, setMaxRepsFirestore, loadingMaxReps] = useFirestoreSetting('maxReps', 0)
  const [maxRepsLocal, setMaxRepsLocal] = useLocalStorage('ksk-max-reps', 0)
  const [currentPhaseFirestore, setCurrentPhaseFirestore, loadingPhase] = useFirestoreSetting('currentPhase', 1)
  const [currentPhaseLocal, setCurrentPhaseLocal] = useLocalStorage('ksk-current-phase', 1)
  const [currentWeekFirestore, setCurrentWeekFirestore, loadingWeek] = useFirestoreSetting('currentWeek', 1)
  const [currentWeekLocal, setCurrentWeekLocal] = useLocalStorage('ksk-current-week', 1)
  const [currentDayFirestore, setCurrentDayFirestore, loadingDay] = useFirestoreSetting('currentDay', 1)
  const [currentDayLocal, setCurrentDayLocal] = useLocalStorage('ksk-current-day', 1)
  // Keep activeTab local only - no need to persist UI state
  const [activeTab, setActiveTab] = useState('workout')
  const [targetSnatchesFirestore, setTargetSnatchesFirestore, loadingTargetSnatches] = useFirestoreSetting('targetSnatches', 100)
  const [targetSnatchesLocal, setTargetSnatchesLocal] = useLocalStorage('ksk-target-snatches', 100)
  
  // Local state for immediate UI updates
  const [localSelectedProgram, setLocalSelectedProgram] = useState('')
  const [localMaxReps, setLocalMaxReps] = useState(0)
  
  // Memoize loading state calculation
  const isFirestoreLoading = useMemo(() => currentUser && (
    loadingSelectedProgram || 
    loadingMaxReps || 
    loadingPhase || 
    loadingWeek || 
    loadingDay || 
    loadingTargetSnatches
  ), [currentUser, loadingSelectedProgram, loadingMaxReps, loadingPhase, loadingWeek, loadingDay, loadingTargetSnatches])
  
  // Initialize local state from stored values
  useEffect(() => {
    const storedProgram = currentUser ? selectedProgramFirestore : selectedProgramLocal
    const storedMaxReps = currentUser ? maxRepsFirestore : maxRepsLocal
    
    if (storedProgram !== localSelectedProgram) {
      setLocalSelectedProgram(storedProgram)
    }
    if (storedMaxReps !== localMaxReps) {
      setLocalMaxReps(storedMaxReps)
    }
  }, [currentUser, selectedProgramFirestore, selectedProgramLocal, maxRepsFirestore, maxRepsLocal, localSelectedProgram, localMaxReps])
  
  // Memoize state object consolidation to prevent object re-creation
  const programState = useMemo(() => ({
    selectedProgram: localSelectedProgram,
    maxReps: localMaxReps,
    currentPhase: currentUser ? currentPhaseFirestore : currentPhaseLocal,
    currentWeek: currentUser ? currentWeekFirestore : currentWeekLocal,
    currentDay: currentUser ? currentDayFirestore : currentDayLocal
  }), [localSelectedProgram, localMaxReps, currentUser, currentPhaseFirestore, currentPhaseLocal, currentWeekFirestore, currentWeekLocal, currentDayFirestore, currentDayLocal])

  // Use destructured values for backward compatibility
  const selectedProgram = programState.selectedProgram
  const maxReps = programState.maxReps
  
  // Workout history (Firestore for authenticated users, localStorage for guests)
  const { workouts: firestoreWorkouts, addWorkout: addFirestoreWorkout } = useWorkoutHistory()
  const [localWorkoutHistory, setLocalWorkoutHistory] = useLocalStorage('ksk-workout-history', [])
  
  // Update handlers with optimistic updates
  const setSelectedProgram = useCallback(async (value) => {
    console.log('📝 Setting selected program:', value)
    // Update local state immediately
    setLocalSelectedProgram(value)
    
    // Then update storage
    try {
      if (currentUser) {
        console.log('💾 About to save to Firestore for user:', currentUser.uid)
        await setSelectedProgramFirestore(value)
        console.log('✅ Successfully saved to Firestore')
        setSuccess('Program selection saved!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        console.log('💾 Saving to localStorage (guest user)')
        setSelectedProgramLocal(value)
      }
    } catch (error) {
      console.error('❌ Failed to save program selection:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      setError(`Failed to save program selection: ${error.message}`)
      
      // Don't revert the local state - keep the selection visible
      console.log('🔄 Keeping local selection despite save failure')
    }
  }, [currentUser, setSelectedProgramFirestore, setSelectedProgramLocal])
  
  const setMaxReps = useCallback(async (value) => {
    console.log('📝 Setting max reps:', value)
    // Update local state immediately
    setLocalMaxReps(value)
    
    // Then update storage
    try {
      if (currentUser) {
        await setMaxRepsFirestore(value)
      } else {
        setMaxRepsLocal(value)
      }
    } catch (error) {
      console.error('❌ Failed to save max reps:', error)
      setError('Failed to save max reps. Please try again.')
    }
  }, [currentUser, setMaxRepsFirestore, setMaxRepsLocal])
  const currentPhase = currentUser ? currentPhaseFirestore : currentPhaseLocal
  const setCurrentPhase = currentUser ? setCurrentPhaseFirestore : setCurrentPhaseLocal
  const currentWeek = currentUser ? currentWeekFirestore : currentWeekLocal
  const setCurrentWeek = currentUser ? setCurrentWeekFirestore : setCurrentWeekLocal
  const currentDay = currentUser ? currentDayFirestore : currentDayLocal
  const setCurrentDay = currentUser ? setCurrentDayFirestore : setCurrentDayLocal
  const targetSnatches = currentUser ? targetSnatchesFirestore : targetSnatchesLocal
  const setTargetSnatches = currentUser ? setTargetSnatchesFirestore : setTargetSnatchesLocal
  
  const workoutHistory = currentUser ? firestoreWorkouts : localWorkoutHistory
  const addWorkout = currentUser ? addFirestoreWorkout : setLocalWorkoutHistory

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 App State:', {
      currentUser: currentUser?.email || 'guest',
      selectedProgram,
      maxReps,
      currentPhase,
      currentWeek,
      currentDay,
      isFirestoreLoading,
      activeTab
    })
  }, [currentUser, selectedProgram, maxReps, currentPhase, currentWeek, currentDay, isFirestoreLoading, activeTab])

  // Authentication success effect - run when user authenticates
  useEffect(() => {
    if (currentUser) {
      console.log('👤 App: User authenticated:', currentUser.email)
      
      // Close auth modal if open
      if (showAuthModal) {
        console.log('🔄 App: Closing auth modal')
        setShowAuthModal(false)
      }
      
      // Close landing page if open
      if (showLandingPage) {
        console.log('🔄 App: Closing landing page')
        setShowLandingPage(false)
        setActiveTab('settings')
      }
      
      // Migrate data if needed
      if (hasLocalStorageData()) {
        console.log('📦 App: Starting data migration')
        migrateLocalStorageToFirestore(currentUser.uid)
          .then(() => {
            console.log('✅ App: Data migration completed')
          })
          .catch((error) => {
            console.error('❌ App: Data migration failed:', error)
            setError('Failed to migrate your data. Please try refreshing the page.')
          })
      }
    }
  }, [currentUser, showAuthModal, showLandingPage])

  // Reset currentDay if it's out of bounds for the new 3-day system
  useEffect(() => {
    if (currentDay > 3 || currentDay < 1) {
      setCurrentDay(1)
    }
  }, [currentDay, setCurrentDay])

  // Memoize workout details calculation to prevent expensive recalculations
  const workoutDetails = useMemo(() => {
    if (!selectedProgram) return { targetReps: 0, prescription: '' }
    
    // Direct mapping: Day 1 = Monday, Day 2 = Wednesday, Day 3 = Friday
    // Ensure currentDay is within valid bounds (1-3)
    const validCurrentDay = Math.max(1, Math.min(3, currentDay))
    const workoutPatterns = ['monday', 'wednesday', 'friday']
    const dayName = workoutPatterns[validCurrentDay - 1]
    
    if (selectedProgram === '3.0') {
      if (!maxReps || maxReps < 1) {
        return { targetReps: 0, prescription: 'Enter max reps to see prescription' }
      }
      const ksk3Data = calculateKSK3Reps(maxReps, dayName, currentWeek)
      return {
        targetReps: ksk3Data.totalReps,
        prescription: `${ksk3Data.percentage}% of max (${ksk3Data.repsPerHand} reps per hand)`
      }
    }
    
    const totalReps = getTotalRepsForWorkout(selectedProgram, currentPhase, dayName, currentWeek)
    const workout = KSK_PROGRAMS[selectedProgram]?.schedule[currentPhase]?.workouts[dayName]
    
    return {
      targetReps: totalReps || 0,
      prescription: workout?.description || ''
    }
  }, [selectedProgram, currentPhase, currentWeek, currentDay, maxReps])

  // Handle getting started from landing page - stabilized with useCallback
  const handleGetStarted = useCallback(() => {
    console.log('🚀 App: Get started clicked, currentUser:', !!currentUser)
    if (currentUser) {
      // User is authenticated, go to app
      console.log('✅ App: User authenticated, going to app')
      setShowLandingPage(false)
      setActiveTab('settings')
    } else {
      // User needs to authenticate
      console.log('🔐 App: User not authenticated, showing register modal')
      setAuthMode('register')
      setShowAuthModal(true)
    }
  }, [currentUser])

  // Handle sign in from landing page - stabilized with useCallback
  const handleSignIn = useCallback(() => {
    console.log('🔐 App: Sign in clicked, showing login modal')
    setAuthMode('login')
    setShowAuthModal(true)
  }, [])

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setShowLandingPage(false)
    setActiveTab('settings')
  }


  // Handle workout logging - stabilized with useCallback
  const handleLogWorkout = useCallback(async (workoutData) => {
    try {
      console.log('📝 Logging workout:', workoutData)
      
      const newWorkout = {
        ...workoutData,
        programVersion: selectedProgram,
        phase: programState.currentPhase,
        week: programState.currentWeek,
        day: programState.currentDay
      }
      
      if (currentUser) {
        // Add to Firestore
        console.log('💾 Saving to Firestore for user:', currentUser.email)
        await addWorkout(newWorkout)
      } else {
        // Add to localStorage
        console.log('💾 Saving to localStorage (guest user)')
        const updatedWorkouts = [...localWorkoutHistory, newWorkout]
        setLocalWorkoutHistory(updatedWorkouts)
      }
      
      // Show success message and switch to progress tab
      alert('Workout logged successfully!')
      setActiveTab('progress')
    } catch (error) {
      console.error('❌ Error logging workout:', error)
      alert('Failed to log workout. Please try again.')
    }
  }, [selectedProgram, programState.currentPhase, programState.currentWeek, programState.currentDay, currentUser, addWorkout, localWorkoutHistory, setLocalWorkoutHistory])

  // Stabilize tab change handler with useCallback
  const handleTabChange = useCallback((tabId) => {
    console.log('🔄 Tab clicked:', tabId)
    setActiveTab(tabId)
  }, [])

  // Stabilize other button handlers with useCallback
  const handleDismissSuccess = useCallback(() => setSuccess(null), [])
  const handleDismissError = useCallback(() => setError(null), [])
  const handleRefreshPage = useCallback(() => window.location.reload(), [])
  const handleGoToSettings = useCallback(() => setActiveTab('settings'), [])
  
  // Stabilize logout handler with useCallback
  const handleLogout = useCallback(async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await logout()
        setActiveTab('workout')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }, [logout])

  // Memoize tab configuration to prevent array re-creation on every render
  const tabs = useMemo(() => [
    { id: 'settings', label: 'Program Selection', icon: '⚙️' },
    { id: 'workout', label: 'Today\'s Workout', icon: '🏋️' },
    { id: 'log', label: 'Log Session', icon: '📝' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    ...(currentUser ? [{ id: 'profile', label: 'Profile', icon: '👤' }] : [])
  ], [currentUser])

  // Show landing page if user hasn't seen it yet
  if (showLandingPage) {
    return (
      <>
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onSignIn={handleSignIn}
          currentUser={currentUser}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen relative" style={{
      background: `
        linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #dbeafe 75%, #f0f9ff 100%),
        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
      `
    }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 shadow-large sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">KSK Snatch Tracker</h1>
            <p className="text-primary-100 text-sm font-medium">Master Geoff Neupert's King-Sized Killer Program</p>
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-[108px] z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-medium transform scale-105'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 hover:scale-102'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✅</span>
              <p className="text-green-800">{success}</p>
            </div>
            <button
              onClick={handleDismissSuccess}
              className="text-green-500 hover:text-green-700 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleDismissError}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
            <button
              onClick={handleRefreshPage}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Refresh Page
            </button>
          </div>
        )}
        {/* Settings Tab - Program Selection */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-slide-up">
            <ProgramSelector
              selectedProgram={selectedProgram}
              onProgramChange={setSelectedProgram}
              maxReps={maxReps}
              onMaxRepsChange={setMaxReps}
              isLoading={currentUser && loadingSelectedProgram}
            />
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <div className="space-y-6 animate-slide-up">
            {!selectedProgram ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-8 text-center shadow-soft">
                <div className="text-5xl mb-4">⚙️</div>
                <p className="text-amber-800 mb-6 text-lg font-medium">Please select a program first</p>
                <button
                  onClick={handleGoToSettings}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium shadow-medium transition-all duration-200 hover:scale-105"
                >
                  Go to Program Selection
                </button>
              </div>
            ) : (
              <WorkoutDisplay
                selectedProgram={selectedProgram}
                currentPhase={currentPhase}
                currentWeek={currentWeek}
                currentDay={currentDay}
                maxReps={maxReps}
                onPhaseChange={setCurrentPhase}
                onWeekChange={setCurrentWeek}
                onDayChange={setCurrentDay}
              />
            )}
          </div>
        )}

        {/* Log Tab */}
        {activeTab === 'log' && (
          <div className="space-y-6 animate-slide-up">
            {!selectedProgram ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-8 text-center shadow-soft">
                <div className="text-5xl mb-4">⚙️</div>
                <p className="text-amber-800 mb-6 text-lg font-medium">Please select a program first</p>
                <button
                  onClick={handleGoToSettings}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium shadow-medium transition-all duration-200 hover:scale-105"
                >
                  Go to Program Selection
                </button>
              </div>
            ) : (
              <WorkoutLogger
                targetReps={workoutDetails.targetReps}
                workoutPrescription={workoutDetails.prescription}
                onLogWorkout={handleLogWorkout}
                programType={selectedProgram}
                targetSnatches={targetSnatches}
                onTargetSnatchesChange={setTargetSnatches}
              />
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="animate-slide-up">
            <ProgressDashboard workoutHistory={workoutHistory} targetSnatches={targetSnatches} />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && currentUser && (
          <div className="space-y-6 animate-slide-up">
            <UserProfile />
            
            {/* Sign Out Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-6 shadow-soft">
              <h3 className="font-semibold text-neutral-800 mb-4">Account Actions</h3>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-all duration-200 hover:scale-105"
              >
                Sign Out
              </button>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-6 shadow-soft">
              <h3 className="font-semibold text-neutral-800 mb-3">Data & Privacy</h3>
              <p className="text-sm text-neutral-600">
                Your workout data and profile information are securely stored in Firebase and only accessible to you. 
                We never share your personal information or training data with third parties.
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  )
}

export default App