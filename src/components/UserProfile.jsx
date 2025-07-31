import { useState, useEffect, memo } from 'react'
import { useUserProfile } from '../hooks/useUserProfile'
import { useAuth } from '../contexts/AuthContext'

const UserProfile = memo(() => {
  const { currentUser } = useAuth()
  const {
    profile,
    updateProfile,
    saveProfile,
    cancelChanges,
    validateProfile,
    loading,
    saving,
    error,
    hasChanges,
    clearError
  } = useUserProfile()

  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate before saving
    const errors = validateProfile()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    
    setValidationErrors([])
    const result = await saveProfile()
    
    if (result.success) {
      setSuccess(true)
    }
  }

  const handleCancel = () => {
    cancelChanges()
    setValidationErrors([])
    clearError()
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-8 shadow-soft">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-neutral-200 rounded"></div>
            <div className="h-10 bg-neutral-200 rounded"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/50 p-8 shadow-soft">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">Edit Profile</h2>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
          <span className="text-green-500 text-xl mr-3">✅</span>
          <p className="text-green-800">Profile saved successfully!</p>
        </div>
      )}

      {/* Error Messages */}
      {(error || validationErrors.length > 0) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <p className="text-red-800 font-semibold">Please fix the following errors:</p>
          </div>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {error && <li>{error}</li>}
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => updateProfile('displayName', e.target.value)}
            placeholder="How should we call you?"
            maxLength={50}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {profile.displayName.length}/50 characters
          </p>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => updateProfile('age', e.target.value)}
            placeholder="Your age"
            min="13"
            max="120"
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800"
          />
        </div>

        {/* Kettlebell Experience */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Kettlebell Experience
          </label>
          <select
            value={profile.experience}
            onChange={(e) => updateProfile('experience', e.target.value)}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800"
          >
            <option value="not_specified">Not Specified</option>
            <option value="beginner">Beginner (&lt; 1 year)</option>
            <option value="intermediate">Intermediate (1-3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </div>

        {/* Short Bio */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Short Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => updateProfile('bio', e.target.value)}
            placeholder="Tell us a bit about yourself..."
            maxLength={200}
            rows={3}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 resize-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {profile.bio.length}/200 characters
          </p>
        </div>

        {/* Training Goals */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            My Training Goals
          </label>
          <textarea
            value={profile.trainingGoals}
            onChange={(e) => updateProfile('trainingGoals', e.target.value)}
            placeholder="What are your kettlebell training goals?"
            maxLength={300}
            rows={4}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 resize-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {profile.trainingGoals.length}/300 characters
          </p>
        </div>

        {/* Other Activities */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Other Activities/Interests
          </label>
          <textarea
            value={profile.otherActivities}
            onChange={(e) => updateProfile('otherActivities', e.target.value)}
            placeholder="Other sports or activities you enjoy..."
            maxLength={200}
            rows={3}
            className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-soft transition-all duration-200 hover:border-primary-400 text-neutral-800 resize-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            {profile.otherActivities.length}/200 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-medium ${
              saving || !hasChanges
                ? 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 hover:scale-105 hover:shadow-large'
            }`}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving || !hasChanges}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-medium ${
              saving || !hasChanges
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 hover:scale-105 hover:shadow-large'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Account Info Section */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <h3 className="font-semibold text-neutral-800 mb-3">Account Information</h3>
        <div className="text-sm text-neutral-600 space-y-1">
          <p><strong>Email:</strong> {currentUser?.email}</p>
          <p><strong>Member Since:</strong> {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
})

UserProfile.displayName = 'UserProfile'

export default UserProfile