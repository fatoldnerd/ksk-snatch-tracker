import { useState, useEffect } from 'react'
import ProgramSelector from './components/ProgramSelector'
import WorkoutDisplay from './components/WorkoutDisplay'
import WorkoutLogger from './components/WorkoutLogger'
import ProgressDashboard from './components/ProgressDashboard'
import { getTotalRepsForWorkout, calculateKSK3Reps, KSK_PROGRAMS } from './data/kskPrograms'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  // Program state with localStorage persistence
  const [selectedProgram, setSelectedProgram] = useLocalStorage('ksk-selected-program', '')
  const [maxReps, setMaxReps] = useLocalStorage('ksk-max-reps', 0)
  
  // Current workout state with localStorage persistence
  const [currentPhase, setCurrentPhase] = useLocalStorage('ksk-current-phase', 1)
  const [currentWeek, setCurrentWeek] = useLocalStorage('ksk-current-week', 1)
  const [currentDay, setCurrentDay] = useLocalStorage('ksk-current-day', 1)
  
  // UI state with localStorage persistence
  const [activeTab, setActiveTab] = useLocalStorage('ksk-active-tab', 'workout')
  
  // Workout history state with localStorage persistence
  const [workoutHistory, setWorkoutHistory] = useLocalStorage('ksk-workout-history', [])
  
  // Target snatches with localStorage persistence
  const [targetSnatches, setTargetSnatches] = useLocalStorage('ksk-target-snatches', 100)

  // Reset currentDay if it's out of bounds for the new 3-day system
  useEffect(() => {
    if (currentDay > 3 || currentDay < 1) {
      setCurrentDay(1)
    }
  }, [currentDay, setCurrentDay])

  // Calculate current workout details
  const getCurrentWorkoutDetails = () => {
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
  }

  const workoutDetails = getCurrentWorkoutDetails()

  // Handle workout logging
  const handleLogWorkout = (workoutData) => {
    const newWorkout = {
      ...workoutData,
      programVersion: selectedProgram,
      phase: currentPhase,
      week: currentWeek,
      day: currentDay
    }
    
    setWorkoutHistory(prev => [...prev, newWorkout])
    
    // Show success message and switch to progress tab
    alert('Workout logged successfully!')
    setActiveTab('progress')
  }

  // Tab configuration
  const tabs = [
    { id: 'settings', label: 'Program Selection', icon: '⚙️' },
    { id: 'workout', label: 'Today\'s Workout', icon: '🏋️' },
    { id: 'log', label: 'Log Session', icon: '📝' },
    { id: 'progress', label: 'Progress', icon: '📊' }
  ]

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
                onClick={() => setActiveTab(tab.id)}
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
        {/* Settings Tab - Program Selection */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-slide-up">
            <ProgramSelector
              selectedProgram={selectedProgram}
              onProgramChange={setSelectedProgram}
              maxReps={maxReps}
              onMaxRepsChange={setMaxReps}
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
                  onClick={() => setActiveTab('settings')}
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
                  onClick={() => setActiveTab('settings')}
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
      </main>
    </div>
  )
}

export default App