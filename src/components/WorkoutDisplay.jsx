import { memo } from 'react';
import { KSK_PROGRAMS, calculateKSK3Reps, getTotalRepsForWorkout } from '../data/kskPrograms';

/**
 * WorkoutDisplay Component
 * Shows the current workout prescription based on selected program, phase, week, and day
 * Displays exact rep schemes and targets for each KSK program variant
 */
const WorkoutDisplay = memo(({ 
  selectedProgram, 
  currentPhase, 
  currentWeek, 
  currentDay, 
  maxReps,
  onPhaseChange,
  onWeekChange, 
  onDayChange 
}) => {
  if (!selectedProgram) {
    return (
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 p-12 text-center">
        <div className="text-4xl mb-4">🏋️</div>
        <p className="text-neutral-600 font-medium">Select a program to see workout details</p>
      </div>
    );
  }

  const program = KSK_PROGRAMS[selectedProgram];
  
  // Validation for KSK 3.0
  if (selectedProgram === '3.0' && (!maxReps || maxReps < 1)) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-amber-800 font-medium">Enter your max snatch reps to see workout prescription.</p>
      </div>
    );
  }

  const phaseData = program.schedule[currentPhase];
  
  // Direct mapping: Day 1 = Monday, Day 2 = Wednesday, Day 3 = Friday
  // Ensure currentDay is within valid bounds (1-3)
  const validCurrentDay = Math.max(1, Math.min(3, currentDay));
  const workoutPatterns = ['monday', 'wednesday', 'friday'];
  const mappedWorkoutDay = workoutPatterns[validCurrentDay - 1];
  const workout = phaseData?.workouts[mappedWorkoutDay];

  if (!workout) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50 p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-800 font-medium">Invalid workout selection</p>
      </div>
    );
  }

  // Calculate reps for different program types
  const getWorkoutDetails = () => {
    switch (workout.type) {
      case 'ladders':
        const ladderTotal = workout.pattern.reduce((sum, rung) => sum + rung, 0);
        return {
          prescription: `Ladders of ${workout.pattern.join(',')} reps per hand`,
          repsPerHand: ladderTotal,
          totalReps: ladderTotal * 2,
          pattern: workout.pattern
        };

      case 'sets':
        const setsTotal = workout.pattern.reduce((sum, reps) => sum + reps, 0);
        
        // For KSK 1.0 Phase 3, show complete weekly pattern
        if (selectedProgram === '1.0' && currentPhase === 3) {
          const weeklyPattern = [9, 15, 12]; // Mon, Wed, Fri
          const weeklyTotal = weeklyPattern.reduce((sum, reps) => sum + reps, 0);
          return {
            prescription: `Weekly pattern: ${weeklyPattern.join(', ')} reps per hand (Day 1/Day 2/Day 3)`,
            repsPerHand: setsTotal, // Current day's reps
            totalReps: setsTotal * 2, // Current day's total
            pattern: workout.pattern,
            weeklyPattern: weeklyPattern,
            weeklyTotal: weeklyTotal
          };
        }
        
        return {
          prescription: `Sets of ${workout.pattern.join(',')} reps per hand`,
          repsPerHand: setsTotal,
          totalReps: setsTotal * 2,
          pattern: workout.pattern
        };

      case 'fixed_reps':
        return {
          prescription: `${workout.repsPerHand} reps per hand`,
          repsPerHand: workout.repsPerHand,
          totalReps: workout.repsPerHand * 2
        };

      case 'percentage':
        const ksk3Data = calculateKSK3Reps(maxReps, mappedWorkoutDay, currentWeek);
        return {
          prescription: `${ksk3Data.percentage}% of max (${ksk3Data.repsPerHand} reps per hand)`,
          repsPerHand: ksk3Data.repsPerHand,
          totalReps: ksk3Data.totalReps,
          percentage: ksk3Data.percentage
        };

      default:
        return { prescription: 'Unknown workout type', repsPerHand: 0, totalReps: 0 };
    }
  };

  const workoutDetails = getWorkoutDetails();

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-6">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">🏋️</div>
        <h2 className="text-xl font-bold text-neutral-800">Current Workout</h2>
      </div>
      
      {/* Program Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Phase Selector */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Phase</label>
          <select
            value={currentPhase}
            onChange={(e) => onPhaseChange(parseInt(e.target.value))}
            className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
          >
            {Array.from({ length: program.phases }, (_, i) => i + 1).map(phase => (
              <option key={phase} value={phase}>
                Phase {phase}
                {program.schedule[phase]?.name && ` - ${program.schedule[phase].name.split(' - ')[1]}`}
              </option>
            ))}
          </select>
        </div>

        {/* Week Selector */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Week</label>
          <select
            value={currentWeek}
            onChange={(e) => onWeekChange(parseInt(e.target.value))}
            className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
          >
            {Array.from({ length: phaseData?.weeks || program.weeksPerPhase }, (_, i) => i + 1).map(week => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>
        </div>

        {/* Day Selector */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Day</label>
          <select
            value={currentDay}
            onChange={(e) => onDayChange(parseInt(e.target.value))}
            className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
          >
            {['Day 1', 'Day 2', 'Day 3'].map((day, index) => (
              <option key={index + 1} value={index + 1}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workout Details */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-6 border border-primary-200/50">
        <h3 className="font-bold text-xl text-primary-900 mb-3">
          Day {validCurrentDay} - {phaseData.name}
        </h3>
        <p className="text-primary-800 text-lg font-medium">{workoutDetails.prescription}</p>
      </div>

      {/* Rep Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 border border-neutral-200/50">
          <p className="text-sm text-neutral-600 font-medium mb-2">Reps per hand</p>
          <p className="text-3xl font-bold text-neutral-900">{workoutDetails.repsPerHand}</p>
        </div>
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 border border-neutral-200/50">
          <p className="text-sm text-neutral-600 font-medium mb-2">Total reps</p>
          <p className="text-3xl font-bold text-neutral-900">{workoutDetails.totalReps}</p>
        </div>
      </div>

      {/* Pattern Details for KSK 1.0 */}
      {workout.type === 'ladders' && (
        <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50">
          <p className="text-sm font-bold text-emerald-800 mb-3 flex items-center">
            <div className="text-lg mr-2">🪩</div>
            Ladder Pattern:
          </p>
          <div className="flex flex-wrap gap-3">
            {workoutDetails.pattern.map((rung, index) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-emerald-200 to-green-200 text-emerald-800 rounded-xl text-sm font-semibold shadow-soft">
                {rung} reps
              </span>
            ))}
          </div>
          <p className="text-xs text-emerald-700 mt-3 font-medium">
            Complete each rung for both hands before moving to the next
          </p>
        </div>
      )}

      {/* Set Details for KSK 1.0 Phase 2 & 3 */}
      {workout.type === 'sets' && workoutDetails.pattern && (
        <div className="mt-6 p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50">
          <p className="text-sm font-bold text-violet-800 mb-3 flex items-center">
            <div className="text-lg mr-2">📊</div>
            {selectedProgram === '1.0' && currentPhase === 3 ? 'Weekly Pattern:' : 'Set Pattern:'}
          </p>
          {selectedProgram === '1.0' && currentPhase === 3 && workoutDetails.weeklyPattern ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {workoutDetails.weeklyPattern.map((reps, index) => (
                  <span key={index} className="px-4 py-2 bg-gradient-to-r from-violet-200 to-purple-200 text-violet-800 rounded-xl text-sm font-semibold shadow-soft">
                    Day {index + 1}: {reps} reps
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {workoutDetails.pattern.map((reps, index) => (
                <span key={index} className="px-4 py-2 bg-gradient-to-r from-violet-200 to-purple-200 text-violet-800 rounded-xl text-sm font-semibold shadow-soft">
                  {reps} reps
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KSK 3.0 Percentage Info */}
      {workout.type === 'percentage' && (
        <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50">
          <p className="text-sm text-orange-800 flex items-center">
            <div className="text-lg mr-2">📈</div>
            <span className="font-medium">
              <strong className="text-lg">{workoutDetails.percentage}%</strong> of your max ({maxReps} reps) = {' '}
              <strong className="text-lg">{workoutDetails.totalReps} total reps</strong> ({workoutDetails.repsPerHand} per hand)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.selectedProgram === nextProps.selectedProgram &&
    prevProps.currentPhase === nextProps.currentPhase &&
    prevProps.currentWeek === nextProps.currentWeek &&
    prevProps.currentDay === nextProps.currentDay &&
    prevProps.maxReps === nextProps.maxReps
  );
});

WorkoutDisplay.displayName = 'WorkoutDisplay';

export default WorkoutDisplay;