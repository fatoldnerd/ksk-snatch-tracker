import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-large max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form content */}
          {mode === 'login' ? (
            <LoginForm onToggleForm={toggleMode} onClose={onClose} />
          ) : (
            <RegisterForm onToggleForm={toggleMode} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal