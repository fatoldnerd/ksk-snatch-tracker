import { useState, memo, useCallback, useMemo } from 'react';

/**
 * WorkoutLogger Component
 * Allows users to log their completed workout sessions
 * Tracks date, kettlebell weight, sets/rounds completed, and optional notes/RPE
 */
const WorkoutLogger = memo(({ 
  targetReps, 
  workoutPrescription, 
  onLogWorkout,
  programType,
  targetSnatches,
  onTargetSnatchesChange
}) => {
  const [workoutData, setWorkoutData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    kettlebellWeight: '',
    setsCompleted: '',
    leftHandReps: '',
    rightHandReps: '',
    notes: '',
    rpe: '',
    totalActualReps: 0
  });

  const [isLogging, setIsLogging] = useState(false);

  // Memoize input change handler to prevent re-creation on every render
  const handleInputChange = useCallback((field, value) => {
    const updatedData = { ...workoutData, [field]: value };
    
    // Auto-calculate total snatches when any relevant field changes
    if (field === 'leftHandReps' || field === 'rightHandReps' || field === 'setsCompleted') {
      const leftReps = parseInt(field === 'leftHandReps' ? value : workoutData.leftHandReps) || 0;
      const rightReps = parseInt(field === 'rightHandReps' ? value : workoutData.rightHandReps) || 0;
      const sets = parseInt(field === 'setsCompleted' ? value : workoutData.setsCompleted) || 1;
      updatedData.totalActualReps = (leftReps + rightReps) * sets;
    }
    
    setWorkoutData(updatedData);
  }, [workoutData]);

  // Memoize form submission handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsLogging(true);

    // Validate required fields
    if (!workoutData.kettlebellWeight || !workoutData.leftHandReps || !workoutData.rightHandReps || !workoutData.setsCompleted) {
      alert('Please fill in all required fields including sets/rounds completed');
      setIsLogging(false);
      return;
    }

    // Create workout log entry
    const logEntry = {
      id: Date.now().toString(),
      date: workoutData.date,
      kettlebellWeight: parseFloat(workoutData.kettlebellWeight),
      leftHandReps: parseInt(workoutData.leftHandReps),
      rightHandReps: parseInt(workoutData.rightHandReps),
      totalReps: workoutData.totalActualReps,
      setsCompleted: parseInt(workoutData.setsCompleted),
      notes: workoutData.notes.trim(),
      rpe: workoutData.rpe ? parseInt(workoutData.rpe) : null,
      targetReps: targetReps,
      prescription: workoutPrescription,
      programType: programType,
      timestamp: new Date().toISOString()
    };

    onLogWorkout(logEntry);

    // Reset form
    setWorkoutData({
      date: new Date().toISOString().split('T')[0],
      kettlebellWeight: workoutData.kettlebellWeight, // Keep weight for convenience
      setsCompleted: '',
      leftHandReps: '',
      rightHandReps: '',
      notes: '',
      rpe: '',
      totalActualReps: 0
    });

    setIsLogging(false);
  }, [workoutData, targetReps, workoutPrescription, programType, onLogWorkout]);

  // Memoize completion percentage calculation
  const completionPercentage = useMemo(() => 
    targetReps ? Math.round((workoutData.totalActualReps / targetReps) * 100) : 0,
    [targetReps, workoutData.totalActualReps]
  );

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">📋</div>
        <h2 className="text-xl font-bold text-neutral-800">Log Your Workout</h2>
      </div>

      {/* Target vs Actual Progress */}
      {targetReps > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-neutral-700 flex items-center">
              <div className="text-lg mr-2">🎯</div>
              Progress
            </span>
            <span className="text-sm text-neutral-600 font-medium">
              {workoutData.totalActualReps} / {targetReps} reps ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3 shadow-inner">
            <div 
              className={`h-3 rounded-full transition-all duration-500 shadow-soft ${
                completionPercentage >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
                completionPercentage >= 80 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'
              }`}
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date and Weight Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={workoutData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Kettlebell Weight (kg) <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={workoutData.kettlebellWeight}
              onChange={(e) => handleInputChange('kettlebellWeight', e.target.value)}
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
              required
            >
              <option value="">Select weight...</option>
              <option value="12">12kg</option>
              <option value="16">16kg</option>
              <option value="20">20kg</option>
              <option value="24">24kg</option>
              <option value="28">28kg</option>
              <option value="32">32kg</option>
              <option value="36">36kg</option>
              <option value="40">40kg</option>
            </select>
          </div>
        </div>

        {/* Reps Completed Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Left Hand Reps <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={workoutData.leftHandReps}
              onChange={(e) => handleInputChange('leftHandReps', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Right Hand Reps <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={workoutData.rightHandReps}
              onChange={(e) => handleInputChange('rightHandReps', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Total Snatches
            </label>
            <input
              type="number"
              value={workoutData.totalActualReps}
              disabled
              className="w-full p-4 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 font-medium"
            />
          </div>
        </div>

        {/* Optional Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Sets/Rounds Completed <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={workoutData.setsCompleted}
              onChange={(e) => handleInputChange('setsCompleted', e.target.value)}
              placeholder="e.g. 5"
              min="1"
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              RPE - Rate of Perceived Exertion (1-10)
            </label>
            <select
              value={workoutData.rpe}
              onChange={(e) => handleInputChange('rpe', e.target.value)}
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
            >
              <option value="">Select RPE...</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(rpe => (
                <option key={rpe} value={rpe}>{rpe}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Notes
          </label>
          <textarea
            value={workoutData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Optional notes about the workout..."
            rows={4}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLogging}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-medium ${
            isLogging 
              ? 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 hover:scale-105 hover:shadow-large'
          }`}
        >
          {isLogging ? 'Logging Workout...' : 'Log Workout'}
        </button>
      </form>

      {/* Target Snatches Setting */}
      <div className="mt-6 p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-lg mr-2">🎯</div>
            <label className="text-sm font-semibold text-violet-800">Daily Snatch Target:</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={targetSnatches}
              onChange={(e) => onTargetSnatchesChange(parseInt(e.target.value) || 0)}
              min="1"
              className="w-20 p-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center font-semibold text-violet-800"
            />
            <span className="text-sm text-violet-700 font-medium">snatches</span>
          </div>
        </div>
        <p className="text-xs text-violet-600 mt-2">Set your daily snatch goal to track progress in the Progress tab</p>
      </div>

      {/* Prescription Reminder */}
      {workoutPrescription && (
        <div className="mt-4 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200/50">
          <p className="text-sm text-primary-800 font-medium flex items-center">
            <div className="text-lg mr-2">📋</div>
            <strong>Today's Target:</strong> <span className="ml-2">{workoutPrescription}</span>
          </p>
        </div>
      )}
    </div>
  );
});

WorkoutLogger.displayName = 'WorkoutLogger';

export default WorkoutLogger;