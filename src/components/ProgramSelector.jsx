import { KSK_PROGRAMS } from '../data/kskPrograms';

/**
 * ProgramSelector Component
 * Allows users to select between KSK 1.0, 2.0, and 3.0 programs
 * For KSK 3.0, also collects the user's max snatch total
 */
const ProgramSelector = ({ 
  selectedProgram, 
  onProgramChange, 
  maxReps, 
  onMaxRepsChange 
}) => {
  const programOptions = Object.keys(KSK_PROGRAMS);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-6">
      <div className="flex items-center mb-6">
        <div className="text-2xl mr-3">⚙️</div>
        <h2 className="text-xl font-bold text-neutral-800">Select Your Program</h2>
      </div>
      
      {/* Program Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          KSK Program Version
        </label>
        <select
          value={selectedProgram}
          onChange={(e) => onProgramChange(e.target.value)}
          className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
        >
          <option value="">Choose a program...</option>
          {programOptions.map(version => (
            <option key={version} value={version}>
              {KSK_PROGRAMS[version].name}
            </option>
          ))}
        </select>
      </div>

      {/* Program Description */}
      {selectedProgram && (
        <div className="mb-6 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200/50">
          <p className="text-sm text-primary-800 font-medium leading-relaxed">
            {KSK_PROGRAMS[selectedProgram].description}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-primary-700 font-semibold">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              {KSK_PROGRAMS[selectedProgram].phases} phases
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
              {KSK_PROGRAMS[selectedProgram].weeksPerPhase} weeks per phase
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              {KSK_PROGRAMS[selectedProgram].daysPerWeek} days per week
            </span>
          </div>
        </div>
      )}

      {/* KSK 3.0 Max Reps Input */}
      {selectedProgram === '3.0' && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            Your Max Total Snatch Reps
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={maxReps || ''}
            onChange={(e) => onMaxRepsChange(parseInt(e.target.value) || 0)}
            placeholder="e.g. 61"
            min="1"
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 font-medium"
          />
          <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
            Enter your maximum total snatch reps (both hands combined). 
            KSK 3.0 uses percentages of this number to calculate daily targets.
          </p>
        </div>
      )}

      {/* Validation Message for KSK 3.0 */}
      {selectedProgram === '3.0' && (!maxReps || maxReps < 1) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
          <div className="flex items-center">
            <div className="text-xl mr-3">⚠️</div>
            <p className="text-sm text-amber-800 font-medium">
              Please enter your max snatch reps to see workout prescriptions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramSelector;